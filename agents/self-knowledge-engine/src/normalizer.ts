/**
 * SelfKnowledgeEngine — Camada 2: Evidence Normalizer (v3.0)
 *
 * Responsável por:
 * - Remover duplicações
 * - Agrupar evidências por projeto
 * - Classificar por categoria
 * - Gerar base consolidada estruturada
 * - [v3.0] Filtrar evidências por classificação de arquivo
 * - [v3.0] Rebaixar peso de config/readme/scaffold
 * - [v3.0] Priorizar evidências com commit_analyses (autoria real)
 * - [v3.0] NÃO inferir habilidade apenas por stack do projeto
 */

import type {
  Evidence,
  NormalizedBase,
  ProjectGroup,
  SkillCategory,
  ComplexityLevel,
} from './types.js';
import { now, log } from './utils.js';

// ─── Category Detection Maps ────────────────────────────────────────

export const STACK_TO_CATEGORY: Record<string, SkillCategory[]> = {
  // Arquitetura
  'Clean Architecture': ['arquitetura'],
  'DDD': ['arquitetura'],
  'MVC': ['arquitetura'],
  'Microservices': ['arquitetura', 'escalabilidade'],
  'Arquitetura Modular': ['arquitetura'],
  'Service Pattern': ['arquitetura'],
  'Repository Pattern': ['arquitetura'],
  'Event-driven': ['arquitetura', 'escalabilidade'],
  'API Backend': ['arquitetura', 'backend'],
  'Separação src/lib': ['arquitetura'],
  'Desacoplamento': ['arquitetura'],

  // Frontend
  'React': ['frontend'],
  'Vue.js': ['frontend'],
  'Angular': ['frontend'],
  'Svelte': ['frontend'],
  'Next.js': ['frontend', 'backend'],
  'Nuxt.js': ['frontend', 'backend'],
  'Tailwind CSS': ['frontend'],
  'CSS': ['frontend'],
  'Design System': ['frontend', 'arquitetura'],
  'Componentização': ['frontend'],
  'React Router': ['frontend'],
  'SPA': ['frontend'],

  // Backend
  'Node.js': ['backend'],
  'Express.js': ['backend'],
  'Fastify': ['backend'],
  'NestJS': ['backend', 'arquitetura'],
  'Laravel': ['backend'],
  'Symfony': ['backend'],
  'Django': ['backend'],
  'Flask': ['backend'],
  'FastAPI': ['backend'],
  'PHP': ['backend'],
  'Python': ['backend'],
  'REST API': ['backend', 'integracao'],
  'GraphQL': ['backend', 'integracao'],
  'WebSocket': ['backend', 'integracao'],

  // Database
  'Database': ['banco-de-dados'],
  'MySQL': ['banco-de-dados'],
  'PostgreSQL': ['banco-de-dados'],
  'MongoDB': ['banco-de-dados'],
  'Redis': ['banco-de-dados', 'performance'],
  'Prisma': ['banco-de-dados'],
  'Prisma ORM': ['banco-de-dados'],
  'TypeORM': ['banco-de-dados'],
  'Sequelize': ['banco-de-dados'],
  'Doctrine ORM': ['banco-de-dados'],
  'SQLAlchemy': ['banco-de-dados'],
  'ORM': ['banco-de-dados'],
  'Query Builder': ['banco-de-dados'],
  'Migrations': ['banco-de-dados'],
  'Schema Design': ['banco-de-dados', 'arquitetura'],

  // Performance
  'Cache': ['performance'],
  'Elasticsearch': ['performance', 'banco-de-dados'],
  'Multi-stage Build': ['performance', 'devops'],

  // Escalabilidade
  'Message Queue': ['escalabilidade'],
  'RabbitMQ': ['escalabilidade'],
  'BullMQ': ['escalabilidade'],
  'Filas': ['escalabilidade'],
  'Celery': ['escalabilidade'],

  // DevOps
  'Docker': ['devops'],
  'Docker Compose': ['devops'],
  'Kubernetes': ['devops', 'escalabilidade'],
  'CI/CD': ['devops'],
  'GitHub Actions': ['devops'],
  'Jenkins': ['devops'],
  'CircleCI': ['devops'],
  'Terraform': ['devops'],
  'IaC': ['devops'],
  'Nginx': ['devops'],
  'Traefik': ['devops'],
  'Deploy Automatizado': ['devops'],
  'AWS': ['devops'],
  'GCP': ['devops'],
  'Azure': ['devops'],

  // Testes
  'Testes Automatizados': ['testes'],
  'Jest': ['testes'],
  'Vitest': ['testes'],
  'Mocha': ['testes'],
  'Cypress': ['testes'],
  'Playwright': ['testes'],
  'PHPUnit': ['testes'],
  'Pytest': ['testes'],
  'Testes em CI': ['testes', 'devops'],
  'E2E': ['testes'],

  // Integração
  'HTTP Client': ['integracao'],
  'OpenAPI': ['integracao', 'produto'],
  'Documentação API': ['integracao', 'produto'],

  // Fundamentos
  'TypeScript': ['fundamentos'],
  'JavaScript': ['fundamentos'],
  'Validação': ['fundamentos'],
  'Zod': ['fundamentos'],
  'Linting': ['fundamentos'],
  'Linting em CI': ['fundamentos', 'devops'],
  'Tooling': ['fundamentos'],
  'Conventional Commits': ['fundamentos'],
  'Git': ['fundamentos'],
  'Shell': ['fundamentos', 'devops'],
  'SQL': ['banco-de-dados'],
  'Refatoração': ['fundamentos'],
  'Refatoração Estrutural': ['fundamentos', 'arquitetura'],
  'Organização de Código': ['fundamentos', 'arquitetura'],

  // Linguagens
  'Go': ['backend'],
  'Rust': ['backend'],
  'Java': ['backend'],
  'Kotlin': ['backend'],
  'Swift': ['fundamentos'],
  'Dart': ['frontend'],

  // Bundlers & Build Tools
  'Vite': ['frontend', 'fundamentos'],
  'Webpack': ['frontend', 'fundamentos'],
  'esbuild': ['frontend', 'fundamentos'],
  'Bundler': ['frontend'],
  'Build Pipeline': ['devops'],

  // Performance
  'Performance': ['performance'],
  'Estratégias de Cache': ['performance'],

  // Produto
  'Documentação': ['produto'],
  'Documentação Técnica': ['produto'],

  // Segurança
  'Environment Config': ['seguranca', 'devops'],

  // Integração & APIs
  'APIs RESTful': ['backend', 'integracao'],
  'Microsserviços': ['arquitetura', 'escalabilidade'],

  // CI extras (sem duplicar chaves que já existem acima)
  'Docker em CI': ['devops'],
  'CI/CD Pipeline': ['devops'],
  'Containerização': ['devops'],
  'SSR': ['frontend'],
  'TypeScript/React': ['frontend'],
};

