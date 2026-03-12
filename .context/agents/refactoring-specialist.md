---
type: agent
name: refactoring-specialist
description: Especialista em decomposição de arquivos grandes (App.tsx, JobPanel.tsx), extração de padrões compartilhados e melhoria de type safety.
generated: 2026-03-12
status: filled
---

# Refactoring Specialist Playbook

## Responsabilidades

- Decompor `App.tsx` (669 linhas) em componentes menores e focados.
- Decompor `JobPanel.tsx` (711 linhas) em sub-componentes com responsabilidades claras.
- Extrair padrões repetidos em utilitários compartilhados (`src/lib/`).
- Melhorar type safety eliminando `any`, `as unknown`, e type assertions inseguras.
- Consolidar patterns de state management (subscribe/notify) em abstração reutilizável.
- Reduzir acoplamento entre módulos mantendo a interface `ResumeData` como contrato.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `src/App.tsx` (669 linhas) | **PRIORIDADE 1**: Decomposição urgente — mistura layout, data fetching, print logic |
| `src/components/JobPanel.tsx` (711 linhas) | **PRIORIDADE 2**: Decomposição — mistura form, analysis display, scoring |
| `src/agents/orchestrator.ts` (292 linhas) | Pipeline coordinator — extrair step handlers |
| `src/agents/job-analyzer.ts` (318 linhas) | Candidato a split: parsing vs matching vs scoring |
| `src/skills/skill-graph.ts` (424 linhas) | Algoritmos de grafo — extrair traversal utilities |
| `src/lib/pipeline-store.ts` (323 linhas) | Store pattern — extrair base class/factory |
| `src/lib/ske-bridge.ts` (292 linhas) | Bridge — separar loading de transformação |
| `src/types/resume.ts` | Schema — pode necessitar split em sub-types |
| `src/agents/useOrchestrator.ts` | Hook — pode estar fazendo demais |

## Workflow

1. **Inventariar arquivos grandes**: Identificar arquivos com 300+ linhas. Priorizar por complexidade ciclomática e número de responsabilidades.
2. **App.tsx decomposição** (669 linhas):
   - Extrair seções do currículo em componentes: `ResumeHeader`, `ExperienceSection`, `SkillsSection`, `EducationSection`, `ProjectsSection`.
   - Mover print-specific logic para `usePrintLayout` hook.
   - Mover data loading/transformation para custom hook `useResumeData`.
   - App.tsx final: ~100-150 linhas fazendo composição de seções.
3. **JobPanel.tsx decomposição** (711 linhas):
   - Separar: `JobInputForm` (input textarea + paste), `JobAnalysisResult` (display de análise), `JobMatchScoring` (scores e métricas).
   - Extrair lógica de estado para `useJobAnalysis` hook.
   - JobPanel final: ~100-150 linhas compondo sub-componentes.
4. **Extrair padrão store**:
   - `pipeline-store.ts`, `execution-store.ts`, `config-store.ts` seguem mesmo pattern singleton+subscribe.
   - Extrair `createStore<T>()` factory function em `src/lib/create-store.ts`.
5. **Type safety audit**:
   - `grep -r "as any" src/` — eliminar cada ocorrência.
   - `grep -r "as unknown" src/` — substituir por type guards.
   - Verificar que todos os `Object.keys()` são tipados corretamente.
6. **Testar após cada refactoring**: Rodar `npm run build` após cada extração. Refactoring não deve mudar comportamento — apenas estrutura.

## Convenções

- **Um componente, uma responsabilidade**: Componente com mais de 200 linhas provavelmente faz demais.
- **Extract, don't rewrite**: Mover código existente para novo arquivo. Não reescrever lógica durante refactoring.
- **Manter exports**: Ao extrair de `App.tsx`, manter o export default. Imports externos não devem mudar.
- **Incremental**: Um PR por extração. Não decompor tudo de uma vez — risco de regressão.
- **Type guards over assertions**: `if (isResumeData(data))` é melhor que `data as ResumeData`.

## Pitfalls Comuns

- **Refactoring + feature no mesmo PR**: Misturar mudança estrutural com nova funcionalidade. Impossível revisar. Separar.
- **Prop drilling após split**: Decompor `App.tsx` em 5 componentes pode criar prop drilling de 3+ níveis. Usar Context ou hooks, não props cascateados.
- **Circular imports após extração**: Mover código de A para B, mas B já importa A. Verificar com `madge --circular src/`.
- **Testes quebrados por path change**: SKE testes importam paths relativos. Mover arquivo sem atualizar imports quebra testes silenciosamente.
- **Store factory over-abstraction**: Extrair `createStore<T>()` é útil, mas não forçar se stores têm lógica específica significativa. Abstração prematura.
- **Print regression**: Decompor `App.tsx` pode quebrar print layout se CSS selectors dependem de estrutura DOM específica. Testar Ctrl+P.
