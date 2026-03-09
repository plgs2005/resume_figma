# Documento mestre de produto e arquitetura para um app de carreira orientado ao RH

## Escopo do produto orientado ao RH e ao candidato

O objetivo do app não é “analisar repositórios” por si só: é **aumentar a probabilidade de um candidato passar pelo funil real de recrutamento** (triagem → avaliação técnica → avaliação comportamental → decisão) entregando **artefatos auditáveis**: currículo ajustado, bullets por experiência, matriz de evidências, riscos de entrevista e plano de reforço. Esse foco é coerente com o fato de que, na prática, muitas candidaturas passam por **sistemas de triagem/filtragem** antes de chegar a um gestor, via Applicant Tracking Systems (ATS). citeturn3search2

Duas ideias orientam o design:

A primeira é: **o processo seletivo é gestão de risco sob incerteza**, então o app precisa produzir *sinais* que reduzam incerteza para recrutadores e hiring managers (resultados, contexto, complexidade, maturidade, comunicação) sem inflar experiência.

A segunda é: **métodos de seleção mais preditivos são os que se aproximam do trabalho real e usam avaliação estruturada**. Meta‑análises tradicionais em psicologia organizacional indicam alta validade preditiva para combinações como *GMA + work sample* e *GMA + structured interview*, e recomendam processos com critérios e pontuação definidos. citeturn0search4turn0search6  
Isso importa porque seu sistema deve “pensar como RH”: ele não deve só listar stacks; deve converter trajetória em evidência alinhada a como empresas avaliam gente.

O app deve funcionar para qualquer usuário (o “Pedro” é apenas exemplo). Logo, a arquitetura precisa ser **multi‑tenant por design**: perfil, fontes, identidades e evidências sempre referenciadas por `user_id`.

## Modelo de dados e tipos de evidência

O erro recorrente que vocês viram na v3.0 (rebaixamento indevido, inferências por extensão, análise restrita a um repo) é um sintoma de um problema de modelo: o sistema estava tentando inferir skills a partir de **uma única modalidade de evidência** (diff/commit do repo atual). O v4.0 precisa tratar a carreira como um **grafo de evidências**.

### Entidade central

O app precisa de um **Dataset Central** (memória persistente) que não armazena “skills soltas”; ele armazena:

- **Projetos** (locais e remotos, com ou sem git)
- **Fontes** (filesystem, entity["company","GitHub","code hosting platform"], entity["company","GitLab","devops platform"], outros)
- **Identidades do usuário** (nomes/e-mails/handles e regras de unificação)
- **Evidências** (artefatos observáveis) + **assertivas** (claims) fornecidas pelo usuário, quando não há logs/código
- **Competências** derivadas (skills, senioridade, confiança) com justificativa rastreável

### Tipos de evidência

Para alinhar com o que RH considera “sinal forte”, você precisa separar evidência em camadas (isso evita o “stack presente ≠ habilidade real”):

**Evidência de autoria (forte)**  
Commit/PR/patch autoral; arquivo criado/modificado por autoria verificada; reviews realizados; incidentes registrados; mudanças em pipeline/infra.  

**Evidência estrutural (média)**  
Assinaturas de framework/arquitetura no projeto; presença de pipelines; padrões de camadas; existência de componentes (ex.: Drupal core, Kubernetes manifests etc.).  

**Evidência declarativa (fraca, mas útil)**  
README, documentação genérica, descrições de tecnologia, dependências (composer/package).  

**Evidência contextual (muito valiosa, se bem coletada)**  
Narrativas estruturadas de incidentes, migrações e decisões arquiteturais (ex.: migração de gateway, mudanças de cloud), registradas com método (STAR/incident report) e vinculadas a um projeto/época.

A governança do app deve exigir que qualquer bullet de currículo gerado tenha **link para ao menos uma evidência forte ou contextual**. Se tiver só evidência declarativa, o sistema marca como “precisa confirmação”.

### Conformidade e privacidade por design

Como esse app processa dados pessoais e potencialmente sensíveis (currículos, histórico, identificadores, mensagens), ele deve ter controles claros de consentimento, minimização e retenção, pois isso cai no escopo da LGPD. citeturn0search3  
Além disso, ele precisa de papéis e responsabilidades (controlador/operador/encarregado) quando houver uso em equipes ou empresas, conforme orientações da entity["organization","Autoridade Nacional de Proteção de Dados","brazil data protection authority"] sobre agentes de tratamento. citeturn1search5

## Agentes e contratos de entrada e saída

A chave para não “errar de novo” é tratar cada agente como **função simples e testável**, mas orquestrada em pipeline global. O orchestrator não “adivinha” — ele chama agentes com contratos claros.

Abaixo está um conjunto mínimo de agentes (v4.0) com contratos.

