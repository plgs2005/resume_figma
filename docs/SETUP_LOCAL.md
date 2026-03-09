# 🚀 Setup Local - Alinhamento Figma Make → Repositório Local

## 📋 Pré-requisitos

```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# Git
git --version
```

---

## 🎯 1. ÍCONES: Como são carregados

### ✅ Biblioteca NPM (Lucide React) - NÃO são assets do Figma

**No Figma Make:**
```tsx
import { Mail, Phone, MapPin, Linkedin, Printer, Download, ExternalLink } from "lucide-react";
```

**No ambiente local (após fix-imports):**
```tsx
// MESMO CÓDIGO - nenhuma diferença!
import { Mail, Phone, MapPin, Linkedin, Printer, Download, ExternalLink } from "lucide-react";
```

**Não há assets SVG do Figma para ícones** - tudo é biblioteca NPM instalada via `package.json`.

---

## 📁 2. ARQUIVOS INDISPENSÁVEIS (já criados)

### ✅ Estrutura de Build/Dev

| Arquivo | Status | Função |
|---------|--------|--------|
| `index.html` | ✅ Criado | Entry point HTML (raiz do Vite) |
| `main.tsx` | ✅ Criado | Bootstrap React + import CSS global |
| `vite.config.ts` | ✅ Criado | Configuração Vite + plugin Tailwind v4 |
| `tsconfig.json` | ✅ Criado | Configuração TypeScript base |
| `tsconfig.app.json` | ✅ Criado | Config TS para app (extends base) |
| `tsconfig.node.json` | ✅ Criado | Config TS para Vite (Node.js) |
| `vite-env.d.ts` | ✅ Criado | Types do Vite (client types) |

### ✅ CSS e Design Tokens

| Arquivo | Status | Função |
|---------|--------|--------|
| `styles/globals.css` | ✅ Criado | **CRÍTICO** - Tailwind v4 + design tokens completos |

**Conteúdo crítico de `styles/globals.css`:**
```css
@import "tailwindcss";  /* Tailwind v4 - import direto */

@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  /* ... 44 linhas de design tokens ... */
  --radius: 0.625rem;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Tipografia base para h1, h2, h3, etc. */
@layer base {
  :where(:not(:has([class*=' text-']), :not(:has([class^='text-'])))) {
    h1 { font-size: var(--text-2xl); ... }
    h2 { font-size: var(--text-xl); ... }
    /* ... */
  }
}

html {
  font-size: var(--font-size);
}
```

**⚠️ SEM ESTE ARQUIVO, O LAYOUT QUEBRA COMPLETAMENTE!**

### ✅ Componentes UI (Shadcn/ui)

| Pasta | Status | Função |
|-------|--------|--------|
| `components/ui/` | ✅ Criado | 47 componentes Shadcn/ui (não usados no currículo) |
| `components/ui/utils.ts` | ✅ Criado | Função `cn()` para merge de classes Tailwind |
| `components/figma/ImageWithFallback.tsx` | ✅ Criado | Componente de imagem (não usado no currículo) |

**Nota:** O currículo atual NÃO usa nenhum componente Shadcn/ui diretamente, mas eles estão disponíveis para expansões futuras.

---

## 🔧 3. AJUSTES OBRIGATÓRIOS PARA RODAR LOCAL

### 🔴 PASSO 1: Corrigir imports versionados do Figma Make

**Problema:** No Figma Make, os imports são versionados:
```tsx
// ❌ Figma Make (não funciona no Node.js)
import { Mail } from "lucide-react@0.487.0";
import { Accordion } from "@radix-ui/react-accordion@1.2.3";
```

**Solução:** Executar script de correção automática:
```bash
# Dar permissão de execução
chmod +x scripts/fix-figma-imports.sh

# Rodar correção
npm run fix-imports
# OU diretamente:
./scripts/fix-figma-imports.sh
```

**Resultado:**
```tsx
// ✅ Após correção (padrão npm)
import { Mail } from "lucide-react";
import { Accordion } from "@radix-ui/react-accordion";
```

