---
type: doc
name: security
description: Segurança, autenticação e compliance
category: security
generated: 2026-03-12
status: filled
---

# Security & Compliance Notes

## Modelo de Segurança

Resume Figma é uma **SPA client-side** sem backend server próprio. O modelo de segurança é simples:

- **Sem autenticação**: O app não requer login (é um portfólio pessoal).
- **Sem banco de dados**: Dados são estáticos em JSON ou gerados client-side.
- **Sem API própria**: Comunicação é apenas leitura de arquivos estáticos (`skill-data.json`).

## Gestão de Secrets

| Secret | Escopo | Armazenamento |
|--------|--------|--------------|
| `GITHUB_TOKEN` / `GH_TOKEN` | SKE (Node.js CLI) | Variável de ambiente ou CLI flag |
| `GITHUB_USERNAME` / `GH_USER` | SKE (Node.js CLI) | Variável de ambiente ou CLI flag |

**Importante**: Tokens GitHub são usados **apenas** pelo SKE offline (Node.js). Nunca são expostos no browser/build.

## Riscos Identificados

| Risco | Severidade | Mitigação |
|-------|-----------|----------|
| Token GitHub em código | Alta | Apenas via env vars ou CLI flags |
| Dados pessoais no source | Média | resume-default.ts contém dados reais do candidato (intencional) |
| CDN script injection (html2pdf) | Baixa | Script carregado de CDN Cloudflare com versão fixa |
| XSS via texto de vaga | Baixa | React escapa HTML por padrão; Markup component limita a **bold** |

## Validação de Input

- **JobPanel**: Aceita texto livre, URLs e imagens. O texto é processado por regex (não interpretado como HTML).
- **Markup component**: Renderiza apenas `**bold**` como `<strong>` — não interpreta Markdown completo.
- **job-analyzer.ts**: Usa regex patterns para extração — sem eval() ou interpretação dinâmica.

## Dependências e Supply Chain

- 47 componentes Shadcn/ui: código local copiado (não runtime dependency).
- Radix UI: pacotes npm verificados (@radix-ui/*).
- html2pdf.js: carregado via CDN (risco mitigado por versão fixa).
- Sem dependências de runtime com acesso a filesystem no browser.

## Compliance

- **GDPR/LGPD**: Dados pessoais do candidato são armazenados no source code por decisão do autor (portfólio pessoal). Não há coleta de dados de terceiros.
- **Licença**: UNLICENSED (código privado do autor).
