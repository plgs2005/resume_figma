/**
 * SelfKnowledgeEngine — Prompt Export para LLMs
 *
 * Gera prompts estruturados com dados factuais para alimentar
 * ChatGPT, Claude, Gemini, etc.
 *
 * Formatos disponíveis:
 * - cover-letter:      Prompt para gerar cover letter personalizada
 * - interview-prep:    Prompt para preparação de entrevista técnica
 * - technical-summary: Resumo técnico factual do perfil
 * - linkedin:          Texto para perfil LinkedIn (About/Experience)
 * - custom:            Template livre com dados injetados
 *
 * REGRA: Todo dado vem da base factual. Nada é inventado.
 */

import type {
  SkillBase,
  NormalizedBase,
  JobMatchResult,
  SkillLevel,
  SkillCategory,
} from './types.js';

// ─── Types ──────────────────────────────────────────────────────────

export type PromptFormat =
  | 'cover-letter'
  | 'interview-prep'
  | 'technical-summary'
  | 'linkedin'
  | 'custom';

export interface PromptExportOptions {
  /** Formato do prompt */
  formato: PromptFormat;
  /** Resultado do job match (para cover-letter e interview-prep) */
  jobMatch?: JobMatchResult;
  /** Idioma do output */
  idioma?: 'pt-br' | 'en';
  /** Tom desejado */
  tom?: 'formal' | 'conversacional' | 'tecnico';
  /** Instruções adicionais do usuário */
  instrucoes_extras?: string;
  /** Template customizado (para formato 'custom') */
  template?: string;
  /** Limite de skills a incluir no contexto */
  max_skills?: number;
}

export interface ExportedPrompt {
  /** O prompt completo pronto para usar */
  prompt: string;
  /** Formato utilizado */
  formato: PromptFormat;
  /** Dados factuais injetados */
  dados_injetados: {
    total_skills: number;
    total_projetos: number;
    total_evidencias: number;
    categorias: string[];
    padroes: string[];
  };
  /** Timestamp */
  gerado_em: string;
}

// ─── Main Class ─────────────────────────────────────────────────────

export class PromptExporter {
  private skillBase: SkillBase;
  private normalizedBase: NormalizedBase;

  constructor(skillBase: SkillBase, normalizedBase: NormalizedBase) {
    this.skillBase = skillBase;
    this.normalizedBase = normalizedBase;
  }

  /**
   * Gera prompt estruturado com dados factuais.
   */
  export(options: PromptExportOptions): ExportedPrompt {
    const { formato } = options;

    let prompt: string;
    switch (formato) {
      case 'cover-letter':
        prompt = this.buildCoverLetterPrompt(options);
        break;
      case 'interview-prep':
        prompt = this.buildInterviewPrepPrompt(options);
        break;
      case 'technical-summary':
        prompt = this.buildTechnicalSummaryPrompt(options);
        break;
      case 'linkedin':
        prompt = this.buildLinkedInPrompt(options);
        break;
      case 'custom':
        prompt = this.buildCustomPrompt(options);
        break;
    }

    return {
      prompt,
      formato,
      dados_injetados: {
        total_skills: this.skillBase.total_skills,
        total_projetos: this.normalizedBase.projetos.length,
        total_evidencias: this.normalizedBase.total_evidencias_unicas,
        categorias: Object.keys(this.skillBase.por_categoria).filter(
          c => this.skillBase.por_categoria[c as SkillCategory].length > 0
        ),
        padroes: this.skillBase.padroes_identificados,
      },
      gerado_em: new Date().toISOString(),
    };
  }

  // ─── Cover Letter ────────────────────────────────────────────────

