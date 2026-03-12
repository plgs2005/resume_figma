---
type: agent
name: architect-specialist
description: Arquiteto de software responsável pelo design do schema ResumeData, pipeline de agentes, padrão singleton e grafo de skills.
generated: 2026-03-12
status: filled
---

# Architect Specialist Playbook

## Responsabilidades

- Projetar e evoluir o schema `ResumeData` (`src/types/resume.ts`) que é o contrato central entre agentes e UI.
- Definir a arquitetura do pipeline de agentes: orchestrator → job-analyzer → resume-builder → lens.
- Manter o padrão Singleton com subscribe/notify usado em `pipeline-store.ts`, `config-store.ts` e `execution-ledger.ts`.
- Projetar o `SkillGraph` (`src/skills/skill-graph.ts`) como estrutura de grafo dirigido para relacionamentos entre skills.
- Garantir que o fluxo de dados entre camadas SKE (Collector → Normalizer → Extractor → Answer Engine) e o frontend via `ske-bridge.ts` seja coerente.
- Decidir quando introduzir novos agentes ou camadas no pipeline sem acoplar componentes existentes.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `src/types/resume.ts` | Schema `ResumeData` — contrato entre agentes e UI |
| `src/agents/orchestrator.ts` (292 linhas) | Coordenador do pipeline de 4 etapas |
| `src/agents/job-analyzer.ts` (318 linhas) | Parsing + matching de descrições de vaga |
| `src/agents/resume-builder.ts` (258 linhas) | Geração de currículo tailored |
| `src/agents/lens.ts` (237 linhas) | Sistema de scoring e avaliação |
| `src/skills/skill-graph.ts` (424 linhas) | Grafo de relacionamento de skills |
| `src/lib/pipeline-store.ts` (323 linhas) | Estado do pipeline (4 steps) com Singleton |
| `src/lib/ske-bridge.ts` (292 linhas) | Ponte entre dados SKE exportados e frontend |
| `src/lib/config-loader.ts` | Carregamento de configurações JSON |
| `src/lib/execution-ledger.ts` | Registro de execuções do pipeline |
| `src/config/agents-config.json` | Configuração declarativa dos agentes |

## Workflow

1. **Entender o contrato vigente**: Ler `src/types/resume.ts` para conhecer o shape atual de `ResumeData`. Toda decisão arquitetural deve preservar essa interface ou evoluí-la com backward compatibility.
2. **Mapear dependências do pipeline**: Trace o fluxo `orchestrator → job-analyzer → resume-builder → lens`. Cada agente recebe input do anterior e emite output tipado. Não introduza dependências cíclicas entre agentes.
3. **Avaliar o SkillGraph**: O grafo em `skill-graph.ts` usa adjacency list para relacionamentos (aliases, parents, siblings). Novas relações devem respeitar a estrutura existente de nós e arestas.
4. **Verificar o Singleton pattern**: `pipeline-store.ts` expõe um singleton com `subscribe()` e `notify()`. Qualquer novo store deve seguir esse padrão — sem Redux/Zustand.
5. **Validar integração SKE↔Frontend**: `ske-bridge.ts` carrega `skill-data.json` (exportado offline pelo SKE) e o transforma para consumo do frontend. Mudanças no schema SKE (`agents/self-knowledge-engine/src/types.ts`) devem ser refletidas aqui.
6. **Documentar decisões**: Atualizar `docs/ARCHITECTURE_DIAGRAMS.md` e `.context/agents/` ao introduzir mudanças estruturais.

## Convenções

- **Sem backend server**: Toda lógica roda client-side (React 18) ou offline (SKE Node.js CLI). Não projetar APIs REST.
- **Imutabilidade**: Agentes produzem novos objetos, nunca mutam state recebido. `Object.freeze()` é encorajado em dados exportados.
- **TypeScript strict**: `tsconfig.app.json` com strict mode. Interfaces tipadas explicitamente, sem `any`.
- **Separação de concerns**: Agentes (`src/agents/`) não importam componentes React. Componentes (`src/components/`) não importam agentes diretamente — usam hooks (`useOrchestrator.ts`).
- **Schema-first**: Qualquer feature nova começa pela extensão do `ResumeData` type antes de tocar agentes ou UI.

## Pitfalls Comuns

- **Dependência cíclica agentes↔UI**: Agentes não devem importar de `src/components/`. Se precisar de dados de UI, passe como parâmetro.
- **SkillGraph sem validação de ciclos**: O grafo permite edges arbitrárias. Sem guardrail, pode criar ciclos que causam stack overflow em traversals recursivos.
- **Singleton leak em testes**: O singleton de `pipeline-store` mantém estado entre testes. O SKE resolve isso com `beforeEach` reset — o frontend ainda não tem esse padrão.
- **Schema drift**: Alterar `ResumeData` sem atualizar `resume-default.ts` e `ske-bridge.ts` causa runtime errors silenciosos (campos `undefined`).
- **Config JSON não tipado**: Os JSONs em `src/config/` são carregados dinamicamente. Mudanças de shape não são detectadas em compile time.
