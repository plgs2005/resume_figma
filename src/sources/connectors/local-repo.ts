/**
 * Local Repo Connector — Analisa um repositório Git local.
 *
 * Estratégia (browser-side):
 * 1. Recebe caminho do repo via config
 * 2. Analisa package.json / requirements.txt / composer.json etc.
 * 3. Extrai linguagens, dependências, scripts
 * 4. Gera evidências de projeto + skill
 *
 * Nota: Em ambiente browser, o acesso a filesystem é limitado.
 * Este conector funciona via File System Access API (quando disponível)
 * ou via upload de diretório.
 */

import type {
    SourceConnector,
    SourceData,
    SourceEvidence,
    ConnectorConfig,
    ConnectionStatus,
} from "../types";

/** Mapa de arquivos de manifesto → linguagem/framework */
const MANIFEST_MAP: Record<string, { language: string; framework?: string }> = {
    "package.json": { language: "JavaScript/TypeScript" },
    "tsconfig.json": { language: "TypeScript" },
    "requirements.txt": { language: "Python" },
    "pyproject.toml": { language: "Python" },
    "composer.json": { language: "PHP" },
    "Gemfile": { language: "Ruby" },
    "Cargo.toml": { language: "Rust" },
    "go.mod": { language: "Go" },
    "pom.xml": { language: "Java" },
    "build.gradle": { language: "Java/Kotlin" },
    "Makefile": { language: "C/C++" },
    "CMakeLists.txt": { language: "C/C++" },
};

export class LocalRepoConnector implements SourceConnector {
    readonly id = "local-repo";
    readonly type = "local-repo" as const;
    readonly label = "Repositório Git Local";
    readonly description = "Analisar repositório Git local para extrair projetos e tecnologias.";
    status: ConnectionStatus = "disconnected";

    private repoPath: string | null = null;
    private fileHandles: FileSystemFileHandle[] = [];

    async connect(config: ConnectorConfig): Promise<boolean> {
        this.status = "connecting";
        try {
            if (config.path) {
                this.repoPath = config.path;
                this.status = "connected";
                return true;
            }

            // Tentar File System Access API
            if ("showDirectoryPicker" in window) {
                const dirHandle = await (window as unknown as {
                    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
                }).showDirectoryPicker();

                this.repoPath = dirHandle.name;
                this.fileHandles = [];

                // Coletar handles de arquivos relevantes
                for await (const entry of dirHandle.values()) {
                    if (entry.kind === "file" && entry.name in MANIFEST_MAP) {
                        this.fileHandles.push(entry as FileSystemFileHandle);
                    }
                }

                this.status = "connected";
                return true;
            }

            throw new Error("File System Access API não disponível neste browser.");
        } catch (err) {
            console.error("[LocalRepoConnector] connect error:", err);
            this.status = "error";
            return false;
        }
    }

    async scan(): Promise<SourceData> {
        if (this.status !== "connected") {
            throw new Error("LocalRepoConnector não está conectado.");
        }

        const evidence: SourceEvidence[] = [];
        const now = new Date().toISOString();
        const detectedLanguages = new Set<string>();

        // Analisar manifestos encontrados
        for (const handle of this.fileHandles) {
            const mapping = MANIFEST_MAP[handle.name];
            if (mapping) {
                detectedLanguages.add(mapping.language);

                try {
                    const file = await handle.getFile();
                    const content = await file.text();

                    // Extrair deps de package.json
                    if (handle.name === "package.json") {
                        const pkg = JSON.parse(content);
                        const allDeps = {
                            ...pkg.dependencies,
                            ...pkg.devDependencies,
                        };

                        // Detectar frameworks
                        const frameworks = detectFrameworks(allDeps);
                        for (const fw of frameworks) {
                            evidence.push({
                                id: `lr-skill-${fw.toLowerCase().replace(/\s+/g, "-")}`,
                                kind: "skill",
                                label: fw,
                                confidence: 80,
                                tags: [mapping.language, fw],
                                sourceId: this.id,
                                sourceType: this.type,
                                extractedAt: now,
                            });
                        }
                    }
                } catch {
                    // Arquivo não legível — pular
                }
            }
        }

        // Projeto principal
        if (this.repoPath) {
            evidence.push({
                id: `lr-project-${this.repoPath.replace(/[^a-zA-Z0-9]/g, "-")}`,
                kind: "project",
                label: this.repoPath,
                description: `Repositório local analisado`,
                confidence: 85,
                tags: Array.from(detectedLanguages),
                sourceId: this.id,
                sourceType: this.type,
                extractedAt: now,
            });
        }

        // Skills por linguagem
        for (const lang of detectedLanguages) {
            evidence.push({
                id: `lr-skill-${lang.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
                kind: "skill",
                label: lang,
                confidence: 75,
                tags: [lang],
                sourceId: this.id,
                sourceType: this.type,
                extractedAt: now,
            });
        }

        const skills = evidence.filter((e) => e.kind === "skill");
        const projects = evidence.filter((e) => e.kind === "project");

        return {
            sourceId: this.id,
            sourceType: this.type,
            label: `Repo: ${this.repoPath ?? "local"}`,
            evidence,
            summary: {
                totalProjects: projects.length,
                totalSkills: skills.length,
                totalExperiences: 0,
                totalEvidence: evidence.length,
            },
            scannedAt: now,
        };
    }

    async disconnect(): Promise<void> {
        this.repoPath = null;
        this.fileHandles = [];
        this.status = "disconnected";
    }

    async validate(config: ConnectorConfig): Promise<boolean> {
        return !!(config.path || "showDirectoryPicker" in window);
    }
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Detecta frameworks a partir das dependências do package.json */
function detectFrameworks(deps: Record<string, string>): string[] {
    const frameworks: string[] = [];
    const depNames = Object.keys(deps ?? {});

    const frameworkMap: Record<string, string> = {
        react: "React",
        "react-dom": "React",
        next: "Next.js",
        vue: "Vue.js",
        nuxt: "Nuxt.js",
        angular: "Angular",
        "@angular/core": "Angular",
        svelte: "Svelte",
        express: "Express.js",
        fastify: "Fastify",
        nestjs: "NestJS",
        "@nestjs/core": "NestJS",
        tailwindcss: "Tailwind CSS",
        vite: "Vite",
        jest: "Jest",
        vitest: "Vitest",
        prisma: "Prisma",
        "@prisma/client": "Prisma",
        drizzle: "Drizzle ORM",
        "drizzle-orm": "Drizzle ORM",
    };

    const seen = new Set<string>();
    for (const dep of depNames) {
        const fw = frameworkMap[dep];
        if (fw && !seen.has(fw)) {
            seen.add(fw);
            frameworks.push(fw);
        }
    }

    return frameworks;
}
