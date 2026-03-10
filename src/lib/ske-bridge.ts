/**
 * SKE Bridge — Conecta o Self-Knowledge Engine ao schema do currículo.
 *
 * Carrega public/skill-data.json (gerado pelo bridge/export.ts do SKE)
 * e fornece funções para:
 * 1. Lookup de skills por nome (fuzzy match)
 * 2. Enriquecimento do ResumeData com scores de confiança
 * 3. Validação: a skill está realmente no portfólio do candidato?
 */

import type { ResumeData, SkillLevel } from "../types/resume";

/* ── Tipos do SKE (espelho do que o bridge/export.ts gera) ── */

export interface SKEData {
  gerado_em: string;
  fonte: string;
  resumo: {
    total_skills: number;
    total_projetos_escaneados: number;
    total_evidencias: number;
    padroes_engenharia: number;
  };
  por_nivel: {
    dominio_solido: string[];
    experiencia_avancada: string[];
    experiencia_pratica: string[];
    conhecimento_basico: string[];
  };
  categorias: Record<string, string[]>;
  destaques: Array<{
    skill: string;
    nivel: string;
    projetos: number;
    profundidade: number;
  }>;
  padroes: string[];
}

export interface SKEMatch {
  encontrado: boolean;
  nome_ske: string;
  nivel: SkillLevel;
  /** Score de confiança 0–100 baseado em projetos e profundidade */
  confidence: number;
  projetos?: number;
  profundidade?: number;
}

/* ── Cache interno ── */

let _skeData: SKEData | null = null;
let _lookupMap: Map<string, SKEMatch> | null = null;

/* ── Carregamento ── */

/**
 * Carrega os dados do SKE de public/skill-data.json.
 * Usa fetch para funcionar tanto em dev (Vite) quanto em build.
 */
export async function loadSKEData(): Promise<SKEData> {
  if (_skeData) return _skeData;

  const resp = await fetch("/skill-data.json");
  if (!resp.ok) {
    throw new Error(
      `Falha ao carregar skill-data.json: ${resp.status} ${resp.statusText}`,
    );
  }

  _skeData = (await resp.json()) as SKEData;
  _lookupMap = null; // Reset lookup cache
  return _skeData;
}

/**
 * Retorna os dados do SKE se já carregados, ou null.
 */
export function getSKEData(): SKEData | null {
  return _skeData;
}