  private buildCoverLetterPrompt(options: PromptExportOptions): string {
    const lang = options.idioma ?? 'pt-br';
    const tom = options.tom ?? 'formal';
    const match = options.jobMatch;

    const sections: string[] = [];

    // System instruction
    sections.push(this.systemInstruction(lang, tom));

    // Task
    if (lang === 'pt-br') {
      sections.push('## TAREFA\n');
      sections.push('Escreva uma cover letter profissional para a vaga descrita abaixo.');
      sections.push('Use EXCLUSIVAMENTE os dados factuais fornecidos — não invente experiências.');
      sections.push('Destaque os pontos fortes que são relevantes para a vaga.');
      if (match?.gaps && match.gaps.length > 0) {
        sections.push('Para os gaps identificados, demonstre capacidade de aprendizado rápido baseado em evidências adjacentes.');
      }
    } else {
      sections.push('## TASK\n');
      sections.push('Write a professional cover letter for the job described below.');
      sections.push('Use EXCLUSIVELY the factual data provided — do not invent experiences.');
      sections.push('Highlight strengths relevant to the role.');
      if (match?.gaps && match.gaps.length > 0) {
        sections.push('For identified gaps, demonstrate fast learning ability based on adjacent evidence.');
      }
    }

    // Job context
    if (match) {
      sections.push('');
      sections.push(this.formatJobContext(match, lang));
    }

    // Factual profile
    sections.push('');
    sections.push(this.formatFactualProfile(options));

    // Match-specific data
    if (match) {
      sections.push('');
      sections.push(this.formatMatchData(match, lang));
    }

    // Constraints
    sections.push('');
    sections.push(this.formatConstraints(lang, tom, 'cover-letter'));

    // Extra instructions
    if (options.instrucoes_extras) {
      sections.push('');
      sections.push(`## ${lang === 'pt-br' ? 'INSTRUÇÕES ADICIONAIS' : 'ADDITIONAL INSTRUCTIONS'}\n`);
      sections.push(options.instrucoes_extras);
    }

    return sections.join('\n');
  }

  // ─── Interview Prep ──────────────────────────────────────────────

  private buildInterviewPrepPrompt(options: PromptExportOptions): string {
    const lang = options.idioma ?? 'pt-br';
    const tom = options.tom ?? 'tecnico';
    const match = options.jobMatch;

    const sections: string[] = [];

    sections.push(this.systemInstruction(lang, tom));

    if (lang === 'pt-br') {
      sections.push('## TAREFA\n');
      sections.push('Prepare um guia de estudo para entrevista técnica com base no perfil factual e na vaga.');
      sections.push('Inclua:');
      sections.push('1. Perguntas técnicas prováveis baseadas nos requisitos da vaga');
      sections.push('2. Respostas sugeridas baseadas em evidências reais do candidato');
      sections.push('3. Pontos para aprofundar antes da entrevista (gaps)');
      sections.push('4. Perguntas comportamentais com exemplos reais de projetos');
      sections.push('5. Riscos e como mitigá-los');
    } else {
      sections.push('## TASK\n');
      sections.push('Prepare a technical interview study guide based on the factual profile and job description.');
      sections.push('Include:');
      sections.push('1. Likely technical questions based on job requirements');
      sections.push('2. Suggested answers based on real candidate evidence');
      sections.push('3. Topics to deepen before the interview (gaps)');
      sections.push('4. Behavioral questions with real project examples');
      sections.push('5. Risks and how to mitigate them');
    }

    if (match) {
      sections.push('');
      sections.push(this.formatJobContext(match, lang));
    }

    sections.push('');
    sections.push(this.formatFactualProfile(options));

    if (match) {
      sections.push('');
      sections.push(this.formatMatchData(match, lang));

      // Risks section
      if (match.riscos_entrevista.length > 0) {
        sections.push('');
        sections.push(`### ${lang === 'pt-br' ? 'RISCOS IDENTIFICADOS' : 'IDENTIFIED RISKS'}\n`);
        for (const r of match.riscos_entrevista) {
          sections.push(`- ${r}`);
        }
      }
    }

    sections.push('');
    sections.push(this.formatConstraints(lang, tom, 'interview-prep'));

    if (options.instrucoes_extras) {
      sections.push('');
      sections.push(`## ${lang === 'pt-br' ? 'INSTRUÇÕES ADICIONAIS' : 'ADDITIONAL INSTRUCTIONS'}\n`);
      sections.push(options.instrucoes_extras);
    }

    return sections.join('\n');
  }

