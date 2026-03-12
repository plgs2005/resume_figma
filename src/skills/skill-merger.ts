/**
 * Skill Merger — Merge cross-source de evidências em skills consolidadas.
 *
 * Estratégia:
 * 1. Recebe evidências de múltiplas fontes (SourceEvidence[])
 * 2. Agrupa por skill normalizado
 * 3. Calcula confidence composta (média ponderada por fonte)
 * 4. Determina nível de proficiência baseado em evidências
 * 5. Retorna lista consolidada de MergedSkill
 */

import type { SourceEvidence, SourceType } from "../sources/types";
import { normalizeSkillName } from "./skill-normalizer";

// ── Tipos do Merger ──────────────────────────────────────────────────

export type ProficiencyLevel =
    | "dominio-solido"
    | "experiencia-avancada"
    | "experiencia-pratica"
    | "conhecimento-basico";

export interface SkillSource {
    /** ID da fonte */
    sourceId: string;
    /** Tipo da fonte */
    sourceType: SourceType;
    /** Confidence individual da fonte */
    confidence: number;
    /** Timestamp da extração */
    extractedAt: string;
}

export interface MergedSkill {
    /** Nome normalizado da skill */
    name: string;
    /** Nível de proficiência inferido */
    level: ProficiencyLevel;
    /** Confidence composta (0-100) */
    confidence: number;
    /** Categoria inferida */
    category: string;
    /** Todas as fontes que reportaram esta skill */
    sources: SkillSource[];
    /** Tags agregadas */
    tags: string[];
    /** Número total de evidências */
    evidenceCount: number;
    /** Se a skill foi confirmada pelo usuário */
    userConfirmed: boolean;
}

export interface MergeResult {
    /** Skills consolidadas */
    skills: MergedSkill[];
    /** Estatísticas do merge */
    stats: {
        totalInputEvidence: number;
        totalSkills: number;
        totalSources: number;
        mergedAt: string;
    };
}

// ── Pesos por tipo de fonte ──────────────────────────────────────────

const SOURCE_WEIGHTS: Record<SourceType, number> = {
    "github": 0.9,
    "local-repo": 0.85,
    "local-directory": 0.7,
    "linkedin-export": 0.8,
    "pdf-resume": 0.6,
    "manual-entry": 1.0, // user-declared = verdade absoluta
};

// ── Categoria inference ──────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
    // Backend
    "Node.js": "Backend", "Python": "Backend", "Java": "Backend", "PHP": "Backend",
    "Ruby": "Backend", "Go": "Backend", "Rust": "Backend", "C#": "Backend",
    "Express.js": "Backend", "NestJS": "Backend", "Django": "Backend",
    "Flask": "Backend", "FastAPI": "Backend", "Laravel": "Backend",
    "Symfony": "Backend", "Spring": "Backend", "Spring Boot": "Backend",
    "Ruby on Rails": "Backend", "ASP.NET": "Backend", "Kotlin": "Backend",
    "Fastify": "Backend",

    // Frontend
    "React": "Frontend", "Vue.js": "Frontend", "Angular": "Frontend",
    "Svelte": "Frontend", "SvelteKit": "Frontend", "Next.js": "Frontend",
    "Nuxt.js": "Frontend", "CSS": "Frontend", "Tailwind CSS": "Frontend",
    "Bootstrap": "Frontend", "Material UI": "Frontend", "Figma": "Frontend",
    "TypeScript": "Frontend", "JavaScript": "Frontend",

    // DevOps
    "Docker": "DevOps", "Docker Compose": "DevOps", "Kubernetes": "DevOps",
    "AWS": "Cloud", "GCP": "Cloud", "Azure": "Cloud", "Terraform": "DevOps",
    "Jenkins": "DevOps", "GitHub Actions": "DevOps", "CircleCI": "DevOps",
    "GitLab CI": "DevOps", "CI/CD": "DevOps", "Nginx": "DevOps",

    // Databases
    "PostgreSQL": "Database", "MySQL": "Database", "MongoDB": "Database",
    "Redis": "Database", "DynamoDB": "Database", "BigQuery": "Database",
    "SQLite": "Database", "SQL": "Database",

    // Testing
    "Jest": "Testing", "Vitest": "Testing", "Pytest": "Testing",
    "PHPUnit": "Testing", "JUnit": "Testing", "Playwright": "Testing",
    "Cypress": "Testing", "E2E Testing": "Testing", "Automated Testing": "Testing",
    "Testing": "Testing", "CI Testing": "Testing",

    // API
    "REST API": "API", "GraphQL": "API", "gRPC": "API", "WebSocket": "API",
    "Apigee": "API Management", "Apigee X": "API Management", "Kong": "API Management",

    // Messaging
    "Apache Kafka": "Messaging", "RabbitMQ": "Messaging",
    "AWS SQS": "Messaging", "Pub/Sub": "Messaging",

    // Tools
    "Git": "Tools", "GitHub": "Tools", "GitLab": "Tools",
    "Vite": "Build Tools", "Webpack": "Build Tools", "Rollup": "Build Tools",
    "esbuild": "Build Tools",
};

