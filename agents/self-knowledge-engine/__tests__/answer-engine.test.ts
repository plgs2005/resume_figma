/**
 * SelfKnowledgeEngine — Unit Tests: Answer Engine
 */

import { AnswerEngine } from '../src/answer-engine';
import type { NormalizedBase, SkillBase, Evidence } from '../src/types';

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
  };
}

function makeNormalizedBase(): NormalizedBase {
  return {
    atualizado_em: new Date().toISOString(),
    total_evidencias_brutas: 2,
    total_evidencias_unicas: 2,
    projetos: [
      {
        nome: 'my-app',
        caminho: '/test/my-app',
        stack: ['React', 'TypeScript', 'Docker'],
        categorias: ['frontend', 'devops'],
        complexidade: 'medio',
        evidencias: [
          makeEvidence({ id: 'ev-1', stack_detectada: ['React', 'TypeScript'], descricao: 'Projeto React com TypeScript', projeto: 'my-app' }),
          makeEvidence({ id: 'ev-2', stack_detectada: ['Docker'], descricao: 'Docker configurado para deploy', projeto: 'my-app' }),
        ],
      },
    ],
    por_categoria: {
      arquitetura: [],
      fundamentos: ['ev-1'],
      performance: [],
      escalabilidade: [],
      testes: [],
      devops: ['ev-2'],
      produto: [],
      seguranca: [],
      'banco-de-dados': [],
      frontend: ['ev-1'],
      backend: [],
      integracao: [],
    },
  };
}

function makeSkillBase(): SkillBase {
  return {
    atualizado_em: new Date().toISOString(),
    total_skills: 3,
    skills: [
      {
        nome: 'React',
        categoria: 'frontend',
        nivel: 'experiencia-pratica',
        padroes: [],
        frequencia: 1,
        profundidade: 45,
        evidencias_ids: ['ev-1'],
        descricao: 'React utilizado em 1 projeto. Profundidade técnica: 45/100.',
      },
      {
        nome: 'TypeScript',
        categoria: 'fundamentos',
        nivel: 'experiencia-pratica',
        padroes: [],
        frequencia: 1,
        profundidade: 45,
        evidencias_ids: ['ev-1'],
        descricao: 'TypeScript utilizado em 1 projeto.',
      },
      {
        nome: 'Docker',
        categoria: 'devops',
        nivel: 'conhecimento-basico',
        padroes: ['containerizacao'],
        frequencia: 1,
        profundidade: 20,
        evidencias_ids: ['ev-2'],
        descricao: 'Docker utilizado em 1 projeto.',
      },
    ],
    por_nivel: {
      'conhecimento-basico': ['Docker'],
      'experiencia-pratica': ['React', 'TypeScript'],
      'experiencia-avancada': [],
      'dominio-solido': [],
    },
    por_categoria: {
      arquitetura: [],
      fundamentos: ['TypeScript'],
      performance: [],
      escalabilidade: [],
      testes: [],
      devops: ['Docker'],
      produto: [],
      seguranca: [],
      'banco-de-dados': [],
      frontend: ['React'],
      backend: [],
      integracao: [],
    },
    padroes_identificados: ['containerizacao'],
  };
}

describe('AnswerEngine', () => {
  let engine: AnswerEngine;

  beforeEach(() => {
    engine = new AnswerEngine(makeNormalizedBase(), makeSkillBase());
  });

  describe('query', () => {
    it('should return factual answer for known skill', () => {
      const result = engine.query('React');

      expect(result.sem_evidencia).toBe(false);
      expect(result.resposta).toBeTruthy();
      expect(result.confianca).toBeGreaterThan(0);
      expect(result.evidencias.length).toBeGreaterThan(0);
    });

    it('should return "sem evidência" for unknown skill', () => {
      const result = engine.query('Haskell monads');

      expect(result.sem_evidencia).toBe(true);
      expect(result.confianca).toBe(0);
    });

    it('should include project context when available', () => {
      const result = engine.query('React TypeScript');

      if (!result.sem_evidencia) {
        expect(result.contexto_projeto).toBeDefined();
      }
    });
  });

  describe('parseJobDescription', () => {
    it('should extract requirements from job text', () => {
      const jobText = `
        Requisitos obrigatórios:
        - Experiência com React
        - TypeScript avançado
        - Docker

        Desejável:
        - Kubernetes
        - GraphQL
      `;

      const job = engine.parseJobDescription(jobText, 'Senior Dev', 'ACME');

      expect(job.titulo).toBe('Senior Dev');
      expect(job.empresa).toBe('ACME');
      expect(job.requisitos.length).toBeGreaterThan(0);

      const reactReq = job.requisitos.find(r => r.nome === 'React');
      expect(reactReq).toBeDefined();
      expect(reactReq!.obrigatorio).toBe(true);

      const k8sReq = job.requisitos.find(r => r.nome === 'Kubernetes');
      expect(k8sReq).toBeDefined();
      expect(k8sReq!.obrigatorio).toBe(false);
    });
  });

  describe('matchJob', () => {
    it('should calculate adherence score', () => {
      const job = engine.parseJobDescription(`
        Requisitos:
        - React
        - TypeScript
        - Docker
      `, 'Frontend Dev');

      const result = engine.matchJob(job);

      expect(result.aderencia).toBeGreaterThan(0);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.bullets.length).toBeGreaterThanOrEqual(0);
    });

    it('should identify gaps', () => {
      const job = engine.parseJobDescription(`
        Requisitos obrigatórios:
        - React
        - Kotlin
        - Terraform
      `, 'Full Stack Dev');

      const result = engine.matchJob(job);

      expect(result.gaps.length).toBeGreaterThan(0);
      const gapNames = result.gaps.map(g => g.requisito.nome);
      expect(gapNames).toContain('Kotlin');
    });

    it('should identify interview risks for critical gaps', () => {
      const job = engine.parseJobDescription(`
        Requisitos obrigatórios:
        - Java
        - Spring Boot
        - Kafka
      `, 'Backend Java');

      const result = engine.matchJob(job);

      expect(result.riscos_entrevista.length).toBeGreaterThan(0);
    });
  });
});
