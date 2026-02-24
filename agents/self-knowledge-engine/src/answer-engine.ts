/**
 * SelfKnowledgeEngine — Camada 4: Answer Engine
 *
 * Quando receber uma pergunta:
 * 1. Buscar evidências relacionadas
 * 2. Confirmar existência factual
 * 3. Estruturar resposta objetiva
 * 4. Indicar contexto do projeto
 * 5. Se não houver evidência suficiente: "Sem evidência suficiente para afirmar."
 *
 * NUNCA inventar. NUNCA exagerar. NUNCA utilizar buzzwords vazias.
 */

import type {
  Evidence,
  NormalizedBase,
  SkillBase,
  ExtractedSkill,
  AnswerResult,
  JobDescription,
  JobRequirement,
  JobMatchResult,
} from './types.js';
import { log } from './utils.js';

// ─── Main Answer Engine Class ───────────────────────────────────────

export class AnswerEngine {
  private normalizedBase: NormalizedBase;
  private skillBase: SkillBase;
  private evidenceIndex: Map<string, Evidence>;

  constructor(normalizedBase: NormalizedBase, skillBase: SkillBase) {
    this.normalizedBase = normalizedBase;
    this.skillBase = skillBase;

    // Indexar evidências por ID para busca rápida
    this.evidenceIndex = new Map();
    for (const project of normalizedBase.projetos) {
      for (const ev of project.evidencias) {
        this.evidenceIndex.set(ev.id, ev);
      }
    }
  }

  // ─── Query Interface ─────────────────────────────────────────────

  /**
   * Responde uma pergunta com base exclusivamente em evidências factuais.
   */
  query(pergunta: string): AnswerResult {
    log.step(`Buscando evidências para: "${pergunta}"`);

    // 1. Buscar skills e evidências relevantes
    const relevantSkills = this.findRelevantSkills(pergunta);
    const relevantEvidences = this.findRelevantEvidences(pergunta);

    // 2. Verificar se há evidência suficiente
    if (relevantSkills.length === 0 && relevantEvidences.length === 0) {
      return {
        pergunta,
        resposta: 'Sem evidência suficiente para afirmar.',
        evidencias: [],
        confianca: 0,
        sem_evidencia: true,
      };
    }

    // 3. Construir resposta factual
    const resposta = this.buildFactualAnswer(pergunta, relevantSkills, relevantEvidences);
    const confianca = this.calculateConfidence(relevantSkills, relevantEvidences);

    // 4. Determinar contexto do projeto
    const projectContext = this.getProjectContext(relevantEvidences);

    return {
      pergunta,
      resposta,
      evidencias: relevantEvidences,
      confianca,
      sem_evidencia: false,
      contexto_projeto: projectContext,
    };
  }

  // ─── Job Matching ────────────────────────────────────────────────

  /**
   * Cruza requisitos de uma vaga com a base factual.
   */
  matchJob(jobDescription: JobDescription): JobMatchResult {
    log.section('MATCHING DE VAGA');
    log.step(`Vaga: ${jobDescription.titulo}${jobDescription.empresa ? ` @ ${jobDescription.empresa}` : ''}`);

    const matches: JobMatchResult['matches'] = [];
    const gaps: JobMatchResult['gaps'] = [];

    // Processar cada requisito
    for (const req of jobDescription.requisitos) {
      const matchingSkills = this.findSkillsForRequirement(req);

      if (matchingSkills.length > 0) {
        const bestMatch = matchingSkills[0];
        const aderencia = this.calculateRequirementAdherence(req, bestMatch);

        matches.push({
          requisito: req,
          skill: bestMatch,
          aderencia,
        });
      } else {
        gaps.push({
          requisito: req,
          sugestao: req.obrigatorio
            ? `Gap obrigatório: ${req.nome}. Sem evidência de experiência prática.`
            : `Gap desejável: ${req.nome}. Pode ser mencionado se houver conhecimento teórico, mas sem evidência prática.`,
        });
      }
    }

    // Calcular aderência total
    const totalReqs = jobDescription.requisitos.length;
    const matchedReqs = matches.length;
    const obrigatoriosAtendidos = matches.filter(m => m.requisito.obrigatorio).length;
    const obrigatoriosTotal = jobDescription.requisitos.filter(r => r.obrigatorio).length;

    const aderencia = totalReqs > 0
      ? Math.round(
          (obrigatoriosAtendidos / Math.max(obrigatoriosTotal, 1)) * 60 +
          (matchedReqs / totalReqs) * 40
        )
      : 0;

    // Gerar bullets estratégicos
    const bullets = this.generateBullets(matches);

    // Pontos fortes e fracos reais
    const pontosFortes = this.identifyStrengths(matches);
    const pontosFracos = this.identifyWeaknesses(gaps, matches);

    // Riscos para entrevista
    const riscos = this.identifyInterviewRisks(gaps, matches);

    // Ajustes de keywords
    const ajustes = this.suggestKeywordAdjustments(jobDescription, matches);

    const result: JobMatchResult = {
      vaga: jobDescription,
      aderencia,
      matches,
      gaps,
      bullets,
      pontos_fortes: pontosFortes,
      pontos_fracos: pontosFracos,
      riscos_entrevista: riscos,
      ajustes_keywords: ajustes,
    };

    this.printJobMatchSummary(result);
    return result;
  }

