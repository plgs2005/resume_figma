---
type: doc
name: data-flow
description: Fluxo de dados, transformações e integrações
category: architecture
generated: 2026-03-12
status: filled
---

# Data Flow & Integrations

## Schema Central: ResumeData

O contrato `ResumeData` (definido em `src/types/resume.ts`) é o coração do sistema. Todas as transformações produzem ou consomem este schema:

```typescript
interface ResumeData {
  schema_version: string;
  pessoal: PersonalInfo;
  resumo: ProfessionalSummary;
  skill_groups: SkillGroup[];
  experiencias: Experience[];
  projetos: Project[];
  consultorias: ConsultingProject[];
  formacao: Education[];
  especializacoes: Specialization[];
  job_match?: JobMatch;
  metadata?: ResumeMetadata;
}
```

## Fluxos de Dados

### Fluxo 1: Renderização Padrão (sem vaga)

```
resume-default.ts (dados estáticos)
  → App.tsx (renderização direta)
  → HTML/CSS otimizado para A4/ATS
```

### Fluxo 2: Pipeline de Tailoring (com vaga)

```
Entrada do usuário (texto/URL/imagem)
  → job-input-resolver.ts (normalização)
  → orchestrator.ts (coordenação)
    ├→ ske-bridge.ts ← fetch('/skill-data.json')
    ├→ job-analyzer.ts (parse requisitos + match)
    │   ├→ lens.ts (dimensões contextuais)
    │   └→ TECH_PATTERNS (50+ regex patterns)
    └→ resume-builder.ts (geração tailored)
        ├→ reorderSkillGroups()
        ├→ markExperienceRelevance()
        ├→ enrichResumeWithSKE()
        └→ suggestSummaryAdjustments()
  → PipelineResult → App.tsx (re-render)
```

### Fluxo 3: Career Intelligence Pipeline (4 passos)

```
Passo 1: Sources   → coleta evidências (skills, experiências, projetos)
Passo 2: Profile   → analisa evidências → ResumeData enriquecido com confiança
Passo 3: Jobs      → analisa descrição de vaga → JobAnalysis
Passo 4: Resume    → combina Profile + JobAnalysis → ResumeData tailored
```

Gerenciado por `pipeline-store.ts` com estado persistido via `config-store.ts`.

### Fluxo 4: SKE Offline Pipeline

```
Filesystem scan (git, package.json, README, docker-compose, etc.)
  → collector.ts (coleta evidências brutas)
  → normalizer.ts (dedup, classificação)
  → extractor.ts (skills, padrões, níveis)
  → answer-engine.ts (queries, job-match)
  → bridge/export.ts → public/skill-data.json
```

## Modelos de Dados

### SKEData (do skill-data.json)
```typescript
interface SKEData {
  resumo: { total_skills, total_projetos, total_evidencias, padroes_engenharia };
  por_nivel: { dominio_solido[], experiencia_avancada[], experiencia_pratica[], conhecimento_basico[] };
  categorias: Record<string, string[]>;
  destaques: Array<{ skill, nivel, projetos, profundidade }>;
  padroes: string[];
}
```

### JobAnalysis (saída do job-analyzer)
```typescript
interface JobAnalysis {
  parsed: ParsedJob;           // título, empresa, requisitos
  match: JobMatch;             // aderência, evidências
  skills_encontradas: string[];
  gaps: string[];
  sugestoes: string[];
  dimensions: LensDimension;   // senioridade, liderança, temas
}
```

### PipelineState (estado do workspace)
```typescript
interface PipelineState {
  sources: PipelineSource[];
  profile: SimpleProfile | null;
  jobAnalysis: JobAnalysis | null;
  tailoredResume: ResumeData | null;
  completedStep: 0 | 1 | 2 | 3 | 4;
}
```

## State Management

O sistema usa **singletons com subscribe/notify** (sem Redux/Zustand):

- `orchestrator.ts`: Estado do pipeline de agentes.
- `pipeline-store.ts`: Estado do fluxo Career Intelligence.
- `config-store.ts`: Persistência de configurações.
- `execution-store.ts` / `execution-ledger.ts`: Rastreamento de execuções.

Padrão:
```typescript
let _state = { ... };
let _listeners: Array<(state) => void> = [];
function notify() { for (const l of _listeners) l({..._state}); }
export function subscribe(fn) { _listeners.push(fn); return () => { ... }; }
```

## Integrações Externas

| Integração | Mecanismo | Dados |
|-----------|-----------|-------|
| SKE → React | `fetch('/skill-data.json')` | Skill database JSON |
| GitHub API | Token-based REST (SKE) | Repos, linguagens, topics |
| html2pdf.js | CDN script load | Exportação PDF |
| Figma MCP | Design integration | Componentes visuais |

## Transformações Chave

| Transformação | Entrada | Saída | Arquivo |
|--------------|---------|-------|---------|
| Parse de vaga | texto bruto | ParsedJob | job-analyzer.ts |
| Match com SKE | ParsedJob + SKEData | JobAnalysis | job-analyzer.ts |
| Tailoring | ResumeData + JobAnalysis | ResumeData tailored | resume-builder.ts |
| Scoring | texto + dimensões | score 0-100 | lens.ts |
| SKE Lookup | nome de skill | SKEMatch | ske-bridge.ts |
| Grafo build | evidências + skills | SkillGraph | skill-graph.ts |
