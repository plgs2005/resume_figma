/**
 * Skill Graph — Grafo de relacionamentos skill ↔ projeto ↔ experiência.
 *
 * Estrutura:
 * - Nodes: skills, projetos, experiências, tecnologias
 * - Edges: relações (usedIn, relatedTo, dependsOn, evidencedBy)
 *
 * O grafo é construído a partir de:
 * 1. SourceEvidence[] dos conectores
 * 2. MergedSkill[] do merger
 * 3. Dados existentes (resume-default, skill-data.json)
 *
 * Fornece queries para:
 * - Encontrar skills relacionadas
 * - Calcular importância relativa
 * - Detectar clusters tecnológicos
 * - Alimentar o Resume Builder com priorização inteligente
 */

import type { SourceEvidence } from "../sources/types";
import type { MergedSkill, MergeResult } from "./skill-merger";
import { normalizeSkillName } from "./skill-normalizer";

// ── Tipos do Grafo ───────────────────────────────────────────────────

export type NodeKind = "skill" | "project" | "experience" | "technology" | "category";

export interface GraphNode {
    id: string;
    kind: NodeKind;
    label: string;
    /** Peso do node (relevância, confidence, etc.) */
    weight: number;
    /** Metadados extras */
    metadata: Record<string, unknown>;
}

export type EdgeRelation =
    | "usedIn"        // skill → project
    | "relatedTo"     // skill ↔ skill
    | "dependsOn"     // skill → skill
    | "evidencedBy"   // skill → evidence
    | "belongsTo"     // skill → category
    | "workedAt"      // experience → project
    | "requires";     // project → technology

export interface GraphEdge {
    source: string;  // node ID
    target: string;  // node ID
    relation: EdgeRelation;
    weight: number;
}

export interface SkillCluster {
    id: string;
    label: string;
    skills: string[];
    avgConfidence: number;
    totalEvidence: number;
}

export interface GraphStats {
    totalNodes: number;
    totalEdges: number;
    totalSkills: number;
    totalProjects: number;
    totalExperiences: number;
    clusters: number;
    builtAt: string;
}

// ── Classe Principal ─────────────────────────────────────────────────

