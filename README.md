# Curriculo Interativo - Tech Lead

> **Curriculo digital profissional e interativo para posicoes de Tech Lead e Engenheiro de Software Senior**  
> Desenvolvido com React, TypeScript e Tailwind CSS v4

[![GitHub](https://img.shields.io/badge/GitHub-plgs2005%2Fresume__figma-blue?logo=github)](https://github.com/plgs2005/resume_figma)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vite.dev/)

---

## Visao Geral

Curriculo digital interativo com foco em **experiencia profissional**, otimizado para:

- **Compatibilidade ATS** (Applicant Tracking Systems)
- **Impressao A4 perfeita** (210mm x 297mm)
- **Exportacao PDF dupla** (Visual + ATS-friendly)
- **Design responsivo** (Mobile, Tablet, Desktop)
- **Performance otimizada**

---

## Pre-requisitos

Antes de comecar, certifique-se de ter as seguintes ferramentas instaladas na sua maquina:

| Ferramenta | Versao Minima | Como verificar | Download |
|-----------|---------------|----------------|----------|
| **Node.js** | 18.0.0+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0.0+ | `npm --version` | (incluido com Node.js) |
| **Git** | 2.x | `git --version` | [git-scm.com](https://git-scm.com/) |

> **Recomendado:** Node.js 20 LTS ou superior. O projeto usa Vite 6 e Tailwind CSS v4, que requerem Node.js 18+.

### Verificacao rapida dos pre-requisitos

Execute os comandos abaixo no seu terminal. Todos devem retornar uma versao:

```bash
node --version
# Esperado: v18.x.x ou superior (ex: v20.11.0)

npm --version
# Esperado: 9.x.x ou superior (ex: 10.2.4)

git --version
# Esperado: git version 2.x.x (ex: git version 2.43.0)
```

Se algum comando falhar ou retornar versao inferior, instale/atualize antes de prosseguir.

---

## Quick Start - Passo a Passo Completo

Siga **todos os passos abaixo na ordem exata** para executar o projeto localmente.

**6 passos sequenciais (resumo):**
1. Clone do repositório
2. Fix de imports do Figma Make
3. Instalação de dependências
4. Conferência de pacotes (`npm ls`)
5. Dev server (`npm run dev`)
6. Build de produção (`npm run build`)

> **IMPORTANTE - Diferenca Figma Make vs Local:**
> O projeto foi criado no Figma Make, que possui um runtime proprio. Para rodar localmente com Vite, sao necessarios arquivos de infraestrutura (`index.html`, `main.tsx`, `vite.config.ts`, `tsconfig.json`) que NAO existem dentro do Figma Make (ele os gera internamente). Alem disso, o Figma Make usa imports com versao embutida (ex: `from "lucide-react@0.487.0"`) que precisam ser convertidos para o formato npm padrao (ex: `from "lucide-react"`). O Passo 2 abaixo cuida dessa conversao.

### Passo 1 - Clonar o repositorio

```bash
git clone https://github.com/plgs2005/resume_figma.git
cd resume_figma
```

**Verificacao:** O diretorio deve conter os arquivos do projeto:

```bash
ls -la
# Deve mostrar: src/, docs/, package.json, index.html, vite.config.ts, etc.
```

---

### Passo 2 - Corrigir imports do Figma Make (OBRIGATORIO)

O projeto foi desenvolvido no **Figma Make**, que usa uma sintaxe especial de imports com versao embutida (ex: `from "lucide-react@0.487.0"`). Essa sintaxe **nao funciona** em ambiente Node.js/Vite padrao. O script abaixo corrige todos os imports automaticamente.

**No Linux / macOS:**

```bash
chmod +x scripts/fix-figma-imports.sh
npm run fix-imports
```

**No Windows (PowerShell):**

```powershell
# Alternativa manual com PowerShell
Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $updated = $content -replace '(from\s+"[^"@]+)@[\d]+\.[\d]+[^"]*(")', '$1$2'
  if ($content -ne $updated) {
    Set-Content $_.FullName -Value $updated -NoNewline
    Write-Host "  Corrigido: $($_.FullName)"
  }
}
```

**No Windows (Git Bash):**

```bash
chmod +x scripts/fix-figma-imports.sh
npm run fix-imports
```

**O que o script faz:**

| Antes (Figma Make) | Depois (Node.js/Vite) |
|--------------------|-----------------------|
| `from "@radix-ui/react-accordion@1.2.3"` | `from "@radix-ui/react-accordion"` |
| `from "lucide-react@0.487.0"` | `from "lucide-react"` |
| `from "class-variance-authority@0.7.1"` | `from "class-variance-authority"` |
| `from "embla-carousel-react@8.6.0"` | `from "embla-carousel-react"` |
| `from "sonner@2.0.3"` | `from "sonner"` |

> **Nota:** As versoes corretas ja estao definidas no `package.json`. O npm instalara as versoes compatveis.

**Verificacao:** Confirme que nao restam imports versionados:

```bash
grep -r '@[0-9]\+\.[0-9]\+' --include="*.tsx" --include="*.ts" . | grep 'from "' | head -5
# Esperado: nenhum resultado (vazio)
```

---

### Passo 3 - Instalar dependencias

```bash
npm install
```

Este comando instala **todas as dependencias** listadas no `package.json`:

- **48 dependencias** de producao (React, Radix UI, Shadcn/ui, Lucide, etc.)
- **6 dependencias** de desenvolvimento (Vite, TypeScript, Tailwind CSS v4)

**Tempo estimado:** 30-90 segundos (depende da conexao)

**Verificacao:** O diretorio `node_modules` deve existir e o comando nao deve mostrar erros criticos:

```bash
ls node_modules/ | head -5
# Deve listar pastas de pacotes (ex: @radix-ui, react, lucide-react, etc.)

# Verificar se nao ha vulnerabilidades criticas
npm audit --production
```

---

### Passo 4 - Conferencia de pacotes instalados

Verifique se os pacotes principais foram instalados corretamente:

```bash
# Verificar pacotes essenciais do core
npm ls react react-dom typescript vite tailwindcss
```

Saida esperada (versoes podem variar levemente):

```
resume-figma@2.0.1
├── react@18.3.1
├── react-dom@18.3.1
├── tailwindcss@4.x.x
├── typescript@5.7.x
└── vite@6.x.x
```

```bash
# Verificar pacotes Shadcn/ui (Radix UI)
npm ls @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-tooltip
```

Saida esperada:

```
resume-figma@2.0.1
├── @radix-ui/react-slot@1.1.2
├── @radix-ui/react-dialog@1.1.6
└── @radix-ui/react-tooltip@1.1.8
```

```bash
# Verificar pacotes de UI e funcionalidades
npm ls lucide-react class-variance-authority clsx tailwind-merge
```

Saida esperada:

```
resume-figma@2.0.1
├── class-variance-authority@0.7.1
├── clsx@2.1.1
├── lucide-react@0.487.0
└── tailwind-merge@2.6.0
```

```bash
# Verificar TODOS os pacotes de uma vez (resumo)
npm ls --depth=0
```

> **Se algum pacote estiver faltando**, execute `npm install` novamente. Se o erro persistir, delete `node_modules` e `package-lock.json` e reinstale:
>
> ```bash
> rm -rf node_modules package-lock.json
> npm install
> ```

---

### Passo 5 - Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

**Saida esperada no terminal:**

```
  VITE v6.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

**Abra o navegador** e acesse:

```
http://localhost:5173/
```

Voce devera ver o curriculo completo renderizado com:
- Header escuro (bg-slate-900) com nome, cargo e contatos
- Secoes: Resumo Profissional, Conhecimentos Tecnicos, Experiencia, Formacao
- Dois botoes flutuantes no canto inferior direito (Exportar PDF + PDF para ATS)

> **Nota:** O Vite tem Hot Module Replacement (HMR). Qualquer alteracao no codigo sera refletida instantaneamente no navegador sem recarregar a pagina.

**Para parar o servidor:** Pressione `Ctrl+C` no terminal.

---

### Passo 6 - Build de producao (opcional)

Para gerar os arquivos otimizados para deploy:

```bash
# Build rapido (recomendado - ignora erros TS em componentes nao utilizados)
npm run build

# OU build com verificacao de tipos (requer fix-imports executado antes)
npm run build:strict
```

**Saida esperada:**

```
vite v6.x.x building for production...
✓ XX modules transformed.
dist/index.html         0.xx kB │ gzip: 0.xx kB
dist/assets/index-XXXX.css    XX.xx kB │ gzip: X.xx kB
dist/assets/index-XXXX.js    XXX.xx kB │ gzip: XX.xx kB
✓ built in Xs
```

**Preview da build de producao:**

```bash
npm run preview
```

Acesse `http://localhost:4173/` para visualizar a versao de producao.

> Os arquivos gerados ficam na pasta `dist/`. Essa pasta pode ser deployada em qualquer servidor estatico (Vercel, Netlify, GitHub Pages, etc.).

---

## Scripts Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite + HMR) na porta 5173 |
| `npm run build` | Gera build de producao em `dist/` (sem verificacao de tipos) |
| `npm run build:strict` | Verifica tipos TypeScript + gera build de producao |
| `npm run preview` | Serve a build de producao localmente na porta 4173 |
| `npm run type-check` | Verifica tipos TypeScript sem gerar build |
| `npm run fix-imports` | Corrige imports versionados do Figma Make (Passo 2) |

> **Nota sobre `build` vs `build:strict`:** O `npm run build` ignora erros de TypeScript nos 47 componentes Shadcn/ui que nao sao utilizados diretamente pelo curriculo. Use `npm run build:strict` apenas apos corrigir todos os imports com `npm run fix-imports`.

---

## Como Usar o Curriculo

### Visualizacao Web

1. Acesse `http://localhost:5173/` com o servidor rodando
2. Navegue pelo curriculo (scroll vertical)
3. Links de email e LinkedIn sao clicaveis

### Exportar PDF Visual (Alta Qualidade)

1. Clique no botao verde **"Exportar PDF"** (canto inferior direito)
2. Aguarde o download automatico
3. Arquivo gerado: `Curriculo_Pedro_Lucas_Gandara_Santos.pdf`
4. **Uso:** Envio direto a recrutadores quando a apresentacao visual importa

### Exportar PDF para ATS (Texto Selecionavel)

1. Clique no botao escuro **"PDF para ATS (Ctrl+P)"**
2. Ou pressione `Ctrl+P` (Windows/Linux) / `Cmd+P` (Mac)
3. No dialogo de impressao, selecione **"Salvar como PDF"**
4. **Uso:** Submissao em portais de emprego (Greenhouse, Lever, Workday, etc.)

---

## Estrutura do Projeto

```
resume_figma/
│
├── index.html                       # Entry point HTML (Vite)
├── package.json                     # Dependencias e scripts npm
├── vite.config.ts                   # Config Vite (React + Tailwind v4 plugins)
├── tsconfig.json                    # Config TypeScript raiz (references)
├── tsconfig.app.json                # Config TypeScript para o app
├── tsconfig.node.json               # Config TypeScript para vite.config.ts
├── .gitignore                       # Arquivos ignorados pelo Git
│
├── src/                             # Codigo-fonte da aplicacao
│   ├── main.tsx                     # Ponto de montagem React (ReactDOM.createRoot)
│   ├── App.tsx                      # Componente principal do curriculo
│   ├── vite-env.d.ts                # Tipos Vite + declaracao window.html2pdf
│   ├── styles/
│   │   └── globals.css              # Tailwind v4 config + design tokens + estilos base
│   └── components/
│       ├── figma/
│       │   └── ImageWithFallback.tsx # Componente de imagem com fallback
│       └── ui/                      # 47 componentes Shadcn/ui
│           ├── accordion.tsx
│           ├── button.tsx
│           ├── card.tsx
│           ├── dialog.tsx
│           ├── ... (43 componentes adicionais)
│           ├── utils.ts             # Utilidade cn() (clsx + tailwind-merge)
│           └── use-mobile.ts        # Hook de deteccao mobile
│
├── docs/                            # Documentacao interna
│   ├── guidelines/
│   │   ├── Guidelines.md            # Documentacao tecnica completa (1000+ linhas)
│   │   ├── DESIGN_SYSTEM.md         # Design system detalhado
│   │   └── DEVELOPMENT.md           # Guia de desenvolvimento
│   ├── ALIGNMENT_GUIDE.md           # Guia rapido de alinhamento
│   ├── SETUP_LOCAL.md               # Setup local detalhado
│   ├── MAKE_VS_LOCAL.md             # Comparacao Make vs Local
│   ├── ARCHITECTURE_DIAGRAMS.md     # Diagramas de arquitetura
│   ├── COMMANDS.md                  # Comandos praticos
│   └── PRINT_FIX_SUMMARY.md         # Documentacao do fix de impressao
│
├── scripts/
│   └── fix-figma-imports.sh         # Script para corrigir imports do Figma Make
│
├── agents/                          # Sub-projetos de agentes AI
│   └── self-knowledge-engine/       # Motor de auto-conhecimento
│
├── Attributions.md                  # Licencas de terceiros
├── CHANGELOG.md                     # Historico de alteracoes
└── README.md                        # Este arquivo
```

---

## Tech Stack

### Core

| Tecnologia | Versao | Funcao |
|-----------|--------|--------|
| **React** | 18.3.x | Framework UI principal |
| **TypeScript** | 5.7.x | Type safety |
| **Tailwind CSS** | 4.0.x | Estilizacao utility-first |
| **Vite** | 6.0.x | Bundler e dev server |

### UI e Componentes

| Biblioteca | Versao | Funcao |
|-----------|--------|--------|
| **Shadcn/ui** (Radix UI) | variadas | 47 componentes UI acessiveis |
| **Assets do Figma (CDN)** | — | Ícones carregados por URL no `App.tsx` |
| **class-variance-authority** | 0.7.x | Variantes de componentes |
| **clsx** + **tailwind-merge** | 2.1.x / 2.6.x | Merge de classes CSS |

### Funcionalidades

| Biblioteca | Versao | Funcao |
|-----------|--------|--------|
| **html2pdf.js** | 0.10.1 | Exportacao PDF visual (via CDN) |
| **Print API** | Nativo | Exportacao PDF ATS |

---

## Troubleshooting - Solucao de Problemas

### Problema: `npm install` falha com erros de dependencia

```bash
# Limpar cache e reinstalar do zero
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problema: `npm run dev` falha com erro de modulo nao encontrado

Provavelmente os imports versionados do Figma Make nao foram corrigidos. Execute:

```bash
# Verificar se ainda existem imports versionados
grep -r '@[0-9]\+\.[0-9]\+' --include="*.tsx" --include="*.ts" . | grep 'from "'

# Se encontrar resultados, execute o fix novamente
chmod +x scripts/fix-figma-imports.sh
./scripts/fix-figma-imports.sh
```

### Problema: Estilos Tailwind nao aplicados

Verifique se o `globals.css` comeca com `@import "tailwindcss";`:

```bash
head -1 src/styles/globals.css
# Esperado: @import "tailwindcss";
```

Se nao tiver, adicione manualmente:

```bash
echo '@import "tailwindcss";' | cat - src/styles/globals.css > temp && mv temp src/styles/globals.css
```

### Problema: Porta 5173 ja em uso

```bash
# Rodar em outra porta
npx vite --port 3000

# Ou matar o processo na porta 5173
# Linux/macOS:
lsof -ti:5173 | xargs kill -9
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Problema: TypeScript reporta erros de tipo

```bash
# Verificar erros sem bloquear o build
npm run type-check

# Se erros forem apenas em componentes Shadcn/ui nao utilizados,
# o Vite ignora erros de tipo no modo dev (apenas o build falha)
# Para forcar build ignorando TS:
npx vite build
```

### Problema: PDF Visual nao exporta (botao nao funciona)

A biblioteca `html2pdf.js` e carregada via CDN em runtime. Verifique:

1. Conexao com internet esta ativa
2. O CDN `cdnjs.cloudflare.com` nao esta bloqueado
3. Abra o Console do navegador (F12) para ver erros

### Problema: Node.js versao incompativel

```bash
# Verificar versao
node --version

# Se menor que 18, atualize:
# Via nvm (recomendado):
nvm install 20
nvm use 20

# Ou baixe diretamente: https://nodejs.org/
```

---

## Sugestoes para proximos passos

1. **Fazer commit de todos os arquivos novos** no GitHub:
  - `package.json`, `index.html`, `main.tsx`, `vite.config.ts`
  - `tsconfig*.json`, `vite-env.d.ts`, `.gitignore`
  - `scripts/fix-figma-imports.sh`
  - `README.md` atualizado

2. **Testar o fluxo completo localmente** apos o clone:
  - `npm run fix-imports`
  - `npm install`
  - `npm run dev`
  - `npm run build`

3. **Manter o atalho `npm run fix-imports`** no `package.json`
  - Ele ja existe e deve permanecer como padrao.

---

## Documentacao Completa

### Guias de Alinhamento Make ↔ Local

> **NOVO:** Guias especializados criados em 23/02/2026 para facilitar o setup e entendimento da diferenca entre o ambiente Figma Make e o repositorio local.

- ⭐ **[ALIGNMENT_GUIDE.md](docs/ALIGNMENT_GUIDE.md)** - **COMECE AQUI!** Resumo executivo de todos os guias
- 📘 **[SETUP_LOCAL.md](docs/SETUP_LOCAL.md)** - Guia completo de setup passo a passo
  - Como os ícones são carregados (assets do Figma)
  - Arquivos indispensáveis (Vite, TypeScript, CSS)
  - Ajustes obrigatórios (fix-imports, install)
  - CSS/Reset obrigatórios (globals.css)
  - Troubleshooting
- 📗 **[MAKE_VS_LOCAL.md](docs/MAKE_VS_LOCAL.md)** - Comparação visual Make vs Local
  - O que é idêntico vs diferente
  - Checklist de validação
- 📙 **[ARCHITECTURE_DIAGRAMS.md](docs/ARCHITECTURE_DIAGRAMS.md)** - Diagramas de arquitetura
  - Fluxo de ícones (Figma assets → DOM)
  - Fluxo de estilos (Tailwind → Browser)
  - HTML2PDF.js e Print API
- 📕 **[COMMANDS.md](docs/COMMANDS.md)** - Comandos práticos de terminal
  - Setup inicial
  - Desenvolvimento diário
  - Troubleshooting

### Documentação Técnica Original

- **[Guidelines.md](docs/guidelines/Guidelines.md)** - Documentacao tecnica completa (10k+ palavras)
  - Decisoes de arquitetura
  - Padroes de codigo (naming, estrutura, Tailwind)
  - Design system (cores, tipografia, espacamento)
  - Otimizacoes ATS e impressao A4
  - Workflow de desenvolvimento
- **[DESIGN_SYSTEM.md](docs/guidelines/DESIGN_SYSTEM.md)** - Design system detalhado
- **[DEVELOPMENT.md](docs/guidelines/DEVELOPMENT.md)** - Guia de desenvolvimento
- **[CHANGELOG.md](CHANGELOG.md)** - Historico de alteracoes
- **[Attributions.md](Attributions.md)** - Licencas de terceiros

---

## Changelog

### v2.0.1 - 20/02/2026
- Ajuste de quebras de pagina na impressao

### v2.0.0 - 20/02/2026
- Refatoracao estrutural completa
- Remocao de pasta `/resume` duplicada
- Criacao de Guidelines.md completo
- Estrutura consolidada na raiz

### v1.0.0 - Data Inicial
- Criacao do curriculo interativo
- Exportacao PDF dupla (Visual + ATS)
- Integracao com Shadcn/ui
- Otimizacoes ATS e impressao A4

---

## Como Contribuir

1. Fork o repositorio
2. Crie uma branch feature: `git checkout -b feature/nova-feature`
3. Commit suas mudancas: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Convencao de Commits

Seguimos o padrao [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     Nova funcionalidade
fix:      Correcao de bug
docs:     Documentacao
style:    Formatacao
refactor: Refatoracao
perf:     Performance
test:     Testes
chore:    Manutencao
```

---

## Features Futuras (Roadmap)

- [ ] Versao em ingles (i18n)
- [ ] Temas customizaveis
- [ ] Secao de certificacoes
- [ ] Modo escuro funcional
- [ ] Testes automatizados
- [ ] CI/CD com GitHub Actions
- [ ] Deploy automatico (Vercel/Netlify)

---

## Licencas

### Codigo do Projeto
Propriedade de Pedro Lucas Gandara Santos

### Bibliotecas de Terceiros
- **Shadcn/ui** - [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- **Lucide React** - ISC License
- **html2pdf.js** - MIT License
- **Radix UI** - MIT License

Ver [Attributions.md](Attributions.md) para detalhes completos.

---

## Autor

**Pedro Lucas Gandara Santos**

- Email: [plgsantos@icloud.com](mailto:plgsantos@icloud.com)
- LinkedIn: [linkedin.com/in/pedrolucassantos](https://linkedin.com/in/pedrolucassantos)
- GitHub: [@plgs2005](https://github.com/plgs2005)
- Repositorio: [plgs2005/resume_figma](https://github.com/plgs2005/resume_figma)

---

## Suporte

Encontrou um bug ou tem uma sugestao?

- [Abrir Issue](https://github.com/plgs2005/resume_figma/issues)
- [Discussoes](https://github.com/plgs2005/resume_figma/discussions)
- [Email direto](mailto:plgsantos@icloud.com)

---

**Ultima atualizacao:** 23 de Fevereiro de 2026  
**Versao:** 2.0.1