# 🎨 Design System - Currículo Interativo

> **Referência visual completa de cores, tipografia, componentes e estilos**  
> Para designers e desenvolvedores que trabalham no projeto

---

## 📖 Índice

1. [Filosofia de Design](#-filosofia-de-design)
2. [Palette de Cores](#-palette-de-cores)
3. [Tipografia](#-tipografia)
4. [Espaçamento](#-espaçamento)
5. [Componentes](#-componentes)
6. [Ícones](#-ícones)
7. [Sombras e Elevação](#-sombras-e-elevação)
8. [Animações](#-animações)
9. [Responsividade](#-responsividade)
10. [Impressão](#-impressão)

---

## 💡 Filosofia de Design

### **Princípios Fundamentais**

#### **1. Profissionalismo**
- Design limpo e minimalista
- Hierarquia visual clara
- Tipografia legível
- Cores sóbrias e elegantes

#### **2. Funcionalidade**
- Conteúdo sobre decoração
- Texto facilmente selecionável
- Estrutura semântica HTML5
- Compatibilidade ATS prioritária

#### **3. Consistência**
- Sistema de espaçamento uniforme
- Palette de cores limitada
- Componentes reutilizáveis
- Padrões visuais previsíveis

#### **4. Acessibilidade**
- Contraste adequado (WCAG AA mínimo)
- Tamanhos de fonte legíveis
- Navegação por teclado
- Semântica HTML clara

---

## 🎨 Palette de Cores

### **Cores Principais**

#### **Base (Light Mode)**

```css
/* Background & Foreground */
--background: #ffffff;              /* rgb(255, 255, 255) */
--foreground: oklch(0.145 0 0);     /* Quase preto */

/* Primary (Azul escuro) */
--primary: #030213;                 /* rgb(3, 2, 19) */
--primary-foreground: #f0f0f0;      /* Texto sobre primary */

/* Secondary (Cinza claro) */
--secondary: oklch(0.95 0.0058 264.53);
--secondary-foreground: #0a0a0a;

/* Accent (Cinza médio) */
--accent: #e9ebef;                  /* rgb(233, 235, 239) */
--accent-foreground: #0a0a0a;

/* Destructive (Vermelho) */
--destructive: #d4183d;             /* rgb(212, 24, 61) */
--destructive-foreground: #fafafa;
```

#### **Cores Utilitárias**

```css
/* Muted (Cinza suave) */
--muted: oklch(0.95 0.0058 264.53);
--muted-foreground: oklch(0.44 0.0077 264.53);

/* Borders */
--border: oklch(0.88 0.0052 264.53);  /* Cinza claro */
--input: oklch(0.88 0.0052 264.53);

/* Ring (Focus) */
--ring: oklch(0.145 0 0);
```

---

### **Palette do Currículo**

#### **Slate (Cinza azulado) - Cor Principal**

```css
/* Slate Scale - Usado no currículo */
slate-50:   #f8fafc   /* Backgrounds suaves */
slate-100:  #f1f5f9
slate-200:  #e2e8f0   /* Bordas */
slate-400:  #94a3b8   /* Bullets secundários */
slate-700:  #334155   /* Texto secundário */
slate-900:  #0f172a   /* Header, bullets, títulos */
```

**Uso no currículo:**
- `bg-slate-900` - Header principal
- `bg-slate-50` - Cards de experiência
- `border-slate-200` - Bordas
- `text-slate-900` - Texto principal
- `text-slate-700` - Texto secundário
- `bg-slate-900` - Bullets principais
- `bg-slate-400` - Bullets secundários

#### **Emerald (Verde) - Ação Primária**

```css
/* Emerald Scale - Botão PDF */
emerald-600: #059669   /* Botão PDF principal */
emerald-700: #047857   /* Hover do botão PDF */
```

**Uso:**
- `bg-emerald-600 hover:bg-emerald-700` - Botão "Exportar PDF"

#### **White & Black - Base**

```css
white:  #ffffff   /* Background do documento */
black:  #000000   /* Texto escuro (raramente usado puro) */
```

---

### **Contraste e Acessibilidade**

| Combinação | Contraste | WCAG |
|------------|-----------|------|
| `text-slate-900` em `bg-white` | 18.5:1 | ✅ AAA |
| `text-slate-700` em `bg-white` | 10.8:1 | ✅ AAA |
| `text-white` em `bg-slate-900` | 17.2:1 | ✅ AAA |
| `text-white` em `bg-emerald-600` | 4.9:1 | ✅ AA |

---

### **Exemplos de Uso**

```tsx
{/* Header escuro */}
<header className="bg-slate-900 text-white">
  <h1>Nome</h1>
</header>

{/* Card de experiência */}
<div className="bg-slate-50 border border-slate-200">
  <h3 className="text-slate-900">Cargo</h3>
  <p className="text-slate-700">Descrição</p>
</div>

{/* Botão de ação */}
<button className="bg-emerald-600 hover:bg-emerald-700 text-white">
  Exportar PDF
</button>

{/* Bullet point */}
<span className="bg-slate-900 rounded-full w-1.5 h-1.5"></span>
```

---

## ✍️ Tipografia

### **Fonte Padrão**

```css
/* System Font Stack */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, 
             sans-serif;
```

**Por quê System Fonts:**
- ✅ Renderização nativa e otimizada
- ✅ Zero latência de carregamento
- ✅ Consistência com SO do usuário
- ✅ Melhor legibilidade
- ✅ Funciona em todos os navegadores

---

### **Escala Tipográfica**

#### **Headings (Títulos)**

```tsx
{/* h1 - Nome principal (Header) */}
<h1 className="text-4xl md:text-5xl font-bold">
  Pedro Lucas Gandara Santos
</h1>
// Mobile: 36px (2.25rem)
// Desktop: 48px (3rem)

{/* h2 - Títulos de seção */}
<h2 className="text-xl font-bold">
  Experiência Profissional
</h2>
// 20px (1.25rem)

{/* h3 - Subtítulos (Cargos, empresas) */}
<h3 className="text-lg font-bold">
  Tech Lead - API Specialist
</h3>
// 18px (1.125rem)
```

#### **Body Text (Corpo)**

```tsx
{/* Texto padrão */}
<p className="text-base">
  Descrição de responsabilidades...
</p>
// 16px (1rem)

{/* Texto secundário */}
<p className="text-sm text-slate-700">
  Informações adicionais...
</p>
// 14px (0.875rem)

{/* Texto pequeno (datas, labels) */}
<span className="text-xs text-slate-700">
  Jan 2023 - Dez 2024
</span>
// 12px (0.75rem)
```

---

### **Font Weights (Pesos)**

```css
/* Disponíveis no system font */
font-light:    300    /* Subtítulo no header */
font-normal:   400    /* Corpo de texto padrão */
font-medium:   500    /* Labels, categorias */
font-semibold: 600    /* Datas, badges, ênfase */
font-bold:     700    /* Títulos (h1, h2, h3) */
```

**Uso no currículo:**
```tsx
<h1 className="font-bold">Nome</h1>
<p className="font-light">Subtítulo</p>
<p className="font-normal">Corpo de texto</p>
<span className="font-semibold">Data</span>
<h3 className="font-medium">Categoria</h3>
```

---

### **Line Height (Altura de linha)**

```css
/* Tailwind defaults (já otimizados) */
text-xs:     line-height: 1rem    (16px)
text-sm:     line-height: 1.25rem (20px)
text-base:   line-height: 1.5rem  (24px)
text-lg:     line-height: 1.75rem (28px)
text-xl:     line-height: 1.75rem (28px)
text-4xl:    line-height: 2.5rem  (40px)
text-5xl:    line-height: 1       (48px)
```

**Customização quando necessário:**
```tsx
<p className="text-base leading-relaxed">  {/* 1.625 */}
<p className="text-base leading-loose">    {/* 2 */}
```

---

### **Letter Spacing (Espaçamento entre letras)**

```tsx
{/* Títulos grandes - ligeiramente mais apertado */}
<h1 className="tracking-tight">
  Nome Principal
</h1>

{/* Labels uppercase - mais espaçado */}
<span className="uppercase tracking-wide text-xs">
  Categoria
</span>

{/* Texto normal - spacing padrão (não especificado) */}
<p>Conteúdo do currículo...</p>
```

---

### **Exemplos Completos**

```tsx
{/* Header */}
<h1 className="text-4xl md:text-5xl font-bold tracking-tight">
  Pedro Lucas Gandara Santos
</h1>
<p className="text-xl md:text-2xl font-light mt-2">
  Tech Lead | API Specialist | Engenheiro Sênior
</p>

{/* Seção */}
<h2 className="text-xl font-bold mb-4">
  Conhecimentos Técnicos
</h2>

{/* Categoria de skills */}
<h3 className="text-sm font-medium text-slate-700 mb-3">
  Backend & API Management
</h3>

{/* Lista de skills */}
<ul className="text-base">
  <li>PHP (Laravel, Symfony)</li>
  <li>Node.js (Express, NestJS)</li>
</ul>

{/* Data/período */}
<span className="text-xs font-semibold text-slate-700">
  Jan 2023 - Presente
</span>
```

---

## 📏 Espaçamento

### **Sistema de Espaçamento (Tailwind Scale)**

```css
/* Tailwind spacing scale (baseado em 4px) */
0:    0px
0.5:  2px
1:    4px
1.5:  6px
2:    8px
2.5:  10px
3:    12px
4:    16px
5:    20px
6:    24px
8:    32px
10:   40px
12:   48px
16:   64px
20:   80px
```

---

### **Espaçamento no Currículo**

#### **Container Principal**

```tsx
<div className="
  max-w-[210mm]           /* Largura A4 */
  min-h-[297mm]           /* Altura A4 */
  p-10                    /* Padding: 40px (tela) */
  print:p-8               /* Padding: 32px (impressão) */
  mx-auto                 /* Centralizado */
">
```

#### **Entre Seções**

```tsx
{/* Espaçamento entre seções principais */}
<section className="mb-8">  {/* 32px */}
  <h2>Seção</h2>
  <div>Conteúdo...</div>
</section>
```

#### **Entre Cards/Items**

```tsx
{/* Lista de experiências profissionais */}
<div className="space-y-4">  {/* 16px entre cards */}
  <div className="bg-slate-50 p-6">  {/* 24px padding interno */}
    <h3>Cargo</h3>
    <p>Empresa</p>
  </div>
  <div className="bg-slate-50 p-6">
    <h3>Cargo</h3>
    <p>Empresa</p>
  </div>
</div>
```

#### **Entre Linhas de Lista**

```tsx
{/* Lista de responsabilidades */}
<ul className="space-y-2">  {/* 8px entre itens */}
  <li>Responsabilidade 1</li>
  <li>Responsabilidade 2</li>
  <li>Responsabilidade 3</li>
</ul>
```

#### **Margens de Títulos**

```tsx
{/* Título de seção */}
<h2 className="text-xl font-bold mb-4">  {/* 16px abaixo */}
  Experiência Profissional
</h2>

{/* Subtítulo/categoria */}
<h3 className="text-sm font-medium mb-3">  {/* 12px abaixo */}
  Backend & API Management
</h3>
```

---

### **Grid de Skills**

```tsx
{/* Grid responsivo de skills */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Mobile: 1 coluna, Desktop: 2 colunas */}
  {/* Gap: 24px entre items */}
  
  <div className="bg-slate-50 p-5 rounded-lg">
    {/* Padding interno: 20px */}
    <h3 className="mb-3">Categoria</h3>
    <ul className="space-y-2">Skills...</ul>
  </div>
</div>
```

---

### **Tabela de Referência Rápida**

| Uso | Classe | Valor | Contexto |
|-----|--------|-------|----------|
| **Container** | `p-10` | 40px | Padding do documento (tela) |
| **Container Print** | `print:p-8` | 32px | Padding do documento (impressão) |
| **Entre Seções** | `mb-8` | 32px | Espaço entre seções principais |
| **Entre Cards** | `space-y-4` | 16px | Cards de experiência |
| **Dentro de Card** | `p-6` | 24px | Padding interno de card |
| **Entre Itens de Lista** | `space-y-2` | 8px | Lista de responsabilidades |
| **Título → Conteúdo** | `mb-4` | 16px | H2 → conteúdo |
| **Subtítulo → Lista** | `mb-3` | 12px | H3 → lista de skills |

---

## 🧩 Componentes

### **Componentes Disponíveis (Shadcn/ui)**

Este projeto tem **47 componentes Shadcn/ui** disponíveis em `/components/ui/`.

#### **Lista Completa**

```
accordion.tsx           dialog.tsx              pagination.tsx
alert-dialog.tsx        drawer.tsx              popover.tsx
alert.tsx               dropdown-menu.tsx       progress.tsx
aspect-ratio.tsx        form.tsx                radio-group.tsx
avatar.tsx              hover-card.tsx          resizable.tsx
badge.tsx               input-otp.tsx           scroll-area.tsx
breadcrumb.tsx          input.tsx               select.tsx
button.tsx              label.tsx               separator.tsx
calendar.tsx            menubar.tsx             sheet.tsx
card.tsx                navigation-menu.tsx     sidebar.tsx
carousel.tsx            sonner.tsx              toggle.tsx
chart.tsx               skeleton.tsx            tooltip.tsx
checkbox.tsx            slider.tsx              use-mobile.ts
collapsible.tsx         switch.tsx              utils.ts
command.tsx             table.tsx
context-menu.tsx        tabs.tsx
                        textarea.tsx
                        toggle-group.tsx
```

**Nota:** Atualmente o currículo **não usa nenhum desses componentes diretamente**, mas estão disponíveis para futuras expansões.

---

### **Componentes Customizados do Currículo**

#### **1. Header**

```tsx
<header className="
  bg-slate-900         /* Fundo escuro */
  text-white           /* Texto branco */
  p-10                 /* Padding generoso */
  print:p-8            /* Reduz na impressão */
  print:bg-slate-900   /* Mantém escuro na impressão */
">
  {/* Nome */}
  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
    Pedro Lucas Gandara Santos
  </h1>
  
  {/* Cargo */}
  <p className="text-xl md:text-2xl font-light mt-2 mb-6">
    Tech Lead | API Specialist | Engenheiro Sênior
  </p>
  
  {/* Contatos */}
  <div className="flex flex-wrap gap-4 text-sm">
    <a href="mailto:email@example.com" className="flex items-center gap-2">
      <Mail className="w-4 h-4" />
      <span>email@example.com</span>
    </a>
    {/* Mais contatos... */}
  </div>
</header>
```

---

#### **2. Section (Seção)**

```tsx
<section className="mb-8">
  {/* Título da seção */}
  <h2 className="
    text-xl 
    font-bold 
    mb-4 
    pb-2 
    border-b-2 
    border-slate-900
  ">
    Experiência Profissional
  </h2>
  
  {/* Conteúdo */}
  <div className="space-y-4">
    {/* Cards de experiência... */}
  </div>
</section>
```

---

#### **3. Experience Card**

```tsx
<div className="
  bg-slate-50 
  p-6 
  rounded-lg 
  border 
  border-slate-200 
  print:shadow-none
">
  {/* Cargo */}
  <h3 className="text-lg font-bold text-slate-900">
    Tech Lead - API Specialist
  </h3>
  
  {/* Empresa e localização */}
  <p className="text-base text-slate-700 mb-2">
    Empresa XYZ • São Paulo, SP
  </p>
  
  {/* Período */}
  <span className="
    inline-block 
    px-3 
    py-1 
    bg-slate-900 
    text-white 
    text-xs 
    font-semibold 
    rounded 
    mb-4
  ">
    Jan 2023 - Presente
  </span>
  
  {/* Responsabilidades */}
  <ul className="space-y-2 text-sm">
    <li className="flex gap-3">
      <span className="bg-slate-900 rounded-full w-1.5 h-1.5 mt-2 flex-shrink-0"></span>
      <span>Responsabilidade 1</span>
    </li>
  </ul>
</div>
```

---

#### **4. Skills Grid**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Categoria de skill */}
  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
    {/* Título da categoria */}
    <h3 className="text-sm font-medium text-slate-700 mb-3">
      Backend & API Management
    </h3>
    
    {/* Lista de skills */}
    <ul className="space-y-2 text-sm">
      <li className="flex gap-3">
        <span className="bg-slate-900 rounded-full w-1.5 h-1.5 mt-2 flex-shrink-0"></span>
        <span>PHP (Laravel, Symfony)</span>
      </li>
      <li className="flex gap-3">
        <span className="bg-slate-400 rounded-full w-1.5 h-1.5 mt-2 flex-shrink-0"></span>
        <span>Node.js (Express, NestJS)</span>
      </li>
    </ul>
  </div>
</div>
```

---

#### **5. Floating Action Buttons**

```tsx
<div className="
  fixed 
  bottom-8 
  right-8 
  print:hidden 
  z-50 
  flex 
  flex-col 
  gap-3
">
  {/* Botão PDF Visual */}
  <button className="
    bg-emerald-600 
    hover:bg-emerald-700 
    text-white 
    px-6 
    py-3 
    rounded-full 
    shadow-xl 
    flex 
    items-center 
    gap-2 
    group 
    transition-all 
    duration-300
  ">
    <Download className="w-6 h-6" />
    <span className="
      max-w-0 
      overflow-hidden 
      group-hover:max-w-xs 
      transition-all 
      duration-300 
      whitespace-nowrap
    ">
      Exportar PDF
    </span>
  </button>
  
  {/* Botão PDF ATS */}
  <button className="
    bg-slate-900 
    hover:bg-slate-800 
    text-white 
    px-6 
    py-3 
    rounded-full 
    shadow-xl 
    flex 
    items-center 
    gap-2 
    transition-all 
    duration-300
  ">
    <Printer className="w-6 h-6" />
    <span>PDF para ATS (Ctrl+P)</span>
  </button>
</div>
```

---

## 🎯 Ícones

### **Biblioteca: Lucide React**

```bash
# Instalação (já incluído)
npm install lucide-react
```

### **Ícones Utilizados no Currículo**

```tsx
import {
  Mail,          // Email
  Phone,         // Telefone  
  MapPin,        // Localização
  Linkedin,      // LinkedIn
  Download,      // Download PDF
  Printer,       // Imprimir/PDF ATS
  ExternalLink,  // Links externos
  FileDown,      // (importado, não usado atualmente)
} from "lucide-react";
```

---

### **Tamanhos Padrão**

```tsx
{/* Pequeno - Contatos no header */}
<Mail className="w-4 h-4" />    // 16px

{/* Médio - Botões de ação */}
<Download className="w-6 h-6" />  // 24px

{/* Grande - (não usado atualmente) */}
<Icon className="w-8 h-8" />      // 32px
```

---

### **Exemplos de Uso**

```tsx
{/* Email com ícone */}
<a href="mailto:email@example.com" className="flex items-center gap-2">
  <Mail className="w-4 h-4" />
  <span>email@example.com</span>
</a>

{/* LinkedIn com ícone */}
<a href="https://linkedin.com/in/profile" className="flex items-center gap-2">
  <Linkedin className="w-4 h-4" />
  <span>LinkedIn</span>
</a>

{/* Botão com ícone */}
<button className="flex items-center gap-2">
  <Download className="w-6 h-6" />
  <span>Exportar PDF</span>
</button>

{/* Link externo com ícone pequeno */}
<a href="https://example.com" className="inline-flex items-center gap-1">
  <span>Ver projeto</span>
  <ExternalLink className="w-3 h-3" />
</a>
```

---

### **Customização de Cor**

```tsx
{/* Herda cor do texto */}
<Mail className="w-4 h-4" />

{/* Cor customizada */}
<Mail className="w-4 h-4 text-emerald-600" />

{/* Com estado hover */}
<button className="text-white hover:text-slate-200">
  <Mail className="w-4 h-4" />
</button>
```

---

## 🌑 Sombras e Elevação

### **Sombras do Tailwind**

```css
/* Usadas no currículo */
shadow-sm:    /* Cards de experiência (leve) */
shadow-xl:    /* Botões flutuantes */
shadow-2xl:   /* Container principal (apenas na tela) */

/* Impressão */
print:shadow-none  /* Remove todas as sombras */
```

---

### **Exemplos de Uso**

```tsx
{/* Container principal do currículo */}
<div className="
  shadow-2xl           /* Sombra grande na tela */
  print:shadow-none    /* Remove na impressão */
">

{/* Card de experiência */}
<div className="
  shadow-sm            /* Sombra sutil */
  print:shadow-none    /* Remove na impressão */
">

{/* Botão flutuante */}
<button className="shadow-xl">  {/* Sombra forte */}
  Exportar PDF
</button>
```

---

### **Elevação (Z-Index)**

```tsx
{/* Botões flutuantes - Sempre no topo */}
<div className="z-50">
  <button>Exportar PDF</button>
</div>

{/* Modais/Overlays (se usar no futuro) */}
<div className="z-40">Modal</div>

{/* Conteúdo normal */}
<div className="z-0">Currículo</div>
```

---

## ✨ Animações

### **Transições do Tailwind**

```tsx
{/* Transição padrão - Botões */}
<button className="
  transition-all       /* Anima todas as propriedades */
  duration-300         /* 300ms */
  hover:bg-emerald-700 /* Muda cor suavemente */
">

{/* Texto expansível no hover */}
<span className="
  max-w-0              /* Largura inicial: 0 */
  overflow-hidden      /* Oculta overflow */
  group-hover:max-w-xs /* Expande no hover do grupo */
  transition-all       /* Anima a mudança */
  duration-300         /* 300ms */
">
  Exportar PDF
</span>
```

---

### **Efeitos de Hover**

```tsx
{/* Botão com hover */}
<button className="
  bg-emerald-600 
  hover:bg-emerald-700    /* Escurece */
  hover:scale-105         /* Aumenta ligeiramente (se quiser) */
  transition-all 
  duration-300
">

{/* Link com hover */}
<a className="
  text-white 
  hover:text-slate-200    /* Clareia */
  transition-colors       /* Apenas cor */
  duration-200            /* Rápido */
">
```

---

### **Smooth Scroll (se aplicar)**

```css
/* No globals.css */
html {
  scroll-behavior: smooth;
}
```

---

## 📱 Responsividade

### **Breakpoints do Tailwind**

```css
/* Mobile First - Default sem prefixo */
(default):  0px     /* Mobile */
sm:         640px   /* Small tablets */
md:         768px   /* Tablets */
lg:         1024px  /* Laptops */
xl:         1280px  /* Desktops */
2xl:        1536px  /* Large desktops */
```

---

### **Responsividade no Currículo**

#### **Tipografia Responsiva**

```tsx
{/* Nome - Cresce em telas maiores */}
<h1 className="
  text-4xl           /* 36px no mobile */
  md:text-5xl        /* 48px no desktop (768px+) */
  font-bold
">

{/* Subtítulo */}
<p className="
  text-xl            /* 20px no mobile */
  md:text-2xl        /* 24px no desktop */
">
```

#### **Grid Responsivo**

```tsx
{/* Skills - 1 coluna no mobile, 2 no desktop */}
<div className="
  grid 
  grid-cols-1        /* 1 coluna (mobile) */
  md:grid-cols-2     /* 2 colunas (tablet+) */
  gap-6
">
```

#### **Espaçamento Responsivo**

```tsx
{/* Padding que se adapta */}
<div className="
  p-6                /* 24px (mobile) */
  md:p-10            /* 40px (tablet+) */
">

{/* Margin que se adapta */}
<div className="
  mb-4               /* 16px (mobile) */
  md:mb-8            /* 32px (tablet+) */
">
```

---

### **Mobile-First Approach**

```tsx
{/* Sempre comece com mobile, adicione md: para desktop */}

// ✅ CORRETO:
<div className="flex-col md:flex-row">  /* Coluna no mobile, linha no desktop */

// ❌ EVITE:
<div className="flex-row md:flex-col">  /* Confuso e não segue mobile-first */
```

---

## 🖨️ Impressão

### **Print Styles (Media Query)**

```css
/* No globals.css */
@media print {
  /* Suas customizações de impressão */
}
```

---

### **Print Variants do Tailwind**

```tsx
{/* Ocultar na impressão */}
<div className="print:hidden">
  <button>Exportar PDF</button>
</div>

{/* Mostrar apenas na impressão */}
<div className="hidden print:block">
  Texto apenas para impressão
</div>

{/* Ajustar espaçamento */}
<div className="p-10 print:p-8">
  {/* 40px na tela, 32px na impressão */}
</div>

{/* Remover sombra */}
<div className="shadow-2xl print:shadow-none">
  Documento
</div>

{/* Forçar cor na impressão */}
<header className="bg-slate-900 print:bg-slate-900">
  {/* Mantém fundo escuro */}
</header>

{/* Quebras de página */}
<div className="break-inside-avoid">
  {/* Evita quebra dentro deste elemento PEQUENO */}
</div>
```

---

### **Otimizações de Impressão A4**

#### **Dimensões Exatas**

```tsx
<div className="
  max-w-[210mm]           /* Largura A4 */
  min-h-[297mm]           /* Altura A4 */
  print:max-w-none        /* Remove limite na impressão */
  print:w-full            /* Ocupa largura total da página */
">
```

#### **Quebras de Página Inteligentes**

```tsx
{/* Evita quebra dentro de elementos PEQUENOS */}
<li className="break-inside-avoid">
<div className="break-inside-avoid"> {/* Ex: Card pequeno */}
<span className="break-inside-avoid">
```

#### **Cores Otimizadas**

```tsx
{/* Background claro (economiza tinta) */}
<div className="bg-slate-50 print:bg-white">

{/* Mantém apenas fundos escuros essenciais */}
<header className="bg-slate-900 print:bg-slate-900">
```

---

## 📚 Recursos Adicionais

### **Documentação do Projeto**
- [Guidelines Completo](Guidelines.md)
- [README Principal](../README.md)
- [Workflow de Desenvolvimento](DEVELOPMENT.md)
- [Changelog](../CHANGELOG.md)

### **Documentação Externa**
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [Lucide React Icons](https://lucide.dev/icons/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [OKLCH Color Picker](https://oklch.com/)
- [Contrast Checker (WebAIM)](https://webaim.org/resources/contrastchecker/)

---

## 👤 Contato

**Dúvidas sobre o design system?**

- 📧 Email: plgsantos@icloud.com
- 💼 LinkedIn: [linkedin.com/in/pedrolucassantos](https://linkedin.com/in/pedrolucassantos)
- 🐙 GitHub: [@plgs2005](https://github.com/plgs2005)

---

**📅 Última atualização:** 20 de Fevereiro de 2026  
**📄 Versão:** 1.0.0