### Project Discovery Layer

**Missão:** descobrir TODOS os projetos relevantes do usuário, inclusive sem git.  
**Entradas:** `scan_roots[]`, regras de exclusão (node_modules, caches, backups), limites de profundidade.  
**Saídas:** `projects.index.json` contendo diretórios candidatos, indicadores encontrados (composer.json, docker-compose, web/core, terraform etc.), flags `has_git`, `confidence_project_is_real`.

Teste de aceitação: os projetos da árvore local (ex.: `claro/`, `mondrian/`, `qr_code/`, `kangu_api/`) aparecem no índice mesmo que não tenham `.git`.

### Stack Fingerprinting Layer

**Missão:** detectar frameworks/stacks por **assinatura estrutural**, não por extensão.  
**Entradas:** projeto do índice + arquivos indicadores.  
**Saídas:** `projects.fingerprint.json` com (`framework`, `runtime`, `build_tools`, `db`, `cloud`, `api_gateway`) e evidências (paths/assinaturas).

Exemplos de assinatura: Drupal (presença de `web/core` e classes `Drupal`), Laravel (presença de `artisan` + `config/app.php`), Next.js (`next.config.js`), etc.  
O objetivo aqui é evitar o erro “Laravel era esperado” quando a realidade era Drupal.

### Infrastructure & Architecture Detector

**Missão:** inferir exposição real a infraestrutura, CI/CD e arquitetura de operações.  
**Entradas:** `docker-compose`, Dockerfiles, manifests k8s/helm, workflows CI, terraform, scripts de deploy; além de logs de incidentes, quando existirem.  
**Saídas:** `projects.infra.json` com lista de capacidades (containerização, pipeline, IaC, observabilidade), e “sinais de escala” (multiserviços, filas, cache, etc.).

Esse agente é onde você captura valor de RH: “operou produção”, “fez troubleshooting”, “migrou ambientes”, “garantiu disponibilidade” — tudo isso é altamente relevante para senioridade e para vagas de liderança.

### Identity Resolution Engine

**Missão:** unir identidades do usuário (nomes/handles/e-mails) na coleta de commits, PRs, issues e histórico.  
**Entradas:** git config, conj. inicial de emails, handles, padrões de noreply do entity["company","GitHub","code hosting platform"], lista manual do usuário.  
**Saídas:** `identity.map.json` com regras de matching e confiança.

Sem isso, o app sempre vai “subestimar” autoria quando existem múltiplos e-mails (algo típico em trajetórias corporativas).

### Commit Evidence Analyzer

**Missão:** transformar histórico de versionamento em evidências fortes.  
**Entradas:** projeto com git + `identity.map.json`.  
**Saídas:** `evidence.commits.json` (por commit: arquivos tocados, diff stats, profundidade, peso arquitetural, tags de domínio).

Aqui entra o que vocês já construíram, mas agora ele roda **sobre o universo de projetos**, não só o repo atual.

### Context Correlation Graph

**Missão:** correlacionar evidências de fontes diferentes em uma narrativa auditável por projeto e por período.  
**Entradas:** outputs anteriores + claims do usuário.  
**Saídas:** `profile.graph.json` (nós e arestas: projeto↔stack↔infra↔evidência↔competência↔resultado).

### Skill Graph Builder

**Missão:** gerar competências “de verdade”: skill = capacidade demonstrada + contexto + recorrência + impacto.  
**Entradas:** `profile.graph.json`.  
**Saídas:** `skills.index.json` com nível e confiança calculados; links para evidências.

### Confidence & Seniority Engine

**Missão:** calcular confiança e senioridade com transparência.  
A recomendação é usar um modelo simples, explicável e calibrável (para não virar “IA que inventa”). Isso também torna o processo mais defensável.

## Orquestração e fluxos operacionais

O seu desenho do orchestrator está correto: ele precisa operar em modo **consulta → lacuna → expansão → persistência**.

### Estados do orchestrator

- **Read mode:** responder usando apenas o dataset (rápido).  
- **Verify mode:** se confiança baixa ou falta evidência forte, rodar agentes específicos (lento, mas melhora a memória).  
- **Expand mode:** se não encontra uma informação, ele “reflete” e decide novas fontes/paths a escanear.  
- **Publish mode:** atualiza dataset e gera artefatos finais (currículo, bullets, scorecards).

### Gatihos

- **Onboarding (primeira execução):** varredura completa local + sync remoto.  
- **Incremental update:** varrer apenas projetos alterados desde o último run + novos repos remotos.  
- **Job match:** quando usuário colar uma vaga, rodar match + gerar CV e bullets.  
- **Audit mode:** rodar auditoria do dataset para detectar inflação/rebaixamento indevido.

### Fluxo orientado ao seu mindmap de RH

