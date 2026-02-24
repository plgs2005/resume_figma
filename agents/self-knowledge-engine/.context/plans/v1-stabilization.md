# Plano de Estabilização — SelfKnowledgeEngine v1.0

**Data:** 2026-02-24
**Autor:** AI + plgs2005
**Status:** ✅ Concluído (commit c534e9b)

---

## 1. Contexto

O SelfKnowledgeEngine foi implementado em uma sessão iterativa com ~3.300 linhas de TypeScript.
O pipeline funciona end-to-end (285 evidências, 109 projetos, 74 skills, 88% job match).
Porém, 4 bugs foram encontrados durante testes manuais, todos causados por falta de
design review antes da implementação.

## 2. Escopo v1.0 (Estabilização)

### O que ENTRA na v1.0:
- [x] Pipeline completo: collect → normalize → extract → query/match
- [x] CLI funcional com todos os comandos
- [x] Testes unitários passando (4 suites)
- [x] ADRs documentando decisões/bugs
- [x] Integração com resume_figma (App.tsx consome skill-base.json)
- [x] Commit limpo com conventional commits

### O que NÃO ENTRA na v1.0:
- GitHub API integration (depende de token)
- Multi-job matching simultâneo
- Watch mode
- Prompt export para LLMs
- UI de visualização

## 3. Decisões de Arquitetura Registradas

| # | Decisão | Motivo | ADR |
|---|---------|--------|-----|
| 1 | Recursão sem gate `isProjectRoot` | Bug: scan não descia em subdiretórios intermediários | ADR-001 |
| 2 | `updateConfig()` em vez de mutação de cópia | Bug: `getConfig()` retornava spread, overrides perdidos | ADR-002 |
| 3 | `STACK_TO_CATEGORY` canônico por tech | Bug: categoria herdada do projeto, não da tecnologia | ADR-003 |
| 4 | `--scan` substitui paths default | Design: evita scan duplicado do cwd do engine | ADR-004 |

## 4. Checklist de Estabilização

- [x] Build limpo (`npm run build`)
- [x] 4 test suites passando (`npm test`) — 23/23 testes ✅
- [x] Relatório skill-report.md com categorias corretas
- [x] Job match report funcional (88% aderência em vaga Tech Lead)
- [x] Integração resume_figma operacional (bridge/export → public/skill-data.json)
- [x] Documentação README.md atualizada
- [x] Commit: `feat(ske): v1.0 stable — pipeline, tests, integration` ✅ c534e9b

## 5. Roadmap v2.0 (Futuro)

| Prioridade | Feature | Valor |
|------------|---------|-------|
| P0 | GitHub API (repos + linguagens) | Completar perfil com dados remotos |
| P1 | Prompt export (structured context para LLMs) | Gerar prompts otimizados para cover letters |
| P1 | Multi-job matching | Comparar perfil vs N vagas |
| P2 | Watch mode | Atualizar base ao detectar novos commits |
| P2 | Dedup inteligente de projetos | Evitar ccoe × 4, mondrian × 3 |
| P3 | UI dashboard (React) | Visualizar skills, gaps, trends |