// ── Funções principais ───────────────────────────────────────────────

/**
 * Mergear evidências de múltiplas fontes em skills consolidadas.
 */
export function mergeEvidence(evidence: SourceEvidence[]): MergeResult {
    const now = new Date().toISOString();

    // Filtrar apenas evidências do tipo "skill"
    const skillEvidence = evidence.filter((e) => e.kind === "skill");

    // Agrupar por nome normalizado
    const groups = new Map<string, SourceEvidence[]>();
    for (const ev of skillEvidence) {
        const normalized = normalizeSkillName(ev.label);
        const existing = groups.get(normalized) ?? [];
        existing.push(ev);
        groups.set(normalized, existing);
    }

    // Gerar MergedSkill para cada grupo
    const skills: MergedSkill[] = [];
    const allSourceIds = new Set<string>();

    for (const [name, evidences] of groups) {
        const sources: SkillSource[] = evidences.map((ev) => {
            allSourceIds.add(ev.sourceId);
            return {
                sourceId: ev.sourceId,
                sourceType: ev.sourceType,
                confidence: ev.confidence,
                extractedAt: ev.extractedAt,
            };
        });

        // Confidence composta = média ponderada
        const confidence = calculateCompositeConfidence(sources);

        // Nível de proficiência
        const level = inferProficiencyLevel(confidence, sources.length);

        // Categoria
        const category = CATEGORY_MAP[name] ?? inferCategoryFromTags(evidences);

        // Tags agregadas
        const allTags = new Set<string>();
        for (const ev of evidences) {
            for (const tag of ev.tags) allTags.add(tag);
        }

        // User confirmed?
        const userConfirmed = sources.some(
            (s) => s.sourceType === "manual-entry",
        );

        skills.push({
            name,
            level,
            confidence,
            category,
            sources,
            tags: Array.from(allTags),
            evidenceCount: evidences.length,
            userConfirmed,
        });
    }

    // Ordenar por confidence desc
    skills.sort((a, b) => b.confidence - a.confidence);

    return {
        skills,
        stats: {
            totalInputEvidence: evidence.length,
            totalSkills: skills.length,
            totalSources: allSourceIds.size,
            mergedAt: now,
        },
    };
}

/**
 * Merge incremental: adiciona novas evidências a um resultado existente.
 */
export function mergeIncremental(
    existing: MergeResult,
    newEvidence: SourceEvidence[],
): MergeResult {
    // Reconstruir evidências originais a partir do existing
    const existingEvidence: SourceEvidence[] = existing.skills.flatMap((skill) =>
        skill.sources.map((src) => ({
            id: `merged-${skill.name}-${src.sourceId}`,
            kind: "skill" as const,
            label: skill.name,
            confidence: src.confidence,
            tags: skill.tags,
            sourceId: src.sourceId,
            sourceType: src.sourceType,
            extractedAt: src.extractedAt,
        })),
    );

    return mergeEvidence([...existingEvidence, ...newEvidence]);
}

// ── Helpers ──────────────────────────────────────────────────────────

function calculateCompositeConfidence(sources: SkillSource[]): number {
    if (sources.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const src of sources) {
        const weight = SOURCE_WEIGHTS[src.sourceType] ?? 0.5;
        weightedSum += src.confidence * weight;
        totalWeight += weight;
    }

    // Bonus por múltiplas fontes (cross-validation)
    const crossSourceBonus = Math.min(sources.length * 3, 15);

    const base = totalWeight > 0 ? weightedSum / totalWeight : 0;
    return Math.min(100, Math.round(base + crossSourceBonus));
}

function inferProficiencyLevel(
    confidence: number,
    sourceCount: number,
): ProficiencyLevel {
    // Confidence alta + múltiplas fontes = domínio sólido
    if (confidence >= 85 && sourceCount >= 2) return "dominio-solido";
    if (confidence >= 70) return "experiencia-avancada";
    if (confidence >= 50) return "experiencia-pratica";
    return "conhecimento-basico";
}

function inferCategoryFromTags(evidences: SourceEvidence[]): string {
    const tagCounts = new Map<string, number>();
    for (const ev of evidences) {
        for (const tag of ev.tags) {
            const cat = CATEGORY_MAP[tag];
            if (cat) {
                tagCounts.set(cat, (tagCounts.get(cat) ?? 0) + 1);
            }
        }
    }

    // Retorna a categoria mais frequente
    let maxCat = "Outros";
    let maxCount = 0;
    for (const [cat, count] of tagCounts) {
        if (count > maxCount) {
            maxCat = cat;
            maxCount = count;
        }
    }

    return maxCat;
}
