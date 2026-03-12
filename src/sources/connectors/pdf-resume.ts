/**
 * PDF Resume Connector — Extrai dados de currículo em PDF.
 *
 * Estratégia:
 * 1. Recebe arquivo PDF via upload
 * 2. Extrai texto usando API nativa (ou pdf.js se disponível)
 * 3. Aplica heurísticas para detectar seções (experiência, skills, educação)
 * 4. Gera evidências estruturadas
 *
 * Nota: parser heurístico — funciona melhor com currículos bem formatados.
 */

import type {
    SourceConnector,
    SourceData,
    SourceEvidence,
    ConnectorConfig,
    ConnectionStatus,
} from "../types";

/** Padrões de seção comuns em currículos */
const SECTION_PATTERNS: Record<string, RegExp> = {
    experience: /(?:experi[eê]ncia|experience|work\s*history|hist[oó]rico)/i,
    education: /(?:forma[cç][aã]o|educa[cç][aã]o|education|academic)/i,
    skills: /(?:habilidades|compet[eê]ncias|skills|conhecimentos|technologies)/i,
    certifications: /(?:certifica[cç][oõ]es|certifications|cursos)/i,
    projects: /(?:projetos|projects|portfolio)/i,
};

export class PdfResumeConnector implements SourceConnector {
    readonly id = "pdf-resume";
    readonly type = "pdf-resume" as const;
    readonly label = "Currículo PDF";
    readonly description = "Upload de currículo em PDF para extração automatizada de dados.";
    status: ConnectionStatus = "disconnected";

    private extractedText: string = "";
    private fileName: string = "";

    async connect(config: ConnectorConfig): Promise<boolean> {
        this.status = "connecting";
        try {
            if (!config.file) {
                throw new Error("Arquivo PDF é obrigatório.");
            }

            this.fileName = config.file.name;

            // Tentar extrair texto do PDF
            const text = await this.extractTextFromPDF(config.file);
            if (!text || text.trim().length < 50) {
                console.warn("[PdfResumeConnector] Pouco texto extraído. O PDF pode ser baseado em imagem.");
            }
            this.extractedText = text;
            this.status = "connected";
            return true;
        } catch (err) {
            console.error("[PdfResumeConnector] connect error:", err);
            this.status = "error";
            return false;
        }
    }

    async scan(): Promise<SourceData> {
        if (this.status !== "connected") {
            throw new Error("PdfResumeConnector não está conectado.");
        }

        const evidence: SourceEvidence[] = [];
        const now = new Date().toISOString();
        const text = this.extractedText;

        if (text.length > 0) {
            // Dividir texto em seções
            const sections = this.splitIntoSections(text);

            // Extrair experiências
            if (sections.experience) {
                const experiences = this.extractExperiences(sections.experience);
                for (const exp of experiences) {
                    evidence.push({
                        id: `pdf-exp-${evidence.length}`,
                        kind: "experience",
                        label: exp,
                        confidence: 60,
                        tags: [],
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                    });
                }
            }

            // Extrair skills
            if (sections.skills) {
                const skills = this.extractSkills(sections.skills);
                for (const skill of skills) {
                    evidence.push({
                        id: `pdf-skill-${slugify(skill)}`,
                        kind: "skill",
                        label: skill,
                        confidence: 55,
                        tags: [skill],
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                    });
                }
            }

            // Extrair educação
            if (sections.education) {
                const eduItems = this.extractListItems(sections.education);
                for (const item of eduItems) {
                    evidence.push({
                        id: `pdf-edu-${evidence.length}`,
                        kind: "education",
                        label: item,
                        confidence: 65,
                        tags: [],
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                    });
                }
            }

            // Extrair certificações
            if (sections.certifications) {
                const certs = this.extractListItems(sections.certifications);
                for (const cert of certs) {
                    evidence.push({
                        id: `pdf-cert-${evidence.length}`,
                        kind: "certification",
                        label: cert,
                        confidence: 65,
                        tags: [],
                        sourceId: this.id,
                        sourceType: this.type,
                        extractedAt: now,
                    });
                }
            }
        }

        const skillCount = evidence.filter((e) => e.kind === "skill").length;
        const expCount = evidence.filter((e) => e.kind === "experience").length;

        return {
            sourceId: this.id,
            sourceType: this.type,
            label: `PDF: ${this.fileName}`,
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
        this.extractedText = "";
        this.fileName = "";
        this.status = "disconnected";
    }

    async validate(config: ConnectorConfig): Promise<boolean> {
        if (!config.file) return false;
        return config.file.type === "application/pdf" || config.file.name.endsWith(".pdf");
    }

    // ── Internal methods ─────────────────────────────────────────────

    /** Extrai texto de um PDF (heurístico, sem dependência pesada) */
    private async extractTextFromPDF(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const rawText = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

        // Tentar extrair texto entre stream/endstream
        const textChunks: string[] = [];
        const streamRegex = /stream\s*\n([\s\S]*?)endstream/g;
        let match: RegExpExecArray | null;

        while ((match = streamRegex.exec(rawText)) !== null) {
            const content = match[1];
            // Extrair operadores de texto Tj e TJ
            const tjRegex = /\(([^)]*)\)\s*Tj/g;
            let tjMatch: RegExpExecArray | null;
            while ((tjMatch = tjRegex.exec(content)) !== null) {
                textChunks.push(tjMatch[1]);
            }
        }

        // Fallback: extrair qualquer texto ASCII legível do PDF
        if (textChunks.length === 0) {
            const printable = rawText.replace(/[^\x20-\x7E\xC0-\xFF\n]/g, " ");
            const cleaned = printable.replace(/\s{3,}/g, "\n").trim();
            return cleaned;
        }

        return textChunks.join(" ");
    }

    /** Divide texto em seções usando regex de padrões comuns */
    private splitIntoSections(text: string): Record<string, string> {
        const lines = text.split("\n");
        const sections: Record<string, string> = {};
        let currentSection = "unknown";
        let currentContent: string[] = [];

        for (const line of lines) {
            let matched = false;
            for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
                if (pattern.test(line) && line.trim().length < 60) {
                    // Salvar seção anterior
                    if (currentContent.length > 0) {
                        sections[currentSection] = currentContent.join("\n");
                    }
                    currentSection = section;
                    currentContent = [];
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                currentContent.push(line);
            }
        }

        if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join("\n");
        }

        return sections;
    }

    /** Extrai itens que parecem experiências profissionais */
    private extractExperiences(text: string): string[] {
        const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 10);
        // Agrupar linhas que começam com maiúscula ou contêm datas
        const experiences: string[] = [];
        const datePattern = /\d{4}|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|present/i;

        for (const line of lines) {
            if (datePattern.test(line) || (line[0] === line[0]?.toUpperCase() && line.length > 20)) {
                experiences.push(line);
            }
        }

        return experiences.slice(0, 20); // Limitar
    }

    /** Extrai skills de uma seção de competências */
    private extractSkills(text: string): string[] {
        // Tentar split por vírgulas, bullets, pipes ou newlines
        const candidates = text
            .split(/[,•|;\n]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 1 && s.length < 50 && !/^\d+$/.test(s));

        // Deduplicate
        return [...new Set(candidates)];
    }

    /** Extrai itens de lista genéricos */
    private extractListItems(text: string): string[] {
        return text
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.length > 5);
    }
}

/** Gera slug */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
}
