/**
 * SelfKnowledgeEngine — Camada 3: Skill Extractor (v3.0)
 *
 * Responsável por:
 * - Identificar padrões reais de engenharia
 * - Determinar frequência de uso e profundidade técnica
 * - Classificar nível de habilidade
 * - Tudo baseado exclusivamente em evidência factual
 *
 * ALTERAÇÕES v3.0:
 * - Confidence scoring: frequência + profundidade = nível final
 * - Nunca rebaixar habilidade sem justificar com dados
 * - Nunca promover habilidade sem múltiplas evidências fortes
 * - NÃO inferir habilidade apenas porque o projeto usa tecnologia X
 * - Apenas commits modificados pelo usuário contam
 * - Sistema de profundidade (1-4) baseado em commit real
 */

import type {
  NormalizedBase,
  SkillBase,
  ExtractedSkill,
  SkillLevel,
  SkillCategory,
  EngineeringPattern,
  Evidence,
  ConfidenceResult,
} from './types.js';
import { now, log } from './utils.js';
import { STACK_TO_CATEGORY } from './normalizer.js';

// ─── Pattern Detection Rules ────────────────────────────────────────

interface PatternRule {
  pattern: EngineeringPattern;
  /** Stack items que indicam este padrão */
  indicators: string[];
  /** Mínimo de indicadores para ativar */
  minIndicators: number;
  /** Descrição factual do padrão */
  descricao: string;
}

const PATTERN_RULES: PatternRule[] = [
  {
    pattern: 'separacao-camadas',
    indicators: ['MVC', 'Clean Architecture', 'DDD', 'Service Pattern', 'Repository Pattern', 'Arquitetura Modular', 'Separação src/lib'],
    minIndicators: 1,
    descricao: 'Separação de responsabilidades em camadas distintas',
  },
  {
    pattern: 'uso-interfaces',
    indicators: ['TypeScript', 'Clean Architecture', 'DDD', 'NestJS', 'Repository Pattern'],
    minIndicators: 2,
    descricao: 'Uso de interfaces/contratos para desacoplamento',
  },
  {
    pattern: 'desacoplamento',
    indicators: ['Service Pattern', 'Repository Pattern', 'Clean Architecture', 'DDD', 'Message Queue', 'Event-driven'],
    minIndicators: 2,
    descricao: 'Desacoplamento entre módulos e camadas',
  },
  {
    pattern: 'estrategia-cache',
    indicators: ['Redis', 'Cache', 'Elasticsearch'],
    minIndicators: 1,
    descricao: 'Implementação de estratégias de cache',
  },
  {
    pattern: 'uso-filas',
    indicators: ['BullMQ', 'Bull', 'RabbitMQ', 'Celery', 'Filas', 'Message Queue'],
    minIndicators: 1,
    descricao: 'Processamento assíncrono via filas',
  },
  {
    pattern: 'refatoracao-estrutural',
    indicators: ['Refatoração', 'Conventional Commits'],
    minIndicators: 1,
    descricao: 'Prática de refatoração contínua',
  },
  {
    pattern: 'tuning-banco',
    indicators: ['criação de índices', 'Schema Design', 'Query Builder', 'ORM'],
    minIndicators: 1,
    descricao: 'Otimização de queries e estrutura de banco',
  },
  {
    pattern: 'testes-automatizados',
    indicators: ['Testes Automatizados', 'Jest', 'Vitest', 'Mocha', 'PHPUnit', 'Pytest', 'Cypress', 'Playwright', 'E2E', 'Testes em CI'],
    minIndicators: 1,
    descricao: 'Cobertura de testes automatizados',
  },
  {
    pattern: 'ci-cd',
    indicators: ['CI/CD', 'GitHub Actions', 'Jenkins', 'CircleCI', 'Deploy Automatizado', 'Testes em CI'],
    minIndicators: 1,
    descricao: 'Pipeline de integração e deploy contínuo',
  },
  {
    pattern: 'containerizacao',
    indicators: ['Docker', 'Docker Compose', 'Kubernetes', 'Multi-stage Build'],
    minIndicators: 1,
    descricao: 'Containerização de aplicações',
  },
  {
    pattern: 'api-rest',
    indicators: ['REST API', 'Express.js', 'Fastify', 'NestJS', 'Laravel', 'FastAPI', 'OpenAPI'],
    minIndicators: 1,
    descricao: 'Desenvolvimento de APIs RESTful',
  },
  {
    pattern: 'api-graphql',
    indicators: ['GraphQL', 'Apollo'],
    minIndicators: 1,
    descricao: 'Desenvolvimento com GraphQL',
  },
  {
    pattern: 'event-driven',
    indicators: ['Event-driven', 'WebSocket', 'Real-time', 'Message Queue', 'RabbitMQ'],
    minIndicators: 1,
    descricao: 'Arquitetura orientada a eventos',
  },
  {
    pattern: 'microservicos',
    indicators: ['Microservices', 'Docker Compose', 'Message Queue', 'API Backend'],
    minIndicators: 2,
    descricao: 'Arquitetura de microsserviços',
  },
  {
    pattern: 'design-system',
    indicators: ['Design System', 'Componentização', 'Tailwind CSS', 'Storybook'],
    minIndicators: 2,
    descricao: 'Implementação de Design System',
  },
  {
    pattern: 'state-management',
    indicators: ['React', 'Vue.js', 'Angular', 'Redux', 'Zustand', 'Pinia', 'Vuex'],
    minIndicators: 2,
    descricao: 'Gerenciamento de estado em aplicações frontend',
  },
  {
    pattern: 'orm-query-builder',
    indicators: ['Prisma', 'TypeORM', 'Sequelize', 'Doctrine ORM', 'SQLAlchemy', 'ORM', 'Query Builder', 'Knex.js'],
    minIndicators: 1,
    descricao: 'Uso de ORM ou Query Builder para abstração de banco',
  },
  {
    pattern: 'migrations',
    indicators: ['Migrations', 'Database', 'Schema Design'],
    minIndicators: 1,
    descricao: 'Versionamento de schema de banco de dados',
  },
  {
    pattern: 'documentacao',
    indicators: ['Documentação', 'OpenAPI', 'Documentação API', 'README'],
    minIndicators: 1,
    descricao: 'Prática de documentação técnica',
  },
];

