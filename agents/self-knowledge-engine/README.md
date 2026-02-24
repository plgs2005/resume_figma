# SelfKnowledgeEngine

Agente local responsável por construir e manter uma base factual estruturada sobre o candidato, utilizando **exclusivamente evidências reais** encontradas em projetos locais, repositórios GitHub, currículos, documentos técnicos e histórico de commits.

## Princípios Fundamentais

- ❌ **NÃO INVENTA** experiências
- ❌ **NÃO EXTRAPOLA** além das evidências
- ❌ **NÃO ASSUME** competências não comprovadas
- ✅ **TODA** afirmação tem origem rastreável

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                 SelfKnowledgeEngine                  │
├─────────┬───────────┬──────────────┬────────────────┤
│ Camada 1│  Camada 2 │   Camada 3   │    Camada 4    │
│ Evidence│  Evidence  │    Skill     │    Answer      │
│Collector│ Normalizer │  Extractor   │    Engine      │
├─────────┼───────────┼──────────────┼────────────────┤
│ Lê:     │ Remove    │ Identifica   │ Busca          │
│ - dirs  │ duplicatas│ padrões de   │ evidências     │
│ - git   │ Agrupa    │ engenharia   │ Confirma       │
│ - GitHub│ por       │ Classifica   │ existência     │
│ - configs│ projeto   │ nível de     │ Estrutura      │
│ - README│ Classifica│ skill        │ resposta       │
│ - tests │ categoria │              │ factual        │
└─────────┴───────────┴──────────────┴────────────────┘
```

## Instalação e Build

```bash
cd agents/self-knowledge-engine
npm install
npm run build
```

## Uso via CLI

```bash
# Pipeline completo: coleta → normalização → extração
npm run full-pipeline

# Etapas individuais
npm run collect
npm run normalize
npm run extract

# Consultas à base factual
node dist/cli.js query "qual minha experiência com React?"
node dist/cli.js query "quais padrões de engenharia eu uso?"

# Match com vaga
node dist/cli.js match-job vaga.txt --titulo "Senior Engineer" --empresa "XPTO"

# Status da base
node dist/cli.js status
```

## Configuração

Crie um arquivo `config.json` em `.context/self-knowledge/config.json`:

```json
{
  "scan_paths": [
    "/home/user/projetos",
    "/home/user/outro-workspace"
  ],
  "output_dir": ".context/self-knowledge",
  "github_token": "ghp_...",
  "github_username": "meu-usuario",
  "max_depth": 8,
  "ignore_patterns": [
    "node_modules", ".git", "vendor", "dist"
  ]
}
```

## Fontes de Evidência

| Fonte | O que é coletado |
|-------|-----------------|
| `package.json` | Dependências, scripts, stack Node.js/TypeScript |
| `composer.json` | Dependências PHP, Laravel/Symfony |
| `docker-compose` | Serviços, infraestrutura, orquestração |
| `Dockerfile` | Containerização, multi-stage builds |
| `.github/workflows` | CI/CD, automação, deploy |
| `migrations/` | Schema de banco, modelagem de dados |
| `*.test.*` / `*.spec.*` | Cobertura de testes, tipos de teste |
| `README.md` | Documentação, tecnologias mencionadas |
| Git history | Commits, branches, padrões de commit |
| GitHub API | Repos, linguagens, stars, topics |
| Estrutura de pastas | Padrões arquiteturais (MVC, Clean, etc.) |

## Output

Após execução, os seguintes arquivos são gerados em `.context/self-knowledge/`:

| Arquivo | Conteúdo |
|---------|----------|
| `raw-evidences.json` | Todas as evidências brutas coletadas |
| `normalized-base.json` | Base consolidada e deduplicada |
| `skill-base.json` | Skills extraídas com nível e padrões |
| `skill-report.md` | Relatório legível de skills |
| `job-match-result.json` | Resultado do match com vaga |
| `job-match-report.md` | Relatório de match com vaga |

## Classificação de Nível

| Nível | Critério |
|-------|----------|
| 🟢 Domínio sólido | Alta frequência + alta profundidade + alta complexidade |
| 🔵 Experiência avançada | Uso consistente em múltiplos projetos complexos |
| 🟡 Experiência prática | Uso real em projetos, mas sem profundidade extrema |
| ⚪ Conhecimento básico | Evidência limitada, poucos projetos |

## Padrões de Engenharia Detectados

- Separação de camadas
- Uso de interfaces/contratos
- Desacoplamento de módulos
- Estratégias de cache
- Processamento com filas
- Refatoração estrutural
- Tuning de banco de dados
- Testes automatizados
- CI/CD Pipeline
- Containerização
- APIs RESTful / GraphQL
- Event-driven architecture
- Microsserviços
- Design System
- ORM / Query Builder
- Database Migrations

## Estrutura de Arquivos

```
agents/self-knowledge-engine/
├── package.json
├── tsconfig.json
├── jest.config.cjs
├── README.md
├── bridge/
│   └── export.ts         # Exporta dados para o resume_figma
├── __tests__/
│   ├── utils.test.ts
│   ├── normalizer.test.ts
│   ├── extractor.test.ts
│   └── answer-engine.test.ts
├── .context/
│   ├── plans/            # Planos de estabilização
│   ├── decisions/        # ADRs (Architecture Decision Records)
│   └── self-knowledge/   # Output do pipeline
└── src/
    ├── index.ts          # Public API exports
    ├── types.ts          # Type definitions (contratos)
    ├── utils.ts          # Utilidades compartilhadas
    ├── collector.ts      # Camada 1: Evidence Collector
    ├── normalizer.ts     # Camada 2: Evidence Normalizer
    ├── extractor.ts      # Camada 3: Skill Extractor
    ├── answer-engine.ts  # Camada 4: Answer Engine
    ├── engine.ts         # Pipeline Orchestrator
    └── cli.ts            # CLI runner
```

## Scripts Úteis

```bash
npm run build        # Compila TypeScript
npm run scan         # Pipeline completo escaneando /home/plgsa
npm run export       # Exporta skill-data.json para public/
npm run refresh      # Build + Scan + Export (tudo em um)
npm run test         # Roda 23 testes unitários (4 suites)
npm run test:watch   # Testes em modo watch
```

## Integração com resume_figma

O bridge exporta os dados para `public/skill-data.json`, consumível pelo React app:

```typescript
// No App.tsx ou qualquer componente:
const skillData = await fetch('/skill-data.json').then(r => r.json());
// skillData.destaques → top 15 skills com nível e evidências
// skillData.categorias → skills por área (backend, frontend, devops...)
// skillData.por_nivel → skills por nível de proficiência
```

## Modo de Operação para Vagas

Quando receber uma descrição de vaga, o agente:

1. Parseia requisitos da vaga automaticamente
2. Cruza com a base factual de skills
3. Calcula aderência técnica (%)
4. Gera bullets estratégicos baseados em evidência real
5. Sinaliza gaps técnicos (obrigatórios e desejáveis)
6. Identifica riscos para entrevista
7. Sugere ajustes de keywords para ATS
