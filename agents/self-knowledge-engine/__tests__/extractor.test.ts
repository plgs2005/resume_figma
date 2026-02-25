/**
 * SelfKnowledgeEngine — Unit Tests: Skill Extractor
 */

import { SkillExtractor } from '../src/extractor';
import type { NormalizedBase, Evidence, DepthLevel } from '../src/types';

function makeNormalizedBase(overrides: Partial<NormalizedBase> = {}): NormalizedBase {
  return {
    atualizado_em: new Date().toISOString(),
    total_evidencias_brutas: 0,
    total_evidencias_unicas: 0,
    projetos: [],
    por_categoria: {
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
    },
    ...overrides,
  };
}

function makeEvidence(partial: Partial<Evidence> = {}): Evidence {
  return {
    id: partial.id || 'ev-' + Math.random().toString(36).slice(2),
    fonte: partial.fonte || '/test/path',
    tipo: partial.tipo || 'arquivo',
    descricao: partial.descricao || 'Test evidence',
    stack_detectada: partial.stack_detectada || ['TypeScript'],
    nivel_complexidade: partial.nivel_complexidade || 'medio',
    coletado_em: partial.coletado_em || new Date().toISOString(),
    projeto: partial.projeto || 'test-project',
    // v3.0 fields
    autoria_verificada: partial.autoria_verificada,
    framework_generated: partial.framework_generated,
    depth_level: partial.depth_level,
    modulo_tipo: partial.modulo_tipo,
    peso_base: partial.peso_base,
    peso_final: partial.peso_final,
  };
}

