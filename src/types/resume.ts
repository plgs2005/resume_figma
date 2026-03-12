/**
 * Resume Data Schema v1.0
 *
 * Contrato de dados entre os agentes (SKE, Job Analyzer, Resume Builder)
 * e o componente visual (App.tsx).
 *
 * TODA renderização do currículo deve consumir este schema.
 * Nenhum texto hardcoded deve existir no App.tsx.
 */

// ── Informações Pessoais ──────────────────────────────────────────────

export interface PersonalInfo {
  nome: string;
  titulo: string;
  email: string;
  telefone: string;
  localizacao: string;
  linkedin: string;
  /** URL opcional do GitHub */
  github?: string;
  /** URL opcional do portfólio */
  portfolio?: string;
}

// ── Resumo Profissional ───────────────────────────────────────────────

export interface ProfessionalSummary {
  /** Texto principal do resumo (pode ter múltiplos parágrafos) */
  paragrafos: string[];
  /** Keywords destacadas para ATS (opcionais) */
  keywords_ats?: string[];
}

// ── Skills / Conhecimentos Técnicos ──────────────────────────────────

export type SkillLevel =
  | "dominio-solido"
  | "experiencia-avancada"
  | "experiencia-pratica"
  | "conhecimento-basico";

export interface Skill {
  nome: string;
  nivel: SkillLevel;
  /** Categoria p/ agrupamento visual */
  categoria: string;
  /** Score de confiança 0-100 (vindo do SKE) */
  confidence?: number;
  /** Se foi destacada pelo match com a vaga */
  destaque_vaga?: boolean;
  /** Origem do dado (progressivo) */
  source?: "truth-layer" | "user-declared" | "user-confirmed";
}

export interface SkillGroup {
  titulo: string;
  /** Se a sessão ocupa largura total ou metade */
  fullWidth?: boolean;
  /** Modo de renderização: 'bullets' (padrão) ou 'paragraph' */
  tipo?: "bullets" | "paragraph";
  skills: Skill[];
}

// ── Experiência Profissional ─────────────────────────────────────────

export interface Experience {
  empresa: string;
  cargo: string;
  periodo: string;
  /** Se é o emprego atual */
  atual?: boolean;
  /** Bullets de realizações */
  realizacoes: string[];
  /** Stack usada nesta experiência */
  stack?: string[];
  /** Se esta experiência é relevante para a vaga atual (match) */
  relevancia_vaga?: "alta" | "media" | "baixa";
  /** Origem do dado (progressivo) */
  source?: "truth-layer" | "user-declared" | "user-confirmed";
}

// ── Projetos Próprios ────────────────────────────────────────────────

export interface Project {
  nome: string;
  descricao: string;
  /** Subtítulo (ex: "Ezead.club + Automações") */
  subtitulo?: string;
  periodo?: string;
  stack?: string[];
  url?: string;
}

// ── Consultoria / Freelance ──────────────────────────────────────────

export interface ConsultingProject {
  empresa: string;
  descricao: string;
}

// ── Formação Acadêmica ───────────────────────────────────────────────

export interface Education {
  instituicao: string;
  curso: string;
  periodo: string;
  status: "em-andamento" | "concluido" | "trancado";
}

// ── Especializações / Certificações ──────────────────────────────────

export interface Specialization {
  titulo: string;
  descricao: string;
  /** Ícone ou emoji representativo */
  icone?: string;
}

// ── Dados de Match com Vaga (preenchido pelo Job Analyzer) ───────────

export interface JobMatch {
  /** Título da vaga */
  titulo_vaga: string;
  /** Empresa */
  empresa_vaga?: string;
  /** Score de aderência 0-100 */
  aderencia: number;
  /** Keywords da vaga que o candidato atende */
  keywords_match: string[];
  /** Keywords da vaga que o candidato NÃO atende */
  keywords_gap: string[];
  /** Sugestões de ajuste para o currículo */
  sugestoes: string[];
}

// ── Schema Principal ─────────────────────────────────────────────────

export interface ResumeData {
  /** Versão do schema */
  schema_version: "1.0";

  /** Informações pessoais */
  pessoal: PersonalInfo;

  /** Resumo profissional */
  resumo: ProfessionalSummary;

  /** Grupos de skills (renderizam como blocos visuais) */
  skill_groups: SkillGroup[];

  /** Experiências profissionais (ordem cronológica reversa) */
  experiencias: Experience[];

  /** Projetos próprios */
  projetos: Project[];

  /** Consultorias / freelance */
  consultorias: ConsultingProject[];

  /** Formação acadêmica */
  formacao: Education[];

  /** Especializações / certificações */
  especializacoes: Specialization[];

  /** Dados de match com vaga (null se não há vaga alvo) */
  job_match?: JobMatch | null;

  /** Metadados de geração */
  metadata: {
    /** Quem gerou: 'manual' | 'ske' | 'agent-builder' */
    gerado_por: "manual" | "ske" | "agent-builder";
    /** Timestamp ISO */
    gerado_em: string;
    /** Se foi tailored para vaga específica */
    tailored: boolean;
    /** ID da vaga (se aplicável) */
    vaga_id?: string;
  };
}

// ── Tipo de dados do SKE bridge (já existe em public/skill-data.json) ─

export interface SKESkillData {
  meta: {
    gerado_em: string;
    total_skills: number;
    total_projetos: number;
    total_evidencias: number;
  };
  por_nivel: Record<SkillLevel, string[]>;
  por_categoria: Record<string, string[]>;
  destaques: Array<{
    nome: string;
    nivel: SkillLevel;
    categoria: string;
    confidence: number;
    evidencias: number;
    projetos: number;
  }>;
  padroes: string[];
}
