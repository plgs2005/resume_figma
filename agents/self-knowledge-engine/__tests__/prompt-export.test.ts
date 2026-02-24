/**
 * Tests for PromptExporter
 */

import { PromptExporter } from '../src/prompt-export.js';
import type { SkillBase, NormalizedBase, JobMatchResult } from '../src/types.js';

// ─── Fixtures ───────────────────────────────────────────────────────

const mockSkillBase: SkillBase = {
  atualizado_em: '2026-02-24T00:00:00.000Z',
  total_skills: 3,
  skills: [
    {
      nome: 'React',
      categoria: 'frontend',
      nivel: 'dominio-solido',
      padroes: ['design-system', 'state-management'],
      frequencia: 10,
      profundidade: 95,
      evidencias_ids: ['ev1', 'ev2'],
      descricao: 'React utilizado em 10 projetos com patterns avançados.',
    },
    {
      nome: 'Node.js',
      categoria: 'backend',
      nivel: 'experiencia-avancada',
      padroes: ['api-rest', 'desacoplamento'],
      frequencia: 7,
      profundidade: 80,
      evidencias_ids: ['ev3'],
      descricao: 'Node.js utilizado em 7 projetos backend.',
    },
    {
      nome: 'Docker',
      categoria: 'devops',
      nivel: 'experiencia-pratica',
      padroes: ['containerizacao'],
      frequencia: 4,
      profundidade: 50,
      evidencias_ids: ['ev4'],
      descricao: 'Docker utilizado em 4 projetos.',
    },
  ],
  por_nivel: {
    'dominio-solido': ['React'],
    'experiencia-avancada': ['Node.js'],
    'experiencia-pratica': ['Docker'],
    'conhecimento-basico': [],
  },
  por_categoria: {
    frontend: ['React'],
    backend: ['Node.js'],
    devops: ['Docker'],
    fundamentos: [],
    performance: [],
    escalabilidade: [],
    testes: [],
    produto: [],
    seguranca: [],
    'banco-de-dados': [],
    integracao: [],
    arquitetura: [],
  },
  padroes_identificados: ['design-system', 'api-rest', 'containerizacao'],
};

const mockNormalizedBase: NormalizedBase = {
  atualizado_em: '2026-02-24T00:00:00.000Z',
  total_evidencias_brutas: 50,
  total_evidencias_unicas: 40,
  projetos: [
    {
      nome: 'projeto-web',
      caminho: '/home/user/projeto-web',
      evidencias: [
        {
          fonte: '/home/user/projeto-web/package.json',
          tipo: 'config',
          descricao: 'Projeto React com TypeScript.',
          stack_detectada: ['React', 'TypeScript'],
          nivel_complexidade: 'alto',
          coletado_em: '2026-02-24T00:00:00.000Z',
          id: 'ev1',
          projeto: 'projeto-web',
        },
      ],
      stack: ['React', 'TypeScript'],
      categorias: ['frontend'],
      complexidade: 'alto',
    },
    {
      nome: 'api-service',
      caminho: '/home/user/api-service',
      evidencias: [
        {
          fonte: '/home/user/api-service/package.json',
          tipo: 'config',
          descricao: 'API Node.js com Express.',
          stack_detectada: ['Node.js', 'Express'],
          nivel_complexidade: 'medio',
          coletado_em: '2026-02-24T00:00:00.000Z',
          id: 'ev3',
          projeto: 'api-service',
        },
      ],
      stack: ['Node.js', 'Express'],
      categorias: ['backend'],
      complexidade: 'medio',
    },
  ],
  por_categoria: {
    frontend: ['ev1'],
    backend: ['ev3'],
    devops: [],
    fundamentos: [],
    performance: [],
    escalabilidade: [],
    testes: [],
    produto: [],
    seguranca: [],
    'banco-de-dados': [],
    integracao: [],
    arquitetura: [],
  },
};

const mockJobMatch: JobMatchResult = {
  vaga: {
    titulo: 'Senior React Developer',
    empresa: 'TechCorp',
    requisitos: [
      { nome: 'React', obrigatorio: true },
      { nome: 'Node.js', obrigatorio: true },
      { nome: 'Kubernetes', obrigatorio: false },
    ],
    texto_original: 'Looking for a senior React developer...',
  },
  aderencia: 75,
  matches: [
    {
      requisito: { nome: 'React', obrigatorio: true },
      skill: mockSkillBase.skills[0],
      aderencia: 95,
    },
    {
      requisito: { nome: 'Node.js', obrigatorio: true },
      skill: mockSkillBase.skills[1],
      aderencia: 80,
    },
  ],
  gaps: [
    {
      requisito: { nome: 'Kubernetes', obrigatorio: false },
      sugestao: 'Gap desejável: Kubernetes. Sem evidência de experiência prática.',
    },
  ],
  bullets: [
    'Experiência comprovada com React (domínio sólido) no projeto projeto-web.',
  ],
  pontos_fortes: ['React: domínio sólido — 10 projetos'],
  pontos_fracos: ['Kubernetes: sem evidência prática'],
  riscos_entrevista: ['BAIXO: 1 diferencial não atendido'],
  ajustes_keywords: [],
};

