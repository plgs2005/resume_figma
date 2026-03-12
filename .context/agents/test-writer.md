---
type: agent
name: test-writer
description: Escritor de testes Jest para o SKE (32 testes, 5 suites), guidelines de teste do AGENTS.md e recomendação de Vitest para agentes React.
generated: 2026-03-12
status: filled
---

# Test Writer Playbook

## Responsabilidades

- Manter e expandir os 32+ testes Jest do SKE em `agents/self-knowledge-engine/__tests__/`.
- Garantir cobertura das 5 suites: answer-engine, authorship/identity, commit-analyzer, extractor/normalizer, project-discovery/utils.
- Recomendar e implementar testes Vitest para agentes frontend (`src/agents/`).
- Seguir as instruções de teste do `AGENTS.md`: `npm run test`, watch mode, build+test antes de PR.
- Escrever testes que são determinísticos, isolados e rápidos.
- Mockar dependências externas (filesystem, GitHub API, fetch) sem side effects.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `agents/self-knowledge-engine/__tests__/answer-engine.test.ts` | Testes do Answer Engine (camada 4) |
| `agents/self-knowledge-engine/__tests__/authorship.test.ts` | Testes de autoria e identity |
| `agents/self-knowledge-engine/__tests__/commit-analyzer.test.ts` | Testes de análise de commits |
| `agents/self-knowledge-engine/__tests__/extractor.test.ts` | Testes do Extractor (camada 3) |
| `agents/self-knowledge-engine/__tests__/identity-resolver.test.ts` | Testes de resolução de identidade |
| `agents/self-knowledge-engine/__tests__/normalizer.test.ts` | Testes do Normalizer (camada 2) |
| `agents/self-knowledge-engine/__tests__/project-discovery.test.ts` | Testes de descoberta de projetos |
| `agents/self-knowledge-engine/__tests__/prompt-export.test.ts` | Testes de exportação de prompts |
| `agents/self-knowledge-engine/__tests__/utils.test.ts` | Testes de utilitários |
| `agents/self-knowledge-engine/jest.config.cjs` | Config Jest (CommonJS + ts-jest) |
| `AGENTS.md` | Instruções de teste do projeto |

## Workflow

1. **Rodar testes existentes**: `cd agents/self-knowledge-engine && npm test`. Verificar que todos 32 testes passam antes de qualquer alteração.
2. **Watch mode para desenvolvimento**: `npm test -- --watch` — re-roda testes afetados a cada save.
3. **Estrutura de teste SKE (Jest)**:
   ```typescript
   describe('NormalizerModule', () => {
     beforeEach(() => {
       // Reset state entre testes
     });

     it('should normalize skill names to lowercase', () => {
       const result = normalizeSkill('TypeScript');
       expect(result).toBe('typescript');
     });

     it('should handle empty input gracefully', () => {
       expect(() => normalizeSkill('')).not.toThrow();
     });
   });
   ```
4. **Mocking patterns para SKE**:
   ```typescript
   // Mock filesystem
   jest.mock('fs', () => ({
     readFileSync: jest.fn().mockReturnValue('mock content'),
     existsSync: jest.fn().mockReturnValue(true),
   }));

   // Mock GitHub API
   jest.mock('../src/collector', () => ({
     fetchCommits: jest.fn().mockResolvedValue([
       { sha: 'abc123', message: 'feat: add feature' }
     ]),
   }));
   ```
5. **Recomendação Vitest para frontend**: Os agentes em `src/agents/` não têm testes. Vitest é recomendado por integração nativa com Vite:
   ```typescript
   // src/agents/__tests__/job-analyzer.test.ts (futuro)
   import { describe, it, expect } from 'vitest';
   import { analyzeJob } from '../job-analyzer';

   describe('JobAnalyzer', () => {
     it('should extract skills from job description', () => {
       const result = analyzeJob('Looking for React and TypeScript developer');
       expect(result.skills).toContain('react');
       expect(result.skills).toContain('typescript');
     });
   });
   ```
6. **Build + test antes de PR**: Conforme AGENTS.md: `npm run build && npm run test`.

## Convenções

- **Jest para SKE**: Config CommonJS (`jest.config.cjs`), transform via `ts-jest`. Não migrar para ESM sem necessidade.
- **Vitest para frontend**: Quando testes de agentes frontend forem necessários, usar Vitest (integração Vite nativa).
- **Determinístico**: Testes não dependem de rede, filesystem real, ou estado global. Mock tudo que é externo.
- **Isolado**: `beforeEach` para reset de state. Singletons (pipeline-store) devem ser resetados entre testes.
- **Nomenclatura**: `should <expected behavior> when <condition>`. Ex: `should return empty array when no skills found`.
- **Sem snapshots para lógica**: Snapshot testing é para UI. Lógica de agentes usa assertions explícitas.

## Pitfalls Comuns

- **Singleton não resetado entre testes**: `pipeline-store` mantém estado entre `it()` blocks. Sem `beforeEach` reset, testes são order-dependent.
- **Jest config CommonJS**: `jest.config.cjs` é CommonJS por necessidade do ts-jest. Renomear para `.ts` ou `.mjs` quebra.
- **Mock de fs sem restore**: `jest.mock('fs')` afeta todos os testes do arquivo. Usar `jest.restoreAllMocks()` em `afterEach`.
- **Testes SKE que escrevem em disco**: Testes que criam arquivos em `.context/` podem falhar em CI ou poluir workspace. Mock filesystem.
- **Cobertura enganosa**: `npm test -- --coverage` mostra linhas, mas não branch coverage. Erro comum: testar happy path e ignorar error paths.
- **Vitest não configurado**: O projeto ainda não tem Vitest setup. Antes de escrever testes frontend, configurar `vitest.config.ts` e adicionar `@testing-library/react`.
- **Testes acoplados a dados reais**: Testes que importam `resume-default.ts` como fixture criam acoplamento. Usar dados mock inline.
