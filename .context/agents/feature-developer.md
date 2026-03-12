---
type: agent
name: feature-developer
description: Desenvolvedor de features: novas páginas/rotas, novos agentes, fontes de skill, extensão do schema ResumeData e componentes Shadcn/ui.
generated: 2026-03-12
status: filled
---

# Feature Developer Playbook

## Responsabilidades

- Implementar novas páginas e rotas no React Router v7 (`src/AppRouter.tsx`).
- Criar novos agentes no pipeline (`src/agents/`), integrando com o orchestrator.
- Adicionar novas fontes de skills via connectors (`src/sources/connectors/`).
- Estender o schema `ResumeData` (`src/types/resume.ts`) para suportar novos campos.
- Adicionar componentes Shadcn/ui (`src/components/ui/`) quando necessário.
- Implementar features no workspace (Home, Sources, Profile, Jobs, Resume, QuickApply).

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `src/AppRouter.tsx` | Rotas React Router v7 (Home, Sources, Profile, Jobs, Resume, QuickApply) |
| `src/types/resume.ts` | Schema `ResumeData` — estender aqui para novos campos |
| `src/agents/orchestrator.ts` (292 linhas) | Registrar novos agentes no pipeline |
| `src/agents/useOrchestrator.ts` | Hook React para consumir o pipeline |
| `src/components/ui/*.tsx` | 47 componentes Shadcn/ui reutilizáveis |
| `src/components/workspace/*.tsx` | Componentes do workspace (páginas internas) |
| `src/pages/workspace/` | Páginas do workspace |
| `src/pages/quick-apply/` | Página Quick Apply |
| `src/sources/types.ts` | Types para fontes de dados |
| `src/sources/connectors/` | Conectores de fontes de dados |
| `src/skills/index.ts` | Entry point do módulo de skills |
| `src/skills/skill-graph.ts` (424 linhas) | Grafo de skills — estender para novas relações |
| `src/skills/skill-merger.ts` | Merge de skills de múltiplas fontes |
| `src/skills/skill-normalizer.ts` | Normalização de nomes de skills |
| `src/hooks/useWorkspaceConfig.ts` | Hook de configuração de workspace |
| `src/lib/config-loader.ts` | Carregamento dinâmico de configs |

## Workflow

1. **Schema first**: Se a feature requer novos dados, começar estendendo `ResumeData` em `src/types/resume.ts`. Isso garante type safety em toda a cadeia.
2. **Atualizar dados default**: Após mudar o schema, atualizar `src/data/resume-default.ts` com valores default para os novos campos.
3. **Implementar agente (se necessário)**:
   - Criar arquivo em `src/agents/novo-agente.ts`.
   - Registrar no `orchestrator.ts` como novo step do pipeline.
   - Expor via `useOrchestrator.ts` para consumo React.
4. **Criar rota (se necessário)**:
   - Adicionar route em `src/AppRouter.tsx`.
   - Criar página em `src/pages/workspace/` ou `src/pages/quick-apply/`.
   - Registrar config em `src/config/` com JSON correspondente.
5. **Usar componentes Shadcn/ui**:
   - Verificar se componente já existe em `src/components/ui/` (47 disponíveis).
   - Se não existe, adicionar via `npx shadcn@latest add <component>`.
   - Nunca modificar componentes ui/ diretamente — compor via wrapper.
6. **Adicionar fonte de skill (se necessário)**:
   - Criar connector em `src/sources/connectors/`.
   - Implementar interface definida em `src/sources/types.ts`.
   - Integrar com `skill-merger.ts` para merge com dados existentes.
7. **Testar**: Verificar build (`npm run build`), visual (dev server), e print layout.

## Convenções

- **Config-driven**: Novas páginas de workspace são configuradas via JSON em `src/config/`. O `config-loader.ts` carrega dinamicamente.
- **Composição over herança**: Novos componentes compõem Shadcn/ui primitives, não estendem.
- **Hook pattern**: Toda interação Agente↔React passa por custom hook. Não importar agentes diretamente em componentes.
- **Feature flag**: Para features experimentais, usar config JSON com flag booleano. Não hardcode condicional.
- **Skill normalizer**: Todo skill name novo deve passar pelo `skill-normalizer.ts` antes de entrar no grafo.

## Pitfalls Comuns

- **Esquecer resume-default.ts**: Adicionar campo em `ResumeData` sem valor default causa `undefined` em runtime quando pipeline não roda.
- **Agente sem registro no orchestrator**: Criar agente em `src/agents/` mas não adicioná-lo ao pipeline do orchestrator. O agente nunca é chamado.
- **Rota sem config**: Adicionar Route em `AppRouter.tsx` sem criar JSON em `src/config/`. O `useWorkspaceConfig` retorna `undefined`.
- **Shadcn/ui modificado diretamente**: Alterar arquivo em `src/components/ui/` impede `npx shadcn@latest add` futuro. Sempre compor externamente.
- **Connector sem tipo**: Novo connector em `src/sources/connectors/` que não implementa interface de `types.ts`. Type error em compile.
- **SkillGraph ciclo**: Adicionar relação no grafo que cria ciclo sem detection. Traversals infinitos em runtime.
