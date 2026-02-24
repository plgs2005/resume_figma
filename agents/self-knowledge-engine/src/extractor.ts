/**
 * SelfKnowledgeEngine — Camada 3: Skill Extractor
 *
 * Responsável por:
 * - Identificar padrões reais de engenharia
 * - Determinar frequência de uso e profundidade técnica
 * - Classificar nível de habilidade
 * - Tudo baseado exclusivamente em evidência factual
 */

import type {
  NormalizedBase,
  SkillBase,
  ExtractedSkill,
  SkillLevel,
  SkillCategory,
  EngineeringPattern,
  Evidence,
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

// ─── Skill Level Assessment ─────────────────────────────────────────

function assessSkillLevel(frequency: number, depth: number, complexity: number): SkillLevel {
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

  // ─── Tech Skills Extraction ──────────────────────────────────────

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

      const frequency = data.projects.size;
      const depth = assessDepth(data.evidences);
      const complexity = assessComplexity(data.evidences);
      const level = assessSkillLevel(frequency * 10, depth, complexity);

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
        descricao: `${tech} utilizado em ${frequency} projeto(s). Profundidade técnica: ${depth}/100.`,
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

  // ─── Pattern Skills ──────────────────────────────────────────────

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

      const uniqueProjects = new Set(relatedEvidences.filter(e => e.projeto).map(e => e.projeto));
      const frequency = uniqueProjects.size;
      const depth = assessDepth(relatedEvidences);
      const complexity = assessComplexity(relatedEvidences);
      const level = assessSkillLevel(frequency * 10, depth, complexity);

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
        descricao: `${rule.descricao}. Identificado em ${frequency} projeto(s) com base em ${relatedEvidences.length} evidência(s).`,
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
    console.log('\n📊 RESUMO DE SKILLS:');
    console.log(`   Domínio sólido:        ${base.por_nivel['dominio-solido'].length} skills`);
    console.log(`   Experiência avançada:   ${base.por_nivel['experiencia-avancada'].length} skills`);
    console.log(`   Experiência prática:    ${base.por_nivel['experiencia-pratica'].length} skills`);
    console.log(`   Conhecimento básico:    ${base.por_nivel['conhecimento-basico'].length} skills`);
    console.log(`   Padrões de engenharia:  ${base.padroes_identificados.length}`);
  }
}
