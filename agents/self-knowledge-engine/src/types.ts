/**
 * SelfKnowledgeEngine — Core Type Definitions
 *
 * Toda estrutura de dados do agente é definida aqui.
 * Nenhuma camada pode operar fora destes contratos.
 */

// ─── Evidence Collector (Camada 1) ──────────────────────────────────

export type EvidenceSourceType = 'arquivo' | 'commit' | 'config' | 'readme' | 'migration' | 'docker' | 'ci' | 'test' | 'github-api';

export type ComplexityLevel = 'baixo' | 'medio' | 'alto';

export interface Evidence {
  /** Caminho absoluto do arquivo ou URL do repo */
  fonte: string;
  /** Tipo da fonte */
  tipo: EvidenceSourceType;
  /** Descrição factual da evidência */
  descricao: string;
  /** Stack/tecnologias detectadas */
  stack_detectada: string[];
  /** Nível de complexidade avaliado */
  nivel_complexidade: ComplexityLevel;
  /** Timestamp ISO de quando a evidência foi coletada */
  coletado_em: string;
  /** Identificador único gerado (hash do conteúdo) */
  id: string;
  /** Nome do projeto de origem */
  projeto?: string;
  /** Linha ou referência específica (ex: "linha 42-58") */
  referencia?: string;
}

// ─── Evidence Normalizer (Camada 2) ─────────────────────────────────

export type SkillCategory =
  | 'arquitetura'
  | 'fundamentos'
  | 'performance'
  | 'escalabilidade'
  | 'testes'
  | 'devops'
  | 'produto'
  | 'seguranca'
  | 'banco-de-dados'
  | 'frontend'
  | 'backend'
  | 'integracao';

export interface ProjectGroup {
  /** Nome do projeto */
  nome: string;
  /** Caminho raiz do projeto */
  caminho: string;
  /** Evidências agrupadas */
  evidencias: Evidence[];
  /** Stack consolidada do projeto */
  stack: string[];
  /** Categorias identificadas */
  categorias: SkillCategory[];
  /** Complexidade geral do projeto */
  complexidade: ComplexityLevel;
}

export interface NormalizedBase {
  /** Data da última normalização */
  atualizado_em: string;
  /** Total de evidências brutas coletadas */
  total_evidencias_brutas: number;
  /** Total após deduplicação */
  total_evidencias_unicas: number;
  /** Projetos agrupados */
  projetos: ProjectGroup[];
  /** Mapa de categorias para IDs de evidência */
  por_categoria: Record<SkillCategory, string[]>;
}

// ─── Skill Extractor (Camada 3) ──────────────────────────────────────

export type SkillLevel =
  | 'conhecimento-basico'
  | 'experiencia-pratica'
  | 'experiencia-avancada'
  | 'dominio-solido';

export type EngineeringPattern =
  | 'separacao-camadas'
  | 'uso-interfaces'
  | 'desacoplamento'
  | 'estrategia-cache'
  | 'uso-filas'
  | 'refatoracao-estrutural'
  | 'tuning-banco'
  | 'testes-automatizados'
  | 'ci-cd'
  | 'containerizacao'
  | 'api-rest'
  | 'api-graphql'
  | 'event-driven'
  | 'microservicos'
  | 'monorepo'
  | 'design-system'
  | 'state-management'
  | 'orm-query-builder'
  | 'migrations'
  | 'code-review'
  | 'documentacao';

export interface ExtractedSkill {
  /** Nome da habilidade/tecnologia */
  nome: string;
  /** Categoria */
  categoria: SkillCategory;
  /** Nível classificado */
  nivel: SkillLevel;
  /** Padrões de engenharia associados */
  padroes: EngineeringPattern[];
  /** Frequência de uso (quantos projetos/evidências) */
  frequencia: number;
  /** Profundidade técnica (0-100) */
  profundidade: number;
  /** IDs das evidências que sustentam esta skill */
  evidencias_ids: string[];
  /** Descrição factual consolidada */
  descricao: string;
}

export interface SkillBase {
  atualizado_em: string;
  total_skills: number;
  skills: ExtractedSkill[];
  por_nivel: Record<SkillLevel, string[]>;
  por_categoria: Record<SkillCategory, string[]>;
  padroes_identificados: EngineeringPattern[];
}

// ─── Answer Engine (Camada 4) ────────────────────────────────────────

export interface AnswerResult {
  /** A pergunta original */
  pergunta: string;
  /** Resposta factual */
  resposta: string;
  /** Evidências utilizadas */
  evidencias: Evidence[];
  /** Confiança (0-100) */
  confianca: number;
  /** Se não houver evidência suficiente */
  sem_evidencia: boolean;
  /** Contexto do projeto relacionado */
  contexto_projeto?: string;
}

// ─── Job Matching ────────────────────────────────────────────────────

export interface JobRequirement {
  /** Tecnologia ou habilidade requerida */
  nome: string;
  /** Se é obrigatório ou desejável */
  obrigatorio: boolean;
  /** Nível mínimo exigido (se identificável) */
  nivel_minimo?: SkillLevel;
}

export interface JobDescription {
  /** Título da vaga */
  titulo: string;
  /** Empresa */
  empresa?: string;
  /** Requisitos extraídos */
  requisitos: JobRequirement[];
  /** Texto original */
  texto_original: string;
}

export interface JobMatchResult {
  /** Vaga analisada */
  vaga: JobDescription;
  /** Score de aderência (0-100) */
  aderencia: number;
  /** Skills que atendem requisitos */
  matches: Array<{
    requisito: JobRequirement;
    skill: ExtractedSkill;
    aderencia: number;
  }>;
  /** Gaps técnicos identificados */
  gaps: Array<{
    requisito: JobRequirement;
    sugestao: string;
  }>;
  /** Bullets estratégicos baseados em evidência */
  bullets: string[];
  /** Pontos fortes reais */
  pontos_fortes: string[];
  /** Pontos fracos reais */
  pontos_fracos: string[];
  /** Riscos para entrevista */
  riscos_entrevista: string[];
  /** Ajustes de palavras-chave sugeridos */
  ajustes_keywords: Array<{
    atual: string;
    sugerido: string;
    motivo: string;
  }>;
}

// ─── Configuration ───────────────────────────────────────────────────

export interface SKEConfig {
  /** Diretórios locais para escanear */
  scan_paths: string[];
  /** Diretório de saída para a base persistente */
  output_dir: string;
  /** Token GitHub (opcional) */
  github_token?: string;
  /** Username GitHub */
  github_username?: string;
  /** Extensões de arquivo para analisar */
  file_extensions: string[];
  /** Pastas a ignorar */
  ignore_patterns: string[];
  /** Profundidade máxima de diretório */
  max_depth: number;
}

// ─── Pipeline ────────────────────────────────────────────────────────

export interface PipelineResult {
  fase: 'collect' | 'normalize' | 'extract' | 'query' | 'match-job';
  sucesso: boolean;
  duracao_ms: number;
  resumo: string;
  erros: string[];
}