/* ── Normalização para matching ── */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\*\*/g, "") // Remove markup bold
    .replace(/[^a-záàãéêíóôúçñ0-9\s.+#]/gi, " ") // Preserva pontuação técnica
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrai nomes de tecnologias/ferramentas de um texto.
 * Ex: "**React, Vue.js** – integração com APIs" → ["react", "vue.js"]
 */
function extractTechKeywords(text: string): string[] {
  const normalized = normalize(text);
  // Pega tudo antes do primeiro traço/vírgula/parêntese como keywords primárias
  const beforeDash = normalized.split(/\s*[–\-]\s*/)[0];
  return beforeDash
    .split(/[,&]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

/* ── Lookup Map ── */

function buildLookupMap(data: SKEData): Map<string, SKEMatch> {
  if (_lookupMap) return _lookupMap;

  const map = new Map<string, SKEMatch>();

  const nivelMap: Record<string, SkillLevel> = {
    dominio_solido: "dominio-solido",
    experiencia_avancada: "experiencia-avancada",
    experiencia_pratica: "experiencia-pratica",
    conhecimento_basico: "conhecimento-basico",
  };

  // Indexar por_nivel
  for (const [nivelKey, skills] of Object.entries(data.por_nivel)) {
    const nivel = nivelMap[nivelKey] || "conhecimento-basico";
    for (const skillName of skills) {
      const key = normalize(skillName);
      if (!map.has(key)) {
        map.set(key, {
          encontrado: true,
          nome_ske: skillName,
          nivel,
          confidence: nivelToConfidence(nivel),
        });
      }
    }
  }

  // Enriquecer com dados de destaques (projetos/profundidade)
  for (const dest of data.destaques) {
    const key = normalize(dest.skill);
    const existing = map.get(key);
    if (existing) {
      existing.projetos = dest.projetos;
      existing.profundidade = dest.profundidade;
      existing.confidence = Math.min(
        100,
        Math.round(dest.profundidade * 0.6 + Math.min(dest.projetos, 50) * 0.8),
      );
    }
  }

  _lookupMap = map;
  return map;
}

function nivelToConfidence(nivel: SkillLevel): number {
  switch (nivel) {
    case "dominio-solido":
      return 90;
    case "experiencia-avancada":
      return 75;
    case "experiencia-pratica":
      return 55;
    case "conhecimento-basico":
      return 30;
  }
}

/* ── Busca de skills ── */

/**
 * Busca uma skill no SKE por nome (fuzzy match).
 * Primeiro tenta match exato; depois tenta keywords extraídas do texto.
 */
export function findSkill(
  skillText: string,
  data?: SKEData | null,
): SKEMatch | null {
  const skeData = data || _skeData;
  if (!skeData) return null;

  const map = buildLookupMap(skeData);
  const normalizedText = normalize(skillText);

  // 1. Match exato
  const exact = map.get(normalizedText);
  if (exact) return exact;

  // 2. Match por keywords extraídas
  const keywords = extractTechKeywords(skillText);
  for (const kw of keywords) {
    const match = map.get(kw);
    if (match) return match;
  }

  // 3. Match parcial: verifica se alguma key do mapa está contida no texto
  for (const [key, match] of map) {
    if (key.length > 3 && normalizedText.includes(key)) {
      return match;
    }
  }

  return null;
}

/* ── Enriquecimento do ResumeData ── */

/**
 * Enriquece um ResumeData com scores de confiança do SKE.
 * Retorna uma NOVA instância (imutável).
 */
export function enrichResumeWithSKE(
  resumeData: ResumeData,
  skeData?: SKEData | null,
): ResumeData {
  const ske = skeData || _skeData;
  if (!ske) return resumeData;

  const enrichedGroups = resumeData.skill_groups.map((group) => ({
    ...group,
    skills: group.skills.map((skill) => {
      const match = findSkill(skill.nome, ske);
      if (match) {
        return {
          ...skill,
          confidence: match.confidence,
        };
      }
      return skill;
    }),
  }));

  return {
    ...resumeData,
    skill_groups: enrichedGroups,
  };
}

/* ── Estatísticas ── */

export interface SKEStats {
  total_skills: number;
  total_projetos: number;
  total_evidencias: number;
  skills_no_resume: number;
  skills_confirmadas: number;
  skills_sem_match: number;
  coverage_pct: number;
}

/**
 * Calcula estatísticas de cobertura entre o resume e o SKE.
 */
export function calculateCoverage(
  resumeData: ResumeData,
  skeData?: SKEData | null,
): SKEStats {
  const ske = skeData || _skeData;
  if (!ske) {
    return {
      total_skills: 0,
      total_projetos: 0,
      total_evidencias: 0,
      skills_no_resume: 0,
      skills_confirmadas: 0,
      skills_sem_match: 0,
      coverage_pct: 0,
    };
  }

  const allSkills = resumeData.skill_groups.flatMap((g) => g.skills);
  let confirmadas = 0;

  for (const skill of allSkills) {
    const match = findSkill(skill.nome, ske);
    if (match) confirmadas++;
  }

  return {
    total_skills: ske.resumo.total_skills,
    total_projetos: ske.resumo.total_projetos_escaneados,
    total_evidencias: ske.resumo.total_evidencias,
    skills_no_resume: allSkills.length,
    skills_confirmadas: confirmadas,
    skills_sem_match: allSkills.length - confirmadas,
    coverage_pct:
      allSkills.length > 0
        ? Math.round((confirmadas / allSkills.length) * 100)
        : 0,
  };
}