  // ─── Technical Summary ───────────────────────────────────────────

  private buildTechnicalSummaryPrompt(options: PromptExportOptions): string {
    const lang = options.idioma ?? 'pt-br';
    const tom = options.tom ?? 'tecnico';

    const sections: string[] = [];

    sections.push(this.systemInstruction(lang, tom));

    if (lang === 'pt-br') {
      sections.push('## TAREFA\n');
      sections.push('Gere um resumo técnico profissional do perfil abaixo.');
      sections.push('O resumo deve ser estruturado por categoria e nível de proficiência.');
      sections.push('Use apenas dados factuais — sem extrapolações.');
    } else {
      sections.push('## TASK\n');
      sections.push('Generate a professional technical summary of the profile below.');
      sections.push('Structure by category and proficiency level.');
      sections.push('Use only factual data — no extrapolations.');
    }

    sections.push('');
    sections.push(this.formatFactualProfile(options));

    // Detailed patterns
    sections.push('');
    sections.push(this.formatEngineeringPatterns(lang));

    // Project highlights
    sections.push('');
    sections.push(this.formatProjectHighlights(lang, 10));

    sections.push('');
    sections.push(this.formatConstraints(lang, tom, 'technical-summary'));

    return sections.join('\n');
  }

  // ─── LinkedIn ────────────────────────────────────────────────────

  private buildLinkedInPrompt(options: PromptExportOptions): string {
    const lang = options.idioma ?? 'pt-br';
    const tom = options.tom ?? 'conversacional';

    const sections: string[] = [];

    sections.push(this.systemInstruction(lang, tom));

    if (lang === 'pt-br') {
      sections.push('## TAREFA\n');
      sections.push('Gere textos para perfil LinkedIn com base nos dados factuais:');
      sections.push('1. **About/Sobre** (máximo 2000 caracteres): resumo engajante, orientado a resultados');
      sections.push('2. **Headline** (máximo 120 caracteres): título impactante baseado em skills reais');
      sections.push('3. **Skills** lista: as 15 skills mais relevantes para recrutar');
      sections.push('');
      sections.push('NÃO use buzzwords vazios. NÃO invente métricas. Baseie tudo em evidências.');
    } else {
      sections.push('## TASK\n');
      sections.push('Generate LinkedIn profile texts based on factual data:');
      sections.push('1. **About** (max 2000 chars): engaging, results-oriented summary');
      sections.push('2. **Headline** (max 120 chars): impactful title based on real skills');
      sections.push('3. **Skills** list: top 15 skills for recruiting');
      sections.push('');
      sections.push('NO empty buzzwords. NO invented metrics. Base everything on evidence.');
    }

    sections.push('');
    sections.push(this.formatFactualProfile(options));

    sections.push('');
    sections.push(this.formatConstraints(lang, tom, 'linkedin'));

    return sections.join('\n');
  }

  // ─── Custom ──────────────────────────────────────────────────────