export class SkillGraph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdge[] = [];
    private adjacency: Map<string, Set<string>> = new Map();

    // ── Build ────────────────────────────────────────────────────────

    /**
     * Construir grafo a partir de evidências brutas.
     */
    buildFromEvidence(evidence: SourceEvidence[]): void {
        for (const ev of evidence) {
            switch (ev.kind) {
                case "skill":
                    this.addSkillNode(ev);
                    break;
                case "project":
                    this.addProjectNode(ev);
                    break;
                case "experience":
                    this.addExperienceNode(ev);
                    break;
                default:
                    // certification, education — tratar como metadata
                    this.addGenericNode(ev);
            }
        }

        // Conectar skills a projetos via tags
        this.inferEdgesFromTags(evidence);
    }

    /**
     * Enriquecer grafo com merge result (skills consolidadas).
     */
    enrichWithMergeResult(result: MergeResult): void {
        for (const skill of result.skills) {
            const nodeId = `skill:${normalizeSkillName(skill.name)}`;

            if (!this.nodes.has(nodeId)) {
                this.addNode({
                    id: nodeId,
                    kind: "skill",
                    label: skill.name,
                    weight: skill.confidence,
                    metadata: {
                        level: skill.level,
                        category: skill.category,
                        evidenceCount: skill.evidenceCount,
                        userConfirmed: skill.userConfirmed,
                    },
                });
            } else {
                // Atualizar peso com confidence do merge
                const existing = this.nodes.get(nodeId)!;
                existing.weight = Math.max(existing.weight, skill.confidence);
                existing.metadata = {
                    ...existing.metadata,
                    level: skill.level,
                    category: skill.category,
                };
            }

            // Adicionar edge para categoria
            const catId = `category:${skill.category}`;
            if (!this.nodes.has(catId)) {
                this.addNode({
                    id: catId,
                    kind: "category",
                    label: skill.category,
                    weight: 50,
                    metadata: {},
                });
            }
            this.addEdge(nodeId, catId, "belongsTo", skill.confidence / 100);
        }
    }

    // ── Queries ──────────────────────────────────────────────────────

    /**
     * Obter todas as skills ordenadas por relevância (peso + conexões).
     */
    getTopSkills(limit: number = 20): GraphNode[] {
        const skillNodes = Array.from(this.nodes.values())
            .filter((n) => n.kind === "skill");

        // Score = weight * (1 + connections * 0.1)
        return skillNodes
            .map((n) => ({
                ...n,
                weight: n.weight * (1 + (this.getNeighborCount(n.id)) * 0.1),
            }))
            .sort((a, b) => b.weight - a.weight)
            .slice(0, limit);
    }

    /**
     * Encontrar skills relacionadas a uma skill.
     */
    getRelatedSkills(skillName: string): GraphNode[] {
        const nodeId = `skill:${normalizeSkillName(skillName)}`;
        const neighbors = this.adjacency.get(nodeId) ?? new Set();

        return Array.from(neighbors)
            .map((id) => this.nodes.get(id))
            .filter((n): n is GraphNode => n !== undefined && n.kind === "skill")
            .sort((a, b) => b.weight - a.weight);
    }

    /**
     * Detectar clusters tecnológicos (grupos de skills que aparecem juntas).
     */
    detectClusters(): SkillCluster[] {
        const categoryGroups = new Map<string, MergedSkill[]>();

        // Agrupar por categoria
        for (const node of this.nodes.values()) {
            if (node.kind === "skill" && node.metadata.category) {
                const cat = node.metadata.category as string;
                const existing = categoryGroups.get(cat) ?? [];
                existing.push({
                    name: node.label,
                    level: (node.metadata.level as MergedSkill["level"]) ?? "conhecimento-basico",
                    confidence: node.weight,
                    category: cat,
                    sources: [],
                    tags: [],
                    evidenceCount: (node.metadata.evidenceCount as number) ?? 0,
                    userConfirmed: (node.metadata.userConfirmed as boolean) ?? false,
                });
                categoryGroups.set(cat, existing);
            }
        }

        const clusters: SkillCluster[] = [];
        for (const [cat, skills] of categoryGroups) {
            if (skills.length === 0) continue;

            const avgConf = skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length;
            const totalEvidence = skills.reduce((sum, s) => sum + s.evidenceCount, 0);

            clusters.push({
                id: `cluster:${cat.toLowerCase().replace(/\s+/g, "-")}`,
                label: cat,
                skills: skills.map((s) => s.name),
                avgConfidence: Math.round(avgConf),
                totalEvidence,
            });
        }

        return clusters.sort((a, b) => b.avgConfidence - a.avgConfidence);
    }

    /**
     * Obter projetos onde uma skill foi usada.
     */
    getProjectsForSkill(skillName: string): GraphNode[] {
        const nodeId = `skill:${normalizeSkillName(skillName)}`;
        const neighbors = this.adjacency.get(nodeId) ?? new Set();

        return Array.from(neighbors)
            .map((id) => this.nodes.get(id))
            .filter((n): n is GraphNode => n !== undefined && n.kind === "project");
    }

    /**
     * Obter estatísticas do grafo.
     */
    getStats(): GraphStats {
        const nodes = Array.from(this.nodes.values());
        return {
            totalNodes: nodes.length,
            totalEdges: this.edges.length,
            totalSkills: nodes.filter((n) => n.kind === "skill").length,
            totalProjects: nodes.filter((n) => n.kind === "project").length,
            totalExperiences: nodes.filter((n) => n.kind === "experience").length,
            clusters: this.detectClusters().length,
            builtAt: new Date().toISOString(),
        };
    }

    /**
     * Exportar grafo como JSON serializable.
     */
    toJSON(): { nodes: GraphNode[]; edges: GraphEdge[]; stats: GraphStats } {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: [...this.edges],
            stats: this.getStats(),
        };
    }

    /**
     * Limpar grafo.
     */
    clear(): void {
        this.nodes.clear();
        this.edges = [];
        this.adjacency.clear();
    }

    // ── Internal ─────────────────────────────────────────────────────

    private addNode(node: GraphNode): void {
        this.nodes.set(node.id, node);
        if (!this.adjacency.has(node.id)) {
            this.adjacency.set(node.id, new Set());
        }
    }

    private addEdge(source: string, target: string, relation: EdgeRelation, weight: number): void {
        this.edges.push({ source, target, relation, weight });

        // Bidirecional na adjacency
        if (!this.adjacency.has(source)) this.adjacency.set(source, new Set());
        if (!this.adjacency.has(target)) this.adjacency.set(target, new Set());
        this.adjacency.get(source)!.add(target);
        this.adjacency.get(target)!.add(source);
    }

    private getNeighborCount(nodeId: string): number {
        return this.adjacency.get(nodeId)?.size ?? 0;
    }

    private addSkillNode(ev: SourceEvidence): void {
        const normalized = normalizeSkillName(ev.label);
        const nodeId = `skill:${normalized}`;

        if (!this.nodes.has(nodeId)) {
            this.addNode({
                id: nodeId,
                kind: "skill",
                label: normalized,
                weight: ev.confidence,
                metadata: {
                    sourceType: ev.sourceType,
                    sourceId: ev.sourceId,
                },
            });
        } else {
            // Aumentar peso se já existe
            const node = this.nodes.get(nodeId)!;
            node.weight = Math.max(node.weight, ev.confidence);
        }
    }

    private addProjectNode(ev: SourceEvidence): void {
        const nodeId = `project:${ev.id}`;
        this.addNode({
            id: nodeId,
            kind: "project",
            label: ev.label,
            weight: ev.confidence,
            metadata: {
                description: ev.description,
                sourceType: ev.sourceType,
                ...ev.metadata,
            },
        });

        // Conectar skills mencionadas nos tags
        for (const tag of ev.tags) {
            const skillId = `skill:${normalizeSkillName(tag)}`;
            if (!this.nodes.has(skillId)) {
                this.addNode({
                    id: skillId,
                    kind: "skill",
                    label: normalizeSkillName(tag),
                    weight: ev.confidence * 0.7,
                    metadata: { inferredFrom: "project-tag" },
                });
            }
            this.addEdge(skillId, nodeId, "usedIn", ev.confidence / 100);
        }
    }

    private addExperienceNode(ev: SourceEvidence): void {
        const nodeId = `experience:${ev.id}`;
        this.addNode({
            id: nodeId,
            kind: "experience",
            label: ev.label,
            weight: ev.confidence,
            metadata: {
                description: ev.description,
                sourceType: ev.sourceType,
                ...ev.metadata,
            },
        });
    }

    private addGenericNode(ev: SourceEvidence): void {
        const nodeId = `${ev.kind}:${ev.id}`;
        this.addNode({
            id: nodeId,
            kind: "skill", // fallback
            label: ev.label,
            weight: ev.confidence,
            metadata: {
                originalKind: ev.kind,
                sourceType: ev.sourceType,
            },
        });
    }

    private inferEdgesFromTags(evidence: SourceEvidence[]): void {
        // Para cada par de evidências que compartilham tags, criar edge relatedTo
        const tagIndex = new Map<string, string[]>();

        for (const ev of evidence) {
            for (const tag of ev.tags) {
                const normalized = normalizeSkillName(tag);
                const existing = tagIndex.get(normalized) ?? [];
                const nodeId = ev.kind === "skill"
                    ? `skill:${normalizeSkillName(ev.label)}`
                    : `${ev.kind}:${ev.id}`;
                existing.push(nodeId);
                tagIndex.set(normalized, existing);
            }
        }

        // Skills que compartilham projetos são relatedTo
        for (const nodeIds of tagIndex.values()) {
            const uniqueSkills = [...new Set(nodeIds)].filter((id) => id.startsWith("skill:"));
            for (let i = 0; i < uniqueSkills.length; i++) {
                for (let j = i + 1; j < uniqueSkills.length; j++) {
                    this.addEdge(uniqueSkills[i], uniqueSkills[j], "relatedTo", 0.5);
                }
            }
        }
    }
}

// ── Factory ──────────────────────────────────────────────────────────

/** Singleton do grafo para uso na aplicação */
let _instance: SkillGraph | null = null;

export function getSkillGraph(): SkillGraph {
    if (!_instance) {
        _instance = new SkillGraph();
    }
    return _instance;
}

export function resetSkillGraph(): void {
    _instance?.clear();
    _instance = null;
}
