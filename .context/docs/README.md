# Documentation Index — Resume Figma

> Gerado em 2026-03-12. Conteúdo baseado na análise real do codebase.

## Docs Disponíveis

| Documento | Descrição |
|-----------|-----------|
| [project-overview.md](./project-overview.md) | Visão geral do projeto, stack, entry points |
| [architecture.md](./architecture.md) | Arquitetura, camadas, padrões de design, pipeline |
| [data-flow.md](./data-flow.md) | Fluxo de dados, schemas, transformações, integrações |
| [development-workflow.md](./development-workflow.md) | Fluxo de desenvolvimento, scripts, CI/CD |
| [glossary.md](./glossary.md) | Glossário, termos do domínio, acrônimos |
| [testing-strategy.md](./testing-strategy.md) | Estratégia de testes, Jest (SKE), validação (React) |
| [security.md](./security.md) | Segurança, secrets, riscos, compliance |
| [tooling.md](./tooling.md) | Ferramentas, scripts, IDE setup, debug |
| [codebase-map.json](./codebase-map.json) | Mapa detalhado do codebase (gerado automaticamente) |

## Referências Rápidas

- **Entry Point**: `src/main.tsx` → `src/AppRouter.tsx`
- **Schema Central**: `src/types/resume.ts` (ResumeData)
- **Agentes**: `src/agents/` (orchestrator, job-analyzer, resume-builder, lens)
- **SKE**: `agents/self-knowledge-engine/`
- **UI Kit**: `src/components/ui/` (47 componentes Shadcn/ui)
