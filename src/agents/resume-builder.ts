/**
 * Resume Builder Agent — Gera versão tailored do currículo.
 *
 * Pipeline: defaultResumeData + JobAnalysis + SKEData → ResumeData tailored
 *
 * Estratégias aplicadas:
 * 1. Reordenar skills: colocar as que correspondem à vaga primeiro
 * 2. Destacar experiências relevantes (relevancia_vaga)
 * 3. Ajustar resumo profissional com keywords da vaga
 * 4. Adicionar job_match ao schema
 * 5. Enriquecer skills com confidence do SKE
 */

import type { ResumeData, SkillGroup, Experience } from "../types/resume";
import type { JobAnalysis } from "./job-analyzer";
import type { SKEData } from "../lib/ske-bridge";
import { enrichResumeWithSKE } from "../lib/ske-bridge";

/* ── Configuração ── */

export interface BuilderOptions {
  /** Se deve reordenar skills com matches na vaga para o topo */
  reorderSkills?: boolean;
  /** Se deve marcar relevância nas experiências */
  markExperienceRelevance?: boolean;
  /** Se deve adicionar sugestões de keywords ao resumo */
  enrichSummary?: boolean;
  /** Se deve enriquecer com dados do SKE (confidence scores) */
  enrichWithSKE?: boolean;
}

const DEFAULT_OPTIONS: BuilderOptions = {
  reorderSkills: true,
  markExperienceRelevance: true,
  enrichSummary: false,
  enrichWithSKE: true,
};

/* ── Builder principal ── */

/**
 * Gera uma versão tailored do currículo baseada na análise da vaga.
 * NÃO modifica o original — retorna uma nova instância.
 */
export function buildTailoredResume(
  baseData: ResumeData,
  analysis: JobAnalysis,
  skeData?: SKEData | null,
  options?: BuilderOptions,
): ResumeData {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result: ResumeData = {
    ...baseData,
    job_match: analysis.match,
    metadata: {
      gerado_por: "agent-builder",
      gerado_em: new Date().toISOString(),
      tailored: true,
      vaga_id: `${analysis.parsed.titulo}_${Date.now()}`,
    },
  };

  // 1. Enriquecer com SKE (confidence scores)
  if (opts.enrichWithSKE && skeData) {
    result = enrichResumeWithSKE(result, skeData);
  }

  // 2. Reordenar skills dentro dos grupos
  if (opts.reorderSkills) {
    result = {
      ...result,
      skill_groups: reorderSkillGroups(
        result.skill_groups,
        analysis.skills_encontradas,
      ),
    };
  }

  // 3. Marcar relevância das experiências
  if (opts.markExperienceRelevance) {
    result = {
      ...result,
      experiencias: markExperienceRelevance(
        result.experiencias,
        analysis.parsed.requisitos.map((r) => r.nome),
      ),
    };
  }

  return result;
}

/* ── Estratégias de otimização ── */

/**
 * Reordena skills dentro de cada grupo, colocando as que
 * correspondem à vaga primeiro e marcando destaque_vaga.
 */
function reorderSkillGroups(
  groups: SkillGroup[],
  matchedKeywords: string[],
): SkillGroup[] {
  const matchSet = new Set(matchedKeywords.map((k) => k.toLowerCase()));

  return groups.map((group) => {
    if (group.tipo === "paragraph") return group;

    const scored = group.skills.map((skill) => {
      const text = skill.nome.toLowerCase().replace(/\*\*/g, "");
      const isMatch = matchSet.size > 0 && [...matchSet].some((kw) => text.includes(kw.toLowerCase()));

      return {
        ...skill,
        destaque_vaga: isMatch || undefined,
        _score: isMatch ? 1 : 0,
      };
    });

    // Ordenar: matches primeiro, depois manter ordem original
    scored.sort((a, b) => b._score - a._score);

    // Remover campo temporário _score
    const skills = scored.map(({ _score, ...rest }) => rest);

    return { ...group, skills };
  });
}

/**
 * Analisa texto de realizações para determinar relevância com a vaga.
 */
function markExperienceRelevance(
  experiencias: Experience[],
  keywords: string[],
): Experience[] {
  if (keywords.length === 0) return experiencias;

  const keywordSet = keywords.map((k) => k.toLowerCase());

  return experiencias.map((exp) => {
    const allText = [
      exp.cargo,
      exp.empresa,
      ...exp.realizacoes,
      ...(exp.stack || []),
    ]
      .join(" ")
      .toLowerCase();

    const matchCount = keywordSet.filter((kw) =>
      allText.includes(kw),
    ).length;
    const matchRatio = matchCount / keywords.length;

    let relevancia_vaga: Experience["relevancia_vaga"];
    if (matchRatio >= 0.4) {
      relevancia_vaga = "alta";
    } else if (matchRatio >= 0.15) {
      relevancia_vaga = "media";
    } else {
      relevancia_vaga = "baixa";
    }

    return { ...exp, relevancia_vaga };
  });
}

/* ── Utilitários de geração ── */

/**
 * Gera um resumo profissional ajustado com keywords da vaga.
 * (Para uso futuro com LLM — por enquanto retorna array de sugestões)
 */
export function suggestSummaryAdjustments(
  currentSummary: string[],
  analysis: JobAnalysis,
): string[] {
  const suggestions: string[] = [];

  // Keywords da vaga que não aparecem no resumo atual
  const summaryText = currentSummary.join(" ").toLowerCase();
  const missingKeywords = analysis.skills_encontradas.filter(
    (kw) => !summaryText.includes(kw.toLowerCase()),
  );

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Considere mencionar no resumo: ${missingKeywords.join(", ")}`,
    );
  }

  // Keywords obrigatórias da vaga
  const obrigatorias = analysis.parsed.requisitos
    .filter((r) => r.obrigatorio)
    .map((r) => r.nome);
  const obrigatoriasNoResumo = obrigatorias.filter((k) =>
    summaryText.includes(k.toLowerCase()),
  );

  if (obrigatoriasNoResumo.length < obrigatorias.length) {
    const faltando = obrigatorias.filter(
      (k) => !summaryText.includes(k.toLowerCase()),
    );
    suggestions.push(
      `⚠️ Keywords obrigatórias ausentes do resumo: ${faltando.join(", ")}`,
    );
  }

  return suggestions;
}

/**
 * Calcula um score comparativo entre a versão base e a tailored.
 */
export function compareTailored(
  base: ResumeData,
  tailored: ResumeData,
): {
  aderencia_antes: number;
  aderencia_depois: number;
  skills_destacadas: number;
  experiencias_relevantes: number;
} {
  const baseAderencia = base.job_match?.aderencia || 0;
  const tailoredAderencia = tailored.job_match?.aderencia || 0;

  const skillsDestacadas = tailored.skill_groups
    .flatMap((g) => g.skills)
    .filter((s) => s.destaque_vaga).length;

  const expRelevantes = tailored.experiencias.filter(
    (e) => e.relevancia_vaga === "alta" || e.relevancia_vaga === "media",
  ).length;

  return {
    aderencia_antes: baseAderencia,
    aderencia_depois: tailoredAderencia,
    skills_destacadas: skillsDestacadas,
    experiencias_relevantes: expRelevantes,
  };
}