  private buildCustomPrompt(options: PromptExportOptions): string {
    const template = options.template || '';
    const lang = options.idioma ?? 'pt-br';

    // Replace placeholders in template
    const factualBlock = this.formatFactualProfile(options);
    const patternsBlock = this.formatEngineeringPatterns(lang);
    const projectsBlock = this.formatProjectHighlights(lang, 10);

    let prompt = template;
    prompt = prompt.replace(/\{\{perfil_factual\}\}/g, factualBlock);
    prompt = prompt.replace(/\{\{padroes_engenharia\}\}/g, patternsBlock);
    prompt = prompt.replace(/\{\{projetos\}\}/g, projectsBlock);
    prompt = prompt.replace(/\{\{total_skills\}\}/g, String(this.skillBase.total_skills));
    prompt = prompt.replace(/\{\{total_projetos\}\}/g, String(this.normalizedBase.projetos.length));

    // If match data is available
    if (options.jobMatch) {
      const matchBlock = this.formatMatchData(options.jobMatch, lang);
      prompt = prompt.replace(/\{\{match_data\}\}/g, matchBlock);
    }

    return prompt;
  }

  // ─── Formatting Helpers ──────────────────────────────────────────

  private systemInstruction(lang: string, tom: string): string {
    const tomMap: Record<string, Record<string, string>> = {
      'pt-br': {
        formal: 'profissional e formal',
        conversacional: 'conversacional mas profissional',
        tecnico: 'técnico e direto',
      },
      en: {
        formal: 'professional and formal',
        conversacional: 'conversational yet professional',
        tecnico: 'technical and direct',
      },
    };

    const tomStr = tomMap[lang]?.[tom] || tom;

    if (lang === 'pt-br') {
      return [
        '## INSTRUÇÃO DO SISTEMA\n',
        `Você é um assistente de carreira que usa EXCLUSIVAMENTE dados factuais.`,
        `Tom: ${tomStr}.`,
        'REGRAS ABSOLUTAS:',
        '- NUNCA invente experiências, projetos ou métricas',
        '- NUNCA use buzzwords vazios (ex: "apaixonado por tecnologia")',
        '- NUNCA extrapole além das evidências fornecidas',
        '- Toda afirmação deve ser baseada nos dados abaixo',
        '- Se não houver evidência para algo, diga "sem evidência para afirmar"',
        '',
      ].join('\n');
    }

    return [
      '## SYSTEM INSTRUCTION\n',
      `You are a career assistant that uses EXCLUSIVELY factual data.`,
      `Tone: ${tomStr}.`,
      'ABSOLUTE RULES:',
      '- NEVER invent experiences, projects, or metrics',
      '- NEVER use empty buzzwords (e.g., "passionate about technology")',
      '- NEVER extrapolate beyond provided evidence',
      '- Every statement must be based on the data below',
      '- If no evidence exists for something, say "no evidence to support"',
      '',
    ].join('\n');
  }

  private formatFactualProfile(options: PromptExportOptions): string {
    const lang = options.idioma ?? 'pt-br';
    const maxSkills = options.max_skills ?? 30;
    const lines: string[] = [];

    lines.push(`## ${lang === 'pt-br' ? 'PERFIL FACTUAL' : 'FACTUAL PROFILE'}\n`);
    lines.push(lang === 'pt-br'
      ? `**Base:** ${this.skillBase.total_skills} skills comprovadas, ${this.normalizedBase.projetos.length} projetos analisados, ${this.normalizedBase.total_evidencias_unicas} evidências.`
      : `**Base:** ${this.skillBase.total_skills} proven skills, ${this.normalizedBase.projetos.length} projects analyzed, ${this.normalizedBase.total_evidencias_unicas} evidences.`
    );

    // Skills by level
    const levelLabels: Record<string, Record<string, string>> = {
      'pt-br': {
        'dominio-solido': 'Domínio Sólido',
        'experiencia-avancada': 'Experiência Avançada',
        'experiencia-pratica': 'Experiência Prática',
        'conhecimento-basico': 'Conhecimento Básico',
      },
      en: {
        'dominio-solido': 'Solid Mastery',
        'experiencia-avancada': 'Advanced Experience',
        'experiencia-pratica': 'Practical Experience',
        'conhecimento-basico': 'Basic Knowledge',
      },
    };

    const labels = levelLabels[lang] || levelLabels['pt-br'];
    const levelOrder: SkillLevel[] = ['dominio-solido', 'experiencia-avancada', 'experiencia-pratica', 'conhecimento-basico'];
    let skillCount = 0;

    for (const level of levelOrder) {
      const skills = this.skillBase.por_nivel[level];
      if (skills.length === 0) continue;

      lines.push('');
      lines.push(`### ${labels[level]} (${skills.length})`);

      for (const skillName of skills) {
        if (skillCount >= maxSkills) break;

        const skill = this.skillBase.skills.find(s => s.nome === skillName);
        if (skill) {
          lines.push(`- **${skill.nome}** [${skill.categoria}] — ${skill.descricao} (${skill.frequencia} projeto(s), profundidade: ${skill.profundidade}/100)`);
          skillCount++;
        }
      }
    }

    return lines.join('\n');
  }