// ─── Skill Level Assessment (v3.0 — Confidence-based) ───────────────

/**
 * v3.0: Calcula o nível de skill baseado em confidence scoring.
 * Nunca promove sem múltiplas evidências fortes.
 * Nunca rebaixa sem justificativa.
 */
function assessSkillLevelWithConfidence(
  frequency: number,
  _depth: number,
  complexity: number,
  evidences: Evidence[]
): ConfidenceResult {
  // Contar evidências autorais (commit com autoria verificada)
  const autorais = evidences.filter(e => e.autoria_verificada === true);
  const commitEvidences = evidences.filter(e => e.tipo === 'commit');
  const commitAutorais = commitEvidences.filter(e => e.autoria_verificada === true);

  // Calcular profundidade média real dos commits (1-4)
  const depthLevels = evidences
    .filter(e => e.depth_level !== undefined)
    .map(e => e.depth_level as number);
  const avgDepth = depthLevels.length > 0
    ? depthLevels.reduce((a, b) => a + b, 0) / depthLevels.length
    : 1;

  // ─── Confidence Score (0-100) ────────────────────────────────
  // Baseado em: frequência de commits autorais + profundidade real + complexidade
  let confidence = 0;

  // Fator 1: Frequência de commits autorais (max 35 pts)
  confidence += Math.min(commitAutorais.length * 5, 35);

  // Fator 2: Profundidade média dos commits (max 30 pts)
  confidence += Math.min(avgDepth * 7.5, 30);

  // Fator 3: Diversidade de projetos com evidência autoral (max 20 pts)
  const projectsWithAutoral = new Set(autorais.filter(e => e.projeto).map(e => e.projeto));
  confidence += Math.min(projectsWithAutoral.size * 10, 20);

  // Fator 4: Complexidade das evidências (max 15 pts)
  const complexityBonus = complexity * 0.15;
  confidence += Math.min(complexityBonus, 15);

  confidence = Math.min(Math.round(confidence), 100);

  // ─── Nível Final ─────────────────────────────────────────────
  let nivel: SkillLevel;
  let justificativa: string;
  let rebaixamento_motivo: string | undefined;
  let promocao_evidencias: string[] | undefined;

  if (confidence >= 75 && commitAutorais.length >= 5 && avgDepth >= 3) {
    nivel = 'dominio-solido';
    justificativa = `Confidence ${confidence}/100. ${commitAutorais.length} commits autorais, profundidade média ${avgDepth.toFixed(1)}/4, ${projectsWithAutoral.size} projeto(s).`;
    promocao_evidencias = commitAutorais.slice(0, 3).map(e => e.descricao.slice(0, 80));
  } else if (confidence >= 50 && commitAutorais.length >= 3 && avgDepth >= 2) {
    nivel = 'experiencia-avancada';
    justificativa = `Confidence ${confidence}/100. ${commitAutorais.length} commits autorais, profundidade média ${avgDepth.toFixed(1)}/4.`;
  } else if (confidence >= 25 && commitAutorais.length >= 1) {
    nivel = 'experiencia-pratica';
    justificativa = `Confidence ${confidence}/100. ${commitAutorais.length} commit(s) autoral(is).`;
  } else {
    nivel = 'conhecimento-basico';
    justificativa = `Confidence ${confidence}/100. Evidência insuficiente para nível superior.`;

    // Justificativa de rebaixamento se tinha evidências mas sem autoria
    if (evidences.length > 0 && commitAutorais.length === 0) {
      rebaixamento_motivo = `Nenhum commit autoral encontrado. ${evidences.length} evidência(s) sem autoria verificada não são suficientes para promoção.`;
    }
  }

  // ─── Proteção contra promoção sem evidência forte ────────────
  // REGRA: Nunca promover skill sem múltiplas evidências de commit autoral
  if (nivel !== 'conhecimento-basico' && commitAutorais.length === 0) {
    nivel = 'conhecimento-basico';
    rebaixamento_motivo = `Rebaixado: nenhum commit autoral. Stack do projeto não conta como prova de habilidade.`;
    justificativa += ` REBAIXADO: sem commits autorais.`;
  }

  return {
    skill: '',
    frequencia: frequency,
    profundidade_media: avgDepth,
    confidence,
    nivel_final: nivel,
    justificativa,
    rebaixamento_motivo,
    promocao_evidencias,
  };
}

