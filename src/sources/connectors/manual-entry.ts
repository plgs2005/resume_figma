/**
 * Manual Entry Connector — Permite entrada manual de experiência e skills.
 *
 * Estratégia:
 * 1. Recebe texto livre descrevendo experiência, projetos, skills
 * 2. Aplica heurísticas simples para categorizar evidências
 * 3. Tudo com confidence máxima (user-declared)
 *
 * Usado quando o usuário quer adicionar informações que não estão
 * em nenhuma fonte digital.
 */

import type {
    SourceConnector,
    SourceData,
    SourceEvidence,
    ConnectorConfig,
    ConnectionStatus,
} from "../types";

/** Tecnologias comuns para auto-detect em texto */
const KNOWN_TECHNOLOGIES = [
    "JavaScript", "TypeScript", "Python", "Java", "PHP", "Ruby", "Go", "Rust",
    "C#", "C++", "Swift", "Kotlin", "Dart", "Scala", "Elixir",
    "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt",
    "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI",
    "Spring", "Laravel", "Rails", "ASP.NET",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "BigQuery",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Terraform",
    "Git", "GitHub", "GitLab", "Jenkins", "CircleCI", "GitHub Actions",
    "Tailwind", "Bootstrap", "Material UI", "Figma",
    "REST", "GraphQL", "gRPC", "WebSocket",
    "Jest", "Vitest", "Pytest", "JUnit",
    "Apigee", "Kong", "Nginx", "Apache",
    "Kafka", "RabbitMQ", "SQS", "Pub/Sub",
];

export class ManualEntryConnector implements SourceConnector {
    readonly id = "manual-entry";
    readonly type = "manual-entry" as const;
    readonly label = "Entrada Manual";
    readonly description = "Descrever experiência e skills manualmente via texto livre.";
    status: ConnectionStatus = "disconnected";

    private rawText: string = "";
    private structuredEntries: ManualEntry[] = [];

    async connect(config: ConnectorConfig): Promise<boolean> {
        this.status = "connecting";
        try {
            if (config.text) {
                this.rawText = config.text;
            } else if (config.entries && Array.isArray(config.entries)) {
                this.structuredEntries = config.entries as ManualEntry[];
            } else {
                throw new Error("Texto ou entries estruturados são obrigatórios.");
            }

            this.status = "connected";
            return true;
        } catch (err) {
            console.error("[ManualEntryConnector] connect error:", err);
            this.status = "error";
            return false;
        }
    }

    async scan(): Promise<SourceData> {
        if (this.status !== "connected") {
            throw new Error("ManualEntryConnector não está conectado.");
        }

        const evidence: SourceEvidence[] = [];
        const now = new Date().toISOString();

        // Processar entries estruturados (se fornecidos)
        for (const entry of this.structuredEntries) {
            evidence.push({
                id: `manual-${entry.kind}-${evidence.length}`,
                kind: entry.kind,
                label: entry.label,
                description: entry.description,
                confidence: 100, // user-declared
                tags: entry.tags ?? [],
                sourceId: this.id,
                sourceType: this.type,
                extractedAt: now,
                metadata: { source: "user-declared" },
            });
        }

        // Processar texto livre
        if (this.rawText.length > 0) {
            // Auto-detect tecnologias mencionadas
            const detectedTechs = KNOWN_TECHNOLOGIES.filter((tech) => {
                const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                return new RegExp(`\\b${escaped}\\b`, "i").test(this.rawText);
            });

            for (const tech of detectedTechs) {
                evidence.push({
                    id: `manual-skill-${tech.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
                    kind: "skill",
                    label: tech,
                    confidence: 100,
                    tags: [tech],
                    sourceId: this.id,
                    sourceType: this.type,
                    extractedAt: now,
                    metadata: { source: "user-declared", detectedFromText: true },
                });
            }

            // Parágrafos como experiências
            const paragraphs = this.rawText
                .split(/\n\n+/)
                .map((p) => p.trim())
                .filter((p) => p.length > 20);

            for (const para of paragraphs) {
                const firstLine = para.split("\n")[0].slice(0, 80);
                evidence.push({
                    id: `manual-exp-${evidence.length}`,
                    kind: "experience",
                    label: firstLine,
                    description: para,
                    confidence: 100,
                    tags: detectedTechs.filter((tech) => {
                        const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                        return new RegExp(`\\b${escaped}\\b`, "i").test(para);
                    }),
                    sourceId: this.id,
                    sourceType: this.type,
                    extractedAt: now,
                    metadata: { source: "user-declared" },
                });
            }
        }

        const skillCount = evidence.filter((e) => e.kind === "skill").length;
        const expCount = evidence.filter((e) => e.kind === "experience").length;

        return {
            sourceId: this.id,
            sourceType: this.type,
            label: "Entrada Manual",
            evidence,
            summary: {
                totalProjects: evidence.filter((e) => e.kind === "project").length,
                totalSkills: skillCount,
                totalExperiences: expCount,
                totalEvidence: evidence.length,
            },
            scannedAt: now,
        };
    }

    async disconnect(): Promise<void> {
        this.rawText = "";
        this.structuredEntries = [];
        this.status = "disconnected";
    }

    async validate(config: ConnectorConfig): Promise<boolean> {
        return !!(config.text || (config.entries && Array.isArray(config.entries)));
    }
}

// ── Tipos internos ───────────────────────────────────────────────────

interface ManualEntry {
    kind: "project" | "skill" | "experience" | "certification" | "education";
    label: string;
    description?: string;
    tags?: string[];
}