  /**
   * Parseia texto livre de descrição de vaga em requisitos estruturados.
   */
  parseJobDescription(text: string, titulo?: string, empresa?: string): JobDescription {
    const requisitos: JobRequirement[] = [];
    const lines = text.split('\n');

    // Detectar tecnologias mencionadas
    const techPatterns: Array<{ regex: RegExp; nome: string }> = [
      { regex: /\breact\b/i, nome: 'React' },
      { regex: /\btypescript\b/i, nome: 'TypeScript' },
      { regex: /\bjavascript\b/i, nome: 'JavaScript' },
      { regex: /\bnode\.?js\b/i, nome: 'Node.js' },
      { regex: /\bnext\.?js\b/i, nome: 'Next.js' },
      { regex: /\bvue\.?js?\b/i, nome: 'Vue.js' },
      { regex: /\bangular\b/i, nome: 'Angular' },
      { regex: /\bpython\b/i, nome: 'Python' },
      { regex: /\bdjango\b/i, nome: 'Django' },
      { regex: /\bflask\b/i, nome: 'Flask' },
      { regex: /\bfastapi\b/i, nome: 'FastAPI' },
      { regex: /\bphp\b/i, nome: 'PHP' },
      { regex: /\blaravel\b/i, nome: 'Laravel' },
      { regex: /\bsymfony\b/i, nome: 'Symfony' },
      { regex: /\bjava\b(?!script)/i, nome: 'Java' },
      { regex: /\bkotlin\b/i, nome: 'Kotlin' },
      { regex: /\bgo\b(?!ogle)/i, nome: 'Go' },
      { regex: /\brust\b/i, nome: 'Rust' },
      { regex: /\bc#|csharp|\.net\b/i, nome: 'C#/.NET' },
      { regex: /\bruby\b/i, nome: 'Ruby' },
      { regex: /\brails\b/i, nome: 'Ruby on Rails' },
      { regex: /\bdocker\b/i, nome: 'Docker' },
      { regex: /\bkubernetes\b|k8s/i, nome: 'Kubernetes' },
      { regex: /\baws\b/i, nome: 'AWS' },
      { regex: /\bgcp\b|google cloud/i, nome: 'GCP' },
      { regex: /\bazure\b/i, nome: 'Azure' },
      { regex: /\bterraform\b/i, nome: 'Terraform' },
      { regex: /\bpostgres/i, nome: 'PostgreSQL' },
      { regex: /\bmysql\b/i, nome: 'MySQL' },
      { regex: /\bmongodb\b/i, nome: 'MongoDB' },
      { regex: /\bredis\b/i, nome: 'Redis' },
      { regex: /\belasticsearch\b/i, nome: 'Elasticsearch' },
      { regex: /\bgraphql\b/i, nome: 'GraphQL' },
      { regex: /\brest\s*api/i, nome: 'REST API' },
      { regex: /\bmicroservi/i, nome: 'Microsserviços' },
      { regex: /\bci\s*\/?\s*cd\b/i, nome: 'CI/CD' },
      { regex: /\btdd\b/i, nome: 'TDD' },
      { regex: /\btestes?\s*(unitário|integração|e2e|automatizado)/i, nome: 'Testes Automatizados' },
      { regex: /\bagile\b|scrum|kanban/i, nome: 'Agile/Scrum' },
      { regex: /\bgit\b(?!hub)/i, nome: 'Git' },
      { regex: /\btailwind/i, nome: 'Tailwind CSS' },
      { regex: /\bprisma\b/i, nome: 'Prisma' },
      { regex: /\bnestjs\b/i, nome: 'NestJS' },
      { regex: /\bexpress\b/i, nome: 'Express.js' },
    ];

    // Determinar se é obrigatório pelo contexto
    let isRequiredSection = true;
    const seenTechs = new Set<string>();

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Detectar seções
      if (/obrigat[oó]ri|requisit|indispens[aá]vel|necess[aá]ri|required|must\s+have/i.test(lower)) {
        isRequiredSection = true;
      }
      if (/desej[aá]vel|diferencial|nice\s+to\s+have|bonus|plus|prefer/i.test(lower)) {
        isRequiredSection = false;
      }

      for (const { regex, nome } of techPatterns) {
        if (regex.test(line) && !seenTechs.has(nome)) {
          seenTechs.add(nome);
          requisitos.push({
            nome,
            obrigatorio: isRequiredSection,
          });
        }
      }
    }

    return {
      titulo: titulo || this.extractJobTitle(text),
      empresa,
      requisitos,
      texto_original: text,
    };
  }

