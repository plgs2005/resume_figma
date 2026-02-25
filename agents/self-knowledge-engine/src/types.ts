/**
 * SelfKnowledgeEngine — Core Type Definitions
 *
 * Toda estrutura de dados do agente é definida aqui.
 * Nenhuma camada pode operar fora destes contratos.
 */

// ─── Evidence Collector (Camada 1) ──────────────────────────────────

export type EvidenceSourceType = 'arquivo' | 'commit' | 'config' | 'readme' | 'migration' | 'docker' | 'ci' | 'test' | 'github-api';

export type EvidenceOrigin = 'local' | 'github';

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

  // ─── Authorship Fields (v2.1) ──────────────────────────────────
  /** Origem da evidência: local (disco) ou github (API) */
  origem?: EvidenceOrigin;
  /** Owner do repositório (ex: "plgs2005") */
  repo_owner?: string | null;
  /** Autor do commit (se evidência de commit) */
  commit_author?: string | null;
  /** Se a autoria foi verificada via commit ou git blame */
  autoria_verificada?: boolean;
  /** Se o arquivo/evidência foi gerado por framework */
  framework_generated?: boolean;
  /** Peso base segundo tipo (1.0 para commit, 0.3 para config, etc.) */
  peso_base?: number;
  /** Peso final após ajustes de autoria/framework */
  peso_final?: number;

  // ─── Commit Detail Fields (v3.0) ──────────────────────────────
  /** Análises de commit individuais associadas a esta evidência */
  commit_analyses?: CommitAnalysis[];
  /** Nível de profundidade da alteração (1-4) */
  depth_level?: DepthLevel;
  /** Módulo arquitetural predominante */
  modulo_tipo?: ModuleType;
}

// ─── Knowledge Truth (v2.1) ─────────────────────────────────────────

export interface KnowledgeTruth {
  /** Skills validadas: têm autoria_verificada em pelo menos 1 evidência */
  skills_validadas: ValidatedSkill[];
  /** Skills inferidas: sem autoria verificada, mas com evidência */
  skills_inferidas: ValidatedSkill[];
  /** Skills descartadas: todas evidências são framework_generated */
  skills_descartadas: ValidatedSkill[];
  /** Total de evidências com autoria verificada */
  total_evidencias_autorais: number;
  /** Total de evidências geradas por framework */
  total_evidencias_framework: number;
  /** Última atualização */
  ultima_atualizacao: string;
}

export interface ValidatedSkill {
  nome: string;
  categoria: SkillCategory;
  nivel: SkillLevel;
  score: number;
  evidencias_autorais: number;
  evidencias_framework: number;
  evidencias_total: number;
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

  // ─── Campos v3.0 (Commit-Based Analysis) ─────────────────────
  /** Confidence score (0-100) — baseado em frequência + profundidade real */
  confidence?: number;
  /** Justificativa do nível atribuído */
  justificativa?: string;
  /** Profundidade média dos commits que tocam esta skill (1-4) */
  depth_medio?: number;
  /** Quantidade de commits autorais que sustentam esta skill */
  commits_autorais?: number;
  /** Se a skill foi inferida por stack do projeto (marcada para revisão) */
  inferida_por_stack?: boolean;
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

// ─── Commit Analysis (v3.0) ──────────────────────────────────────────

/** Análise individual de um commit Git */
export interface CommitAnalysis {
  /** Hash do commit */
  hash: string;
  /** Autor do commit (nome) */
  autor: string;
  /** Email do autor */
  autor_email: string;
  /** Data do commit (ISO) */
  data: string;
  /** Mensagem do commit */
  mensagem: string;
  /** Arquivos modificados neste commit */
  arquivos_modificados: CommitFileChange[];
  /** Total de linhas adicionadas */
  linhas_adicionadas: number;
  /** Total de linhas removidas */
  linhas_removidas: number;
  /** Se o autor é o usuário configurado */
  is_own_commit: boolean;
  /** Nível de profundidade da alteração (1-4) */
  depth_level: DepthLevel;
  /** Domínios técnicos tocados neste commit */
  dominios: string[];
  /** Peso arquitetural do commit */
  peso_arquitetural: number;
}

/** Alteração de arquivo dentro de um commit */
export interface CommitFileChange {
  /** Caminho do arquivo */
  caminho: string;
  /** Extensão do arquivo */
  extensao: string;
  /** Linhas adicionadas */
  adicionadas: number;
  /** Linhas removidas */
  removidas: number;
  /** Classificação do arquivo */
  classificacao: FileClassification;
  /** Domínio técnico inferido pela extensão */
  dominio: string;
  /** Se é arquivo de dependência/scaffold (não conta como evidência) */
  is_dependency: boolean;
  /** Módulo arquitetural (core, superficial, config, etc.) */
  modulo_tipo: ModuleType;
}

/** Classificação de arquivo por origem */
export type FileClassification =
  | 'codigo-autoral'      // Código escrito pelo dev
  | 'scaffold'            // Gerado por CLI/framework
  | 'dependencia'         // node_modules, vendor, etc.
  | 'configuracao'        // tsconfig, eslint, etc.
  | 'documentacao'        // README, docs
  | 'teste'               // Arquivos de teste
  | 'migracao'            // Migrations de BD
  | 'asset';              // Imagens, fontes, etc.

/** Tipo de módulo arquitetural */
export type ModuleType =
  | 'core'                // domain, services, middleware, auth, infra
  | 'feature'             // components, pages, routes
  | 'test'                // testes
  | 'config'              // configuração
  | 'docs'                // documentação
  | 'superficial';        // README, changelog, assets

/** Nível de profundidade da alteração (1-4) */
export type DepthLevel = 1 | 2 | 3 | 4;
// 1 = ajuste superficial (typo, config, README)
// 2 = implementação funcional (novo componente, rota, etc.)
// 3 = refatoração estrutural (reorganizar módulos, renomear camadas)
// 4 = alteração crítica (auth, middleware, domain, infra)

/** Peso por contexto arquitetural */
export interface ArchitecturalWeight {
  /** Domínio técnico */
  dominio: string;
  /** Peso multiplicador (1.0 = normal, >1 = aumento) */
  peso: number;
  /** Justificativa */
  motivo: string;
}

/** Resultado de confidence scoring para uma skill */
export interface ConfidenceResult {
  /** Nome da skill */
  skill: string;
  /** Frequência: em quantos commits/projetos aparece */
  frequencia: number;
  /** Profundidade média dos commits (1-4) */
  profundidade_media: number;
  /** Score de confiança (0-100) */
  confidence: number;
  /** Nível final calculado */
  nivel_final: SkillLevel;
  /** Justificativa do nível atribuído */
  justificativa: string;
  /** Se houve rebaixamento, por quê */
  rebaixamento_motivo?: string;
  /** Se houve promoção, evidências que sustentam */
  promocao_evidencias?: string[];
}

/** Mapa de extensão → domínio técnico */
export interface ExtensionDomainMap {
  extensao: string;
  dominio: string;
  categoria: SkillCategory;
}

// ─── Pipeline ────────────────────────────────────────────────────────

export interface PipelineResult {
  fase: 'collect' | 'normalize' | 'extract' | 'query' | 'match-job' | 'truth';
  sucesso: boolean;
  duracao_ms: number;
  resumo: string;
  erros: string[];
}
