/**
 * Skills module — Barrel export.
 *
 * Uso:
 *   import { normalizeSkillName, mergeEvidence, getSkillGraph } from "@/skills";
 */

// Normalizer
export {
    normalizeSkillName,
    normalizeSkillList,
    areSkillsEquivalent,
    addSkillAlias,
    getSkillAliases,
} from "./skill-normalizer";

// Merger
export {
    mergeEvidence,
    mergeIncremental,
    type MergedSkill,
    type MergeResult,
    type SkillSource,
    type ProficiencyLevel,
} from "./skill-merger";

// Graph
export {
    SkillGraph,
    getSkillGraph,
    resetSkillGraph,
    type GraphNode,
    type GraphEdge,
    type EdgeRelation,
    type NodeKind,
    type SkillCluster,
    type GraphStats,
} from "./skill-graph";
