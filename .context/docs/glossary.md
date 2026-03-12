---
type: doc
name: glossary
description: Glossário de termos do domínio e conceitos-chave
category: reference
generated: 2026-03-12
status: filled
---

# Glossário & Conceitos de Domínio

## Termos do Sistema

| Termo | Definição |
|-------|----------|
| **SKE** | Self-Knowledge Engine — motor factual que escaneia repositórios e extrai skills com evidência rastreável |
| **Tailored Resume** | Versão customizada do currículo gerada automaticamente para uma vaga específica |
| **Agent Pipeline** | Sequência de agentes client-side que processam dados: resolve → load-ske → analyze → build |
| **ResumeData** | Schema TypeScript central que define a estrutura do currículo (contrato entre agentes e UI) |
| **Lens** | Sistema de scoring que extrai dimensões contextuais da vaga (senioridade, liderança, temas) |
| **Job Match** | Resultado do cruzamento entre requisitos da vaga e skills do candidato |
| **Aderência** | Percentual de compatibilidade entre o perfil e a vaga (0-100%) |
| **Career Intelligence Workspace** | Interface multi-página para gerenciar fontes, perfil, vagas e currículos |
| **SkillGraph** | Grafo de relacionamentos entre skills, projetos, experiências e tecnologias |
| **Pipeline Store** | Estado compartilhado do fluxo de 4 passos (Sources→Profile→Jobs→Resume) |
| **Execution Ledger** | Registro histórico de execuções do pipeline |

## Níveis de Skill (SKE)

| Nível | Ícone | Critério |
|-------|-------|----------|
| Domínio sólido | 🟢 | Alta frequência + alta profundidade + alta complexidade |
| Experiência avançada | 🔵 | Uso consistente em múltiplos projetos complexos |
| Experiência prática | 🟡 | Uso real em projetos, sem profundidade extrema |
| Conhecimento básico | ⚪ | Evidência limitada, poucos projetos |

## Fontes de Evidência (SKE)

| Fonte | O que é coletado |
|-------|-----------------|
| `package.json` | Dependências, scripts, stack Node.js/TypeScript |
| `composer.json` | Dependências PHP, Laravel/Symfony |
| `docker-compose` | Serviços, infraestrutura |
| `.github/workflows` | CI/CD, automação |
| Git history | Commits, branches, padrões |
| GitHub API | Repos, linguagens, topics |

## Personas

| Persona | Descrição |
|---------|-----------|
| **Candidato** | Usuário principal (Pedro Lucas). Usa o sistema para gerar currículos |
| **Recrutador** | Quem recebe o PDF/impressão. O currículo é otimizado para ATS compatibility |
| **AI Agent** | Agentes do sistema que processam dados (orchestrator, job-analyzer, etc.) |

## Acrônimos

| Sigla | Significado |
|-------|------------|
| ATS | Applicant Tracking System |
| SKE | Self-Knowledge Engine |
| HMR | Hot Module Replacement |
| SPA | Single Page Application |
| OCR | Optical Character Recognition |
| JWT | JSON Web Token |
| mTLS | Mutual Transport Layer Security |
