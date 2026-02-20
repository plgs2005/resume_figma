# 📋 Guidelines - Projeto Currículo Interativo

> **Currículo Interativo para Tech Lead/Engenheiro Sênior**  
> Desenvolvido com React, Tailwind CSS v4 e Shadcn/ui  
> Otimizado para ATS (Applicant Tracking Systems), impressão A4 e exportação PDF

---

## 📖 Índice

1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Decisões de Arquitetura](#-decisões-de-arquitetura)
3. [Tech Stack](#-tech-stack)
4. [Estrutura de Arquivos](#-estrutura-de-arquivos)
5. [Padrões de Código](#-padrões-de-código)
6. [Funcionalidades Principais](#-funcionalidades-principais)
7. [Otimizações Específicas](#-otimizações-específicas)
8. [Design System](#-design-system)
9. [Processo de Desenvolvimento](#-processo-de-desenvolvimento)
10. [Guia de Contribuição](#-guia-de-contribuição)
11. [Comandos Úteis](#-comandos-úteis)

---

## 🎯 Visão Geral do Projeto

### **Objetivo**
Criar um currículo digital interativo e profissional para posições de **Tech Lead** e **Engenheiro de Software Sênior**, com foco especial em:

- ✅ **Compatibilidade ATS** - Texto selecionável, estrutura semântica, sem elementos que bloqueiem leitura
- ✅ **Impressão A4 perfeita** - Dimensões exatas (210mm x 297mm), otimização de quebras de página
- ✅ **Exportação PDF dupla**:
  - PDF Visual (html2pdf.js) - Alta qualidade, preserva estilos
  - PDF ATS (Print do navegador) - Texto selecionável, otimizado para parsing
- ✅ **Design profissional** - Layout moderno, tipografia cuidadosa, hierarquia visual clara

### **Contexto Técnico**
Este projeto foi desenvolvido inicialmente no **Figma Make** (ambiente de desenvolvimento web do Figma) e posteriormente migrado para versionamento completo no GitHub devido às **limitações de escrita do Figma Make**. Todo o gerenciamento de versões é feito manualmente via GitHub.

---

## 🏗️ Decisões de Arquitetura

### **1. Single Page Application (SPA)**
**Decisão:** Currículo completo em uma única página React (`/App.tsx`)

**Razões:**
- ✅ Simplicidade de impressão e exportação PDF
- ✅ Sem necessidade de roteamento para um currículo
- ✅ Performance otimizada (tudo carregado de uma vez)
- ✅ Facilita manutenção e atualização de conteúdo

### **2. Component-Based Architecture**
**Decisão:** Estrutura baseada em componentes reutilizáveis do Shadcn/ui

**Razões:**
- ✅ Reusabilidade e consistência visual
- ✅ Manutenção facilitada
- ✅ Biblioteca madura e bem documentada
- ✅ Compatível com Tailwind CSS v4

### **3. Utility-First CSS (Tailwind v4)**
**Decisão:** Uso de Tailwind CSS v4 para estilização

**Razões:**
- ✅ Prototipagem rápida
- ✅ Design consistente via design tokens
- ✅ Otimização automática de CSS
- ✅ Responsive design facilitado
- ✅ Print styles nativos (`print:` variant)

### **4. Estado Local Mínimo**
**Decisão:** Apenas estado para controle de carregamento da biblioteca PDF

**Razões:**
- ✅ Currículo é conteúdo estático (não requer estado complexo)
- ✅ Menos complexidade, mais performance
- ✅ Facilita debugging e manutenção

### **5. Estrutura Flat (Raiz do Projeto)**
**Decisão:** Todos os arquivos na raiz, sem pasta `/resume`

**Razões:**
- ✅ Simplicidade e convenção padrão React
- ✅ Evita confusão de paths de imports
- ✅ Melhor compatibilidade com ferramentas e IDEs
- ✅ Elimina duplicação acidental

**Histórico:** Inicialmente havia uma pasta `/resume` criada como backup de segurança durante limitações do Figma Make. Após migração completa para GitHub, a duplicação foi removida (refactor em 20/02/2026).

---

## 🛠️ Tech Stack

### **Core**
| Tecnologia | Versão | Uso |
|-----------|---------|-----|
| **React** | 18.x | Framework UI principal |
| **TypeScript** | 5.x | Type safety e desenvolvimento |
| **Tailwind CSS** | v4.0 | Estilização utility-first |

### **UI Components**
| Biblioteca | Licença | Uso |
|-----------|---------|-----|
| **Shadcn/ui** | MIT | Sistema de componentes (47 componentes) |
| **Lucide React** | ISC | Ícones (Mail, Phone, MapPin, Download, Printer, etc.) |

### **Funcionalidades**
| Biblioteca | Versão | Uso |
|-----------|---------|-----|
| **html2pdf.js** | 0.10.1 | Exportação PDF visual (carregado via CDN) |
| **Navegador (Print)** | Nativo | Exportação PDF otimizada para ATS |

### **Design Tokens**
- **Cores:** Custom palette com suporte a dark mode (OKLCH color space)
- **Tipografia:** Font system variables (`--text-*`)
- **Espaçamento:** Tailwind spacing scale
- **Raio:** Custom `--radius: 0.625rem` (10px)

---

## 📁 Estrutura de Arquivos

```
/
├── App.tsx                          # ⭐ Componente principal do currículo
├── Attributions.md                  # Licenças (Shadcn/ui MIT, Unsplash)
│
├── components/
│   ├── figma/
│   │   └── ImageWithFallback.tsx   # Componente de imagem com fallback
│   │
│   └── ui/                          # 47 componentes Shadcn/ui
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       ├── tooltip.tsx
│       ├── use-mobile.ts           # Hook para detecção mobile
│       └── utils.ts                # Utilidades (cn, etc.)
│
├── guidelines/
│   └── Guidelines.md               # 📄 Este arquivo
│
└── styles/
    └── globals.css                 # Estilos globais + Tailwind v4 config
```

### **Componentes UI Disponíveis**
Apesar de termos 47 componentes Shadcn/ui disponíveis, **o currículo atual não usa nenhum deles diretamente**. Estão disponíveis para:
- ✅ Futuras expansões do projeto
- ✅ Criação de versões alternativas (portfolio, mini-site, etc.)
- ✅ Reutilização em outros projetos

---

## 📝 Padrões de Código

### **1. Naming Conventions**

#### **Arquivos**
```
PascalCase    → App.tsx, ImageWithFallback.tsx
kebab-case    → alert-dialog.tsx, context-menu.tsx
camelCase     → utils.ts, use-mobile.ts
```

#### **Componentes React**
```tsx
// ✅ Correto: PascalCase
export default function App() { }
export function ImageWithFallback() { }

// ❌ Incorreto
export default function app() { }
export function imageWithFallback() { }
```

#### **Funções**
```tsx
// ✅ Correto: camelCase
const handleExportPDF = () => { }
const handlePrint = () => { }

// ❌ Incorreto
const HandleExportPDF = () => { }
const handle_export_pdf = () => { }
```

#### **Variáveis**
```tsx
// ✅ Correto: camelCase
const [isReady, setIsReady] = useState(false);
const resumeContent = document.getElementById("resume-content");

// ❌ Incorreto
const [IsReady, SetIsReady] = useState(false);
const resume_content = document.getElementById("resume-content");
```

### **2. Estrutura de Componentes**

```tsx
// Ordem recomendada:
import React, { useEffect, useState } from "react";
import { Icon1, Icon2 } from "lucide-react";

export default function ComponentName() {
  // 1. State declarations
  const [state, setState] = useState(initialValue);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 3. Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### **3. Tailwind CSS Classes**

#### **Ordem de Classes**
```tsx
// Ordem recomendada:
// Layout → Sizing → Spacing → Typography → Visual → States → Print
className="
  flex flex-col          // Layout
  max-w-[210mm]         // Sizing
  p-10 mx-auto          // Spacing
  text-xl font-bold     // Typography
  bg-white shadow-2xl   // Visual
  hover:scale-105       // States
  print:p-8             // Print
"
```

#### **Breakpoints**
```tsx
// Mobile-first approach
<div className="
  flex-col           // Mobile (default)
  md:flex-row        // Tablet e acima (768px+)
">
```

#### **Print Styles**
```tsx
// Use print: variant para estilos de impressão
className="
  fixed              // Visível na tela
  print:hidden       // Oculto na impressão
"

className="
  shadow-2xl         // Sombra na tela
  print:shadow-none  // Sem sombra na impressão
"
```

### **4. Comentários**

```tsx
// ✅ Comentários de seção (JSX)
{/* Header */}
{/* Professional Summary */}
{/* Skills - Row 1: Backend & API Management */}

// ✅ Comentários inline (TypeScript)
// Load html2pdf library
const script = document.createElement("script");

// @ts-ignore - Necessário para biblioteca externa
window.html2pdf().set(opt).from(element).save();
```

### **5. IDs e Data Attributes**

```tsx
// IDs: kebab-case
<div id="resume-content">

// Data attributes: kebab-case
<section data-section="experience">
```

---

## ⚙️ Funcionalidades Principais

### **1. Exportação PDF Visual (html2pdf.js)**

**Como funciona:**
```tsx
const handleExportPDF = () => {
  const element = document.getElementById("resume-content");
  const opt = {
    margin: 0,
    filename: "Curriculo_Pedro_Lucas_Gandara_Santos.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,              // Alta resolução
      useCORS: true,         // Permite imagens externas
      letterRendering: true, // Melhora texto
      scrollY: 0,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  window.html2pdf().set(opt).from(element).save();
};
```

**Características:**
- ✅ Alta qualidade visual (98% JPEG)
- ✅ Preserva 100% dos estilos CSS
- ✅ Respeita quebras de página (`break-inside-avoid`)
- ✅ Formato A4 perfeito
- ❌ Texto pode não ser totalmente selecionável (rasterização)

**Quando usar:** 
- Para envio direto a recrutadores humanos
- Quando a apresentação visual é prioridade
- Para visualização rápida do currículo

---

### **2. Exportação PDF para ATS (Print do Navegador)**

**Como funciona:**
```tsx
const handlePrint = () => {
  window.print(); // Abre diálogo de impressão nativo
};
```

**Características:**
- ✅ Texto 100% selecionável e parseável
- ✅ Estrutura semântica preservada
- ✅ Compatível com ATS (Greenhouse, Lever, Workday, etc.)
- ✅ Usa print styles do Tailwind (`print:`)
- ✅ Sem dependências externas

**Quando usar:**
- Para submissão em portais de emprego
- Quando o currículo será processado por ATS
- Para empresas com sistemas automatizados de triagem

**Print Styles aplicados:**
```css
/* Exemplos de estilos de impressão */
.print\:hidden { display: none !important; }          /* Oculta botões */
.print\:shadow-none { box-shadow: none !important; }  /* Remove sombras */
.print\:p-8 { padding: 2rem !important; }             /* Ajusta espaçamento */
.print\:bg-slate-900 { background: #0f172a; }         /* Mantém header escuro */
```

---

### **3. Botões de Ação Flutuantes**

**Localização:** Canto inferior direito (fixo)

**Características:**
```tsx
<div className="fixed bottom-8 right-8 print:hidden z-50 flex flex-col gap-3">
  {/* Botão 1: Exportar PDF Visual */}
  <button className="
    bg-emerald-600 hover:bg-emerald-700   // Verde
    group                                 // Para animação de texto
  ">
    <Download />
    <span className="
      max-w-0 overflow-hidden              // Texto oculto
      group-hover:max-w-xs                 // Aparece no hover
      transition-all duration-300
    ">
      Exportar PDF
    </span>
  </button>

  {/* Botão 2: PDF para ATS */}
  <button className="
    bg-slate-900 hover:bg-slate-800       // Escuro
  ">
    <Printer />
    <span>PDF para ATS (Ctrl+P)</span>
  </button>
</div>
```

**UX Decisions:**
- ✅ Sempre visível durante scroll
- ✅ Oculto na impressão (`print:hidden`)
- ✅ Texto expandido no hover (melhor UX)
- ✅ Cores distintas (verde vs. escuro) para diferenciar ações
- ✅ Tooltips informativos

---

### **4. Estrutura Semântica**

```tsx
<div id="resume-content">
  <header>               {/* Cabeçalho com nome e contatos */}
    <h1>               {/* Nome completo */}
    <p>                {/* Cargo/Título */}
    <a href="mailto:"> {/* Email clicável */}
    <a href="https:"> {/* LinkedIn clicável */}
  </header>

  <main>
    <section>          {/* Resumo Profissional */}
      <h2>           {/* Título da seção */}
      <p>            {/* Conteúdo */}

    <section>          {/* Conhecimentos Técnicos */}
      <h2>
      <h3>           {/* Categorias de skills */}
      <ul>
        <li>         {/* Cada skill */}

    <section>          {/* Experiência Profissional */}
      <h2>
      <h3>           {/* Cargo */}
      <p>            {/* Empresa */}
      <span>         {/* Período */}
      <ul>
        <li>         {/* Cada responsabilidade */}
  </main>
</div>
```

**Por que isso importa:**
- ✅ ATS consegue identificar seções automaticamente
- ✅ Leitores de tela funcionam corretamente
- ✅ SEO otimizado (se houver versão web)
- ✅ Manutenção facilitada

---

## 🎨 Otimizações Específicas

### **1. Otimização para ATS**

#### **✅ O que está implementado:**

**Texto Selecionável**
```tsx
// ✅ CORRETO: Texto em HTML puro
<p>Desenvolvedor Sênior de APIs...</p>

// ❌ EVITADO: Texto em imagens
<img src="texto-como-imagem.png" />
```

**Estrutura Hierárquica**
```tsx
// ✅ Hierarquia clara
<h1>Nome Completo</h1>           // Nível 1: Identidade
<h2>Resumo Profissional</h2>     // Nível 2: Seções principais
<h3>Cargo na Empresa</h3>        // Nível 3: Subsecções
```

**Palavras-chave Estratégicas**
```tsx
// Incluídas no currículo:
- "API Specialist", "Tech Lead", "Sênior"
- "Apigee Edge", "Apigee X", "API-First"
- "OAuth2", "JWT", "mTLS"
- "AWS", "GCP", "Docker", "Jenkins"
- "React", "Laravel", "Node.js", "PHP"
- "OpenAPI", "Swagger", "REST", "Microservices"
```

**Links Clicáveis**
```tsx
<a href="mailto:plgsantos@icloud.com">plgsantos@icloud.com</a>
<a href="https://linkedin.com/in/pedrolucassantos">LinkedIn</a>
```

#### **❌ O que está evitado:**

- ❌ Tabelas complexas (dificultam parsing)
- ❌ Texto em colunas (ATS lê linha por linha)
- ❌ Elementos gráficos decorativos excessivos
- ❌ Fontes customizadas não-padrão
- ❌ Campos ocultos ou collapsed

---

### **2. Otimização para Impressão A4**

#### **Dimensões Exatas**
```tsx
<div className="
  max-w-[210mm]           // Largura A4
  min-h-[297mm]           // Altura A4
  print:max-w-none
  print:w-full
">
```

#### **Quebras de Página**
```tsx
// Evita quebra dentro de elementos
className="break-inside-avoid"

// Aplicado em:
- Seções completas (<section>)
- Cards de experiência (<div> de empresa)
- Blocos de skills (<div> de categoria)
- Projetos individuais
```

#### **Espaçamento Ajustado**
```tsx
// Tela
className="p-10"        // Mais espaçamento visual

// Impressão
className="print:p-8"   // Otimizado para caber em A4
```

#### **Cores de Impressão**
```tsx
// Header mantém fundo escuro
className="
  bg-slate-900
  print:bg-slate-900    // Forçado na impressão
"

// Sombras removidas
className="
  shadow-2xl
  print:shadow-none     // Economiza tinta
"
```

---

### **3. Performance**

#### **Carregamento de Biblioteca Externo**
```tsx
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  script.onload = () => setIsReady(true);
  document.body.appendChild(script);

  return () => {
    if (document.body.contains(script)) {
      document.body.removeChild(script);
    }
  };
}, []);
```

**Por quê:**
- ✅ Não bloqueia renderização inicial
- ✅ Cleanup automático
- ✅ Carregamento apenas quando necessário

#### **Otimização de Reflows**
- ✅ Sem mudanças de DOM após render inicial
- ✅ Estado mínimo (apenas `isReady`)
- ✅ Sem re-renders desnecessários

---

## 🎨 Design System

### **Palette de Cores**

#### **Cores Principais**
```css
/* Light Mode */
--background: #ffffff
--foreground: oklch(0.145 0 0)      /* Quase preto */
--primary: #030213                   /* Azul escuro */
--secondary: oklch(0.95 0.0058 264.53) /* Cinza claro */

/* Destaque */
--accent: #e9ebef                    /* Cinza médio */
--destructive: #d4183d               /* Vermelho */

/* Botões */
Botão PDF: bg-emerald-600            /* Verde */
Botão ATS: bg-slate-900              /* Escuro */
```

#### **Cores Semânticas (Currículo)**
```css
Header:         bg-slate-900    text-white
Body:           bg-white        text-slate-900
Cards:          bg-slate-50 / bg-white
Bordas:         border-slate-200
Bullets:        bg-slate-900 / bg-slate-400
```

### **Tipografia**

#### **Fonte Padrão**
```css
font-family: system-ui, -apple-system, sans-serif
font-size: 16px (base)
```

#### **Escala Tipográfica**
```tsx
<h1> text-4xl md:text-5xl font-bold  /* 36px → 48px */
<h2> text-xl font-bold               /* 20px */
<h3> text-lg font-bold               /* 18px */
<p>  text-base                        /* 16px */
<p>  text-sm                          /* 14px */
<p>  text-xs                          /* 12px */
```

#### **Pesos**
```css
font-light      /* 300 - Subtítulo no header */
font-normal     /* 400 - Corpo de texto */
font-medium     /* 500 - Labels, categorias */
font-semibold   /* 600 - Datas, badges */
font-bold       /* 700 - Títulos, nomes */
```

### **Espaçamento**

#### **Grid de Conteúdo**
```tsx
// Seções principais
className="mb-8"              /* 2rem entre seções */

// Cards de experiência
className="space-y-4"         /* 1rem entre cards */

// Dentro de listas
className="space-y-2"         /* 0.5rem entre itens */

// Padding interno
className="p-10 print:p-8"    /* 2.5rem → 2rem */
className="p-6"               /* 1.5rem */
className="p-5"               /* 1.25rem */
className="p-4"               /* 1rem */
```

### **Bordas e Sombras**

#### **Raio de Borda**
```css
--radius: 0.625rem              /* 10px */
rounded-full                    /* Botões circulares */
rounded-lg                      /* Cards */
rounded                         /* Badges */
```

#### **Sombras**
```tsx
// Documento principal
className="shadow-2xl print:shadow-none"

// Cards
className="shadow-sm print:shadow-none"

// Botões
className="shadow-xl"
```

### **Ícones**

**Biblioteca:** Lucide React

**Ícones utilizados:**
```tsx
import {
  Mail,          // Email
  Phone,         // Telefone
  MapPin,        // Localização
  Linkedin,      // LinkedIn
  Printer,       // Imprimir
  Download,      // Download PDF
  ExternalLink,  // Links externos
  FileDown,      // (importado, não usado)
} from "lucide-react";
```

**Tamanhos:**
```tsx
className="w-6 h-6"    // Botões (24px)
className="w-4 h-4"    // Contatos (16px)
className="w-3 h-3"    // External links (12px)
```

---

## 🔄 Processo de Desenvolvimento

### **Contexto: Limitações do Figma Make**

Este projeto foi **iniciado no Figma Make** (ambiente de desenvolvimento web integrado ao Figma), mas migrado para **GitHub** devido às **limitações de escrita/persistência** do ambiente.

#### **Figma Make - Características:**
- ✅ Prototipagem rápida de aplicações React
- ✅ Preview em tempo real
- ✅ Integração com componentes do Figma
- ❌ **Limitação:** Escrita inconsistente no filesystem
- ❌ **Limitação:** Sem controle de versão nativo
- ❌ **Limitação:** Dificuldade em manter arquivos grandes

#### **Solução Implementada:**
1. ✅ **Desenvolvimento inicial** no Figma Make
2. ✅ **Backup completo** em pasta `/resume` (medida de segurança temporária)
3. ✅ **Migração para GitHub** (`plgs2005/resume_figma`)
4. ✅ **Versionamento manual** via MCP (Model Context Protocol) do GitHub
5. ✅ **Refatoração estrutural** (20/02/2026) - Remoção de duplicações

---

### **Workflow de Desenvolvimento**

#### **1. Estrutura de Branches**
```bash
main              # Produção (versão estável)
├── develop       # Desenvolvimento ativo
└── feature/*     # Features específicas
```

#### **2. Convenção de Commits**

**Formato:**
```
<tipo>(<escopo>): <descrição curta>

<descrição detalhada (opcional)>

<breaking changes / notas (opcional)>
```

**Tipos:**
```
feat:      Nova funcionalidade
fix:       Correção de bug
docs:      Documentação
style:     Formatação, espaçamento (não afeta código)
refactor:  Refatoração de código
perf:      Melhoria de performance
test:      Adição/correção de testes
chore:     Tarefas de manutenção
```

**Exemplos:**
```bash
# Nova funcionalidade
git commit -m "feat(pdf): adiciona exportação PDF via html2pdf.js"

# Refatoração importante
git commit -m "refactor: remove pasta /resume e consolida estrutura na raiz"

# Documentação
git commit -m "docs(guidelines): cria Guidelines.md completo"

# Correção
git commit -m "fix(print): corrige quebra de página em seção de experiência"
```

#### **3. Processo de Atualização de Conteúdo**

**Para atualizar informações do currículo:**

1. **Editar `/App.tsx`**
```tsx
// Exemplo: Adicionar nova experiência profissional
<div className="bg-slate-50 p-6 rounded-lg...">
  <h3>Novo Cargo</h3>
  <p>Nova Empresa</p>
  <span>Período</span>
  <ul>
    <li>Responsabilidade 1</li>
    <li>Responsabilidade 2</li>
  </ul>
</div>
```

2. **Testar localmente**
```bash
# No Figma Make (preview automático)
# OU em ambiente local:
npm run dev
```

3. **Validar impressão e PDF**
- [ ] Testar exportação PDF Visual
- [ ] Testar exportação PDF ATS (Ctrl+P)
- [ ] Verificar quebras de página
- [ ] Validar responsividade mobile

4. **Commit e push**
```bash
git add App.tsx
git commit -m "feat(experience): adiciona experiência em [empresa]"
git push origin main
```

---

### **4. Checklist de Qualidade**

Antes de cada commit, validar:

**✅ Funcionalidade**
- [ ] Currículo renderiza corretamente
- [ ] Botão de PDF Visual funciona
- [ ] Botão de PDF ATS funciona
- [ ] Links de email/LinkedIn clicáveis

**✅ Design**
- [ ] Texto legível e hierarquia clara
- [ ] Espaçamento consistente
- [ ] Cores e estilos uniformes
- [ ] Responsivo em mobile/tablet/desktop

**✅ Impressão**
- [ ] Dimensões A4 respeitadas (210mm x 297mm)
- [ ] Quebras de página adequadas
- [ ] Sem elementos cortados
- [ ] Botões ocultos na impressão

**✅ ATS**
- [ ] Texto 100% selecionável
- [ ] Estrutura semântica (<h1>, <h2>, <section>)
- [ ] Palavras-chave presentes
- [ ] Sem tabelas complexas

**✅ Código**
- [ ] Sem erros TypeScript
- [ ] Imports organizados
- [ ] Comentários quando necessário
- [ ] Nomes descritivos

---

## 🤝 Guia de Contribuição

### **Como Contribuir**

#### **1. Issues e Melhorias**

**Criar uma Issue no GitHub:**
```markdown
**Título:** [FEAT] Adicionar seção de certificações

**Descrição:**
Adicionar nova seção "Certificações Profissionais" entre "Conhecimentos Técnicos" e "Experiência Profissional".

**Motivação:**
- Destaca credenciais importantes
- Melhora credibilidade do currículo
- Padrão em currículos tech

**Implementação Sugerida:**
- Nova <section> no App.tsx
- Lista de certificações com nome, instituição, data
- Ícone de badge do Lucide React
- Estilo consistente com outras seções
```

#### **2. Pull Requests**

**Processo:**
1. Fork do repositório
2. Criar branch feature: `git checkout -b feature/nome-da-feature`
3. Fazer alterações
4. Testar localmente
5. Commit: `git commit -m "feat: descrição"`
6. Push: `git push origin feature/nome-da-feature`
7. Criar Pull Request no GitHub

**Template de PR:**
```markdown
## Descrição
[Descrição clara do que foi alterado]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Testado localmente
- [ ] Validado impressão/PDF
- [ ] Sem erros TypeScript
- [ ] Código comentado quando necessário
- [ ] Guidelines.md atualizado (se aplicável)
```

---

### **Áreas de Melhoria Potenciais**

#### **🎯 Features Futuras**

1. **Internacionalização (i18n)**
   - Versão em inglês do currículo
   - Toggle de idioma PT/EN
   - Conteúdo separado em arquivos JSON

2. **Temas Customizáveis**
   - Paletas de cores alternativas
   - Modo escuro funcional para visualização
   - Configuração via UI

3. **Seções Adicionais**
   - Certificações profissionais
   - Publicações e artigos
   - Projetos open source
   - Palestras e eventos

4. **Analytics**
   - Tracking de downloads de PDF
   - Tempo de visualização
   - Clicks em links

5. **Formulário de Contato**
   - Integração com email
   - Validação de campos
   - Proteção anti-spam

6. **SEO**
   - Meta tags otimizadas
   - OpenGraph para social media
   - Schema.org markup

#### **🔧 Melhorias Técnicas**

1. **Testes Automatizados**
   - Unit tests (Jest + React Testing Library)
   - E2E tests (Playwright)
   - Snapshot testing para regressions

2. **CI/CD**
   - GitHub Actions para build
   - Deploy automático (Vercel/Netlify)
   - Validação de PRs

3. **Acessibilidade**
   - Auditoria WCAG 2.1 AA
   - Navegação por teclado
   - Screen reader testing

4. **Performance**
   - Lazy loading de bibliotecas
   - Code splitting
   - Lighthouse score 100

5. **Componentização**
   - Separar seções em componentes
   - `/components/resume/Header.tsx`
   - `/components/resume/Experience.tsx`
   - `/components/resume/Skills.tsx`

---

## 🔧 Comandos Úteis

### **No Figma Make**

```bash
# Preview automático (sem comandos necessários)
# Salvar: Automático
# Exportar: Botão "Download" na interface
```

### **Desenvolvimento Local (se migrar para ambiente local)**

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

### **Git/GitHub**

```bash
# Clonar repositório
git clone https://github.com/plgs2005/resume_figma.git

# Ver status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "tipo: descrição"

# Push
git push origin main

# Ver histórico
git log --oneline

# Ver diferenças
git diff

# Criar branch
git checkout -b feature/nome

# Mudar de branch
git checkout main

# Merge
git merge feature/nome
```

### **GitHub via MCP (Model Context Protocol)**

```bash
# Usado no Figma Make para interagir com GitHub
# Commits são feitos via assistente AI integrado
# Comandos manuais não necessários
```

---

## 📚 Recursos e Referências

### **Documentação Oficial**

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide React Icons](https://lucide.dev/)
- [html2pdf.js Documentation](https://github.com/eKoopmans/html2pdf.js)

### **Otimização ATS**

- [How ATS Works - Greenhouse](https://www.greenhouse.io/guidance/how-to-beat-the-ats)
- [ATS-Friendly Resume Tips](https://www.jobscan.co/blog/ats-resume/)
- [Resume Parsing Best Practices](https://www.lever.co/blog/resume-parsing-best-practices/)

### **Print CSS**

- [Print CSS Guide - Smashing Magazine](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)
- [A Guide to Print CSS](https://www.sitepoint.com/css-printer-friendly-pages/)

### **Tailwind Print Utilities**

- [Tailwind Print Variant Documentation](https://tailwindcss.com/docs/hover-focus-and-other-states#print-styles)

---

## 📝 Notas Finais

### **Filosofia do Projeto**

Este currículo foi desenvolvido com foco em **3 pilares fundamentais**:

1. **🎯 Funcionalidade sobre Complexidade**
   - Código simples e direto
   - Sem over-engineering
   - Manutenção facilitada

2. **📱 Acessibilidade e Compatibilidade**
   - ATS-friendly
   - Print-optimized
   - Responsive design
   - Semantic HTML

3. **✨ Profissionalismo Visual**
   - Design limpo e moderno
   - Tipografia cuidadosa
   - Hierarquia clara
   - Atenção aos detalhes

---

### **Changelog Importante**

#### **v2.0.0** - 20/02/2026
- **[BREAKING]** Refatoração estrutural completa
- **[REMOVED]** Pasta `/resume` deletada (duplicação eliminada)
- **[CHANGED]** `/App.tsx` agora contém código completo na raiz
- **[ADDED]** Guidelines.md completo criado
- **[FIXED]** Estrutura de arquivos simplificada

#### **v1.0.0** - Data Inicial
- Criação do currículo interativo
- Implementação de exportação PDF dupla
- Integração com Shadcn/ui
- Otimizações ATS e impressão A4

---

### **Contato e Suporte**

**Autor:** Pedro Lucas Gandara Santos  
**Email:** plgsantos@icloud.com  
**LinkedIn:** [linkedin.com/in/pedrolucassantos](https://linkedin.com/in/pedrolucassantos)  
**GitHub Repo:** [github.com/plgs2005/resume_figma](https://github.com/plgs2005/resume_figma)

---

### **Licenças**

Este projeto utiliza:

- **Shadcn/ui:** [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- **Unsplash (se aplicável):** [Unsplash License](https://unsplash.com/license)
- **Lucide React:** ISC License
- **html2pdf.js:** MIT License

**Código do projeto:** Propriedade de Pedro Lucas Gandara Santos

---

**📅 Última atualização:** 20 de Fevereiro de 2026  
**📄 Versão do documento:** 1.0.0
