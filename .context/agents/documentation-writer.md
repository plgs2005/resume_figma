---
type: agent
name: documentation-writer
description: Escritor de documentação técnica para .context/, AGENTS.md, READMEs, JSDoc em agentes e CHANGELOG com Conventional Commits.
generated: 2026-03-12
status: filled
---

# Documentation Writer Playbook

## Responsabilidades

- Manter documentação em `.context/` (artefatos gerados para agentes IA) e `.context/agents/` (playbooks).
- Atualizar `AGENTS.md` com regras de desenvolvimento, testes e PR.
- Escrever e manter `README.md` do projeto raiz e `agents/self-knowledge-engine/README.md`.
- Adicionar JSDoc em funções exportadas dos agentes (`src/agents/*.ts`) e do SKE.
- Atualizar `CHANGELOG.md` seguindo Conventional Commits em cada release.
- Manter `docs/` com guias de arquitetura, design system, desenvolvimento e guidelines.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `AGENTS.md` | Instruções para agentes IA: dev, teste, PR |
| `README.md` | Overview do projeto e quickstart |
| `CHANGELOG.md` | Histórico de versões com Conventional Commits |
| `CLAUDE.md` | Project rules para agentes Claude |
| `agents/self-knowledge-engine/README.md` | Doc do sub-projeto SKE |
| `.context/agents/README.md` | Índice dos playbooks de agentes |
| `.context/agents/*.md` | 13+ playbooks especializados |
| `docs/ALIGNMENT_GUIDE.md` | Guia de alinhamento de design |
| `docs/ARCHITECTURE_DIAGRAMS.md` | Diagramas de arquitetura |
| `docs/guidelines/DESIGN_SYSTEM.md` | Design system: tokens, cores, tipografia |
| `docs/guidelines/DEVELOPMENT.md` | Guia de desenvolvimento |
| `docs/guidelines/Guidelines.md` | Guidelines gerais do projeto |
| `docs/COMMANDS.md` | Referência de comandos disponíveis |
| `docs/SETUP_LOCAL.md` | Setup local do ambiente |
| `Attributions.md` | Licenças de terceiros |

## Workflow

1. **Identificar escopo da documentação**:
   - **Código**: JSDoc em `src/agents/`, TSDoc em types, comentários inline em lógica complexa.
   - **Projeto**: AGENTS.md, README.md, CHANGELOG.md — visíveis no root.
   - **Agentes IA**: `.context/agents/` playbooks, `.context/docs/README.md` índice.
   - **Guias**: `docs/` para arquitetura, design system, workflow.
2. **JSDoc pattern para agentes**:
   ```typescript
   /**
    * Analisa descrição de vaga e extrai requisitos.
    * @param jobDescription - Texto bruto da descrição da vaga
    * @param skillGraph - Grafo de skills para matching
    * @returns Objeto com requisitos extraídos e scores de match
    */
   ```
3. **CHANGELOG entry**: Seguir Conventional Commits:
   ```
   ## [1.2.0] - 2026-03-12
   ### Added
   - feat(agents): add lens scoring system
   ### Fixed
   - fix(ske-bridge): handle missing skill aliases
   ```
4. **Atualizar .context/ após mudanças estruturais**: Novos agentes, rotas ou stores devem ser documentados em playbooks e no README.md de `.context/agents/`.
5. **Cross-references**: Manter links entre docs. Ex: playbooks referenciam `AGENTS.md`, `AGENTS.md` referencia `docs/`.
6. **Validar links**: Verificar que links relativos entre markdown files resolvem corretamente.

## Convenções

- **Português BR**: Toda documentação voltada para o projeto é em PT-BR. Code comments e JSDoc podem ser em inglês.
- **Markdown com YAML frontmatter**: Playbooks em `.context/agents/` usam frontmatter com `type`, `name`, `description`, `generated`, `status`.
- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`. Scope entre parênteses: `feat(ske):`.
- **Sem duplicação**: Se informação existe em `AGENTS.md`, referenciar ao invés de copiar em outros docs.
- **Tabelas para mapeamento de arquivos**: Cada playbook usa tabela `| Arquivo | Função |` com caminhos relativos ao root.

## Pitfalls Comuns

- **CHANGELOG desatualizado**: Feature sem entry no CHANGELOG é feature invisível para colaboradores. Atualizar no mesmo PR.
- **JSDoc dessincrônica**: Mudar assinatura de função sem atualizar JSDoc. Verificar `@param` e `@returns` após refactoring.
- **Links quebrados em .context/**: Renomear arquivo sem atualizar referências em outros markdowns. Usar `grep -r "nome_antigo" .context/` para encontrar.
- **Frontmatter inválido**: YAML frontmatter precisa de `---` exato no início. Espaço antes do `---` invalida o parsing.
- **README.md genérico**: README deve refletir o estado atual do projeto (stack, scripts, arquitetura), não um template genérico.
- **Docs duplicados**: Informação existente em `AGENTS.md` sendo reescrita em `docs/DEVELOPMENT.md`. Consolidar ou cross-referenciar.
