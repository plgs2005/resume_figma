/**
 * SelfKnowledgeEngine — Unit Tests: Evidence Normalizer
 */

import { EvidenceNormalizer } from '../src/normalizer';
import type { Evidence } from '../src/types';

function makeEvidence(partial: Partial<Evidence> = {}): Evidence {
  return {
    id: partial.id || 'test-id-' + Math.random().toString(36).slice(2),
    fonte: partial.fonte || '/test/path',
    tipo: partial.tipo || 'arquivo',
    descricao: partial.descricao || 'Test evidence',
    stack_detectada: partial.stack_detectada || ['TypeScript'],
    nivel_complexidade: partial.nivel_complexidade || 'medio',
    coletado_em: partial.coletado_em || new Date().toISOString(),
    projeto: partial.projeto || 'test-project',
    referencia: partial.referencia,
  };
}

describe('EvidenceNormalizer', () => {
  let normalizer: EvidenceNormalizer;

  beforeEach(() => {
    normalizer = new EvidenceNormalizer();
  });

  describe('normalize', () => {
    it('should return correct counts', () => {
      const evidences = [
        makeEvidence({ id: '1', fonte: '/a', stack_detectada: ['React'] }),
        makeEvidence({ id: '2', fonte: '/b', stack_detectada: ['TypeScript'] }),
      ];

      const result = normalizer.normalize(evidences);

      expect(result.total_evidencias_brutas).toBe(2);
      expect(result.total_evidencias_unicas).toBeLessThanOrEqual(2);
      expect(result.projetos.length).toBeGreaterThan(0);
    });

    it('should deduplicate evidences with same fonte/tipo/stack', () => {
      const evidences = [
        makeEvidence({ id: '1', fonte: '/same', tipo: 'config', stack_detectada: ['React'], descricao: 'short' }),
        makeEvidence({ id: '2', fonte: '/same', tipo: 'config', stack_detectada: ['React'], descricao: 'longer description here' }),
      ];

      const result = normalizer.normalize(evidences);

      expect(result.total_evidencias_unicas).toBe(1);
      // Should keep the one with longer description
    });

    it('should group by project', () => {
      const evidences = [
        makeEvidence({ projeto: 'project-a', stack_detectada: ['React'] }),
        makeEvidence({ projeto: 'project-a', stack_detectada: ['TypeScript'] }),
        makeEvidence({ projeto: 'project-b', stack_detectada: ['Vue.js'] }),
      ];

      const result = normalizer.normalize(evidences);
      const projectNames = result.projetos.map(p => p.nome);

      expect(projectNames).toContain('project-a');
      expect(projectNames).toContain('project-b');
    });

    it('should classify evidence into categories', () => {
      const evidences = [
        makeEvidence({ stack_detectada: ['React', 'Tailwind CSS'] }),
        makeEvidence({ stack_detectada: ['Docker', 'CI/CD'] }),
        makeEvidence({ stack_detectada: ['Jest', 'Testes Automatizados'] }),
      ];

      const result = normalizer.normalize(evidences);

      expect(result.por_categoria.frontend.length).toBeGreaterThan(0);
      expect(result.por_categoria.devops.length).toBeGreaterThan(0);
      expect(result.por_categoria.testes.length).toBeGreaterThan(0);
    });

    it('should handle empty input', () => {
      const result = normalizer.normalize([]);

      expect(result.total_evidencias_brutas).toBe(0);
      expect(result.total_evidencias_unicas).toBe(0);
      expect(result.projetos.length).toBe(0);
    });
  });
});
