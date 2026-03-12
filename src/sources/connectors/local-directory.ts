/**
 * Local Directory Connector — Analisa um diretório local de projetos.
 *
 * Estratégia:
 * 1. Enumera subdiretórios do diretório raiz
 * 2. Para cada subdir: busca manifestos (package.json, etc.)
 * 3. Gera evidências de projetos e skills
 *
 * Funciona via File System Access API (showDirectoryPicker).
 */

import type {
    SourceConnector,
    SourceData,
    SourceEvidence,
    ConnectorConfig,
    ConnectionStatus,
} from "../types";

/** Arquivos que indicam um projeto válido */
const PROJECT_INDICATORS = [
    "package.json",
    "Cargo.toml",
    "requirements.txt",
    "pyproject.toml",
    "composer.json",
    "go.mod",
    "Gemfile",
    "pom.xml",
    "build.gradle",
    "Makefile",
    "README.md",
];

export class LocalDirectoryConnector implements SourceConnector {
    readonly id = "local-directory";
    readonly type = "local-directory" as const;
    readonly label = "Diretório Local";
    readonly description = "Selecionar pasta de projetos para análise em massa.";
    status: ConnectionStatus = "disconnected";

    private dirName: string | null = null;
    private dirHandle: FileSystemDirectoryHandle | null = null;

    async connect(config: ConnectorConfig): Promise<boolean> {
        this.status = "connecting";
        try {
            if (!("showDirectoryPicker" in window) && !config.path) {
                throw new Error("File System Access API não disponível.");
            }

            if ("showDirectoryPicker" in window && !config.path) {
                this.dirHandle = await (window as unknown as {
                    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
                }).showDirectoryPicker();
                this.dirName = this.dirHandle.name;
            } else {
                this.dirName = config.path ?? "local-dir";
            }

            this.status = "connected";
            return true;
        } catch (err) {
            console.error("[LocalDirectoryConnector] connect error:", err);
            this.status = "error";
            return false;
        }
    }

    async scan(): Promise<SourceData> {
        if (this.status !== "connected") {
            throw new Error("LocalDirectoryConnector não está conectado.");
        }

        const evidence: SourceEvidence[] = [];
        const now = new Date().toISOString();

        if (this.dirHandle) {
            // Enumerar subdiretórios
            for await (const entry of this.dirHandle.values()) {
                if (entry.kind === "directory") {
                    const subDir = entry as FileSystemDirectoryHandle;
                    const indicators: string[] = [];

                    try {
                        for await (const subEntry of subDir.values()) {
                            if (
                                subEntry.kind === "file" &&
                                PROJECT_INDICATORS.includes(subEntry.name)
                            ) {
                                indicators.push(subEntry.name);
                            }
                        }
                    } catch {
                        // Permissão negada — pular
                        continue;
                    }

                    if (indicators.length > 0) {
                        evidence.push({
                            id: `ld-project-${subDir.name}`,
                            kind: "project",
                            label: subDir.name,
                            description: `Projeto detectado via ${indicators.join(", ")}`,
                            confidence: 70,
                            tags: indicators,
                            sourceId: this.id,
                            sourceType: this.type,
                            extractedAt: now,
                            metadata: { indicators },
                        });
                    }
                }
            }
        }

        const projects = evidence.filter((e) => e.kind === "project");

        return {
            sourceId: this.id,
            sourceType: this.type,
            label: `Dir: ${this.dirName ?? "local"}`,
            evidence,
            summary: {
                totalProjects: projects.length,
                totalSkills: 0,
                totalExperiences: 0,
                totalEvidence: evidence.length,
            },
            scannedAt: now,
        };
    }

    async disconnect(): Promise<void> {
        this.dirHandle = null;
        this.dirName = null;
        this.status = "disconnected";
    }

    async validate(config: ConnectorConfig): Promise<boolean> {
        return !!(config.path || "showDirectoryPicker" in window);
    }
}