  private formatJobContext(match: JobMatchResult, lang: string): string {
    const lines: string[] = [];

    lines.push(`## ${lang === 'pt-br' ? 'CONTEXTO DA VAGA' : 'JOB CONTEXT'}\n`);
    lines.push(`**${lang === 'pt-br' ? 'Título' : 'Title'}:** ${match.vaga.titulo}`);
    if (match.vaga.empresa) {
      lines.push(`**${lang === 'pt-br' ? 'Empresa' : 'Company'}:** ${match.vaga.empresa}`);
    }
    lines.push(`**${lang === 'pt-br' ? 'Aderência' : 'Match'}:** ${match.aderencia}%`);

    lines.push('');
    lines.push(`### ${lang === 'pt-br' ? 'Requisitos' : 'Requirements'}`);
    for (const req of match.vaga.requisitos) {
      const icon = req.obrigatorio ? '🔴' : '🟡';
      lines.push(`${icon} ${req.nome} (${req.obrigatorio ? (lang === 'pt-br' ? 'obrigatório' : 'required') : (lang === 'pt-br' ? 'desejável' : 'nice-to-have')})`);
    }

    return lines.join('\n');
  }

  private formatMatchData(match: JobMatchResult, lang: string): string {
    const lines: string[] = [];

    // Strengths
    if (match.pontos_fortes.length > 0) {
      lines.push(`### ${lang === 'pt-br' ? 'PONTOS FORTES (usar como destaque)' : 'STRENGTHS (highlight these)'}\n`);
      for (const p of match.pontos_fortes) {
        lines.push(`✅ ${p}`);
      }
      lines.push('');
    }

    // Gaps
    if (match.gaps.length > 0) {
      lines.push(`### ${lang === 'pt-br' ? 'GAPS (tratar com cuidado)' : 'GAPS (handle carefully)'}\n`);
      for (const g of match.gaps) {
        const icon = g.requisito.obrigatorio ? '🔴' : '🟡';
        lines.push(`${icon} ${g.requisito.nome}: ${g.sugestao}`);
      }
      lines.push('');
    }

    // Bullets
    if (match.bullets.length > 0) {
      lines.push(`### ${lang === 'pt-br' ? 'BULLETS FACTUAIS (para incorporar)' : 'FACTUAL BULLETS (to incorporate)'}\n`);
      for (const b of match.bullets) {
        lines.push(`• ${b}`);
      }
      lines.push('');
    }

    // Keyword adjustments
    if (match.ajustes_keywords.length > 0) {
      lines.push(`### ${lang === 'pt-br' ? 'AJUSTES DE KEYWORDS (ATS)' : 'KEYWORD ADJUSTMENTS (ATS)'}\n`);
      for (const a of match.ajustes_keywords) {
        lines.push(`- "${a.atual}" → "${a.sugerido}" (${a.motivo})`);
      }
    }

    return lines.join('\n');
  }

