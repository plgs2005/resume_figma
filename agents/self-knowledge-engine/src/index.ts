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
} from './types.js';
