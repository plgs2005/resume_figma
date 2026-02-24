/**
 * SelfKnowledgeEngine — Unit Tests: Authorship Verification & Weights
 */

import { applyWeightsOnly, WEIGHT_BY_TYPE } from '../src/authorship';
import type { Evidence } from '../src/types';

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
    origem: partial.origem,
    repo_owner: partial.repo_owner,
    commit_author: partial.commit_author,
    autoria_verificada: partial.autoria_verificada,
    framework_generated: partial.framework_generated,
    peso_base: partial.peso_base,
    peso_final: partial.peso_final,
  };
}

describe('Authorship Weights', () => {
  describe('WEIGHT_BY_TYPE', () => {
    it('should define correct base weights per evidence type', () => {
      expect(WEIGHT_BY_TYPE['commit']).toBe(1.0);
      expect(WEIGHT_BY_TYPE['test']).toBe(1.0);
      expect(WEIGHT_BY_TYPE['arquivo']).toBe(0.9);
      expect(WEIGHT_BY_TYPE['migration']).toBe(0.9);
      expect(WEIGHT_BY_TYPE['ci']).toBe(0.8);
      expect(WEIGHT_BY_TYPE['docker']).toBe(0.7);
      expect(WEIGHT_BY_TYPE['config']).toBe(0.3);
      expect(WEIGHT_BY_TYPE['readme']).toBe(0.2);
    });
  });

  describe('applyWeightsOnly', () => {
    it('should assign peso_base by tipo', () => {
      const evidences = [
        makeEvidence({ tipo: 'commit' }),
        makeEvidence({ tipo: 'config' }),
        makeEvidence({ tipo: 'readme' }),
        makeEvidence({ tipo: 'test' }),
      ];

      const result = applyWeightsOnly(evidences);

      expect(result[0].peso_base).toBe(1.0);
      expect(result[1].peso_base).toBe(0.3);
      expect(result[2].peso_base).toBe(0.2);
      expect(result[3].peso_base).toBe(1.0);
    });

    it('should give full peso_final when autoria_verificada is true', () => {
      const evidences = [
        makeEvidence({ tipo: 'commit', autoria_verificada: true }),
        makeEvidence({ tipo: 'test', autoria_verificada: true }),
      ];

      const result = applyWeightsOnly(evidences);

      expect(result[0].peso_final).toBe(1.0);
      expect(result[1].peso_final).toBe(1.0);
    });

    it('should reduce peso_final to 0.3x when no autoria', () => {
      const evidences = [
        makeEvidence({ tipo: 'commit', autoria_verificada: false }),
        makeEvidence({ tipo: 'config', autoria_verificada: false }),
      ];

      const result = applyWeightsOnly(evidences);

      expect(result[0].peso_final).toBeCloseTo(0.3);  // 1.0 * 0.3
      expect(result[1].peso_final).toBeCloseTo(0.09); // 0.3 * 0.3
    });

    it('should set peso_final to 0 when framework_generated', () => {
      const evidences = [
        makeEvidence({ tipo: 'commit', framework_generated: true }),
        makeEvidence({ tipo: 'config', framework_generated: true, autoria_verificada: true }),
      ];

      const result = applyWeightsOnly(evidences);

      expect(result[0].peso_final).toBe(0);
      expect(result[1].peso_final).toBe(0); // framework_generated trumps autoria
    });

    it('should not mutate original evidences', () => {
      const original = makeEvidence({ tipo: 'commit' });
      const originalCopy = { ...original };

      applyWeightsOnly([original]);

      expect(original.peso_base).toBe(originalCopy.peso_base);
      expect(original.peso_final).toBe(originalCopy.peso_final);
    });

    it('should handle unknown tipo with default weight', () => {
      const evidences = [
        makeEvidence({ tipo: 'github-api' as any }),
      ];

      const result = applyWeightsOnly(evidences);

      expect(result[0].peso_base).toBe(0.2);
    });
  });

  describe('Weight Calculations — Scenarios', () => {
    it('scenario: autoral commit + autoral test → high score', () => {
      const evidences = applyWeightsOnly([
        makeEvidence({ tipo: 'commit', autoria_verificada: true }),
        makeEvidence({ tipo: 'test', autoria_verificada: true }),
        makeEvidence({ tipo: 'ci', autoria_verificada: true }),
      ]);

      const totalWeight = evidences.reduce((s, e) => s + (e.peso_final ?? 0), 0);
      expect(totalWeight).toBe(2.8); // 1.0 + 1.0 + 0.8
    });

    it('scenario: all framework → zero score', () => {
      const evidences = applyWeightsOnly([
        makeEvidence({ tipo: 'config', framework_generated: true }),
        makeEvidence({ tipo: 'readme', framework_generated: true }),
        makeEvidence({ tipo: 'arquivo', framework_generated: true }),
      ]);

      const totalWeight = evidences.reduce((s, e) => s + (e.peso_final ?? 0), 0);
      expect(totalWeight).toBe(0);
    });

    it('scenario: mixed autoral + unverified → weighted score', () => {
      const evidences = applyWeightsOnly([
        makeEvidence({ tipo: 'commit', autoria_verificada: true }),   // 1.0
        makeEvidence({ tipo: 'config' }),                              // 0.3 * 0.3 = 0.09
        makeEvidence({ tipo: 'readme' }),                              // 0.2 * 0.3 = 0.06
      ]);

      const totalWeight = evidences.reduce((s, e) => s + (e.peso_final ?? 0), 0);
      expect(totalWeight).toBeCloseTo(1.15);
    });
  });
});