  private formatEngineeringPatterns(lang: string): string {
    const lines: string[] = [];

    lines.push(`### ${lang === 'pt-br' ? 'PADRÕES DE ENGENHARIA COMPROVADOS' : 'PROVEN ENGINEERING PATTERNS'}\n`);

    for (const pattern of this.skillBase.padroes_identificados) {
      lines.push(`- ${pattern}`);
    }

    return lines.join('\n');
  }

  private formatProjectHighlights(lang: string, max: number): string {
    const lines: string[] = [];

    lines.push(`### ${lang === 'pt-br' ? 'PROJETOS DESTACADOS' : 'HIGHLIGHTED PROJECTS'}\n`);

    // Sort projects by evidence count (most evidence = more complex)
    const sorted = [...this.normalizedBase.projetos]
      .sort((a, b) => b.evidencias.length - a.evidencias.length)
      .slice(0, max);

    for (const p of sorted) {
      lines.push(`- **${p.nome}** — ${p.stack.slice(0, 6).join(', ')} [${p.complexidade}] (${p.evidencias.length} evidências)`);
    }

    return lines.join('\n');
  }

  private formatConstraints(lang: string, tom: string, formato: PromptFormat): string {
    const lines: string[] = [];

    lines.push(`## ${lang === 'pt-br' ? 'CONSTRAINTS DE OUTPUT' : 'OUTPUT CONSTRAINTS'}\n`);

    if (lang === 'pt-br') {
      switch (formato) {
        case 'cover-letter':
          lines.push('- Máximo 400 palavras');
          lines.push('- 3-4 parágrafos');
          lines.push('- Não usar "Prezado(a) Senhor(a)" — usar nome da empresa se disponível');
          lines.push('- Fechar com chamada para ação concreta');
          lines.push(`- Tom: ${tom}`);
          lines.push('- Idioma: Português brasileiro');
          break;
        case 'interview-prep':
          lines.push('- Organizar por seção: Técnico, Comportamental, Riscos');
          lines.push('- Para cada pergunta, incluir resposta sugerida com evidências');
          lines.push('- Marcar gaps como "ESTUDAR ANTES"');
          lines.push(`- Tom: ${tom}`);
          break;
        case 'technical-summary':
          lines.push('- Máximo 600 palavras');
          lines.push('- Estruturar por categoria');
          lines.push('- Incluir dados quantitativos (N projetos, N evidências)');
          lines.push(`- Tom: ${tom}`);
          break;
        case 'linkedin':
          lines.push('- About: máximo 2000 caracteres');
          lines.push('- Headline: máximo 120 caracteres');
          lines.push('- Orientado a resultados e dados');
          lines.push('- Evitar clichês de perfil tech');
          lines.push(`- Tom: ${tom}`);
          break;
        default:
          lines.push(`- Tom: ${tom}`);
      }
    } else {
      switch (formato) {
        case 'cover-letter':
          lines.push('- Maximum 400 words');
          lines.push('- 3-4 paragraphs');
          lines.push('- Use company name if available');
          lines.push('- Close with concrete call to action');
          lines.push(`- Tone: ${tom}`);
          lines.push('- Language: English');
          break;
        case 'interview-prep':
          lines.push('- Organize by section: Technical, Behavioral, Risks');
          lines.push('- For each question, include suggested answer with evidence');
          lines.push('- Mark gaps as "STUDY BEFORE"');
          lines.push(`- Tone: ${tom}`);
          break;
        case 'technical-summary':
          lines.push('- Maximum 600 words');
          lines.push('- Structure by category');
          lines.push('- Include quantitative data (N projects, N evidences)');
          lines.push(`- Tone: ${tom}`);
          break;
        case 'linkedin':
          lines.push('- About: max 2000 characters');
          lines.push('- Headline: max 120 characters');
          lines.push('- Results and data oriented');
          lines.push('- Avoid tech profile clichés');
          lines.push(`- Tone: ${tom}`);
          break;
        default:
          lines.push(`- Tone: ${tom}`);
      }
    }

    return lines.join('\n');
  }
}
