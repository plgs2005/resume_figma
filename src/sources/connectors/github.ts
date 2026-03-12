/**
 * GitHub Connector — Extrai evidências de repositórios GitHub.
 *
 * Estratégia:
 * 1. Autentica via Personal Access Token
 * 2. Lista repos do usuário
 * 3. Para cada repo: analisa linguagens, commits recentes, topics
 * 4. Gera evidências de projeto + skill por linguagem/framework
 */

import type {
    SourceConnector,
    SourceData,
    SourceEvidence,
    ConnectorConfig,
    ConnectionStatus,
} from "../types";

export class GitHubConnector implements SourceConnector {
    readonly id = "github";
    readonly type = "github" as const;
    readonly label = "GitHub";
    readonly description = "Conectar repositórios GitHub para análise automatizada de projetos e skills.";
    status: ConnectionStatus = "disconnected";

    private token: string | null = null;
    private username: string | null = null;

    async connect(config: ConnectorConfig): Promise<boolean> {
        this.status = "connecting";
        try {
            if (!config.token) {
                throw new Error("GitHub token é obrigatório.");
            }
            this.token = config.token;

            // Validar token consultando /user
            const res = await fetch("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${this.token}` },
            });

            if (!res.ok) {
                throw new Error(`GitHub API retornou ${res.status}`);
            }

            const user = await res.json();
            this.username = user.login;
            this.status = "connected";
            return true;
        } catch (err) {
            console.error("[GitHubConnector] connect error:", err);
            this.status = "error";
            return false;
        }
    }

    async scan(): Promise<SourceData> {
        if (this.status !== "connected" || !this.token) {
            throw new Error("GitHubConnector não está conectado. Chame connect() primeiro.");
        }

        const evidence: SourceEvidence[] = [];
        const now = new Date().toISOString();

        try {
            // Buscar repos do usuário (até 100)
            const res = await fetch(
                "https://api.github.com/user/repos?per_page=100&sort=updated&type=owner",
                { headers: { Authorization: `Bearer ${this.token}` } },
            );

            if (!res.ok) throw new Error(`Falha ao listar repos: ${res.status}`);

            const repos: Array<{
                name: string;
                description: string | null;
                language: string | null;
                topics: string[];
                stargazers_count: number;
                fork: boolean;
                html_url: string;
                updated_at: string;
            }> = await res.json();

            // Filtrar forks
            const ownRepos = repos.filter((r) => !r.fork);

            for (const repo of ownRepos) {
                // Evidência de projeto
                evidence.push({
                    id: `gh-project-${repo.name}`,
                    kind: "project",
                    label: repo.name,
                    description: repo.description ?? undefined,
                    confidence: 90,
                    tags: [
                        ...(repo.language ? [repo.language] : []),
                        ...repo.topics,
                    ],
                    sourceId: this.id,
                    sourceType: this.type,
                    extractedAt: now,
                    metadata: {
                        stars: repo.stargazers_count,
                        url: repo.html_url,
                        updatedAt: repo.updated_at,
                    },
                });

                // Evidência de skill por linguagem principal
                if (repo.language) {
                    const existingSkill = evidence.find(
                        (e) => e.kind === "skill" && e.label === repo.language,
                    );
                    if (!existingSkill) {
                        evidence.push({
                            id: `gh-skill-${repo.language.toLowerCase()}`,
                            kind: "skill",
                            label: repo.language,
                            confidence: 85,
                            tags: [repo.language],
                            sourceId: this.id,
                            sourceType: this.type,
                            extractedAt: now,
                        });
                    }
                }
            }
        } catch (err) {
            console.error("[GitHubConnector] scan error:", err);
        }

        const skills = evidence.filter((e) => e.kind === "skill");
        const projects = evidence.filter((e) => e.kind === "project");

        return {
            sourceId: this.id,
            sourceType: this.type,
            label: `GitHub (${this.username})`,
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
        this.token = null;
        this.username = null;
        this.status = "disconnected";
    }

    async validate(config: ConnectorConfig): Promise<boolean> {
        if (!config.token) return false;
        try {
            const res = await fetch("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${config.token}` },
            });
            return res.ok;
        } catch {
            return false;
        }
    }
}
