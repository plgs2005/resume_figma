---
type: agent
name: code-reviewer
description: Revisor de código focado em conformidade com ResumeData, padrões de imutabilidade, Tailwind, e cobertura de testes SKE.
generated: 2026-03-12
status: filled
---

# Code Reviewer Playbook

## Responsabilidades

- Revisar PRs garantindo conformidade com o contrato `ResumeData` (`src/types/resume.ts`).
- Verificar padrões de imutabilidade em agentes (sem mutação de state recebido).
- Auditar uso de Tailwind v4: classes válidas, tokens CSS custom properties, sem estilos inline desnecessários.
- Garantir cobertura de testes SKE: novos módulos devem ter testes correspondentes em `__tests__/`.
- Validar separação de concerns: agentes não importam React, componentes não importam agentes diretamente.
- Verificar Conventional Commits e CHANGELOG.md atualizado.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `src/types/resume.ts` | Schema de referência para todas as revisões |
| `src/agents/*.ts` | Agentes do pipeline — verificar imutabilidade e tipagem |
| `src/components/ui/*.tsx` | 47 componentes Shadcn/ui — verificar padrão de composição |
| `src/styles/globals.css` | Tokens e variáveis CSS — único ponto de design tokens |
| `agents/self-knowledge-engine/__tests__/*.ts` | 5 suites de teste — verificar cobertura |
| `src/hooks/useWorkspaceConfig.ts` | Hook de configuração — verificar padrão de uso |
| `CHANGELOG.md` | Histórico de versões — deve refletir mudanças |
| `AGENTS.md` | Regras do projeto — referência para decisões de PR |

## Workflow

1. **Verificar contrato ResumeData**: Qualquer PR que altere `src/types/resume.ts` deve atualizar simultaneamente `resume-default.ts`, `ske-bridge.ts`, e testes relevantes.
2. **Checklist de imutabilidade**:
   - Agentes recebem dados como parâmetro e retornam novos objetos.
   - Nenhum `Array.push()`, `obj.prop = value`, ou `delete obj.prop` em dados de pipeline.
   - Preferir spread operator `{ ...obj, newProp }` e `[...arr, newItem]`.
3. **Auditoria Tailwind**:
   - Classes existem no Tailwind v4. Não inventar classes (`bg-brand-500` → usar variável CSS `bg-[var(--brand)]`).
   - Responsive breakpoints: `md:` (768px), `lg:` (1024px). Não usar breakpoints customizados sem registrar.
   - Print classes: `print:hidden`, `print:block` são válidos.
4. **Cobertura de testes SKE**:
   - Novos módulos em `agents/self-knowledge-engine/src/` devem ter teste em `__tests__/`.
   - Mocks de filesystem e GitHub API devem usar `jest.fn()`, não mocks reais.
   - Rodar `npm test -- --coverage` para verificar linhas não cobertas.
5. **Separação de concerns**:
   - `src/agents/` não importa de `src/components/`.
   - `src/components/` acessa agentes exclusivamente via hooks (`useOrchestrator.ts`).
   - `src/lib/` é camada de infraestrutura — sem lógica de negócio.
6. **Commit e changelog**: Verificar formato Conventional Commits (`feat:`, `fix:`, `refactor:`). CHANGELOG.md atualizado.

## Convenções

- **Sem `any`**: TypeScript strict está ativo. `unknown` + type guard é preferível a `any`.
- **Sem `eval()` ou `Function()`**: Risco de segurança. Rejeitar qualquer PR que introduza.
- **Imports organizados**: React imports primeiro, depois libs externas, depois internos. Path absoluto via alias `@/`.
- **Componentes Shadcn/ui**: Não modificar diretamente os 47 componentes em `src/components/ui/`. Estender via composição.
- **JSDoc em agentes**: Funções exportadas em `src/agents/` devem ter JSDoc com `@param` e `@returns`.

## Pitfalls Comuns

- **PR toca ResumeData mas não testes**: Schema change sem teste correspondente é dívida técnica imediata.
- **Mutação acidental em reducer-like patterns**: `pipeline-store` usa pattern similar a reducer. State é copiado, não mutado — mas é fácil esquecer o spread.
- **Tailwind class purging**: Em build, Vite/Tailwind remove classes não usadas. Classes dinâmicas (`bg-${color}-500`) serão removidas. Usar safelist ou classes completas.
- **Import cruzado agentes↔componentes**: Fácil de introduzir, difícil de detectar. Verificar imports com `grep -r "from.*components" src/agents/`.
- **Testes SKE com side effects**: Testes que escrevem em disco (`.context/`) podem falhar em CI. Mockar filesystem.