// ─── Main Normalizer Class ──────────────────────────────────────────

export class EvidenceNormalizer {
  /**
   * Normaliza e consolida todas as evidências coletadas.
   */
  normalize(rawEvidences: Evidence[]): NormalizedBase {
    log.section('CAMADA 2 — EVIDENCE NORMALIZER');

    const totalBruto = rawEvidences.length;
    log.step(`Evidências brutas recebidas: ${totalBruto}`);

    // 1. Remover duplicações
    const unique = this.deduplicate(rawEvidences);
    log.step(`Após deduplicação: ${unique.length} (removidas ${totalBruto - unique.length})`);

    // 2. [v3.0] Classificar e filtrar evidências fracas
    const classified = this.classifyEvidenceStrength(unique);
    log.step(`Após classificação de força: ${classified.strong.length} fortes, ${classified.weak.length} fracas, ${classified.discarded.length} descartadas`);

    // 3. Agrupar por projeto (usar evidências fortes + fracas com flag)
    const allValid = [...classified.strong, ...classified.weak];
    const projects = this.groupByProject(allValid);
    log.step(`Projetos identificados: ${projects.length}`);

    // 3. Classificar por categoria
    const byCategory = this.classifyByCategory(unique);
    log.step(`Categorias com evidências: ${Object.keys(byCategory).filter(k => byCategory[k as SkillCategory].length > 0).length}`);

    const result: NormalizedBase = {
      atualizado_em: now(),
      total_evidencias_brutas: totalBruto,
      total_evidencias_unicas: unique.length,
      projetos: projects,
      por_categoria: byCategory,
    };

    log.ok('Base normalizada gerada com sucesso.');
    return result;
  }

  // ─── Evidence Strength Classification (v3.0) ─────────────────

