/**
 * SelfKnowledgeEngine — Public API
 *
 * Agente factual para construção e manutenção de base de conhecimento técnico.
 * Baseado exclusivamente em evidências rastreáveis.
 */

export { SelfKnowledgeEngine } from './engine.js';
export { EvidenceCollector } from './collector.js';
export { EvidenceNormalizer } from './normalizer.js';
export { SkillExtractor } from './extractor.js';
export { AnswerEngine } from './answer-engine.js';
export { PromptExporter } from './prompt-export.js';
export { AuthorshipVerifier, applyWeightsOnly } from './authorship.js';
export { CommitAnalyzer } from './commit-analyzer.js';

export type {
  PromptFormat,
  PromptExportOptions,
  ExportedPrompt,
} from './prompt-export.js';

export type {
  Evidence,
  EvidenceSourceType,
  ComplexityLevel,
  NormalizedBase,
  ProjectGroup,
  SkillCategory,
  SkillBase,
  ExtractedSkill,
  SkillLevel,
  EngineeringPattern,
  AnswerResult,
  JobDescription,
  JobRequirement,
  JobMatchResult,
  SKEConfig,
  PipelineResult,
  EvidenceOrigin,
  KnowledgeTruth,
  ValidatedSkill,
  CommitAnalysis,
  CommitFileChange,
  FileClassification,
  ModuleType,
  DepthLevel,
  ArchitecturalWeight,
  ConfidenceResult,
  ExtensionDomainMap,
} from './types.js';
