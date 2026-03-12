---
type: doc
name: tooling
description: Ferramentas de desenvolvimento e produtividade
category: tooling
generated: 2026-03-12
status: filled
---

# Tooling & Productivity Guide

## Build System

| Ferramenta | Versão | Função |
|-----------|--------|--------|
| Vite | 6.x | Dev server + bundler de produção |
| @vitejs/plugin-react | 4.x | Fast Refresh para React |
| @tailwindcss/vite | 4.x | Integração Tailwind v4 |
| TypeScript | 5.7.x | Compilação e type-checking |

## Scripts Disponíveis

### Root (`/resume_figma`)

```bash
npm run dev          # Dev server com HMR (http://localhost:5173)
npm run build        # Build de produção (dist/)
npm run build:strict # tsc -b + vite build
npm run preview      # Preview do build
npm run type-check   # tsc --noEmit
npm run fix-imports  # Corrige imports Figma
```

### SKE (`/agents/self-knowledge-engine`)

```bash
npm run build        # Compila TypeScript → dist/
npm run dev          # tsc --watch
npm run scan         # Pipeline completo
npm run export       # Exporta skill-data.json → public/
npm run refresh      # Build + Scan + Export
npm test             # Jest (32 testes, 5 suites)
npm run test:watch   # Jest --watch
```

## IDE Setup (VS Code)

### Extensões Recomendadas
- **TypeScript** (built-in)
- **Tailwind CSS IntelliSense** — autocomplete de classes
- **ES7+ React/Redux/GraphQL** — snippets React
- **Prettier** — formatação
- **ESLint** — linting (se configurado)

### Settings Relevantes
- `editor.defaultFormatter: "esbenp.prettier-vscode"` (recomendado)
- `typescript.preferences.importModuleSpecifier: "relative"` (imports relativos)

## Configuração TypeScript

O projeto usa 3 tsconfigs:
- `tsconfig.json` — raiz (referencia app e node)
- `tsconfig.app.json` — config do app React (strict, jsx: react-jsx)
- `tsconfig.node.json` — config para vite.config.ts

O SKE tem seu próprio `tsconfig.json` em `agents/self-knowledge-engine/`.

## Automação & Scripts

- `scripts/fix-figma-imports.sh` — Corrige imports Figma (pós-geração de componentes)
- SKE `bridge/export.ts` — Exporta dados coletados para `public/skill-data.json`

## AI Context Tools

- `.context/` — Artefatos gerados pelo AI-CONTEXT
- `agents/` — Playbooks para agentes AI
- `docs/` — Documentação estruturada para consumo por AI
- `AGENTS.md` — Instruções de CI/testes para agentes Codex/copilot

## Debug

### Frontend
- Chrome DevTools (F12)
- React DevTools extension
- Vite HMR errors aparecem como overlay no browser

### SKE
- `node --enable-source-maps dist/cli.js <comando>` — source maps habilitados
- `npm run dev` (tsc --watch) para desenvolvimento contínuo
