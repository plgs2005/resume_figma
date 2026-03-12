---
type: agent
name: devops-specialist
description: Especialista em build Vite, scripts npm, deploy de SPA estática, pipeline de refresh SKE e automação de builds manuais.
generated: 2026-03-12
status: filled
---

# DevOps Specialist Playbook

## Responsabilidades

- Manter a configuração Vite (`vite.config.ts`) para build otimizado de produção.
- Gerenciar scripts npm (`package.json`) para dev, build, test e operações SKE.
- Configurar deployment como SPA estática (sem backend server).
- Manter o pipeline de refresh SKE: re-scan → re-export → rebuild frontend.
- Garantir que TypeScript 5.7 compile sem erros antes de qualquer deploy.
- Gerenciar tsconfig files: `tsconfig.json` (base), `tsconfig.app.json` (frontend), `tsconfig.node.json` (Vite/Node).

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `vite.config.ts` | Configuração Vite 6: plugins, alias, build options |
| `package.json` | Scripts npm, dependências, metadata do projeto |
| `tsconfig.json` | Config base TypeScript (references) |
| `tsconfig.app.json` | Config TS para código React/frontend |
| `tsconfig.node.json` | Config TS para Vite e scripts Node |
| `index.html` | Entry point HTML do Vite — meta tags, CDN scripts |
| `agents/self-knowledge-engine/package.json` | Dependências e scripts do SKE |
| `agents/self-knowledge-engine/jest.config.cjs` | Config Jest para testes SKE |
| `scripts/fix-figma-imports.sh` | Script de manutenção de imports Figma |
| `src/styles/globals.css` | Tailwind v4 config (importado via CSS) |

## Workflow

1. **Dev local**: `npm run dev` inicia Vite dev server com HMR. Porta padrão 5173. Verificar que `--host 0.0.0.0` é usado para acesso externo.
2. **Build de produção**: `npm run build` executa `tsc -b && vite build`. Output em `dist/`. Zero erros TypeScript exigidos.
3. **Testes SKE**: `cd agents/self-knowledge-engine && npm test`. 32 testes, 5 suites. Deve passar 100% antes de deploy.
4. **Pipeline completo pré-PR**: `npm run build && npm run test` (conforme AGENTS.md). Verificar artefatos em `dist/`.
5. **Refresh SKE**: Quando dados do perfil mudam:
   - Rodar SKE scan: `cd agents/self-knowledge-engine && npm run dev`
   - Exportar: gera `public/skill-data.json`
   - Rebuild frontend: `npm run build`
6. **Deploy**: Copiar `dist/` para qualquer hosting estático (Vercel, Netlify, GitHub Pages). Configurar SPA fallback (todas rotas → `index.html`).

## Convenções

- **Sem CI/CD automatizado**: Build e test são manuais. Seguir checklist: build, test, verify `dist/`.
- **Dois package.json**: Root (`/package.json`) para frontend React. SKE (`agents/self-knowledge-engine/package.json`) é projeto separado com deps próprias.
- **Três tsconfigs**: Base herda para `app` e `node`. Não misturar configs — cada um tem seu escopo de includes.
- **Vite base path**: Para deploy em subpath (ex: `/resume/`), configurar `base` em `vite.config.ts`.
- **Tailwind v4 via CSS**: Tailwind é configurado via `@import` em `globals.css`, não via `tailwind.config.js` (v4 usa CSS-first).

## Pitfalls Comuns

- **`dist/` desatualizado**: Esquecer `npm run build` antes de deploy. Sempre verificar timestamp de `dist/index.html`.
- **TypeScript errors ignorados**: `vite build` compila mesmo com erros TS se `noEmit` não estiver configurado. Rodar `tsc -b` separadamente para garantir.
- **SPA routing em hosting**: Sem configuração de fallback, rotas como `/jobs` ou `/resume` retornam 404. Necessário redirecionar para `index.html`.
- **Node version mismatch**: SKE pode exigir Node versão diferente do frontend. Verificar com `node -v` e `engines` no `package.json`.
- **CDN scripts no index.html**: Scripts carregados de CDN (fonts, analytics) podem bloquear render. Usar `defer` ou `async`.
- **Env vars não disponíveis no browser**: Vite expõe apenas variáveis com prefixo `VITE_`. Variáveis sem prefixo não chegam ao bundle.