  // ─── Internal Search Methods ─────────────────────────────────────

  private findRelevantSkills(query: string): ExtractedSkill[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

    return this.skillBase.skills.filter(skill => {
      const skillText = `${skill.nome} ${skill.descricao} ${skill.padroes.join(' ')} ${skill.categoria}`.toLowerCase();
      return queryTerms.some(term => skillText.includes(term));
    }).sort((a, b) => b.profundidade - a.profundidade);
  }

  private findRelevantEvidences(query: string): Evidence[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

    const allEvidences = this.normalizedBase.projetos.flatMap(p => p.evidencias);

    return allEvidences.filter(ev => {
      const evText = `${ev.descricao} ${ev.stack_detectada.join(' ')} ${ev.projeto || ''}`.toLowerCase();
      return queryTerms.some(term => evText.includes(term));
    }).slice(0, 10); // Limitar a 10 mais relevantes
  }

  private findSkillsForRequirement(req: JobRequirement): ExtractedSkill[] {
    const reqLower = req.nome.toLowerCase();
    return this.skillBase.skills.filter(skill => {
      const skillLower = skill.nome.toLowerCase();
      return skillLower === reqLower ||
        skillLower.includes(reqLower) ||
        reqLower.includes(skillLower) ||
        skill.descricao.toLowerCase().includes(reqLower);
    }).sort((a, b) => b.profundidade - a.profundidade);
  }

  // ─── Response Building ───────────────────────────────────────────

  private buildFactualAnswer(
    _pergunta: string,
    skills: ExtractedSkill[],
    evidences: Evidence[]
  ): string {
    const parts: string[] = [];

    if (skills.length > 0) {
      parts.push('Com base nas evidências encontradas:');

      for (const skill of skills.slice(0, 5)) {
        parts.push(`• ${skill.nome} — Nível: ${skill.nivel.replace('-', ' ')}. ${skill.descricao}`);
      }
    }

    if (evidences.length > 0) {
      parts.push('\nEvidências de suporte:');
      for (const ev of evidences.slice(0, 5)) {
        parts.push(`  ↳ [${ev.tipo}] ${ev.descricao} (fonte: ${ev.fonte})`);
      }
    }

    return parts.join('\n');
  }

  private calculateConfidence(skills: ExtractedSkill[], evidences: Evidence[]): number {
    if (skills.length === 0 && evidences.length === 0) return 0;

    let score = 0;
    score += Math.min(skills.length * 15, 40);
    score += Math.min(evidences.length * 10, 30);

    // Boost por diversidade de fontes
    const sourceTypes = new Set(evidences.map(e => e.tipo));
    score += Math.min(sourceTypes.size * 10, 30);

    return Math.min(score, 100);
  }

  private getProjectContext(evidences: Evidence[]): string | undefined {
    const projects = [...new Set(evidences.filter(e => e.projeto).map(e => e.projeto))];
    if (projects.length === 0) return undefined;
    return `Projetos relacionados: ${projects.join(', ')}`;
  }

  // ─── Job Match Helpers ───────────────────────────────────────────

  private calculateRequirementAdherence(req: JobRequirement, skill: ExtractedSkill): number {
    let score = 50; // Base: skill exists

    // Level matching
    const levelOrder = ['conhecimento-basico', 'experiencia-pratica', 'experiencia-avancada', 'dominio-solido'];
    const skillLevelIdx = levelOrder.indexOf(skill.nivel);

    if (req.nivel_minimo) {
      const reqLevelIdx = levelOrder.indexOf(req.nivel_minimo);
      if (skillLevelIdx >= reqLevelIdx) {
        score += 30;
      } else {
        score -= (reqLevelIdx - skillLevelIdx) * 10;
      }
    } else {
      score += skillLevelIdx * 10;
    }

    // Frequency and depth boost
    score += Math.min(skill.frequencia * 5, 10);
    score += Math.round(skill.profundidade / 10);

    return Math.min(Math.max(score, 0), 100);
  }

