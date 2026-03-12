---
type: agent
name: database-specialist
description: Especialista em gestão de dados JSON, state stores singleton, execution ledger e persistência via localStorage.
generated: 2026-03-12
status: filled
---

# Database Specialist Playbook

## Responsabilidades

- Gerenciar os arquivos JSON que servem como fonte de dados: `skill-data.json`, configs em `src/config/`, `resume-default.ts`.
- Manter o `pipeline-store.ts` (323 linhas) como state manager singleton com padrão subscribe/notify.
- Administrar o `execution-ledger.ts` que registra histórico de execuções do pipeline.
- Implementar persistência via `config-store.ts` usando localStorage para preferências e estado de workspace.
- Garantir integridade dos dados entre formatos (JSON estático → TypeScript typed → runtime state).
- Projetar schemas de dados que sejam serializáveis (JSON-safe) para persistência.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `public/skill-data.json` | Dados exportados do SKE — skills, experiências, metadados |
| `src/data/resume-default.ts` | Dados estáticos factuais do currículo (fallback) |
| `src/lib/pipeline-store.ts` (323 linhas) | State singleton: 4-step pipeline state com subscribe/notify |
| `src/lib/execution-ledger.ts` | Registro histórico de execuções do pipeline |
| `src/lib/execution-store.ts` | Store de execução corrente |
| `src/lib/config-loader.ts` | Carrega e valida config JSONs |
| `src/config/config-store.ts` | Persistência localStorage para configurações de workspace |
| `src/config/agents-config.json` | Configuração declarativa dos agentes |
| `src/config/workspace-config.json` | Configuração do workspace (rotas, layout) |
| `src/config/home-config.json` | Configuração da página Home |
| `src/config/jobs-config.json` | Configuração da página Jobs |
| `src/config/resume-config.json` | Configuração da página Resume |
| `src/config/sources-config.json` | Configuração de fontes de dados |
| `src/config/profile-config.json` | Configuração do perfil do usuário |
| `src/types/resume.ts` | Schema `ResumeData` — contrato de dados |

## Workflow

1. **Mapear todas as fontes de dados**: O projeto não tem banco de dados. Dados vêm de: (a) `skill-data.json` (SKE export), (b) `resume-default.ts` (estático), (c) config JSONs, (d) localStorage via `config-store.ts`.
2. **Entender o pipeline-store**: É um singleton — única instância global. Métodos: `getState()`, `setState()`, `subscribe(listener)`, `notify()`. Não usar `new` — importar a instância exportada.
3. **Verificar serialização**: Tudo que vai para localStorage deve ser `JSON.stringify`-safe. Sem funções, Dates como ISO strings, sem referências circulares.
4. **Validar config JSONs**: Mudanças em JSONs de config não são type-checked em compile time. Usar `config-loader.ts` para validação runtime. Testar manualmente após alterações.
5. **Sincronizar skill-data.json**: Quando SKE é re-executado, `skill-data.json` é regenerado. Verificar que `ske-bridge.ts` consome o novo formato. Comparar diff do JSON antes/depois.
6. **Limpar localStorage em dev**: Bug comum é state stale no localStorage. Em DevTools → Application → Local Storage → limpar quando testar mudanças de schema.

## Convenções

- **JSON como source of truth**: Configs são declarativas (JSON), não imperativas. Lógica de carregamento fica em `config-loader.ts`.
- **Singleton pattern**: Stores são singletons com subscribe/notify. Sem Redux, sem Zustand, sem Context API para state global.
- **Imutabilidade**: `setState` recebe um novo objeto, não muta o anterior. Listeners recebem cópia do estado.
- **Fallback graceful**: Se `skill-data.json` falha ao carregar, `resume-default.ts` é usado como fallback. Nunca crashar por dados ausentes.
- **Versionamento de schema**: Ao mudar a shape de um config JSON, manter backward compatibility ou migrar dados existentes em localStorage.

## Pitfalls Comuns

- **localStorage quota**: Browsers limitam localStorage (~5-10MB). Se o execution-ledger crescer demais, pode atingir quota. Implementar rotação.
- **Config JSON não validado**: Mudar shape de um JSON sem atualizar `config-loader.ts` causa falha silenciosa — campos retornam `undefined`.
- **Subscriber leak**: `subscribe()` retorna `unsubscribe`. Se um componente React não chamar `unsubscribe` no cleanup, causa memory leak e updates fantasma.
- **skill-data.json stale**: Desenvolvedores esquecem de re-exportar após mudanças no SKE. O frontend mostra dados antigos sem erro.
- **Serialização de Map/Set**: Se algum store usar `Map` ou `Set` internamente, `JSON.stringify` converte para `{}` ou `[]` vazio. Converter para Object/Array antes de persistir.
- **Race condition no notify**: Se dois `setState` acontecem em sequência rápida, listeners podem receber estado intermediário inconsistente.
