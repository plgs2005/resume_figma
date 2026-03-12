---
type: doc
name: testing-strategy
description: Estratégia de testes, frameworks e cobertura
category: quality
generated: 2026-03-12
status: filled
---

# Testing Strategy

## Visão Geral

O projeto tem duas áreas de teste:

1. **SKE (Self-Knowledge Engine)**: Suite completa com Jest — 32 testes em 5 suites.
2. **React App (resume_figma)**: Sem suite de testes configurada atualmente. A validação é feita via build + type-check.

## SKE — Framework de Testes

| Aspecto | Detalhe |
|---------|---------|
| Framework | Jest 29.7 |
| Transpilação | ts-jest (ESM via `--experimental-vm-modules`) |
| Config | `jest.config.cjs` |
| Execução | `npm test` ou `npm run test:watch` |
| Suites | 5 |
| Testes | 32 |

### Suites de Teste

| Suite | Arquivo | Responsabilidade |
|-------|---------|-----------------|
| Utils | `__tests__/utils.test.ts` | Funções utilitárias compartilhadas |
| Normalizer | `__tests__/normalizer.test.ts` | Deduplicação e classificação de evidências |
| Extractor | `__tests__/extractor.test.ts` | Extração de skills e padrões |
| Answer Engine | `__tests__/answer-engine.test.ts` | Motor de respostas factuais |
| Prompt Export | `__tests__/prompt-export.test.ts` | Geração de prompts para LLMs |
| Authorship | `__tests__/authorship.test.ts` | Atribuição de autoria |
| Commit Analyzer | `__tests__/commit-analyzer.test.ts` | Análise de histórico git |
| Identity Resolver | `__tests__/identity-resolver.test.ts` | Resolução de identidade |
| Project Discovery | `__tests__/project-discovery.test.ts` | Descoberta de projetos |

### Executando Testes SKE

```bash
cd agents/self-knowledge-engine
npm test                    # Executa todos
npm run test:watch          # Modo watch
npm test -- --verbose       # Saída detalhada
npm test -- utils           # Suite específica
```

## React App — Validação

Atualmente o app React não possui testes automatizados. A validação é feita por:

1. **Type-check**: `npm run type-check` (tsc --noEmit)
2. **Build**: `npm run build` (Vite build estrito)
3. **Visual**: Inspeção manual via dev server
4. **Build:strict**: `npm run build:strict` (tsc -b + vite build)

## Estratégia Recomendada para Futuro

| Tipo | Framework | Alvo |
|------|-----------|------|
| Unitário (agentes) | Vitest | `src/agents/*.ts` — job-analyzer, resume-builder, lens |
| Unitário (skills) | Vitest | `src/skills/*.ts` — skill-graph, merger, normalizer |
| Componente | Testing Library | `src/components/` — JobPanel, workspace pages |
| E2E | Playwright | Fluxo completo: abrir app → colar vaga → ver currículo tailored |

## Guidelines para Novos Testes

- Cada novo agente deve ter testes unitários correspondentes
- Testes devem usar dados mockados (não depender de filesystem real)
- Padrão de nomenclatura: `__tests__/nome-modulo.test.ts`
- Cobertura mínima recomendada: 80% para módulos de agentes
- Rode `npm run build && npm test` antes de PRs (conforme AGENTS.md)