describe('SkillExtractor', () => {
  let extractor: SkillExtractor;

  beforeEach(() => {
    extractor = new SkillExtractor();
  });

  it('should return empty skills for empty base', () => {
    const base = makeNormalizedBase();
    const result = extractor.extract(base);

    expect(result.total_skills).toBe(0);
    expect(result.skills).toEqual([]);
    expect(result.padroes_identificados).toEqual([]);
  });

  it('should extract skills from project stacks', () => {
    const base = makeNormalizedBase({
      total_evidencias_brutas: 3,
      total_evidencias_unicas: 3,
      projetos: [
        {
          nome: 'my-app',
          caminho: '/test/my-app',
          stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
          categorias: ['frontend', 'fundamentos'],
          complexidade: 'medio',
          evidencias: [
            makeEvidence({ stack_detectada: ['React', 'TypeScript'], nivel_complexidade: 'medio' }),
            makeEvidence({ stack_detectada: ['Tailwind CSS'], nivel_complexidade: 'baixo' }),
            makeEvidence({ stack_detectada: ['Vite'], nivel_complexidade: 'baixo' }),
          ],
        },
      ],
    });

    const result = extractor.extract(base);

    expect(result.total_skills).toBeGreaterThan(0);
    const skillNames = result.skills.map(s => s.nome);
    expect(skillNames).toContain('React');
    expect(skillNames).toContain('TypeScript');
  });

  it('should identify engineering patterns', () => {
    const base = makeNormalizedBase({
      total_evidencias_brutas: 5,
      total_evidencias_unicas: 5,
      projetos: [
        {
          nome: 'api-project',
          caminho: '/test/api',
          stack: ['Docker', 'Docker Compose', 'GitHub Actions', 'CI/CD', 'Jest', 'Testes Automatizados', 'REST API', 'NestJS'],
          categorias: ['devops', 'testes', 'backend'],
          complexidade: 'alto',
          evidencias: [
            makeEvidence({ stack_detectada: ['Docker', 'Docker Compose'], nivel_complexidade: 'medio' }),
            makeEvidence({ stack_detectada: ['GitHub Actions', 'CI/CD'], nivel_complexidade: 'medio' }),
            makeEvidence({ stack_detectada: ['Jest', 'Testes Automatizados'], nivel_complexidade: 'medio' }),
            makeEvidence({ stack_detectada: ['REST API', 'NestJS'], nivel_complexidade: 'alto' }),
          ],
        },
      ],
    });

    const result = extractor.extract(base);

    expect(result.padroes_identificados).toContain('containerizacao');
    expect(result.padroes_identificados).toContain('ci-cd');
    expect(result.padroes_identificados).toContain('testes-automatizados');
    expect(result.padroes_identificados).toContain('api-rest');
  });

  it('should classify skill levels correctly', () => {
    const manyEvidences = Array.from({ length: 8 }, (_, i) =>
      makeEvidence({
        id: `ev-${i}`,
        projeto: `proj-${i % 3}`,
        stack_detectada: ['React'],
        nivel_complexidade: i > 4 ? 'alto' : 'medio',
      })
    );

    const base = makeNormalizedBase({
      total_evidencias_brutas: manyEvidences.length,
      total_evidencias_unicas: manyEvidences.length,
      projetos: [
        {
          nome: 'multi-project',
          caminho: '/test',
          stack: ['React'],
          categorias: ['frontend'],
          complexidade: 'alto',
          evidencias: manyEvidences,
        },
      ],
    });

    const result = extractor.extract(base);
    const reactSkill = result.skills.find(s => s.nome === 'React');

    expect(reactSkill).toBeDefined();
    expect(reactSkill!.frequencia).toBeGreaterThanOrEqual(1);
    expect(reactSkill!.profundidade).toBeGreaterThan(0);
    expect(['conhecimento-basico', 'experiencia-pratica', 'experiencia-avancada', 'dominio-solido'])
      .toContain(reactSkill!.nivel);
  });

  // ─── v3.0: Confidence Scoring Tests ──────────────────────────

  it('should NOT promote skill without autoral commits (v3.0)', () => {
    // Cenário: skill detectada via stack/config, mas sem commits autorais
    const base = makeNormalizedBase({
      total_evidencias_brutas: 2,
      total_evidencias_unicas: 2,
      projetos: [
        {
          nome: 'config-only-project',
          caminho: '/test/config-only',
          stack: ['Redis', 'Docker'],
          categorias: ['performance', 'devops'],
          complexidade: 'medio',
          evidencias: [
            makeEvidence({
              tipo: 'config',
              stack_detectada: ['Redis', 'Docker'],
              nivel_complexidade: 'medio',
              autoria_verificada: false,
            }),
            makeEvidence({
              tipo: 'readme',
              stack_detectada: ['Redis', 'Docker'],
              nivel_complexidade: 'baixo',
              autoria_verificada: false,
            }),
          ],
        },
      ],
    });

    const result = extractor.extract(base);
    const redisSkill = result.skills.find(s => s.nome === 'Redis');

    expect(redisSkill).toBeDefined();
    // v3.0: Sem commits autorais → conhecimento-basico
    expect(redisSkill!.nivel).toBe('conhecimento-basico');
    // Deve estar marcada como inferida por stack
    expect(redisSkill!.inferida_por_stack).toBe(true);
  });

  it('should promote skill WITH autoral commit evidence (v3.0)', () => {
    // Cenário: múltiplos commits autorais em diferentes projetos
    const autoraisEvidences = Array.from({ length: 6 }, (_, i) =>
      makeEvidence({
        id: `ev-autoral-${i}`,
        tipo: 'commit',
        projeto: `proj-${i % 3}`,
        stack_detectada: ['TypeScript'],
        nivel_complexidade: i > 3 ? 'alto' : 'medio',
        autoria_verificada: true,
        depth_level: (i > 3 ? 3 : 2) as DepthLevel,
      })
    );

    const base = makeNormalizedBase({
      total_evidencias_brutas: autoraisEvidences.length,
      total_evidencias_unicas: autoraisEvidences.length,
      projetos: [
        {
          nome: 'real-project',
          caminho: '/test/real',
          stack: ['TypeScript'],
          categorias: ['fundamentos'],
          complexidade: 'alto',
          evidencias: autoraisEvidences,
        },
      ],
    });

    const result = extractor.extract(base);
    const tsSkill = result.skills.find(s => s.nome === 'TypeScript');

    expect(tsSkill).toBeDefined();
    // v3.0: Com commits autorais → nível superior
    expect(tsSkill!.nivel).not.toBe('conhecimento-basico');
    expect(tsSkill!.confidence).toBeGreaterThan(0);
    expect(tsSkill!.commits_autorais).toBeGreaterThan(0);
    expect(tsSkill!.inferida_por_stack).toBe(false);
  });

  it('should include confidence and justificativa fields (v3.0)', () => {
    const base = makeNormalizedBase({
      total_evidencias_brutas: 1,
      total_evidencias_unicas: 1,
      projetos: [
        {
          nome: 'test-project',
          caminho: '/test',
          stack: ['React'],
          categorias: ['frontend'],
          complexidade: 'medio',
          evidencias: [
            makeEvidence({
              tipo: 'commit',
              stack_detectada: ['React'],
              autoria_verificada: true,
            }),
          ],
        },
      ],
    });

    const result = extractor.extract(base);
    const skill = result.skills.find(s => s.nome === 'React');

    expect(skill).toBeDefined();
    expect(skill!.confidence).toBeDefined();
    expect(typeof skill!.confidence).toBe('number');
    expect(skill!.justificativa).toBeDefined();
    expect(typeof skill!.justificativa).toBe('string');
  });
});