**O script corrige AUTOMATICAMENTE:**
- Todos os arquivos `.ts` e `.tsx`
- Exclui `node_modules/` e `dist/`
- Compatível com Linux (GNU sed) e macOS (BSD sed)

### 🟡 PASSO 2: Instalar dependências

```bash
npm install
```

**O que será instalado (package.json):**
- React 18.3.1 + React DOM
- Lucide React 0.487.0 (ícones)
- 12 pacotes @radix-ui (componentes Shadcn/ui)
- Tailwind CSS v4.0.0 + plugin Vite
- Vite 6.0.7
- TypeScript 5.7.3

### 🟢 PASSO 3: Rodar dev server

```bash
npm run dev
```

**Deve abrir:** `http://localhost:5173`

---

## 🎨 4. CSS/RESET OBRIGATÓRIOS

### ✅ Reset CSS Incluído (Tailwind Preflight)

O Tailwind v4 inclui **automaticamente** um reset CSS (Preflight) via `@import "tailwindcss"` no `globals.css`.

**Não precisa criar arquivo reset.css separado!**

### ✅ Estilos Globais Base

Tudo está no `styles/globals.css`:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

### ✅ Tipografia Padrão

Os estilos de `<h1>`, `<h2>`, `<h3>`, `<button>`, `<label>`, `<input>` estão definidos no `globals.css` (linhas 139-183).

**IMPORTANTE:** Esses estilos só aplicam quando NÃO há classes Tailwind de texto (`text-*`) no elemento. No currículo, quase tudo tem classes explícitas, então esses defaults são sobrescritos.

---

## 🔍 5. DIFERENÇAS ENTRE MAKE E REPO LOCAL

### ✅ O que é IDÊNTICO:

| Item | Status |
|------|--------|
| `App.tsx` | ✅ Código idêntico |
| `styles/globals.css` | ✅ Design tokens idênticos |
| Componentes UI | ✅ Shadcn/ui completo |
| Layout visual | ✅ 100% igual |
| Funcionalidades | ✅ Botões PDF, print, html2pdf.js |
| Wrapper externo | ✅ `bg-slate-100 py-8` aplicado |

### 🟡 O que precisa AJUSTE:

| Item | Figma Make | Repo Local | Solução |
|------|------------|------------|---------|
| **Imports** | Versionados (`@0.487.0`) | Sem versão | ✅ `npm run fix-imports` |
| **HTML entry** | Gerenciado pelo Make | Precisa `index.html` | ✅ Já criado |
| **Bootstrap** | Automático | Precisa `main.tsx` | ✅ Já criado |
| **Dev server** | Make interno | Vite | ✅ `npm run dev` |

### ❌ O que NUNCA estará no repo local:

| Item | Motivo |
|------|--------|
| Interface visual do Make | É ferramenta externa |
| Preview automático | Precisa rodar `npm run dev` |
| Sistema de salvamento do Make | É cloud do Figma |

---

## 📦 6. FONTES: Sistema vs. Custom

### ✅ Fontes Usadas no Projeto

O currículo usa **fontes do sistema** (sem custom fonts):

```css
/* App.tsx - linha 66 */
font-sans  /* = Tailwind default sans-serif stack */
```

**Stack de fontes Tailwind `font-sans`:**
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Não precisa instalar/importar nenhuma fonte!**

Se quiser fonte customizada no futuro:

```tsx
// 1. Adicionar no index.html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

// 2. Adicionar no globals.css
@layer base {
  body {
    font-family: 'Inter', sans-serif;
  }
}
```

---

## 🖼️ 7. ASSETS: Nenhum asset de imagem usado

### ✅ Estado Atual

O currículo **NÃO usa nenhuma imagem ou asset**:
- ❌ Sem logo pessoal
- ❌ Sem foto de perfil
- ❌ Sem ícones SVG customizados
- ✅ Apenas ícones Lucide React (biblioteca NPM)

