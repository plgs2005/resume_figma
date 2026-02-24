# SelfKnowledgeEngine — Roadmap v2.0

**Criado:** 2026-02-24
**Baseline:** v1.0 (74 skills, 109 projetos, 285 evidências, 23 testes ✅)

---

## Prioridades

### P0 — GitHub API Integration
**Valor:** Completar perfil com dados remotos (linguagens, stars, topics)
**Esforço:** Médio
**Dependências:** Token GitHub configurado
**Notas:** Código já existe em `collector.ts`, falta testar e validar.

### P1 — Prompt Export para LLMs
**Valor:** Gerar contextos estruturados para cover letters, entrevistas, e respostas
**Esforço:** Baixo
**Ideia:** `ske prompt --vaga vaga.txt --formato "cover-letter"` gera um prompt
otimizado com os dados factuais para alimentar ChatGPT/Claude/etc.
**Output:** Markdown com instrução + dados factuais + constraints de formato.

### P1 — Multi-Job Matching
**Valor:** Comparar perfil contra N vagas para encontrar melhor fit
**Esforço:** Baixo
**Ideia:** `ske match-multi vagas/` lê todos os .txt de um diretório e gera ranking.

### P2 — Dedup Inteligente de Projetos
**Valor:** Evitar ccoe ×4, mondrian ×3 (projetos escaneados em múltiplos paths)
**Esforço:** Médio
**Abordagem:** Hash do package.json/composer.json + git remote para detectar clones.

### P2 — Watch Mode
**Valor:** Atualizar base automaticamente ao detectar novos commits/projetos
**Esforço:** Alto
**Abordagem:** `chokidar` ou `fs.watch` em `scan_paths`, re-scan incremental.

### P3 — Dashboard React
**Valor:** Visualizar skills, gaps, trends em UI interativa
**Esforço:** Alto
**Nota:** Já temos os dados em JSON — é "apenas" UI.

---

## Métricas de Sucesso v2.0

| Métrica | v1.0 (atual) | v2.0 (meta) |
|---------|-------------|-------------|
| Skills detectadas | 74 | 120+ (com GitHub API) |
| Projetos escaneados | 109 | 109 (sem duplicatas) |
| Fontes de evidência | 5 tipos | 7 tipos (+GitHub +prompt) |
| Aderência em vagas | 88% | Baseline mantido |
| Testes | 23 | 40+ |
| Cobertura | ~60%* | 80%+ |
