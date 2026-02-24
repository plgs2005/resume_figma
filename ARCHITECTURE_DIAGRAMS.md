# 🏗️ Arquitetura de Imports - Diagrama Visual

## 📦 Como os Ícones São Carregados (Lucide React)

```
┌──────────────────────────────────────────────────────────┐
│                       App.tsx                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  import {                                                │
│    Mail,         ←─────┐                                │
│    Phone,        ←─────┤                                │
│    MapPin,       ←─────┤                                │
│    Linkedin,     ←─────┤  Importados de biblioteca NPM  │
│    Printer,      ←─────┤  (NÃO são assets SVG do Figma) │
│    Download,     ←─────┤                                │
│    ExternalLink  ←─────┘                                │
│  } from "lucide-react";                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
                            │
                            │ npm install lucide-react@^0.487.0
                            ▼
┌──────────────────────────────────────────────────────────┐
│                   node_modules/                          │
│                   lucide-react/                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📦 Biblioteca completa instalada:                       │
│                                                          │
│  ├── Mail.js          (componente React)                │
│  ├── Phone.js         (componente React)                │
│  ├── MapPin.js        (componente React)                │
│  ├── Linkedin.js      (componente React)                │
│  ├── Printer.js       (componente React)                │
│  ├── Download.js      (componente React)                │
│  ├── ExternalLink.js  (componente React)                │
│  └── ... +1000 outros ícones disponíveis                 │
│                                                          │
│  Cada ícone é um componente React que renderiza SVG     │
│                                                          │
└──────────────────────────────────────────────────────────┘
                            │
                            │ Usado no JSX
                            ▼
┌──────────────────────────────────────────────────────────┐
│                    Browser (Render)                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  <Mail className="w-4 h-4" />                            │
│  ↓                                                       │
│  <svg width="16" height="16" ...>                        │
│    <path d="M4 4h16v12H4z..." />                         │
│  </svg>                                                  │
│                                                          │
│  ✅ SVG inline no DOM (não é arquivo .svg externo)       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Fluxo de Estilos (Tailwind CSS v4)

```
┌──────────────────────────────────────────────────────────┐
│                     index.html                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  <head>                                                  │
│    <title>Currículo - Pedro Lucas...</title>            │
│    <!-- CSS será injetado aqui pelo Vite -->            │
│  </head>                                                 │
│  <body>                                                  │
│    <div id="root"></div>                                 │
│    <script src="/main.tsx"></script>  ←──────┐          │
│  </body>                                      │          │
│                                               │          │
└───────────────────────────────────────────────┼──────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────┐
│                       main.tsx                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  import React from "react";                              │
│  import ReactDOM from "react-dom/client";                │
│  import App from "./App";                                │
│  import "./styles/globals.css";  ←───────────┐          │
│                                               │          │
│  ReactDOM.createRoot(                         │          │
│    document.getElementById("root")!           │          │
│  ).render(<App />);                           │          │
│                                               │          │
└───────────────────────────────────────────────┼──────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────┐
│                  styles/globals.css                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  @import "tailwindcss";  ←───────────────────┐          │
│                                               │          │
│  :root {                                      │          │
│    --background: #ffffff;                     │          │
│    --foreground: oklch(0.145 0 0);            │          │
│    --radius: 0.625rem;                        │          │
│    /* ... 40+ design tokens */                │          │
│  }                                            │          │
│                                               │          │
│  @theme inline {                              │          │
│    --color-background: var(--background);     │          │
│    /* ... mapeia tokens para Tailwind */      │          │
│  }                                            │          │
│                                               │          │
│  @layer base {                                │          │
│    body {                                     │          │
│      @apply bg-background text-foreground;    │          │
│      -webkit-font-smoothing: antialiased;     │          │
│    }                                          │          │
│    h1 { font-size: var(--text-2xl); ... }     │          │
│    h2 { font-size: var(--text-xl); ... }      │          │
│  }                                            │          │
│                                               │          │
└───────────────────────────────────────────────┼──────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────┐
│                  @tailwindcss/vite                       │
│                  (Vite Plugin)                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Processa @import "tailwindcss"                       │
│  2. Lê todos os arquivos .tsx                            │
│  3. Extrai classes usadas:                               │
│     - bg-slate-100                                       │
│     - py-8                                               │
│     - text-white                                         │
│     - rounded-full                                       │
│     - ... (100+ classes)                                 │
│                                                          │
│  4. Gera CSS final otimizado (apenas classes usadas)     │
│                                                          │
│  5. Injeta no <head> do browser                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────┐
│                    Browser DOM                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  <head>                                                  │
│    <style data-vite-plugin-tailwindcss>                  │
│      .bg-slate-100 { background-color: #f1f5f9; }        │
│      .py-8 { padding-top: 2rem; padding-bottom: 2rem; }  │
│      .text-white { color: #ffffff; }                     │
│      .rounded-full { border-radius: 9999px; }            │
│      /* ... apenas as classes USADAS no código */        │
│    </style>                                              │
│  </head>                                                 │
│                                                          │
│  <body>                                                  │
│    <div id="root">                                       │
│      <div class="bg-slate-100 py-8">  ←── Estilizado!   │
│        <div class="bg-white shadow-2xl">                 │
│          <header class="bg-slate-900 text-white">        │
│            ...                                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Componentes (App.tsx → DOM)

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│                    (Componente React)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  export default function App() {                            │
│    const [isReady, setIsReady] = useState(false);          │
│                                                             │
│    useEffect(() => {                                        │
│      // Carrega html2pdf.js do CDN                          │
│    }, []);                                                  │
│                                                             │
│    return (                                                 │
│      <div className="bg-slate-100 py-8">                    │
│        <div id="resume-content">                            │
│          <header className="bg-slate-900 text-white">       │
│            <h1>Pedro Lucas Gandara Santos</h1>              │
│            ...                                              │
│          </header>                                          │
│          <main>                                             │
│            <section>Resumo Profissional</section>           │
│            <section>Conhecimentos Técnicos</section>        │
│            ...                                              │
│          </main>                                            │
│        </div>                                               │
│                                                             │
│        <button onClick={handleExportPDF}>                   │
│          <Download />                                       │
│          Exportar PDF                                       │
│        </button>                                            │
│      </div>                                                 │
│    );                                                       │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ React.render()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Virtual DOM                            │
│                   (React Reconciliation)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React compara Virtual DOM com DOM real                     │
│  e faz updates mínimos e eficientes                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ ReactDOM.createRoot()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Browser DOM                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  <div id="root">                                            │
│    <div class="min-h-screen bg-slate-100 py-8">            │
│      <!-- Action Buttons (fixed bottom-right) -->          │
│      <div class="fixed bottom-8 right-8 z-50">             │
│        <button class="bg-emerald-600 rounded-full">         │
│          <svg>...</svg> <!-- Download icon -->             │
│          <span>Exportar PDF</span>                          │
│        </button>                                            │
│        <button class="bg-slate-900 rounded-full">           │
│          <svg>...</svg> <!-- Printer icon -->              │
│          <span>PDF para ATS (Ctrl+P)</span>                 │
│        </button>                                            │
│      </div>                                                 │
│                                                             │
│      <!-- Resume Content -->                                │
│      <div id="resume-content" class="max-w-[210mm]">       │
│        <header class="bg-slate-900 text-white p-10">        │
│          <h1 class="text-5xl font-bold">                    │
│            Pedro Lucas Gandara Santos                       │
│          </h1>                                              │
│          <p class="text-xl text-slate-300">                 │
│            Líder Técnico | Eng. FullStack Sr. | ...        │
│          </p>                                               │
│          <div class="mt-8 flex gap-6 text-sm">              │
│            <a href="mailto:plgsantos@icloud.com">           │
│              <svg>...</svg> <!-- Mail icon -->             │
│              plgsantos@icloud.com                           │
│            </a>                                             │
│            ...                                              │
│          </div>                                             │
│        </header>                                            │
│                                                             │
│        <main class="p-10">                                  │
│          <section class="mb-8">                             │
│            <h2 class="text-xl font-bold border-b-2">        │
│              Resumo Profissional                            │
│            </h2>                                            │
│            <p>Desenvolvedor Sênior de APIs...</p>           │
│          </section>                                         │
│          ...                                                │
│        </main>                                              │
│      </div>                                                 │
│    </div>                                                   │
│  </div>                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Dependências NPM (package.json)

```
┌───────────────────────────────────────────────────────────┐
│                      package.json                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  "dependencies": {                                        │
│    ┌─────────────────────────────────────────────────┐   │
│    │  CORE (Framework Base)                          │   │
│    ├─────────────────────────────────────────────────┤   │
│    │  "react": "^18.3.1"                             │   │
│    │  "react-dom": "^18.3.1"                         │   │
│    └─────────────────────────────────────────────────┘   │
│                                                           │
│    ┌─────────────────────────────────────────────────┐   │
│    │  UI LIBRARY (Ícones)                            │   │
│    ├─────────────────────────────────────────────────┤   │
│    │  "lucide-react": "^0.487.0"  ← USADO NO APP!   │   │
│    └─────────────────────────────────────────────────┘   │
│                                                           │
│    ┌─────────────────────────────────────────────────┐   │
│    │  SHADCN/UI (Componentes - 47 no total)         │   │
│    ├─────────────────────────────────────────────────┤   │
│    │  "@radix-ui/react-accordion": "^1.2.3"          │   │
│    │  "@radix-ui/react-alert-dialog": "^1.1.6"       │   │
│    │  "@radix-ui/react-avatar": "^1.1.3"             │   │
│    │  "@radix-ui/react-checkbox": "^1.1.4"           │   │
│    │  "@radix-ui/react-dialog": "^1.1.6"             │   │
│    │  "@radix-ui/react-dropdown-menu": "^2.1.6"      │   │
│    │  "@radix-ui/react-popover": "^1.1.6"            │   │
│    │  "@radix-ui/react-select": "^2.1.6"             │   │
│    │  "@radix-ui/react-separator": "^1.1.2"          │   │
│    │  "@radix-ui/react-slider": "^1.2.3"             │   │
│    │  "@radix-ui/react-switch": "^1.1.3"             │   │
│    │  "@radix-ui/react-tabs": "^1.1.3"               │   │
│    │  "@radix-ui/react-tooltip": "^1.1.8"            │   │
│    │  ... (+ 8 outros pacotes Radix UI)              │   │
│    │                                                  │   │
│    │  "class-variance-authority": "^0.7.1"           │   │
│    │  "clsx": "^2.1.1"                               │   │
│    │  "tailwind-merge": "^2.6.0"                     │   │
│    └─────────────────────────────────────────────────┘   │
│                                                           │
│    ┌─────────────────────────────────────────────────┐   │
│    │  UTILITIES (Auxiliares Shadcn/ui)               │   │
│    ├─────────────────────────────────────────────────┤   │
│    │  "cmdk": "^1.1.1"                               │   │
│    │  "date-fns": "^3.6.0"                           │   │
│    │  "embla-carousel-react": "^8.6.0"               │   │
│    │  "input-otp": "^1.4.2"                          │   │
│    │  "next-themes": "^0.4.6"                        │   │
│    │  "react-day-picker": "^8.10.1"                  │   │
│    │  "react-hook-form": "^7.55.0"                   │   │
│    │  "react-resizable-panels": "^2.1.7"             │   │
│    │  "recharts": "^2.15.2"                          │   │
│    │  "sonner": "^2.0.3"                             │   │
│    │  "vaul": "^1.1.2"                               │   │
│    └─────────────────────────────────────────────────┘   │
│  },                                                       │
│                                                           │
│  "devDependencies": {                                     │
│    ┌─────────────────────────────────────────────────┐   │
│    │  BUILD TOOLS (Desenvolvimento)                  │   │
│    ├─────────────────────────────────────────────────┤   │
│    │  "@tailwindcss/vite": "^4.0.0"  ← CRÍTICO!     │   │
│    │  "tailwindcss": "^4.0.0"        ← CRÍTICO!     │   │
│    │  "@vitejs/plugin-react": "^4.3.4"               │   │
│    │  "vite": "^6.0.7"               ← CRÍTICO!     │   │
│    │  "typescript": "^5.7.3"         ← CRÍTICO!     │   │
│    │  "@types/react": "^18.3.18"                     │   │
│    │  "@types/react-dom": "^18.3.5"                  │   │
│    └─────────────────────────────────────────────────┘   │
│  }                                                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
                              │
                              │ npm install
                              ▼
┌───────────────────────────────────────────────────────────┐
│                   node_modules/                           │
│              (~300 MB após instalação)                    │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  📦 Pacotes instalados:                                   │
│     - react/                                              │
│     - react-dom/                                          │
│     - lucide-react/        ← 7 ícones usados no app       │
│     - @radix-ui/           ← 47 componentes (não usados)  │
│     - tailwindcss/         ← Framework CSS                │
│     - vite/                ← Build tool                   │
│     - typescript/          ← Compiler                     │
│     - ... (+ ~200 dependências transitivas)               │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Análise de Uso Real:

| Categoria | Instalado | Usado no App | Taxa de Uso |
|-----------|-----------|--------------|-------------|
| **React Core** | 2 pacotes | 2 pacotes (100%) | ✅ 100% |
| **Lucide Icons** | 1000+ ícones | 7 ícones | ⚠️ 0.7% |
| **Shadcn/ui Components** | 47 componentes | 0 componentes | ❌ 0% |
| **Radix UI (base)** | 12 pacotes | 0 pacotes | ❌ 0% |
| **Tailwind CSS** | 1 pacote | 1 pacote (100%) | ✅ 100% |
| **Build Tools** | 5 pacotes | 5 pacotes (100%) | ✅ 100% |

**Nota:** Shadcn/ui e Radix UI estão instalados para **futuras expansões**, mas o currículo atual é puro HTML+CSS+React sem usar esses componentes.

---

## 🔌 HTML2PDF.js (Carregamento Dinâmico)

```
┌─────────────────────────────────────────────────────────┐
│                   App.tsx - useEffect                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  useEffect(() => {                                      │
│    const script = document.createElement("script");    │
│    script.src = "https://cdnjs.cloudflare.com/...";    │
│    script.onload = () => setIsReady(true);             │
│    document.body.appendChild(script);                  │
│  }, []);                                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────┐
│              CDN (CloudFlare)                           │
│   cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📦 html2pdf.bundle.min.js (~200 KB)                    │
│                                                         │
│  Inclui:                                                │
│  - html2canvas (converte HTML → Canvas)                 │
│  - jsPDF (gera PDF)                                     │
│  - html2pdf (orquestra conversão)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Download
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Browser - window                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  window.html2pdf = function() { ... }                   │
│                                                         │
│  ✅ Biblioteca disponível globalmente                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Usuário clica "Exportar PDF"
                           ▼
┌─────────────────────────────────────────────────────────┐
│              handleExportPDF() - App.tsx                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  const element = document.getElementById("resume");     │
│  window.html2pdf()                                      │
│    .set({                                               │
│      margin: 0,                                         │
│      filename: "Curriculo_Pedro_Lucas.pdf",             │
│      image: { type: "jpeg", quality: 0.98 },            │
│      html2canvas: { scale: 2, ... },                    │
│      jsPDF: { unit: "mm", format: "a4" }                │
│    })                                                   │
│    .from(element)                                       │
│    .save();                                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Conversão
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Processo de Geração PDF                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. html2canvas:                                        │
│     - Lê DOM do #resume-content                         │
│     - Renderiza como Canvas (rasterização)              │
│     - Escala 2x (alta resolução)                        │
│                                                         │
│  2. Conversão Canvas → JPEG:                            │
│     - Quality: 98%                                      │
│     - Compressão mínima                                 │
│                                                         │
│  3. jsPDF:                                              │
│     - Cria documento PDF A4 (210mm × 297mm)             │
│     - Insere imagem JPEG                                │
│     - Respeita margens e quebras de página              │
│                                                         │
│  4. Download:                                           │
│     - Gera Blob                                         │
│     - Cria link temporário                              │
│     - Aciona download do browser                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Save
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Curriculo_Pedro_Lucas_Gandara_Santos.pdf      │
│                    (Arquivo Final)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ PDF Visual (alta qualidade)                         │
│  ✅ Preserva 100% dos estilos CSS                       │
│  ⚠️ Texto parcialmente selecionável (é imagem JPEG)     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🖨️ Impressão ATS (window.print)

```
┌─────────────────────────────────────────────────────────┐
│            Usuário clica "PDF para ATS"                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  onClick={() => window.print()}                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Abre diálogo nativo
                           ▼
┌─────────────────────────────────────────────────────────┐
│            Browser Print Dialog (Ctrl+P)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Destino:  [Salvar como PDF] ▼                          │
│  Layout:   [Retrato] ▼                                  │
│  Páginas:  [Todas]                                      │
│  Margens:  [Padrão]                                     │
│                                                         │
│  [ Preview ]     [ Cancelar ]     [ Salvar ]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Aplica print media query
                           ▼
┌─────────────────────────────────────────────────────────┐
│               Tailwind Print Styles                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  @media print {                                         │
│    .print\:hidden { display: none !important; }         │
│    .print\:p-8 { padding: 2rem !important; }            │
│    .print\:shadow-none { box-shadow: none; }            │
│    .print\:bg-slate-900 { background: #0f172a; }        │
│    .print\:max-w-none { max-width: none; }              │
│    .print\:w-full { width: 100%; }                      │
│  }                                                      │
│                                                         │
│  ✅ Esconde botões flutuantes                           │
│  ✅ Remove sombras (economiza tinta)                    │
│  ✅ Ajusta espaçamento para caber em A4                 │
│  ✅ Mantém header escuro                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Renderiza para PDF
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  PDF Gerado (ATS)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Texto 100% selecionável                             │
│  ✅ Estrutura semântica preservada                      │
│  ✅ Compatível com parsing de ATS                       │
│  ✅ Formato A4 (210mm × 297mm)                          │
│  ⚠️ Pode perder alguns estilos visuais complexos        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura Final de Arquivos

```
resume_figma/
│
├── 📄 index.html                    ← Entry point HTML
├── 📄 main.tsx                      ← Bootstrap React
├── 📄 App.tsx                       ← ⭐ Componente principal
│
├── 📦 package.json                  ← Dependencies
├── 📦 package-lock.json             ← Lock de versões
│
├── ⚙️ vite.config.ts                ← Configuração Vite
├── ⚙️ tsconfig.json                 ← TypeScript base
├── ⚙️ tsconfig.app.json             ← TS app config
├── ⚙️ tsconfig.node.json            ← TS node config
├── ⚙️ vite-env.d.ts                 ← Vite types
│
├── 🎨 styles/
│   └── globals.css                  ← ⭐ Tailwind v4 + design tokens
│
├── 🧩 components/
│   ├── ui/                          ← 47 componentes Shadcn/ui
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── utils.ts                 ← cn() helper
│   │   └── ...
│   │
│   └── figma/
│       └── ImageWithFallback.tsx    ← Componente imagem (não usado)
│
├── 📜 scripts/
│   └── fix-figma-imports.sh         ← ⭐ Corrige imports versionados
│
├── 📚 guidelines/
│   ├── Guidelines.md                ← ⭐ Documentação completa (10k+ palavras)
│   ├── DESIGN_SYSTEM.md
│   └── DEVELOPMENT.md
│
├── 📄 SETUP_LOCAL.md                ← ⭐ Este guia
├── 📄 MAKE_VS_LOCAL.md              ← Comparação Make vs Local
│
├── 📄 README.md
├── 📄 CHANGELOG.md
├── 📄 Attributions.md
│
├── 🚫 .gitignore
│
└── 📦 node_modules/                 ← Criado após npm install
    ├── react/
    ├── lucide-react/
    ├── tailwindcss/
    ├── vite/
    └── ... (~200 pacotes)
```

---

**🎯 Resumo: Todos os ícones são Lucide React (NPM), não há assets SVG do Figma, o CSS é 100% Tailwind v4 carregado via globals.css, e a estrutura é completamente auto-suficiente após `npm install`.**