### ✅ ImageWithFallback.tsx

Existe o componente `components/figma/ImageWithFallback.tsx`, mas:
- ❌ **NÃO é usado no App.tsx**
- ✅ Existe apenas para futuras expansões
- ✅ Protegido (arquivo do sistema Figma Make)

---

## 🔧 8. VARIÁVEIS DE AMBIENTE (.env)

### ✅ Estado Atual

O projeto **NÃO precisa de arquivo `.env`**:
- ❌ Sem API keys
- ❌ Sem configurações de ambiente
- ❌ Sem variáveis públicas VITE_*

### 🟡 Se precisar no futuro:

```bash
# Criar .env na raiz
touch .env

# Adicionar variáveis
VITE_API_URL=https://api.example.com
VITE_PUBLIC_KEY=abc123
```

```tsx
// Usar no código
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 📋 9. CHECKLIST COMPLETO - Setup Local

### Preparação

- [ ] Node.js 18+ instalado
- [ ] npm 9+ instalado
- [ ] Git instalado
- [ ] Repositório clonado: `git clone https://github.com/plgs2005/resume_figma.git`
- [ ] Navegado para pasta: `cd resume_figma`

### Correção de Imports

- [ ] Permissão de execução: `chmod +x scripts/fix-figma-imports.sh`
- [ ] Rodou correção: `npm run fix-imports`
- [ ] Verificou output: "Concluído! X arquivo(s) corrigido(s)."

### Instalação

- [ ] Rodou: `npm install`
- [ ] Sem erros de instalação
- [ ] Pasta `node_modules/` criada

### Dev Server

- [ ] Rodou: `npm run dev`
- [ ] Abriu: `http://localhost:5173`
- [ ] Currículo renderiza corretamente
- [ ] **Wrapper externo:** Fundo cinza (`bg-slate-100`) com padding vertical (`py-8`)
- [ ] **Currículo:** Fundo branco com sombra (`shadow-2xl`)
- [ ] Header escuro (`bg-slate-900`) visível
- [ ] Botões flutuantes (verde + escuro) no canto inferior direito
- [ ] Responsividade funciona (testar mobile/tablet/desktop)

### Funcionalidades

- [ ] Botão "Exportar PDF" (verde) funciona
- [ ] Botão "PDF para ATS" (escuro) abre diálogo de impressão
- [ ] Links de email e LinkedIn clicáveis
- [ ] Scroll suave
- [ ] Sem erros no console do navegador

### Build de Produção (opcional)

- [ ] Rodou: `npm run build`
- [ ] Pasta `dist/` criada
- [ ] Rodou: `npm run preview`
- [ ] Build funciona em `http://localhost:4173`

---

## 🐛 10. TROUBLESHOOTING

### Problema: "Cannot find module 'lucide-react@0.487.0'"

**Causa:** Imports ainda versionados (script de correção não rodou)

**Solução:**
```bash
npm run fix-imports
npm run dev
```

---

### Problema: Layout quebrado / sem estilos

**Causa:** `globals.css` não importado ou Tailwind não carregado

**Verificar:**
```tsx
// main.tsx DEVE ter:
import "./styles/globals.css";
```

**Solução:**
```bash
# Reinstalar Tailwind
npm install tailwindcss@4.0.0 @tailwindcss/vite@4.0.0 --save-dev
npm run dev
```

---

### Problema: "Failed to resolve import 'tailwindcss'"

**Causa:** Tailwind v4 não instalado ou plugin Vite ausente

**Solução:**
```bash
npm install @tailwindcss/vite@4.0.0 --save-dev
```

**Verificar `vite.config.ts`:**
```ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // ← DEVE ESTAR PRESENTE
  ],
});
```

---

### Problema: TypeScript errors no editor

**Causa:** TSConfig não reconhecido ou cache do TS

**Solução:**
```bash
# VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Linha de comando
npm run type-check

# Se persistir
rm -rf node_modules package-lock.json
npm install
```

---

