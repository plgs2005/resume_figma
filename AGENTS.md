# AGENTS.md

## Dicas para o ambiente de desenvolvimento
- Instale as dependências com `npm install` antes de executar o scaffolding.

- Use `npm run dev` para a sessão interativa do TypeScript que permite a experimentação local.

- Execute `npm run build` para atualizar o pacote CommonJS em `dist/` antes de enviar as alterações.

- Armazene os artefatos gerados em `.context/` para que as execuções subsequentes permaneçam determinísticas.

## Instruções de teste
- Execute `npm run test` para executar o conjunto de testes do Jest.

- Adicione `-- --watch` ao iterar em um teste com falha.

- Execute `npm run build && npm run test` antes de abrir um PR para simular a CI.

- Adicione ou atualize testes juntamente com quaisquer alterações no gerador ou na CLI.

## Instruções para PR
- Siga os commits convencionais (por exemplo, `feat(scaffolding): add doc links`).

- Crie links cruzados para os novos scaffolds em `docs/README.md` e `agents/README.md` para que os agentes futuros possam encontrá-los.

- Anexe exemplos de saída da CLI ou markdown gerado quando o comportamento mudar.

- Confirme se os artefatos compilados em `dist/` correspondem às novas alterações do código-fonte.

## Mapeamento do repositório
- `src/` — Código-fonte do aplicativo (React + TypeScript).

- `src/App.tsx` — Componente principal de currículo/CV. Edite para alterações de conteúdo ou layout.

- `src/main.tsx` — Ponto de entrada do React (ReactDOM.createRoot). Raramente precisa ser editado.

- `src/vite-env.d.ts` — Declarações de tipo do Vite. Edite para adicionar aumentos de tipo globais.

- `src/components/ui/` — 47 componentes Shadcn/ui. Adicione novos elementos de interface do usuário aqui.
- `src/components/figma/` — Componentes de integração com o Figma (ImageWithFallback).

- `src/styles/globals.css` — Configuração do Tailwind v4, tokens de design e estilos globais.

- `docs/` — Documentação e diretrizes internas.

- `docs/guidelines/` — Sistema de design, guia de desenvolvimento e documentação técnica.

- `docs/ALIGNMENT_GUIDE.md`, `SETUP_LOCAL.md`, etc. — Guias de configuração e arquitetura.

- `agents/` — Subprojetos de agentes de IA (por exemplo, `self-knowledge-engine/`).

- `.context/` — Artefatos de contexto de IA gerados (determinísticos e regeneráveis).

- `scripts/` — Scripts de compilação e manutenção (por exemplo, `fix-figma-imports.sh`).
- `public/` — Recursos estáticos servidos como estão pelo Vite.
- `index.html` — Ponto de entrada HTML do Vite. Edite para alterar meta tags ou scripts de CDN.
- `package.json` — Dependências e scripts npm. Edite para alterações de dependências.
- `Attributions.md` — Licenças de terceiros. Atualize ao adicionar dependências.

- `CHANGELOG.md` — Histórico de versões. Atualize a cada lançamento.

- `README.md` — Visão geral do projeto e guia de início rápido.

## Referências do AI Context
- Índice da documentação: `.context/docs/README.md`
- Playbooks de agentes: `.context/agents/README.md`
- Guia do colaborador: `CONTRIBUTING.md`