  /**
   * Classifica evidências em fortes, fracas e descartadas.
   *
   * REGRAS:
   * - Evidências de commit com autoria verificada → FORTE
   * - Evidências de teste/migration com autoria → FORTE
   * - Evidências de config/readme → FRACA (não prova skill)
   * - Evidências de framework_generated → DESCARTADA
   * - Evidências de github-api sem commits autorais → FRACA
   */
  private classifyEvidenceStrength(evidences: Evidence[]): {
    strong: Evidence[];
    weak: Evidence[];
    discarded: Evidence[];
  } {
    const strong: Evidence[] = [];
    const weak: Evidence[] = [];
    const discarded: Evidence[] = [];

    for (const ev of evidences) {
      // Descartada: framework generated
      if (ev.framework_generated === true) {
        discarded.push(ev);
        continue;
      }

      // Tipos que NÃO podem provar skill sozinhos
      const weakTypes: string[] = ['config', 'readme', 'github-api'];

      if (weakTypes.includes(ev.tipo)) {
        // Config/README/GitHub-API → evidência fraca
        // Reduzir peso para evitar inflação
        weak.push({ ...ev, peso_final: Math.min(ev.peso_final ?? 0.1, 0.1) });
        continue;
      }

      // Commit com autoria verificada → FORTE
      if (ev.tipo === 'commit' && ev.autoria_verificada) {
        strong.push(ev);
        continue;
      }

      // Commit sem autoria verificada → FRACA
      if (ev.tipo === 'commit' && !ev.autoria_verificada) {
        weak.push({ ...ev, peso_final: (ev.peso_final ?? 0) * 0.2 });
        continue;
      }

      // Teste, migration, CI, docker, arquivo com autoria → FORTE
      if (ev.autoria_verificada) {
        strong.push(ev);
        continue;
      }

      // Resto → FRACA
      weak.push(ev);
    }

    return { strong, weak, discarded };
  }

  // ─── Deduplication ───────────────────────────────────────────────

  private deduplicate(evidences: Evidence[]): Evidence[] {
    const seen = new Map<string, Evidence>();

    for (const ev of evidences) {
      // Chave de dedup: combinação de fonte + tipo + stack (ordenada)
      const stackKey = [...ev.stack_detectada].sort().join('|');
      const dedupKey = `${ev.fonte}::${ev.tipo}::${stackKey}`;

      if (!seen.has(dedupKey)) {
        seen.set(dedupKey, ev);
      } else {
        // Se duplicada, manter a com descrição mais longa (mais informativa)
        const existing = seen.get(dedupKey)!;
        if (ev.descricao.length > existing.descricao.length) {
          seen.set(dedupKey, ev);
        }
      }
    }

    return Array.from(seen.values());
  }

  // ─── Project Grouping ────────────────────────────────────────────

  private groupByProject(evidences: Evidence[]): ProjectGroup[] {
    const groups = new Map<string, Evidence[]>();

    for (const ev of evidences) {
      const project = ev.projeto || this.inferProject(ev.fonte);
      if (!groups.has(project)) {
        groups.set(project, []);
      }
      groups.get(project)!.push(ev);
    }

    return Array.from(groups.entries()).map(([nome, evs]) => {
      const allStack = evs.flatMap(e => e.stack_detectada);
      const uniqueStack = [...new Set(allStack)];
      const categories = this.detectCategories(uniqueStack);
      const complexity = this.assessProjectComplexity(evs);

      return {
        nome,
        caminho: evs[0]?.fonte || '',
        evidencias: evs,
        stack: uniqueStack,
        categorias: categories,
        complexidade: complexity,
      };
    }).sort((a, b) => b.evidencias.length - a.evidencias.length);
  }

  // ─── Category Classification ─────────────────────────────────────

  private classifyByCategory(evidences: Evidence[]): Record<SkillCategory, string[]> {
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

    for (const ev of evidences) {
      const categories = this.detectCategories(ev.stack_detectada);
      for (const cat of categories) {
        if (!result[cat].includes(ev.id)) {
          result[cat].push(ev.id);
        }
      }
    }

    return result;
  }

  private detectCategories(stack: string[]): SkillCategory[] {
    const categories = new Set<SkillCategory>();

    for (const tech of stack) {
      const cats = STACK_TO_CATEGORY[tech];
      if (cats) {
        for (const c of cats) categories.add(c);
      }
    }

    // Fallback: se nenhuma categoria detectada, marcar como fundamentos
    if (categories.size === 0) {
      categories.add('fundamentos');
    }

    return Array.from(categories);
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private inferProject(fonte: string): string {
    // Tentar extrair nome do projeto do caminho
    const parts = fonte.split('/');
    // Encontrar o diretório que parece ser o projeto
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] && !['src', 'lib', 'components', 'utils', 'config', ''].includes(parts[i])) {
        return parts[i];
      }
    }
    return 'desconhecido';
  }

  private assessProjectComplexity(evidences: Evidence[]): ComplexityLevel {
    const complexities = evidences.map(e => e.nivel_complexidade);
    const altoCount = complexities.filter(c => c === 'alto').length;
    const medioCount = complexities.filter(c => c === 'medio').length;

    if (altoCount > 2 || evidences.length > 8) return 'alto';
    if (medioCount > 2 || evidences.length > 4) return 'medio';
    return 'baixo';
  }
}