O mindmap que você construiu (“Triagem de Currículo”, “Avaliação Técnica”, “Avaliação Comportamental”, “Processo Administrativo e Legal”, “Mapeamento de Perfil”, “Decisão Final”) é um excelente “modelo de produto”. O app deve produzir outputs diretamente mapeáveis a essas etapas.

Um exemplo de mapeamento:

- **Triagem (ATS/RH):** CV otimizado por palavras‑chave, títulos claros, bullets com impacto e contexto; isso é consistente com a realidade de que CVs passam por ATS antes do gestor. citeturn3search2  
- **Técnico (hiring manager):** matriz de evidência (commits/arquitetura/infra), exemplos de decisões e trade-offs; isso imita “work sample” e discussão estruturada, recomendados por pesquisas de seleção com alta validade preditiva. citeturn0search4turn0search6  
- **Comportamental (STAR):** incident database e exemplos de conflitos/resolução; isso abastece entrevistas estruturadas, reduzindo viés e aumentando confiabilidade. citeturn0search6  
- **Legal/administrativo:** consentimento e minimização; não coletar dados indevidos; atenção a restrições como a vedação de práticas discriminatórias (Lei 9.029). citeturn2search7  
- **Checagens sensíveis:** se futuramente houver “background check” (por empresas), há entendimento do entity["organization","Tribunal Superior do Trabalho","brazil labor court"] limitando/condicionando exigência de antecedentes criminais para evitar discriminação e exigir justificativa. citeturn0search0

## Motor de matching e geração de currículo

Essa é a camada que “transforma 100 stacks em 10 bullets”.

### Entrada

- Descrição de vaga
- Dataset do usuário

### Processamento

1. **Extrair requisitos da vaga** (hard skills, contexto, senioridade, metodologia, palavras‑chave).  
2. **Selecionar evidências relevantes** por projeto/época (não por “lista de tecnologias”).  
3. **Gerar bullets** com regras:
   - cada bullet precisa linkar para evidência;
   - evidência fraca → bullet marcado como “precisa validação”;
   - evitar buzzwords sem lastro.
4. **Gerar “scorecard de entrevista”**:
   - pontos fortes e fracos,
   - riscos técnicos,
   - perguntas prováveis (design/operacional/comportamental).

### Saídas essenciais ao RH

- **Currículo “versão vaga”** (1–2 páginas)
- **Bullets por seção** (arquitetura, projetos, experiência recente)
- **Checklist de palavras‑chave ATS** (sem stuffing)
- **Riscos e gaps** (o que não evidenciar; o que estudar; o que responder com honestidade)

Essa engenharia de outputs é uma resposta pragmática ao funil que você mapeou.

## Governança, privacidade e conformidade

Como o app coleta dados pessoais, ele precisa operar com “privacy by design”. A LGPD exige base legal e boas práticas de tratamento de dados pessoais, e a entity["organization","Autoridade Nacional de Proteção de Dados","brazil data protection authority"] publica guias sobre papéis (controlador/operador/encarregado) que viram checklist de arquitetura quando o sistema escala para além de uso individual. citeturn0search3turn1search5

Checklist mínimo de governança:

- Consentimento explícito para conectar fontes (GitHub/GitLab/e-mails/chat). citeturn0search3  
- Configuração de exclusões (ex.: `node_modules`, backups, dumps) para reduzir risco e ruído.  
- Política de retenção: o que fica e por quanto tempo. citeturn0search3  
- “Explainability” do score: qualquer confiança/senioridade deve mostrar fórmula e evidências.  
- Auditoria anti‑viés: tecnologias automatizadas usadas em seleção podem introduzir discriminação; há orientações públicas nos EUA alertando riscos de ferramentas algorítmicas em hiring, especialmente para pessoas com deficiência, o que reforça a necessidade de transparência e avaliação. citeturn3search1  
- Conformidade trabalhista: se o app orientar decisões contratuais, lembrar que a CLT define empregado como pessoa física que presta serviços não eventuais sob dependência e salário (art. 3º), o que é relevante para evitar orientação equivocada “CLT vs PJ”. citeturn2search0

## Plano de implementação e critérios de aceitação

O caminho seguro é construir v4.0 em fases, com “checkpoints” de qualidade antes de avançar.

### Fase de fundação

Entregar Dataset Central + Project Discovery + Identity Resolution.

Critérios de aceitação:
- Indexa projetos com e sem git.
- Unifica identidades com confiança configurável.
- Não “rebaixa” por falta de dados; marca como “insuficiente”.

### Fase de fingerprint e infra

Entregar Stack Fingerprinting + Infra & Architecture Detector.

Critérios:
- Identifica Drupal corretamente quando houver assinatura estrutural.
- Identifica CI/CD e Docker por nome/path (workflows, Dockerfile), não por extensão genérica.
- Não confunde `.yml` com “skill YAML”; classifica por contexto (workflows vs config).