/**
 * Fallback para compatibilidade: assess simples sem confidence.
 * Usado apenas quando não há dados de commit v3.0.
 */
export function assessSkillLevel(frequency: number, depth: number, complexity: number): SkillLevel {
  const score = (frequency * 0.3) + (depth * 0.4) + (complexity * 0.3);

  if (score >= 75) return 'dominio-solido';
  if (score >= 50) return 'experiencia-avancada';
  if (score >= 25) return 'experiencia-pratica';
  return 'conhecimento-basico';
}

function assessDepth(evidences: Evidence[]): number {
  let score = 0;

  // Usar peso_final se disponível (v2.1), senão fallback para contagem
  const hasWeights = evidences.some(e => e.peso_final !== undefined);

  if (hasWeights) {
    // Soma dos peso_final (pondera autoria)
    const weightSum = evidences.reduce((s, e) => s + (e.peso_final ?? 0), 0);
    score += Math.min(weightSum * 8, 40);

    // Evidências autorais valem mais
    const autorais = evidences.filter(e => e.autoria_verificada === true).length;
    score += autorais * 10;
  } else {
    // Fallback v2.0: mais evidências = mais profundidade
    score += Math.min(evidences.length * 5, 30);
  }

  // Complexidade das evidências (ignora framework_generated)
  const validEvs = evidences.filter(e => e.framework_generated !== true);
  const altoCount = validEvs.filter(e => e.nivel_complexidade === 'alto').length;
  const medioCount = validEvs.filter(e => e.nivel_complexidade === 'medio').length;
  score += altoCount * 15;
  score += medioCount * 8;

  // Diversidade de tipos de fonte (excluir framework)
  const uniqueTypes = new Set(validEvs.map(e => e.tipo));
  score += uniqueTypes.size * 5;

  // Diversidade de projetos (excluir framework)
  const uniqueProjects = new Set(validEvs.filter(e => e.projeto).map(e => e.projeto));
  score += uniqueProjects.size * 8;

  return Math.min(score, 100);
}

