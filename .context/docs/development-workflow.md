---
type: doc
name: development-workflow
description: Fluxo de desenvolvimento, branching e CI/CD
category: workflow
generated: 2026-03-12
status: filled
---

# Development Workflow

## Branching Strategy

- Branch principal: `main`
- Commits seguem **Conventional Commits**: `feat(scope): description`, `fix(scope): description`
- PRs devem passar no build antes de merge

## Scripts NPM (Root)

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `vite` | Dev server com HMR |
| `build` | `vite build` | Build de produção |
| `build:strict` | `tsc -b && vite build` | Build com type-check |
| `preview` | `vite preview` | Preview do build |
| `type-check` | `tsc --noEmit` | Verificação de tipos |
| `fix-imports` | `bash scripts/fix-figma-imports.sh` | Corrige imports Figma |

## Scripts NPM (SKE)

| Script | Descrição |
|--------|-----------|
| `build` | Compila TypeScript |
| `scan` | Pipeline completo escaneando /home/plgsa |
| `export` | Exporta skill-data.json para public/ |
| `refresh` | Build + Scan + Export (tudo em um) |
| `test` | 32 testes unitários (5 suites) |
| `test:watch` | Testes em modo watch |

## Fluxo de Desenvolvimento Diário

1. **Inicie o dev server**: `npm run dev`
2. **Faça alterações**: Edite arquivos em `src/`
3. **HMR**: Mudanças são refletidas automaticamente
4. **Type-check**: `npm run type-check` para verificar tipos
5. **Build**: `npm run build` antes de commit
6. **Testes SKE**: `cd agents/self-knowledge-engine && npm test`

## Adicionando Componentes UI

O projeto usa Shadcn/ui. Para adicionar novos componentes:

1. Adicione o componente em `src/components/ui/`
2. Siga o padrão existente (Radix + forwardRef + cn())
3. Exporte via barrel exports se necessário

## Adicionando Agentes

1. Crie o agente em `src/agents/`
2. Defina tipos no arquivo ou em `src/types/`
3. Integre com o `orchestrator.ts` se for parte do pipeline
4. Documente o agente e atualize este workflow

## Modificando o Currículo

1. **Dados**: Edite `src/data/resume-default.ts` para conteúdo
2. **Schema**: Edite `src/types/resume.ts` para novos campos
3. **Layout**: Edite `src/App.tsx` para renderização
4. **Estilos**: Edite `src/styles/globals.css` para design tokens

## CI/CD

- Rode `npm run build && npm run type-check` antes de PRs
- Para SKE: `cd agents/self-knowledge-engine && npm run build && npm test`
- Verifique que `dist/` (SKE) corresponde ao source
- Confirme que `public/skill-data.json` está atualizado via `npm run refresh`

## Coding Standards

- TypeScript strict (quando usando build:strict)
- React com function components e hooks
- Tailwind CSS v4 para estilização (sem CSS modules)
- Nomes de variáveis/funções em inglês, comentários/docs em português
- JSDoc comments em todos os módulos de agentes
