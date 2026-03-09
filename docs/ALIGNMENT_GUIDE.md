# 🎯 Alinhamento Figma Make ↔ Repositório Local - Guia Completo

Este documento explica **exatamente** como o projeto do Figma Make está estruturado e como replicá-lo 100% no ambiente local.

---

## 📚 Documentação Disponível

| Documento | Conteúdo | Quando Usar |
|-----------|----------|-------------|
| **[SETUP_LOCAL.md](./SETUP_LOCAL.md)** | ⭐ Guia completo de setup (10+ seções) | Primeira vez configurando o projeto local |
| **[MAKE_VS_LOCAL.md](./MAKE_VS_LOCAL.md)** | Comparação visual Make vs Local | Entender diferenças de ambiente |
| **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** | Diagramas de arquitetura (imports, CSS, fluxos) | Entender como tudo funciona internamente |
| **[COMMANDS.md](./COMMANDS.md)** | Lista completa de comandos práticos | Referência rápida de terminal |

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Clonar repositório
git clone https://github.com/plgs2005/resume_figma.git
cd resume_figma

# 2. Corrigir imports versionados (CRÍTICO!)
chmod +x scripts/fix-figma-imports.sh
npm run fix-imports

# 3. Instalar dependências
npm install

# 4. Rodar dev server
npm run dev

# 5. Abrir browser
http://localhost:5173
```

**Tempo total:** ~5 minutos (após clone)

---

## ❓ Perguntas Frequentes - Respostas Rápidas

### 1. **Como os ícones são carregados?**

**Resposta:** Via biblioteca NPM **Lucide React**, NÃO são assets SVG do Figma.

```tsx
// App.tsx
import { Mail, Phone, MapPin, Linkedin, Printer, Download, ExternalLink } from "lucide-react";

// Renderiza como:
<Mail className="w-4 h-4" />  // Componente React que gera SVG inline
```

**Detalhes completos:** Ver [ARCHITECTURE_DIAGRAMS.md - Seção "Como os Ícones São Carregados"](./ARCHITECTURE_DIAGRAMS.md#-como-os-ícones-são-carregados-lucide-react)

---

### 2. **Quais arquivos/configs são indispensáveis?**

**Resposta:** Todos os arquivos de configuração já foram criados. Estrutura completa:

```
✅ index.html              ← Entry point HTML
✅ main.tsx                ← Bootstrap React
✅ App.tsx                 ← Componente principal
✅ vite.config.ts          ← Configuração Vite + Tailwind plugin
✅ tsconfig.json           ← TypeScript config
✅ package.json            ← Dependencies
✅ styles/globals.css      ← ⭐ CRÍTICO - Tailwind v4 + design tokens
✅ scripts/fix-figma-imports.sh  ← Correção de imports
```

**Lista completa com descrições:** Ver [SETUP_LOCAL.md - Seção "Arquivos Indispensáveis"](./SETUP_LOCAL.md#-2-arquivos-indispensáveis-já-criados)

---

### 3. **Existe algum ajuste de CSS/Reset obrigatório?**

**Resposta:** Sim, o arquivo `styles/globals.css` é **OBRIGATÓRIO** e contém:

1. **Tailwind v4** (`@import "tailwindcss"`)
2. **Design tokens** (40+ variáveis CSS: cores, espaçamento, raio)
3. **Reset CSS** (via Tailwind Preflight - automático)
4. **Tipografia base** (estilos para `h1`, `h2`, `h3`, etc.)

**Conteúdo crítico:**
```css
@import "tailwindcss";  /* ← Carrega Tailwind v4 */

:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --radius: 0.625rem;
  /* ... 40+ tokens */
}