  private generateBullets(matches: JobMatchResult['matches']): string[] {
    return matches
      .filter(m => m.aderencia >= 50)
      .sort((a, b) => b.aderencia - a.aderencia)
      .slice(0, 8)
      .map(m => {
        const ev = this.evidenceIndex.get(m.skill.evidencias_ids[0]);
        const context = ev?.projeto ? ` no projeto ${ev.projeto}` : '';
        return `Experiência comprovada com ${m.skill.nome} (${m.skill.nivel.replace(/-/g, ' ')})${context}. ${m.skill.descricao}`;
      });
  }

  private identifyStrengths(matches: JobMatchResult['matches']): string[] {
    return matches
      .filter(m => m.aderencia >= 70)
      .map(m => `${m.requisito.nome}: ${m.skill.nivel.replace(/-/g, ' ')} — evidenciado em ${m.skill.frequencia} projeto(s)`);
  }

  private identifyWeaknesses(gaps: JobMatchResult['gaps'], matches: JobMatchResult['matches']): string[] {
    const weaknesses: string[] = [];

    // Gaps obrigatórios
    for (const gap of gaps.filter(g => g.requisito.obrigatorio)) {
      weaknesses.push(`${gap.requisito.nome}: sem evidência prática encontrada (requisito obrigatório)`);
    }

    // Skills com baixa aderência
    for (const match of matches.filter(m => m.aderencia < 40)) {
      weaknesses.push(`${match.requisito.nome}: evidência limitada (aderência: ${match.aderencia}%)`);
    }

    return weaknesses;
  }

  private identifyInterviewRisks(gaps: JobMatchResult['gaps'], matches: JobMatchResult['matches']): string[] {
    const risks: string[] = [];

    // Gaps obrigatórios são riscos altos
    const criticalGaps = gaps.filter(g => g.requisito.obrigatorio);
    if (criticalGaps.length > 0) {
      risks.push(`ALTO: ${criticalGaps.length} requisito(s) obrigatório(s) sem evidência: ${criticalGaps.map(g => g.requisito.nome).join(', ')}`);
    }

    // Skills com nível básico em requisito obrigatório
    const basicOnRequired = matches.filter(m => m.requisito.obrigatorio && m.skill.nivel === 'conhecimento-basico');
    if (basicOnRequired.length > 0) {
      risks.push(`MÉDIO: ${basicOnRequired.length} requisito(s) com apenas conhecimento básico: ${basicOnRequired.map(m => m.requisito.nome).join(', ')}`);
    }

    // Muitos gaps desejáveis
    const desiredGaps = gaps.filter(g => !g.requisito.obrigatorio);
    if (desiredGaps.length > 3) {
      risks.push(`BAIXO: ${desiredGaps.length} diferenciais não atendidos — pode reduzir competitividade`);
    }

    return risks;
  }

  private suggestKeywordAdjustments(
    _job: JobDescription,
    matches: JobMatchResult['matches']
  ): JobMatchResult['ajustes_keywords'] {
    const adjustments: JobMatchResult['ajustes_keywords'] = [];

    // Sugerir usar a nomenclatura exata da vaga
    for (const match of matches) {
      const reqName = match.requisito.nome;
      const skillName = match.skill.nome;

      if (reqName.toLowerCase() !== skillName.toLowerCase()) {
        adjustments.push({
          atual: skillName,
          sugerido: reqName,
          motivo: `A vaga usa "${reqName}" — ajustar nomenclatura no currículo para melhor match ATS.`,
        });
      }
    }

    return adjustments;
  }

  private extractJobTitle(text: string): string {
    const lines = text.split('\n').filter(l => l.trim());
    return lines[0]?.trim().slice(0, 100) || 'Vaga não especificada';
  }

  private printJobMatchSummary(result: JobMatchResult): void {
    console.log('\n📋 RESULTADO DO MATCHING:');
    console.log(`   Vaga: ${result.vaga.titulo}`);
    console.log(`   Aderência: ${result.aderencia}%`);
    console.log(`   Requisitos atendidos: ${result.matches.length}/${result.vaga.requisitos.length}`);
    console.log(`   Gaps: ${result.gaps.length}`);
    console.log(`   Riscos: ${result.riscos_entrevista.length}`);

    if (result.pontos_fortes.length > 0) {
      console.log('\n   💪 Pontos Fortes:');
      for (const pf of result.pontos_fortes.slice(0, 5)) {
        console.log(`      • ${pf}`);
      }
    }

    if (result.pontos_fracos.length > 0) {
      console.log('\n   ⚠️  Pontos Fracos:');
      for (const pf of result.pontos_fracos.slice(0, 5)) {
        console.log(`      • ${pf}`);
      }
    }

    if (result.riscos_entrevista.length > 0) {
      console.log('\n   🚨 Riscos para Entrevista:');
      for (const r of result.riscos_entrevista) {
        console.log(`      • ${r}`);
      }
    }
  }
}
