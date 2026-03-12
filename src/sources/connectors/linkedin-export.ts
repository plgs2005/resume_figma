/**
 * LinkedIn Export Connector — Importa dados do LinkedIn data export.
 *
 * Estratégia:
 * 1. Recebe arquivo ZIP do LinkedIn data export
 * 2. Extrai CSVs relevantes (Positions.csv, Skills.csv, Education.csv, etc.)
 * 3. Parseia e gera evidências de experiência, skill e educação
 *
 * O LinkedIn permite export de dados via Settings > Data Privacy > Get a copy.
 * Os arquivos CSV seguem um formato razoavelmente estável.
 */

import type {
    SourceConnector,
    SourceData,
    SourceEvidence,
    ConnectorConfig,
    ConnectionStatus,
} from "../types";

/** CSVs relevantes dentro do ZIP do LinkedIn */
const RELEVANT_CSVS = [
    "Positions.csv",
    "Skills.csv",
    "Education.csv",
    "Certifications.csv",
    "Profile.csv",
];

export class LinkedInExportConnector implements SourceConnector {
    readonly id = "linkedin-export";
    readonly type = "linkedin-export" as const;
    readonly label = "LinkedIn Export";
    readonly description = "Importar dados exportados do LinkedIn (ZIP com CSVs).";
    status: ConnectionStatus = "disconnected";

    private fileContent: Map<string, string> = new Map();

    async connect(config: ConnectorConfig): Promise<boolean> {
        this.status = "connecting";
        try {
            if (!config.file) {
                throw new Error("Arquivo ZIP do LinkedIn é obrigatório.");
            }

            // Se tiver JSZip disponível, descompactar
            // Fallback: tratar como CSV direto
            const file = config.file;

            if (file.name.endsWith(".csv")) {
                // CSV direto
                const text = await file.text();
                this.fileContent.set(file.name, text);
            } else if (file.name.endsWith(".zip")) {
                // Tentar descompactar com JSZip se disponível
                if (typeof globalThis !== "undefined" && "JSZip" in globalThis) {
                    const JSZip = (globalThis as unknown as { JSZip: { loadAsync: (data: ArrayBuffer) => Promise<{ files: Record<string, { async: (type: string) => Promise<string> }> }> } }).JSZip;
                    const buf = await file.arrayBuffer();
                    const zip = await JSZip.loadAsync(buf);

                    for (const csvName of RELEVANT_CSVS) {
                        const entry = Object.entries(zip.files).find(
                            ([name]) => name.endsWith(csvName),
                        );
                        if (entry) {
                            const content = await entry[1].async("string");
                            this.fileContent.set(csvName, content);
                        }
                    }
                } else {
                    console.warn("[LinkedInExportConnector] JSZip não disponível. Instale jszip para suporte a ZIP.");
                    throw new Error("JSZip não disponível. Envie CSVs individuais.");
                }
            }

            this.status = "connected";
            return true;
        } catch (err) {
            console.error("[LinkedInExportConnector] connect error:", err);
            this.status = "error";
            return false;
        }
    }

    async scan(): Promise<SourceData> {
        if (this.status !== "connected") {
            throw new Error("LinkedInExportConnector não está conectado.");
        }

        const evidence: SourceEvidence[] = [];
        const now = new Date().toISOString();

        // Parsear Positions.csv → experiências
        const positions = this.fileContent.get("Positions.csv");
        if (positions) {
            const rows = parseCSV(positions);
            for (const row of rows) {
                const company = row["Company Name"] ?? row["company_name"] ?? "";
                const title = row["Title"] ?? row["title"] ?? "";
                if (company || title) {
                    evidence.push({
                        id: `li-exp-${slugify(company)}-${slugify(title)}`,
                        kind: "experience",
                        label: `${title} @ ${company}`,
                        description: row["Description"] ?? undefined,
                        confidence: 90,
                        tags: [company, title].filter(Boolean),
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                        metadata: {
                            startDate: row["Started On"] ?? row["started_on"],
                            endDate: row["Finished On"] ?? row["finished_on"],
                            location: row["Location"] ?? row["location"],
                        },
                    });
                }
            }
        }

        // Parsear Skills.csv → skills
        const skills = this.fileContent.get("Skills.csv");
        if (skills) {
            const rows = parseCSV(skills);
            for (const row of rows) {
                const skillName = row["Name"] ?? row["name"] ?? "";
                if (skillName) {
                    evidence.push({
                        id: `li-skill-${slugify(skillName)}`,
                        kind: "skill",
                        label: skillName,
                        confidence: 70,
                        tags: [skillName],
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                    });
                }
            }
        }

        // Parsear Education.csv → educação
        const education = this.fileContent.get("Education.csv");
        if (education) {
            const rows = parseCSV(education);
            for (const row of rows) {
                const school = row["School Name"] ?? row["school_name"] ?? "";
                const degree = row["Degree Name"] ?? row["degree_name"] ?? "";
                if (school) {
                    evidence.push({
                        id: `li-edu-${slugify(school)}`,
                        kind: "education",
                        label: `${degree} — ${school}`,
                        confidence: 95,
                        tags: [school, degree].filter(Boolean),
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                    });
                }
            }
        }

        // Parsear Certifications.csv → certificações
        const certs = this.fileContent.get("Certifications.csv");
        if (certs) {
            const rows = parseCSV(certs);
            for (const row of rows) {
                const certName = row["Name"] ?? row["name"] ?? "";
                if (certName) {
                    evidence.push({
                        id: `li-cert-${slugify(certName)}`,
                        kind: "certification",
                        label: certName,
                        confidence: 95,
                        tags: [row["Authority"] ?? ""].filter(Boolean),
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                        metadata: {
                            authority: row["Authority"] ?? row["authority"],
                            url: row["Url"] ?? row["url"],
                        },
                    });
                }
            }
        }

        const expCount = evidence.filter((e) => e.kind === "experience").length;
        const skillCount = evidence.filter((e) => e.kind === "skill").length;

        return {
            sourceId: this.id,
            sourceType: this.type,
            label: "LinkedIn Export",
            evidence,
            summary: {
                totalProjects: 0,
                totalSkills: skillCount,
                totalExperiences: expCount,
                totalEvidence: evidence.length,
            },
            scannedAt: now,
        };
    }

    async disconnect(): Promise<void> {
        this.fileContent.clear();
        this.status = "disconnected";
    }

    async validate(config: ConnectorConfig): Promise<boolean> {
        if (!config.file) return false;
        const ext = config.file.name.split(".").pop()?.toLowerCase();
        return ext === "zip" || ext === "csv";
    }
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Parser CSV simples (sem dependências) */
function parseCSV(raw: string): Record<string, string>[] {
    const lines = raw.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = splitCSVLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = splitCSVLine(lines[i]);
        const row: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
            row[headers[j].trim()] = (values[j] ?? "").trim();
        }
        rows.push(row);
    }

    return rows;
}

/** Split uma linha CSV respeitando aspas */
function splitCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const ch of line) {
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

/** Gera slug a partir de texto */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
}
