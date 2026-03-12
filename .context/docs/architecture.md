---
type: doc
name: architecture
description: Arquitetura do sistema, componentes e padrões de design
category: architecture
generated: 2026-03-12
status: filled
---

# Architecture Notes

## Visão Geral

Resume Figma é uma **SPA monolítica React** com um sub-projeto Node.js (Self-Knowledge Engine). A arquitetura é orientada a agentes client-side que processam dados factual do candidato e descrições de vagas para gerar currículos tailored em tempo real, sem backend server.

## Topologia

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (SPA)                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │AppRouter │→ │ Workspace    │→ │ Pages                │  │
│  │(React    │  │ Layout       │  │ (Home/Sources/       │  │
│  │ Router)  │  │ (Sidebar)    │  │  Profile/Jobs/Resume)│  │
│  └──────────┘  └──────────────┘  └──────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Agent Pipeline (client-side)            │   │
│  │  ┌──────────┐ ┌────────────┐ ┌───────────────────┐  │   │
│  │  │   Lens   │ │Job Analyzer│ │ Resume Builder     │  │   │
│  │  │(scoring) │ │(parse+match│ │(tailored generation│  │   │
│  │  └──────────┘ └────────────┘ └───────────────────┘  │   │
│  │         ↕              ↕               ↕             │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │    Orchestrator (singleton, subscribe/notify) │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕ fetch                            │
│                 public/skill-data.json                       │
└─────────────────────────────────────────────────────────────┘
                          ↑ export
┌─────────────────────────────────────────────────────────────┐
│            Self-Knowledge Engine (Node.js CLI)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Collector │→│Normalizer│→│Extractor │→│Answer Engine │  │
│  │(git,pkg, │ │(dedup,   │ │(patterns,│ │(queries,     │  │
│  │ github)  │ │ classify)│ │ levels)  │ │ job-match)   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                                                             │
│  bridge/export.ts → public/skill-data.json                  │
└─────────────────────────────────────────────────────────────┘
```

## Camadas Arquiteturais

### 1. Presentation Layer (React)
- **AppRouter** (`src/AppRouter.tsx`): React Router v7 com 6 rotas + redirect.
- **WorkspaceLayout**: Sidebar persistente + Outlet para páginas.
- **App.tsx**: Componente monolítico de renderização do currículo (669 linhas).
- **Componentes UI**: 47 componentes Shadcn/ui baseados em Radix UI primitives.
- **JobPanel**: Painel lateral com 3 modos de entrada (texto, URL, imagem/OCR).

### 2. Agent Layer (Client-Side)
- **Orchestrator** (`src/agents/orchestrator.ts`): Singleton que gerencia o pipeline completo.
- **useOrchestrator** (`src/agents/useOrchestrator.ts`): Hook React que expõe estado reativo.
- **Job Analyzer** (`src/agents/job-analyzer.ts`): Parseia vagas, detecta tecnologias via regex, calcula match.
- **Resume Builder** (`src/agents/resume-builder.ts`): Gera ResumeData tailored sem mutar o original.
- **Lens** (`src/agents/lens.ts`): Scoring e priorização de relevância (senioridade, liderança, temas de negócio).

### 3. Data Layer
- **ResumeData** (`src/types/resume.ts`): Schema tipado com 204 linhas cobrindo pessoal, skills, experiências, projetos, formação.
- **resume-default.ts**: Dados estáticos factual do candidato (306 linhas).
- **pipeline-store.ts**: Estado do fluxo Career Intelligence em 4 passos (Sources→Profile→Jobs→Resume).
- **config-store.ts**: Persistência de configurações.
- **execution-ledger/store**: Rastreamento de execuções do pipeline.

### 4. Skills System
- **SkillGraph** (`src/skills/skill-graph.ts`): Grafo de relacionamentos (424 linhas) com nodes (skill, project, experience, technology, category) e edges (usedIn, relatedTo, dependsOn, evidencedBy).
- **skill-merger.ts**: Merge de skills de múltiplas fontes.
- **skill-normalizer.ts**: Normalização de nomes de skills.

### 5. SKE Bridge
- **ske-bridge.ts** (`src/lib/ske-bridge.ts`): Carrega `skill-data.json`, faz lookup fuzzy de skills, enriquece ResumeData com scores de confiança.

## Padrões de Design Detectados

| Padrão | Confiança | Localização | Descrição |
|--------|-----------|-------------|-----------|
| Singleton + Observer | Alta | `orchestrator.ts` | Estado global com subscribe/notify para reatividade |
| Immutable Data | Alta | `resume-builder.ts` | Nunca muta original; retorna nova instância |
| Pipeline/Chain | Alta | `orchestrator.ts` | Estágios sequenciais: resolve → load → analyze → build |
| Strategy | Alta | `lens.ts` | Pesos configuráveis para scoring de relevância |
| Bridge | Alta | `ske-bridge.ts` | Conecta dados offline (SKE) ao app React |
| Hook Pattern | Alta | `useOrchestrator.ts` | Encapsula estado reativo do pipeline em hook React |
| Schema Contract | Alta | `types/resume.ts` | Contrato tipado entre agentes e componente visual |
| Grafo | Média | `skill-graph.ts` | Grafo de adjacência para queries de relacionamento |

## Pipeline de Agentes

```
Input (texto/URL/imagem)
  ↓  resolveJobInput()
Texto normalizado
  ↓  loadSKEData()
SKE carregado (skill-data.json)
  ↓  analyzeJob()
JobAnalysis { parsed, match, gaps, dimensões }
  ↓  buildTailoredResume()
ResumeData tailored { skills reordenadas, experiências marcadas, job_match }
  ↓  compareTailored() + suggestSummaryAdjustments()
PipelineResult { aderência antes/depois, sugestões }
```

## Decisões Arquiteturais

1. **Client-side only**: Todo processamento roda no browser. Sem backend server. O SKE gera JSON offline.
2. **Dados imutáveis**: O resume-builder nunca muta o defaultResumeData. Sempre retorna cópia.
3. **Schema-first**: O `ResumeData` é o contrato central. Agentes produzem, App.tsx consome.
4. **Singleton com subscribe**: Evita prop drilling. Padrão análogo ao Zustand sem dependência.
5. **Tailwind v4**: Design tokens via CSS custom properties (não config JS). Tema light/dark.
6. **Monorepo leve**: SKE é sub-projeto em `agents/` com seu próprio package.json.

## Riscos & Restrições

- Performance depende do dispositivo do usuário (SPA client-side).
- Sem SSR: impacto em SEO e tempo de carregamento inicial.
- O SKE precisa rodar offline e exportar antes do app consumir.
- Regex-based job parsing tem limitações vs NLP real.