// ─── Tests ──────────────────────────────────────────────────────────

describe('PromptExporter', () => {
  let exporter: PromptExporter;

  beforeEach(() => {
    exporter = new PromptExporter(mockSkillBase, mockNormalizedBase);
  });

  describe('export()', () => {
    it('deve gerar technical-summary com dados factuais', () => {
      const result = exporter.export({ formato: 'technical-summary' });

      expect(result.formato).toBe('technical-summary');
      expect(result.prompt).toContain('PERFIL FACTUAL');
      expect(result.prompt).toContain('React');
      expect(result.prompt).toContain('Node.js');
      expect(result.prompt).toContain('Docker');
      expect(result.prompt).toContain('NUNCA invente');
      expect(result.dados_injetados.total_skills).toBe(3);
      expect(result.dados_injetados.total_projetos).toBe(2);
      expect(result.gerado_em).toBeTruthy();
    });

    it('deve gerar cover-letter com job match', () => {
      const result = exporter.export({
        formato: 'cover-letter',
        jobMatch: mockJobMatch,
        idioma: 'pt-br',
        tom: 'formal',
      });

      expect(result.prompt).toContain('cover letter');
      expect(result.prompt).toContain('Senior React Developer');
      expect(result.prompt).toContain('TechCorp');
      expect(result.prompt).toContain('75%');
      expect(result.prompt).toContain('PONTOS FORTES');
      expect(result.prompt).toContain('GAPS');
      expect(result.prompt).toContain('Kubernetes');
    });

    it('deve gerar interview-prep com riscos', () => {
      const result = exporter.export({
        formato: 'interview-prep',
        jobMatch: mockJobMatch,
      });

      expect(result.prompt).toContain('entrevista');
      expect(result.prompt).toContain('Perguntas técnicas');
      expect(result.prompt).toContain('Riscos');
      expect(result.prompt).toContain('RISCOS IDENTIFICADOS');
    });

    it('deve gerar linkedin com constraints específicas', () => {
      const result = exporter.export({
        formato: 'linkedin',
        idioma: 'pt-br',
        tom: 'conversacional',
      });

      expect(result.prompt).toContain('LinkedIn');
      expect(result.prompt).toContain('About');
      expect(result.prompt).toContain('Headline');
      expect(result.prompt).toContain('2000 caracteres');
      expect(result.prompt).toContain('conversacional');
    });

    it('deve suportar idioma inglês', () => {
      const result = exporter.export({
        formato: 'technical-summary',
        idioma: 'en',
      });

      expect(result.prompt).toContain('FACTUAL PROFILE');
      expect(result.prompt).toContain('NEVER invent');
      expect(result.prompt).toContain('Solid Mastery');
      expect(result.prompt).not.toContain('PERFIL FACTUAL');
    });

    it('deve respeitar max_skills', () => {
      const result = exporter.export({
        formato: 'technical-summary',
        max_skills: 1,
      });

      // Deve conter apenas 1 skill detalhada (React)
      const skillCount = (result.prompt.match(/\*\*React\*\*/g) || []).length;
      expect(skillCount).toBe(1);
      // Node.js e Docker não devem aparecer como skills detalhadas
      expect(result.prompt).not.toContain('**Node.js**');
      expect(result.prompt).not.toContain('**Docker**');
    });

    it('deve gerar custom com template e placeholders', () => {
      const result = exporter.export({
        formato: 'custom',
        template: 'Perfil com {{total_skills}} skills e {{total_projetos}} projetos.\n\n{{perfil_factual}}',
      });

      expect(result.prompt).toContain('Perfil com 3 skills e 2 projetos.');
      expect(result.prompt).toContain('React');
    });

    it('deve incluir instruções extras quando fornecidas', () => {
      const result = exporter.export({
        formato: 'cover-letter',
        jobMatch: mockJobMatch,
        instrucoes_extras: 'Mencionar disponibilidade imediata.',
      });

      expect(result.prompt).toContain('INSTRUÇÕES ADICIONAIS');
      expect(result.prompt).toContain('disponibilidade imediata');
    });
  });

  describe('dados_injetados', () => {
    it('deve conter metadados corretos', () => {
      const result = exporter.export({ formato: 'technical-summary' });

      expect(result.dados_injetados.total_skills).toBe(3);
      expect(result.dados_injetados.total_projetos).toBe(2);
      expect(result.dados_injetados.total_evidencias).toBe(40);
      expect(result.dados_injetados.categorias).toContain('frontend');
      expect(result.dados_injetados.categorias).toContain('backend');
      expect(result.dados_injetados.categorias).toContain('devops');
      expect(result.dados_injetados.padroes).toEqual(['design-system', 'api-rest', 'containerizacao']);
    });
  });
});
