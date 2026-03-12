---
type: agent
name: backend-specialist
description: Especialista no Self-Knowledge Engine (SKE), CLI Node.js com 4 camadas de processamento, testes Jest e exportação de dados.
generated: 2026-03-12
status: filled
---

# Backend Specialist Playbook

## Responsabilidades

- Desenvolver e manter o SKE (Self-Knowledge Engine) em `agents/self-knowledge-engine/`.
- Implementar as 4 camadas do pipeline: Collector → Normalizer → Extractor → Answer Engine.
- Manter a ponte de exportação `bridge/export.ts` que gera `skill-data.json` para o frontend.
- Escrever e manter os 32+ testes Jest em 5 suites (`__tests__/`).
- Integrar com GitHub API para coleta de dados de commits e repos.
- Garantir que o CLI (`src/cli.ts`) funcione offline sem dependências de rede em runtime.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `agents/self-knowledge-engine/src/collector.ts` | Camada 1: coleta dados brutos de fontes (GitHub, local) |
| `agents/self-knowledge-engine/src/normalizer.ts` | Camada 2: padroniza e limpa dados coletados |
| `agents/self-knowledge-engine/src/extractor.ts` | Camada 3: extrai skills, experiências e metadados |
| `agents/self-knowledge-engine/src/answer-engine.ts` | Camada 4: responde queries sobre o perfil profissional |
| `agents/self-knowledge-engine/src/engine.ts` | Orquestrador das 4 camadas |
| `agents/self-knowledge-engine/src/identity-resolver.ts` | Resolve identidade do autor (múltiplos e-mails/nomes) |
| `agents/self-knowledge-engine/src/commit-analyzer.ts` | Analisa commits para extrair skills e padrões |
| `agents/self-knowledge-engine/src/project-discovery.ts` | Descobre projetos e stack tecnológica |
| `agents/self-knowledge-engine/src/prompt-export.ts` | Exporta dados formatados para prompts de IA |
| `agents/self-knowledge-engine/bridge/export.ts` | Ponto de exportação: SKE → `skill-data.json` |
| `agents/self-knowledge-engine/src/types.ts` | Types compartilhados do SKE |
| `agents/self-knowledge-engine/src/utils.ts` | Utilitários (hashing, date parsing, etc.) |
| `agents/self-knowledge-engine/jest.config.cjs` | Configuração Jest (CommonJS) |

## Workflow

1. **Entender o pipeline SKE**: O fluxo é linear — `Collector` busca dados brutos → `Normalizer` padroniza → `Extractor` identifica skills/experiências → `Answer Engine` responde queries. Cada camada é stateless e testável isoladamente.
2. **Rodar testes antes de qualquer mudança**: `cd agents/self-knowledge-engine && npm test`. São 32 testes em 5 suites. Todos devem passar.
3. **Alterar uma camada por vez**: Mudanças no `Normalizer` podem afetar `Extractor` e `Answer Engine`. Teste a cadeia completa via `engine.ts`.
4. **Exportar para o frontend**: Após mudanças, rodar `bridge/export.ts` para regenerar `public/skill-data.json`. Validar que `src/lib/ske-bridge.ts` consome o novo formato corretamente.
5. **Testar identity resolution**: O `identity-resolver.ts` mapeia múltiplos e-mails/nomes para um autor. Adicionar aliases nos testes quando novos formatos aparecerem.
6. **Build**: `npm run build` gera bundle CommonJS em `dist/`. Verificar que artefatos em `dist/` refletem as mudanças.

## Convenções

- **Jest com CommonJS**: O SKE usa `jest.config.cjs` (não ESM). Transforms via `ts-jest`. Mocks com `jest.fn()`.
- **Sem dependências de runtime externas**: O SKE roda offline. GitHub API é usada apenas na fase de coleta, com cache em `.context/`.
- **Types separados**: Tipos do SKE vivem em `agents/self-knowledge-engine/src/types.ts`, não em `src/types/`. A ponte é `bridge/export.ts`.
- **Determinismo**: Saídas armazenadas em `.context/` para reruns determinísticos. Mesmo input = mesmo `skill-data.json`.
- **tsconfig próprio**: O SKE tem seu próprio `tsconfig.json`, separado do frontend.

## Pitfalls Comuns

- **skill-data.json desatualizado**: Após mudanças no SKE, esquecer de re-exportar via `bridge/export.ts` causa dados stale no frontend.
- **Jest config CommonJS vs ESM**: O SKE usa `jest.config.cjs`. Mudar para `.ts` ou `.mjs` quebra a configuração atual do ts-jest.
- **Identity resolver com e-mails novos**: Commits com e-mail não mapeado são atribuídos a "unknown". Sempre adicionar novos aliases.
- **GitHub token expiration**: Se o token do GitHub expirar, o Collector falha silenciosamente. Verificar `GITHUB_TOKEN` env var.
- **Types drift SKE↔Frontend**: Mudar types no SKE sem atualizar `src/lib/ske-bridge.ts` causa `undefined` em campos no frontend. Sempre validar a ponte.