### Problema: Wrapper externo não aparece (fundo cinza ausente)

**Causa:** Push manual não foi feito ainda (código local desatualizado)

**Verificar App.tsx linha 66:**
```tsx
// ✅ DEVE SER:
<div className="min-h-screen bg-slate-100 print:bg-white py-8 print:p-0 font-sans text-slate-900">

// ❌ SE FOR ISSO, está desatualizado:
<div className="min-h-screen bg-white print:bg-white p-0 font-sans text-slate-900">
```

**Solução:** Pull do GitHub após push manual:
```bash
git pull origin main
npm run fix-imports
npm run dev
```

---

### Problema: html2pdf.js não funciona (PDF não gera)

**Causa:** Biblioteca não carregou (CDN bloqueado ou timeout)

**Verificar console:**
```js
// Deve aparecer no console depois de alguns segundos:
// (nenhum erro sobre html2pdf)
```

**Solução temporária:** Recarregar página (Ctrl+R)

**Solução permanente (futuro):** Instalar html2pdf.js via npm em vez de CDN:
```bash
npm install html2pdf.js
```

```tsx
// App.tsx
import html2pdf from "html2pdf.js";

const handleExportPDF = () => {
  html2pdf().set(opt).from(element).save();
};
```

---

## 📚 11. COMANDOS RÁPIDOS

```bash
# Setup inicial (após clone)
npm install
npm run fix-imports
npm run dev

# Desenvolvimento diário
npm run dev                  # Dev server (hot reload)
npm run type-check           # Validar TypeScript
npm run build                # Build de produção
npm run preview              # Preview da build

# Manutenção
npm run fix-imports          # Re-rodar se puxar código do Make
npm outdated                 # Ver dependências desatualizadas
npm update                   # Atualizar (cuidado com breaking changes)
```

---

## ✅ 12. RESUMO EXECUTIVO

### O que você PRECISA fazer:

1. ✅ Clonar repositório
2. ✅ Rodar `npm run fix-imports` (UMA VEZ, após cada pull do Make)
3. ✅ Rodar `npm install`
4. ✅ Rodar `npm run dev`
5. ✅ Abrir `http://localhost:5173`

### O que NÃO precisa fazer:

- ❌ Criar arquivo de reset CSS (Tailwind já tem)
- ❌ Importar fontes customizadas (usa system fonts)
- ❌ Baixar assets/imagens (não há nenhum)
- ❌ Configurar .env (não precisa)
- ❌ Criar tailwind.config.js (Tailwind v4 usa CSS puro)
- ❌ Instalar html2pdf.js (carrega via CDN no useEffect)

### O que é IDÊNTICO entre Make e Local:

- ✅ Layout visual (100%)
- ✅ Funcionalidades (botões PDF, print)
- ✅ Código React (após fix-imports)
- ✅ Design tokens (globals.css)
- ✅ Componentes Shadcn/ui (47 componentes disponíveis)

---

## 🎯 PRÓXIMOS PASSOS

Depois de rodar local com sucesso:

1. **Validar visualmente**: Compare Make vs. Local (devem ser idênticos)
2. **Testar funcionalidades**: 
   - Exportar PDF Visual (botão verde)
   - PDF para ATS (botão escuro → Ctrl+P → Salvar como PDF)
3. **Verificar responsividade**: Mobile, tablet, desktop
4. **Testar impressão**: Ctrl+P → verificar quebras de página

5. **Fazer push das alterações mais recentes**:
   ```bash
   git status
   git add .
   git commit -m "feat: adiciona wrapper externo com bg-slate-100 e py-8"
   git push origin main
   ```

6. **Continuar desenvolvimento**:
   - Editar `App.tsx` para atualizar conteúdo
   - Hot reload automático no navegador
   - Commit e push quando satisfeito

---

**📅 Última atualização:** 23 de Fevereiro de 2026  
**📄 Versão do documento:** 1.0.0  
**👤 Autor:** Pedro Lucas Gandara Santos