@layer base {
  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
  }
}
```

**⚠️ SEM ESTE ARQUIVO, O LAYOUT NÃO FUNCIONA!**

**Detalhes completos:** Ver [SETUP_LOCAL.md - Seção "CSS/RESET OBRIGATÓRIOS"](./SETUP_LOCAL.md#-4-cssreset-obrigatórios)

---

### 4. **Diferenças entre a prévia do Make e o repo local?**

**Resposta:** **ZERO diferenças visuais/funcionais!** Apenas diferenças de ambiente:

| Aspecto | Figma Make | Repo Local | Idêntico? |
|---------|-----------|------------|-----------|
| **Layout Visual** | Preview interno | http://localhost:5173 | ✅ 100% |
| **Código React** | App.tsx versionado | App.tsx sem versão | ✅ Após fix-imports |
| **CSS/Tailwind** | globals.css | globals.css | ✅ Idêntico |
| **Funcionalidades** | Botões PDF, print | Botões PDF, print | ✅ Idêntico |
| **Build Tool** | Make interno | Vite 6.0.7 | ⚠️ Diferente (mas output igual) |

**O que precisa ajuste:**
- ✅ Imports versionados (`lucide-react@0.487.0` → `lucide-react`)
- ✅ Dev server (Make interno → `npm run dev`)
- ✅ Git push (somente leitura no Make → push completo no local)

**Comparação visual completa:** Ver [MAKE_VS_LOCAL.md](./MAKE_VS_LOCAL.md)

---

### 5. **O que falta no repo local?**

**Resposta:** **NADA!** O repo local tem **TUDO** que o Make tem, MAIS:

```
Make tem:                         Local tem:
├── App.tsx                       ├── App.tsx                ✅
├── styles/globals.css            ├── styles/globals.css      ✅
├── components/ui/*               ├── components/ui/*        ✅
└── Guidelines.md                 ├── Guidelines.md          ✅
                                  │
                                  PLUS:
                                  ├── index.html             ⭐
                                  ├── main.tsx               ⭐
                                  ├── vite.config.ts         ⭐
                                  ├── package.json           ⭐
                                  ├── fix-figma-imports.sh   ⭐
                                  ├── SETUP_LOCAL.md         ⭐
                                  ├── MAKE_VS_LOCAL.md       ⭐
                                  ├── ARCHITECTURE_DIAGRAMS.md ⭐
                                  └── COMMANDS.md            ⭐
```

**Lista completa:** Ver [MAKE_VS_LOCAL.md - Seção "O Que Falta?"](./MAKE_VS_LOCAL.md#-o-que-falta-no-repo-local-resposta-nada)

---

## 🔧 Ajustes Obrigatórios Para Rodar Local

### **🔴 PASSO 1: Corrigir Imports Versionados (CRÍTICO!)**

**Problema:** No Figma Make, os imports têm sufixos de versão:
```tsx
import { Mail } from "lucide-react@0.487.0";  // ❌ Não funciona no Node.js
```

**Solução:** Executar script de correção:
```bash
chmod +x scripts/fix-figma-imports.sh
npm run fix-imports
```

**Resultado:**
```tsx
import { Mail } from "lucide-react";  // ✅ Padrão npm
```

**Detalhes:** Ver [SETUP_LOCAL.md - Seção "Ajustes Obrigatórios"](./SETUP_LOCAL.md#-3-ajustes-obrigatórios-para-rodar-local)

---

### **🟡 PASSO 2: Instalar Dependências**

```bash
npm install
```

**Instalará:**
- React 18.3.1 + React DOM
- Lucide React 0.487.0 (ícones)
- Tailwind CSS v4.0.0
- Vite 6.0.7 (build tool)
- TypeScript 5.7.3
- 47 componentes Shadcn/ui (não usados no currículo, mas disponíveis)

**Tempo:** 1-3 minutos

---

### **🟢 PASSO 3: Rodar Dev Server**

```bash
npm run dev
```

**Abre:** `http://localhost:5173`

**Deve ver:**
- ✅ Fundo cinza claro (`bg-slate-100`)
- ✅ Currículo branco com sombra (`shadow-2xl`)
- ✅ Header escuro (`bg-slate-900`)
- ✅ Botões flutuantes (verde + escuro) no canto inferior direito
- ✅ Hot reload funcionando (mudanças refletem automaticamente)

---

## 🎨 Fontes: Sistema vs. Custom

**Resposta:** O projeto usa **fontes do sistema** (sem custom fonts).

```tsx
// App.tsx - linha 66
font-sans  // = Tailwind default sans-serif stack
```

**Stack de fontes:**
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Não precisa instalar/importar nenhuma fonte!**

**Se quiser fonte customizada no futuro:** Ver [SETUP_LOCAL.md - Seção "Fontes"](./SETUP_LOCAL.md#-6-fontes-sistema-vs-custom)

---

## 🖼️ Assets: Imagens e SVGs

**Resposta:** O currículo **NÃO usa nenhuma imagem ou asset**.

- ❌ Sem logo pessoal
- ❌ Sem foto de perfil
- ❌ Sem ícones SVG customizados do Figma
- ✅ Apenas ícones Lucide React (biblioteca NPM)

**Componente `ImageWithFallback.tsx`:**
- ✅ Existe no projeto (`components/figma/ImageWithFallback.tsx`)
- ❌ **NÃO é usado** no `App.tsx`
- ✅ Está disponível para futuras expansões

---

## 🔍 Troubleshooting - Problemas Comuns

### Problema: "Cannot find module 'lucide-react@0.487.0'"

```bash
npm run fix-imports
npm run dev
```

**Detalhes:** Ver [COMMANDS.md - Seção "Troubleshooting"](./COMMANDS.md#-correção-de-problemas-comuns)

---

### Problema: Layout sem estilos (fundo branco, sem cores)

```bash
# Reinstalar Tailwind
npm install tailwindcss@4.0.0 @tailwindcss/vite@4.0.0 --save-dev
npm run dev
```

**Verificar:**
- [ ] `vite.config.ts` tem `tailwindcss()` no array de plugins
- [ ] `main.tsx` importa `"./styles/globals.css"`
- [ ] `styles/globals.css` existe e tem `@import "tailwindcss"`

---

### Problema: TypeScript errors no editor

```bash
# VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Linha de comando
npm run type-check
```

---

### Problema: Port 5173 já em uso

```bash
# Usar porta diferente
npm run dev -- --port 3000
```

---

## 📋 Checklist de Validação

Execute para confirmar alinhamento perfeito:

### Visual
- [ ] Fundo cinza claro (`bg-slate-100`) no wrapper externo
- [ ] Espaçamento vertical (`py-8`) antes/depois do currículo
- [ ] Currículo branco com sombra grande (`shadow-2xl`)
- [ ] Header escuro (`bg-slate-900`) sem gradiente
- [ ] Botões flutuantes (verde + escuro) no canto inferior direito

### Funcional
- [ ] Botão verde gera PDF (html2pdf.js)
- [ ] Botão escuro abre impressão (window.print)
- [ ] Links de email e LinkedIn clicáveis
- [ ] Responsivo (mobile/tablet/desktop)

### Código
- [ ] Imports SEM versão (`lucide-react`, não `lucide-react@0.487.0`)
- [ ] TypeScript sem erros: `npm run type-check`
- [ ] Vite roda sem warnings: `npm run dev`
- [ ] Build funciona: `npm run build`

**Se TODOS estão ✅, você está 100% alinhado!**

---

## 🎯 Workflow Completo - Do Zero ao Dev

```bash
# 1. Clonar
git clone https://github.com/plgs2005/resume_figma.git
cd resume_figma

# 2. Setup
chmod +x scripts/fix-figma-imports.sh
npm run fix-imports
npm install

# 3. Dev
npm run dev

# 4. Validar (abrir http://localhost:5173)
# - [ ] Layout OK
# - [ ] Botões funcionam
# - [ ] Responsivo OK

# 5. Fazer mudanças
code App.tsx  # Editar conteúdo

# 6. Testar
# (Hot reload automático no browser)

# 7. Commit
git add .
git commit -m "feat: atualiza experiência profissional"
git push origin main

# 8. Build de produção (opcional)
npm run build
npm run preview
```

**Tempo total (primeira vez):** ~10 minutos  
**Tempo (depois):** ~30 segundos

---

## 📚 Estrutura da Documentação

```
resume_figma/
│
├── 📄 THIS_FILE.md                        ← ⭐ Você está aqui!
│                                           (Resumo executivo)
│
├── 📘 SETUP_LOCAL.md                      ← Guia completo de setup
│   ├── Pré-requisitos                      (Node, npm, Git)
│   ├── Ícones e bibliotecas                (Lucide React)
│   ├── Arquivos indispensáveis             (12 arquivos críticos)
│   ├── Ajustes obrigatórios                (fix-imports, install)
│   ├── CSS/Reset                           (globals.css)
│   ├── Fontes                              (system fonts)
│   ├── Assets                              (nenhum usado)
│   ├── Troubleshooting                     (10 problemas comuns)
│   ├── Checklist completo                  (15+ validações)
│   └── Comandos rápidos                    (TL;DR)
│
├── 📗 MAKE_VS_LOCAL.md                    ← Comparação Make vs Local
│   ├── Diagrama visual                     (Make → Local)
│   ├── Tabela comparativa                  (12 aspectos)
│   ├── O que falta no repo local           (NADA!)
│   ├── Diferenças de ambiente              (Build tool)
│   ├── Resumo em 3 pontos                  (Visual, Código, Ambiente)
│   └── Checklist de alinhamento            (4 categorias)
│
├── 📙 ARCHITECTURE_DIAGRAMS.md            ← Diagramas de arquitetura
│   ├── Como ícones são carregados          (Lucide → DOM)
│   ├── Fluxo de estilos                    (Tailwind → Browser)
│   ├── Fluxo de componentes                (App → DOM)
│   ├── Dependências NPM                    (package.json)
│   ├── HTML2PDF.js                         (CDN → PDF)
│   ├── Impressão ATS                       (Print → PDF)
│   └── Estrutura de arquivos               (ASCII tree)
│
├── 📕 COMMANDS.md                         ← Comandos práticos
│   ├── Setup inicial                       (clone, install)
│   ├── Desenvolvimento diário              (dev, build, preview)
│   ├── Debugging                           (diagnóstico)
│   ├── Correção de problemas               (5 problemas comuns)
│   ├── Git workflows                       (commits, branches)
│   ├── Testes manuais                      (checklist)
│   └── Workflow completo                   (exemplo prático)
│
└── 📚 guidelines/
    └── Guidelines.md                       ← Documentação original
                                             (10k+ palavras)
```

---

## 💡 Quando Usar Cada Documento

### Primeira Vez (Setup)
1. **THIS_FILE.md** (você está aqui) - Visão geral
2. **SETUP_LOCAL.md** - Seguir passo a passo completo
3. **COMMANDS.md** - Copiar/colar comandos

### Entendendo Diferenças
1. **MAKE_VS_LOCAL.md** - Comparação visual
2. **ARCHITECTURE_DIAGRAMS.md** - Como tudo funciona

### Referência Rápida
1. **COMMANDS.md** - Comandos de terminal
2. **SETUP_LOCAL.md - Seção Troubleshooting** - Resolver problemas

### Desenvolvimento
1. **Guidelines.md** - Convenções de código, padrões, design system
2. **COMMANDS.md - Workflow Completo** - Exemplo prático

---

## 🎉 Conclusão

**Você agora tem:**

✅ **Entendimento completo** de como o projeto funciona  
✅ **4 guias especializados** para referência  
✅ **Setup local 100% funcional** (após seguir SETUP_LOCAL.md)  
✅ **Zero diferenças** entre Make e Local (após fix-imports)  
✅ **Comandos prontos** para copiar/colar (COMMANDS.md)  
✅ **Diagramas visuais** de toda a arquitetura  

**Próximos passos:**

1. Se ainda não fez setup: Ir para **[SETUP_LOCAL.md](./SETUP_LOCAL.md)**
2. Se quer entender diferenças: Ir para **[MAKE_VS_LOCAL.md](./MAKE_VS_LOCAL.md)**
3. Se quer ver arquitetura: Ir para **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)**
4. Se quer comandos: Ir para **[COMMANDS.md](./COMMANDS.md)**

---

**📅 Criado em:** 23 de Fevereiro de 2026  
**👤 Autor:** Pedro Lucas Gandara Santos  
**📧 Email:** plgsantos@icloud.com  
**🔗 Repo:** [github.com/plgs2005/resume_figma](https://github.com/plgs2005/resume_figma)
