/**
 * Lens — Sistema de scoring e priorização de relevância.
 *
 * Extrai dimensões contextuais da vaga (senioridade, liderança, temas de negócio)
 * e calcula scores determinísticos de relevância para skills e experiências.
 *
 * Usado pelo resume-builder para aprimorar a priorização além do match de keywords.
 */

/* ── Tipos ── */

export type SeniorityLevel =
  | "junior"
  | "pleno"
  | "senior"
  | "lead"
  | "staff"
  | "principal";

export interface LensDimension {
  cargo: string[];
  senioridade: SeniorityLevel;
  tecnologias: string[];
  temas_negocio: string[];
  lideranca: boolean;
  contexto: string[];
}

export interface LensWeights {
  tecnologia_obrigatoria: number;
  tecnologia_desejavel: number;
  experiencia_lideranca: number;
  senioridade_match: number;
  tema_negocio: number;
  contexto: number;
}

/* ── Defaults ── */

const DEFAULT_WEIGHTS: LensWeights = {
  tecnologia_obrigatoria: 30,
  tecnologia_desejavel: 15,
  experiencia_lideranca: 20,
  senioridade_match: 15,
  tema_negocio: 10,
  contexto: 10,
};

/* ── Detecção de sinais ── */

const LEADERSHIP_SIGNALS: RegExp[] = [
  /l[ií]der\s*(t[eé]cnico)?/i,
  /tech\s*lead/i,
  /team\s*lead/i,
  /coordena/i,
  /gest[ãa]o\s*(de\s*equipe|t[eé]cnica)/i,
  /mentoria/i,
  /arquiteto?\s*(de\s*software|de\s*solu)/i,
  /principal\s*engineer/i,
  /staff\s*engineer/i,
  /engineering\s*manager/i,
  /head\s*of/i,
  /diretor\s*t[eé]cnico/i,
];

const SENIORITY_PATTERNS: Record<string, RegExp[]> = {
  junior: [/j[uú]nior/i, /jr\.?(?:\s|$)/i, /entry[\s-]*level/i],
  pleno: [/pleno/i, /mid[\s-]*level/i],
  senior: [/s[eê]nior/i, /sr\.?(?:\s|$)/i, /especialista/i],
  lead: [/lead\b/i, /l[ií]der/i, /coordenador/i, /tech\s*lead/i],
  staff: [/staff/i],
  principal: [/principal/i],
};

const BUSINESS_THEMES: Array<{ regex: RegExp; tema: string }> = [
  { regex: /fintech|financeiro|banco|pagamento|credito/i, tema: "fintech" },
  { regex: /healthcare|sa[uú]de|hospital/i, tema: "healthcare" },
  { regex: /e-?commerce|varejo|retail|marketplace/i, tema: "e-commerce" },
  { regex: /telecom|telecomunica/i, tema: "telecom" },
  { regex: /edtech|educa/i, tema: "edtech" },
  { regex: /log[ií]stica|supply[\s-]*chain/i, tema: "logistica" },
  { regex: /startup/i, tema: "startup" },
  { regex: /enterprise|corporativ/i, tema: "enterprise" },
  { regex: /governo|p[uú]blic|gov/i, tema: "governo" },
  { regex: /seguran[çc]a|security|cybersec/i, tema: "seguranca" },
  { regex: /intelig[eê]ncia\s*artificial|machine\s*learning|ia\b|ml\b|llm/i, tema: "ia" },
  { regex: /dados|data\s*(engineer|science|analy)/i, tema: "dados" },
  { regex: /cloud|infra/i, tema: "cloud" },
  { regex: /produto|product/i, tema: "produto" },
];

/* ── Extração de dimensões ── */

/**
 * Extrai dimensões contextuais da vaga a partir do texto.
 * Determinístico: mesma entrada → mesma saída.
 */
export function extractDimensions(
  text: string,
  titulo?: string,
): LensDimension {
  const fullText = [titulo || "", text].join(" ");

  // Senioridade (primeira que encaixar, em ordem de especificidade)
  let senioridade: SeniorityLevel = "senior"; // default para vagas que não especificam
  const seniorityOrder: SeniorityLevel[] = [
    "principal",
    "staff",
    "lead",
    "senior",
    "pleno",
    "junior",
  ];
  for (const level of seniorityOrder) {
    if (SENIORITY_PATTERNS[level]?.some((p) => p.test(fullText))) {
      senioridade = level;
      break;
    }
  }

  // Liderança
  const lideranca = LEADERSHIP_SIGNALS.some((p) => p.test(fullText));

  // Temas de negócio
  const temas_negocio = BUSINESS_THEMES.filter((t) =>
    t.regex.test(fullText),
  ).map((t) => t.tema);

  // Contexto
  const contexto: string[] = [];
  if (/remoto|remote/i.test(fullText)) contexto.push("remoto");
  if (/h[ií]brido|hybrid/i.test(fullText)) contexto.push("hibrido");
  if (/presencial|onsite|on[\s-]*site/i.test(fullText))
    contexto.push("presencial");
  if (/internacional|global/i.test(fullText))
    contexto.push("internacional");

  return {
    cargo: titulo ? [titulo] : [],
    senioridade,
    tecnologias: [], // preenchido pelo caller (job-analyzer injeta as tecnologias detectadas)
    temas_negocio,
    lideranca,
    contexto,
  };
}

/* ── Scoring ── */

/**
 * Calcula score de relevância de um texto contra as dimensões da vaga.
 * Retorna valor 0-100.
 */
export function scoreText(
  text: string,
  dimensions: LensDimension,
  weights: LensWeights = DEFAULT_WEIGHTS,
): number {
  const lower = text.toLowerCase();
  let score = 0;

  // Match de tecnologias
  for (const tech of dimensions.tecnologias) {
    if (lower.includes(tech.toLowerCase())) {
      score += weights.tecnologia_obrigatoria;
    }
  }

  // Match de liderança
  if (dimensions.lideranca && LEADERSHIP_SIGNALS.some((p) => p.test(text))) {
    score += weights.experiencia_lideranca;
  }

  // Match de temas de negócio
  for (const tema of dimensions.temas_negocio) {
    if (lower.includes(tema.toLowerCase())) {
      score += weights.tema_negocio;
    }
  }

  // Match de contexto
  for (const ctx of dimensions.contexto) {
    if (lower.includes(ctx.toLowerCase())) {
      score += weights.contexto;
    }
  }

  return Math.min(score, 100);
}

/**
 * Gera ranking de items por relevância.
 * Retorna items ordenados por score decrescente com _lensScore anexado.
 */
export function rankItems<T>(
  items: T[],
  getText: (item: T) => string,
  dimensions: LensDimension,
  weights?: LensWeights,
): Array<T & { _lensScore: number }> {
  return items
    .map((item) => ({
      ...item,
      _lensScore: scoreText(getText(item), dimensions, weights),
    }))
    .sort((a, b) => b._lensScore - a._lensScore);
}

/* ── Funções utilitárias ── */

/**
 * Detecta se a vaga pede liderança técnica.
 */
export function detectsLeadership(text: string): boolean {
  return LEADERSHIP_SIGNALS.some((p) => p.test(text));
}

/**
 * Detecta senioridade requerida pela vaga.
 */
export function detectSeniority(text: string): SeniorityLevel {
  const order: SeniorityLevel[] = [
    "principal",
    "staff",
    "lead",
    "senior",
    "pleno",
    "junior",
  ];
  for (const level of order) {
    if (SENIORITY_PATTERNS[level]?.some((p) => p.test(text))) {
      return level;
    }
  }
  return "senior";
}