function assessComplexity(evidences: Evidence[]): number {
  const validEvs = evidences.filter(e => e.framework_generated !== true);
  const complexityMap = { baixo: 10, medio: 40, alto: 80 };
  const scores = validEvs.map(e => complexityMap[e.nivel_complexidade]);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// ─── Main Extractor Class ───────────────────────────────────────────

export class SkillExtractor {
  /**
   * Extrai habilidades reais a partir da base normalizada.
   */
  extract(normalizedBase: NormalizedBase): SkillBase {
    log.section('CAMADA 3 — SKILL EXTRACTOR');

    const allEvidences = normalizedBase.projetos.flatMap(p => p.evidencias);

    // 1. Extrair skills por tecnologia/stack
    const techSkills = this.extractTechSkills(normalizedBase);
    log.step(`Skills técnicas extraídas: ${techSkills.length}`);

    // 2. Identificar padrões de engenharia
    const patterns = this.identifyPatterns(normalizedBase);
    log.step(`Padrões de engenharia identificados: ${patterns.length}`);

    // 3. Extrair skills de padrões
    const patternSkills = this.extractPatternSkills(patterns, allEvidences);
    log.step(`Skills de padrões: ${patternSkills.length}`);

    // 4. Consolidar
    const allSkills = [...techSkills, ...patternSkills];
    const dedupSkills = this.deduplicateSkills(allSkills);

    // 5. Classificar
    const byLevel = this.groupByLevel(dedupSkills);
    const byCategory = this.groupByCategory(dedupSkills);

    const result: SkillBase = {
      atualizado_em: now(),
      total_skills: dedupSkills.length,
      skills: dedupSkills,
      por_nivel: byLevel,
      por_categoria: byCategory,
      padroes_identificados: patterns,
    };

    log.ok(`Total de skills únicas: ${dedupSkills.length}`);
    this.printSummary(result);

    return result;
  }

  // ─── Tech Skills Extraction (v3.0 — Commit-based) ────────────

  private extractTechSkills(base: NormalizedBase): ExtractedSkill[] {
    // Agregar todas as stacks de todos os projetos
    const techMap = new Map<string, { evidences: Evidence[]; projects: Set<string>; categories: Set<SkillCategory> }>();

    for (const project of base.projetos) {
      for (const ev of project.evidencias) {
        for (const tech of ev.stack_detectada) {
          if (!techMap.has(tech)) {
            techMap.set(tech, { evidences: [], projects: new Set(), categories: new Set() });
          }
          const entry = techMap.get(tech)!;
          entry.evidences.push(ev);
          entry.projects.add(project.nome);

          // Classificar por tecnologia usando mapa canônico (não do projeto)
          const techCategories = STACK_TO_CATEGORY[tech];
          if (techCategories) {
            for (const cat of techCategories) {
              entry.categories.add(cat);
            }
          }
        }
      }
    }

    // Converter para skills
    const skills: ExtractedSkill[] = [];

    for (const [tech, data] of techMap) {
      // Ignorar items genéricos demais
      if (['Frontend', 'Backend', 'Database', 'DevOps'].includes(tech)) continue;

      // ─── v3.0: Verificar se tem evidências de commit autoral ───
      const commitEvidences = data.evidences.filter(e => e.tipo === 'commit');
      const autorais = data.evidences.filter(e => e.autoria_verificada === true);
      const hasAuthoralEvidence = autorais.length > 0;

      // v3.0: Se NÃO tem evidência autoral, marcar como inferida por stack
      // e rebaixar para conhecimento-basico
      const isStackInferred = !hasAuthoralEvidence && commitEvidences.length === 0;

      const frequency = data.projects.size;
      const depth = assessDepth(data.evidences);
      const complexity = assessComplexity(data.evidences);

      // v3.0: Usar confidence scoring se tiver evidências de commit
      let level: SkillLevel;
      let confidence: number | undefined;
      let justificativa: string | undefined;
      let depthMedio: number | undefined;
      let commitsAutorais: number | undefined;

      if (commitEvidences.length > 0 || autorais.length > 0) {
        // Usar confidence scoring (v3.0)
        const result = assessSkillLevelWithConfidence(frequency, depth, complexity, data.evidences);
        level = result.nivel_final;
        confidence = result.confidence;
        justificativa = result.justificativa;
        depthMedio = result.profundidade_media;
        commitsAutorais = autorais.filter(e => e.tipo === 'commit').length;
      } else {
        // Sem commits → conhecimento-basico (não infere por stack)
        level = 'conhecimento-basico';
        confidence = 0;
        justificativa = `Sem commits autorais. Skill inferida apenas pela presença na stack do projeto — NÃO promovida.`;
      }

      const categories = Array.from(data.categories);
      const primaryCategory = categories[0] || 'fundamentos';

      skills.push({
        nome: tech,
        categoria: primaryCategory,
        nivel: level,
        padroes: [],
        frequencia: frequency,
        profundidade: depth,
        evidencias_ids: data.evidences.map(e => e.id),
        descricao: `${tech} utilizado em ${frequency} projeto(s). Profundidade técnica: ${depth}/100.${isStackInferred ? ' ⚠️ INFERIDA POR STACK — sem commits autorais.' : ''}`,
        // Campos v3.0
        confidence,
        justificativa,
        depth_medio: depthMedio,
        commits_autorais: commitsAutorais,
        inferida_por_stack: isStackInferred,
      });
    }

    return skills;
  }

  // ─── Pattern Identification ──────────────────────────────────────

  private identifyPatterns(base: NormalizedBase): EngineeringPattern[] {
    const allStack = base.projetos.flatMap(p => p.stack);
    const allDescriptions = base.projetos.flatMap(p => p.evidencias.map(e => e.descricao));
    const combinedText = [...allStack, ...allDescriptions].join(' ');

    const identifiedPatterns: EngineeringPattern[] = [];

    for (const rule of PATTERN_RULES) {
      const matchCount = rule.indicators.filter(indicator =>
        allStack.includes(indicator) || combinedText.includes(indicator)
      ).length;

      if (matchCount >= rule.minIndicators) {
        identifiedPatterns.push(rule.pattern);
      }
    }

    return identifiedPatterns;
  }

  // ─── Pattern Skills (v3.0 — Commit-based) ────────────────────

  private extractPatternSkills(patterns: EngineeringPattern[], allEvidences: Evidence[]): ExtractedSkill[] {
    const skills: ExtractedSkill[] = [];

    for (const pattern of patterns) {
      const rule = PATTERN_RULES.find(r => r.pattern === pattern);
      if (!rule) continue;

      // Encontrar evidências que suportam este padrão
      const relatedEvidences = allEvidences.filter(ev =>
        ev.stack_detectada.some(s => rule.indicators.includes(s)) ||
        ev.descricao.toLowerCase().includes(pattern.toLowerCase())
      );

      if (relatedEvidences.length === 0) continue;

      // v3.0: Filtrar apenas evidências com autoria verificada para pontuar
      const autorais = relatedEvidences.filter(e => e.autoria_verificada === true);
      const hasAuthoralEvidence = autorais.length > 0;

      const uniqueProjects = new Set(relatedEvidences.filter(e => e.projeto).map(e => e.projeto));
      const frequency = uniqueProjects.size;
      const depth = assessDepth(relatedEvidences);
      const complexity = assessComplexity(relatedEvidences);

      // v3.0: Usar confidence scoring
      let level: SkillLevel;
      let confidence: number | undefined;
      let justificativa: string | undefined;

      if (hasAuthoralEvidence) {
        const result = assessSkillLevelWithConfidence(frequency, depth, complexity, relatedEvidences);
        level = result.nivel_final;
        confidence = result.confidence;
        justificativa = result.justificativa;
      } else {
        level = 'conhecimento-basico';
        confidence = 0;
        justificativa = `Padrão detectado na stack, mas sem commits autorais confirmados.`;
      }

      // Determinar categoria primária do padrão
      const categoryMap: Record<string, SkillCategory> = {
        'separacao-camadas': 'arquitetura',
        'uso-interfaces': 'arquitetura',
        'desacoplamento': 'arquitetura',
        'estrategia-cache': 'performance',
        'uso-filas': 'escalabilidade',
        'refatoracao-estrutural': 'fundamentos',
        'tuning-banco': 'banco-de-dados',
        'testes-automatizados': 'testes',
        'ci-cd': 'devops',
        'containerizacao': 'devops',
        'api-rest': 'backend',
        'api-graphql': 'backend',
        'event-driven': 'arquitetura',
        'microservicos': 'arquitetura',
        'design-system': 'frontend',
        'state-management': 'frontend',
        'orm-query-builder': 'banco-de-dados',
        'migrations': 'banco-de-dados',
        'code-review': 'fundamentos',
        'documentacao': 'produto',
      };

      skills.push({
        nome: this.patternToHumanName(pattern),
        categoria: categoryMap[pattern] || 'fundamentos',
        nivel: level,
        padroes: [pattern],
        frequencia: frequency,
        profundidade: depth,
        evidencias_ids: relatedEvidences.map(e => e.id),
        descricao: `${rule.descricao}. Identificado em ${frequency} projeto(s) com base em ${relatedEvidences.length} evidência(s).${!hasAuthoralEvidence ? ' ⚠️ Sem commits autorais — não promovido.' : ''}`,
        // Campos v3.0
        confidence,
        justificativa,
        commits_autorais: autorais.filter(e => e.tipo === 'commit').length,
        inferida_por_stack: !hasAuthoralEvidence,
      });
    }

    return skills;
  }

  // ─── Deduplication ───────────────────────────────────────────────

  private deduplicateSkills(skills: ExtractedSkill[]): ExtractedSkill[] {
    const map = new Map<string, ExtractedSkill>();

    for (const skill of skills) {
      const key = skill.nome.toLowerCase();
      if (!map.has(key)) {
        map.set(key, skill);
      } else {
        // Merge: manter o de maior nível e combinar evidências
        const existing = map.get(key)!;
        const merged: ExtractedSkill = {
          ...existing,
          frequencia: Math.max(existing.frequencia, skill.frequencia),
          profundidade: Math.max(existing.profundidade, skill.profundidade),
          nivel: this.higherLevel(existing.nivel, skill.nivel),
          padroes: [...new Set([...existing.padroes, ...skill.padroes])],
          evidencias_ids: [...new Set([...existing.evidencias_ids, ...skill.evidencias_ids])],
        };
        map.set(key, merged);
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.profundidade - a.profundidade);
  }

  // ─── Classification Helpers ──────────────────────────────────────

  private groupByLevel(skills: ExtractedSkill[]): Record<SkillLevel, string[]> {
    const result: Record<SkillLevel, string[]> = {
      'conhecimento-basico': [],
      'experiencia-pratica': [],
      'experiencia-avancada': [],
      'dominio-solido': [],
    };

    for (const skill of skills) {
      result[skill.nivel].push(skill.nome);
    }

    return result;
  }

  private groupByCategory(skills: ExtractedSkill[]): Record<SkillCategory, string[]> {
    const result: Record<SkillCategory, string[]> = {
      arquitetura: [],
      fundamentos: [],
      performance: [],
      escalabilidade: [],
      testes: [],
      devops: [],
      produto: [],
      seguranca: [],
      'banco-de-dados': [],
      frontend: [],
      backend: [],
      integracao: [],
    };

    for (const skill of skills) {
      result[skill.categoria].push(skill.nome);
    }

    return result;
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private higherLevel(a: SkillLevel, b: SkillLevel): SkillLevel {
    const order: SkillLevel[] = ['conhecimento-basico', 'experiencia-pratica', 'experiencia-avancada', 'dominio-solido'];
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return ia >= ib ? a : b;
  }

  private patternToHumanName(pattern: EngineeringPattern): string {
    const names: Record<EngineeringPattern, string> = {
      'separacao-camadas': 'Separação de Camadas',
      'uso-interfaces': 'Uso de Interfaces/Contratos',
      'desacoplamento': 'Desacoplamento de Módulos',
      'estrategia-cache': 'Estratégias de Cache',
      'uso-filas': 'Processamento com Filas',
      'refatoracao-estrutural': 'Refatoração Estrutural',
      'tuning-banco': 'Tuning de Banco de Dados',
      'testes-automatizados': 'Testes Automatizados',
      'ci-cd': 'CI/CD Pipeline',
      'containerizacao': 'Containerização',
      'api-rest': 'APIs RESTful',
      'api-graphql': 'GraphQL',
      'event-driven': 'Event-Driven Architecture',
      'microservicos': 'Microsserviços',
      'monorepo': 'Monorepo',
      'design-system': 'Design System',
      'state-management': 'State Management',
      'orm-query-builder': 'ORM / Query Builder',
      'migrations': 'Database Migrations',
      'code-review': 'Code Review',
      'documentacao': 'Documentação Técnica',
    };
    return names[pattern] || pattern;
  }

  private printSummary(base: SkillBase): void {
    console.log('\n📊 RESUMO DE SKILLS (v3.0 — Confidence-based):');
    console.log(`   Domínio sólido:        ${base.por_nivel['dominio-solido'].length} skills`);
    console.log(`   Experiência avançada:   ${base.por_nivel['experiencia-avancada'].length} skills`);
    console.log(`   Experiência prática:    ${base.por_nivel['experiencia-pratica'].length} skills`);
    console.log(`   Conhecimento básico:    ${base.por_nivel['conhecimento-basico'].length} skills`);
    console.log(`   Padrões de engenharia:  ${base.padroes_identificados.length}`);

    // v3.0: Mostrar skills inferidas por stack (que foram rebaixadas)
    const inferidas = base.skills.filter(s => s.inferida_por_stack);
    if (inferidas.length > 0) {
      console.log(`\n   ⚠️  Skills inferidas por stack (rebaixadas): ${inferidas.length}`);
      for (const s of inferidas.slice(0, 5)) {
        console.log(`      - ${s.nome} (confidence: ${s.confidence ?? 0}/100)`);
      }
    }

    // v3.0: Mostrar skills com alta confidence
    const highConfidence = base.skills.filter(s => (s.confidence ?? 0) >= 75);
    if (highConfidence.length > 0) {
      console.log(`\n   ✅ Skills com alta confidence (≥75): ${highConfidence.length}`);
      for (const s of highConfidence.slice(0, 5)) {
        console.log(`      - ${s.nome} (confidence: ${s.confidence}/100, commits autorais: ${s.commits_autorais ?? 0})`);
      }
    }
  }
}
