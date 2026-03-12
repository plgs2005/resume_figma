---
type: doc
name: project-overview
description: Visão geral do projeto, propósito e componentes-chave
category: overview
generated: 2026-03-12
status: filled
scaffoldVersion: "2.0.0"
---

## Project Overview

**Resume Figma** é uma plataforma de currículo interativo e inteligente para profissionais de tecnologia (Tech Lead / Engenheiro de Software Sênior). Combina um currículo visual otimizado para ATS, impressão A4 e exportação PDF com um **sistema de agentes client-side** que analisa vagas e gera versões tailored do currículo automaticamente, baseado em evidências reais extraídas de repositórios e projetos do candidato via Self-Knowledge Engine (SKE).

> **Detailed Analysis**: Para contagem completa de símbolos, camadas de arquitetura e grafos de dependência, veja [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- **Root**: `/home/plgsa/resume_figma`
- **Linguagem**: TypeScript (principal), CSS, HTML
- **Framework**: React 18 + Vite 6 + Tailwind CSS v4
- **Entry Point (app)**: `src/main.tsx` → `src/AppRouter.tsx`
- **Entry Point (agente)**: `agents/self-knowledge-engine/src/cli.ts`
- **Versão**: 2.0.1
- **Autor**: Pedro Lucas Gandara Santos

## Entry Points

- [`src/main.tsx`](../../src/main.tsx) — React entry point (ReactDOM.createRoot)
- [`src/AppRouter.tsx`](../../src/AppRouter.tsx) — Roteamento principal (React Router v7)
- [`src/App.tsx`](../../src/App.tsx) — Componente principal do currículo (669 linhas)
- [`agents/self-knowledge-engine/src/cli.ts`](../../agents/self-knowledge-engine/src/cli.ts) — CLI do Self-Knowledge Engine

## Key Exports

- `ResumeData` — Schema de dados do currículo → `src/types/resume.ts`
- `useOrchestrator()` — Hook de pipeline de agentes → `src/agents/useOrchestrator.ts`
- `analyzeJob()` — Análise de vagas → `src/agents/job-analyzer.ts`
- `buildTailoredResume()` — Geração de currículo customizado → `src/agents/resume-builder.ts`
- `SkillGraph` — Grafo de relacionamentos skill↔projeto → `src/skills/skill-graph.ts`
- `loadSKEData()` — Bridge SKE→React → `src/lib/ske-bridge.ts`

## File Structure & Code Organization

- `src/` — Código-fonte React + TypeScript da aplicação web.
  - `src/agents/` — Agentes client-side (orchestrator, job-analyzer, resume-builder, lens).
  - `src/components/` — Componentes React (UI Shadcn/ui, Figma, workspace, pipeline).
  - `src/config/` — Configurações JSON e config-store para persistência.
  - `src/data/` — Dados estáticos (resume-default.ts com conteúdo factual).
  - `src/hooks/` — Custom hooks React (useWorkspaceConfig).
  - `src/lib/` — Bibliotecas internas (ske-bridge, pipeline-store, execution-ledger/store).
  - `src/pages/` — Páginas do workspace (Home, Sources, Profile, Jobs, Resume, QuickApply).
  - `src/skills/` — Sistema de skills (graph, merger, normalizer).
  - `src/sources/` — Conectores de fontes de dados e tipos.
  - `src/styles/` — CSS global com design tokens Tailwind v4.
  - `src/types/` — Contratos TypeScript (ResumeData schema).
- `agents/` — Sub-projetos de agentes AI.
  - `agents/self-knowledge-engine/` — Motor factual (4 camadas: coleta→normalização→extração→respostas).
- `docs/` — Documentação interna e guidelines.
- `public/` — Assets estáticos (skill-data.json gerado pelo SKE).
- `scripts/` — Scripts de manutenção (fix-figma-imports.sh).
- `.context/` — Artefatos de contexto AI gerados.

## Technology Stack Summary

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js ≥18, Browser (ES2022) |
| Framework | React 18.3 com Vite 6 |
| Linguagem | TypeScript 5.7 |
| Estilização | Tailwind CSS v4 + CSS custom properties |
| UI Kit | Shadcn/ui (47 componentes Radix) |
| Roteamento | React Router DOM v7 |
| Build | Vite + @vitejs/plugin-react + @tailwindcss/vite |
| Gráficos | Recharts |
| Formulários | React Hook Form |
| Testes (SKE) | Jest 29 + ts-jest |

## Core Framework Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4 com design tokens via CSS custom properties. Componentes Shadcn/ui baseados em Radix UI.
- **Agent Pipeline**: Arquitetura de agentes client-side com pipeline em estágios (resolve → load-ske → analyze → build). Singleton com subscribe/notify.
- **SKE Backend**: TypeScript puro (Node.js) com 4 camadas: Collector → Normalizer → Extractor → Answer Engine.
- **Data Bridge**: `public/skill-data.json` conecta o SKE offline ao React via fetch.

## UI & Interaction Libraries

- **Radix UI**: 25+ primitives (@radix-ui/react-*) para acessibilidade e composição.
- **Lucide React**: Ícones SVG.
- **Sonner**: Toast notifications.
- **Vaul**: Drawer/sheet.
- **cmdk**: Command palette.
- **Embla Carousel**: Carrossel de conteúdo.
- **React Resizable Panels**: Layout com painéis redimensionáveis.

## Getting Started Checklist

1. Clone: `git clone https://github.com/plgs2005/resume_figma.git`
2. Instale: `npm install`
3. Dev server: `npm run dev`
4. Acesse: `http://localhost:5173/workspace/home`
5. SKE: `cd agents/self-knowledge-engine && npm install && npm run refresh`
6. Reveja [Development Workflow](./development-workflow.md).

## Next Steps

- Portfolio interativo que demonstra capacidades técnicas do candidato.
- Pipeline de agentes permite customização automática do currículo por vaga.
- Workspace com 6 rotas: Home, Sources, Profile, Jobs, Resume, Quick Apply.
- Roadmap: conectores de fontes adicionais, integração com LLMs para cover letters.