### Fase de evidência forte e grafo

Entregar Commit Evidence Analyzer rodando em múltiplos projetos + Context Correlation Graph.

Critérios:
- Não depende de “repo atual”.
- Usa Source Registry (paths locais + repos remotos espelhados).
- Gera grafo auditável (por projeto e por período).

### Fase de matching e currículo

Entregar Skill Graph Builder + Confidence & Seniority Engine + Job Match.

Critérios:
- Bullet sem evidência forte/contextual não entra por padrão.
- Saída pronta para RH (triagem + entrevista técnica + comportamental).

### Prompt mestre para o entity["company","GitHub Copilot","ai pair programmer"]

Abaixo está um “único documento operacional” (para você colar no Copilot) que força a implementação por fases e impede que ele execute tarefas no papel errado (refatorar vs executar vs auditar).  

```text
MISSÃO (v4.0): Implementar um sistema multi-agente de “Career Intelligence” orientado ao RH, que documenta o usuário (não os sistemas) e gera um dataset persistente e auditável.

IMPORTANTE: Você está atuando como DESENVOLVEDOR.
Nesta tarefa, você deve MODIFICAR o CÓDIGO, criar módulos/arquivos, testes e um pipeline. Não execute análises finais nem gere currículo real até que os módulos estejam prontos.

PRINCÍPIO: Uma habilidade só pode ser promovida por evidência forte ou contextual; presença de stack/dependência é evidência fraca.

FUNDAMENTOS DO PRODUTO
- Funil RH: triagem (ATS) → técnica → comportamental → decisão
- Output do app deve ser: dataset + CV otimizado + bullets auditáveis + riscos/gaps

ARQUITETURA V4.0 (módulos/agentes)
1) ProjectDiscovery
2) StackFingerprinting
3) InfraArchitectureDetector
4) IdentityResolution
5) CommitEvidenceAnalyzer
6) ContextCorrelationGraph
7) SkillGraphBuilder
8) ConfidenceSeniorityEngine
9) JobMatcher + CV/Bullets Generator

DATASET CENTRAL (persistência)
Crie um diretório único (ex.: .context/profile/) com:
- sources.registry.json (paths + repos remotos + tokens/credenciais via env)
- projects.index.json (descoberta)
- projects.fingerprint.json (stack)
- projects.infra.json (infra/arquitetura)
- identity.map.json (alias/emails/handles)
- evidence.commits.json (evidência forte)
- profile.graph.json (correlação)
- skills.index.json (skills + níveis + evidências)
- job.matches/ (outputs por vaga)

REGRAS DE COLETA
- Projetos locais SEM git: coletar fingerprint + infra + estrutura; não inventar autoria.
- Projetos com git: coletar commits e diffs com autoria resolvida por IdentityResolution.
- Repos remotos: espelhar (mirror) para um cache local e analisar como local.

REGRAS DE FINGERPRINT (não por extensão)
- Drupal: web/core + Drupal.php + composer packages drupal/*
- Laravel: artisan + config/app.php + composer packages laravel/*
- CI/CD: .github/workflows/*, .gitlab-ci.yml, Jenkinsfile etc
- Docker: Dockerfile*, docker-compose* (nome do arquivo, não extensão)

ORQUESTRAÇÃO
Implemente um Orchestrator que:
1) consulta dataset
2) se confiança insuficiente, decide quais agentes rodar
3) atualiza dataset (sempre incremental)
4) produz outputs por vaga quando solicitado

CRITÉRIOS DE ACEITAÇÃO (testes automáticos)
- Testa projetos sem git são descobertos
- Testa Drupal é detectado com assinatura estrutural
- Testa CI/CD e Docker são classificados por path/nome
- Testa identidade unifica múltiplos emails/handles
- Testa skill não é promovida sem evidência forte/contextual vinculada
- Testa JobMatcher gera currículo com evidências linkadas

MODO DE TRABALHO
- Implementar fase por fase (foundation → fingerprint/infra → graph → matching)
- A cada fase: escrever testes + gerar README técnico de como rodar
- Após concluir as fases, gere um comando CLI: `run full-pipeline` e `run match-job`.

Ao finalizar, mostre:
- Arquivos criados/modificados
- Como rodar os testes
- Como rodar o pipeline com um scan_root configurável
- Um exemplo de output (sem dados sensíveis)
```

Essa especificação amarra a sua visão 360 (RH + técnico + comportamental + legal) com um sistema multi‑agente “formiguinha”, capaz de crescer sem colapsar e sem virar um gerador de buzzwords. citeturn0search4turn0search6turn3search2turn0search3turn1search5turn2search7turn2search0turn0search0turn3search1