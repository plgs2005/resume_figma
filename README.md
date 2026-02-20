# 📄 Currículo Interativo - Tech Lead

> **Currículo digital profissional e interativo para posições de Tech Lead e Engenheiro de Software Sênior**  
> Desenvolvido com React, TypeScript e Tailwind CSS v4

[![GitHub](https://img.shields.io/badge/GitHub-plgs2005%2Fresume__figma-blue?logo=github)](https://github.com/plgs2005/resume_figma)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 **Visão Geral**

Currículo digital interativo com foco em **experiência profissional**, otimizado para:

- ✅ **Compatibilidade ATS** (Applicant Tracking Systems)
- ✅ **Impressão A4 perfeita** (210mm x 297mm)
- ✅ **Exportação PDF dupla** (Visual + ATS-friendly)
- ✅ **Design responsivo** (Mobile, Tablet, Desktop)
- ✅ **Performance otimizada**

---

## ✨ **Funcionalidades Principais**

### **📥 Exportação PDF Dupla**

#### **1. PDF Visual (Alta Qualidade)**
- ✅ Preserva 100% dos estilos CSS
- ✅ Qualidade JPEG 98%
- ✅ Formato A4 perfeito
- 🎯 **Para:** Envio direto a recrutadores

#### **2. PDF para ATS (Compatível com Sistemas)**
- ✅ Texto 100% selecionável
- ✅ Estrutura semântica preservada
- ✅ Compatível com Greenhouse, Lever, Workday, etc.
- 🎯 **Para:** Submissão em portais de emprego

### **🖨️ Impressão Otimizada**
- Dimensões A4 exatas (210mm x 297mm)
- Quebras de página inteligentes
- Otimização de cores e espaçamento
- Botões ocultos automaticamente na impressão

### **📱 Design Responsivo**
- Layout adaptável para mobile, tablet e desktop
- Tipografia escalável
- Hierarquia visual clara

---

## 🛠️ **Tech Stack**

### **Core**
- **React** 18.x - Framework UI
- **TypeScript** 5.x - Type safety
- **Tailwind CSS** v4.0 - Estilização utility-first

### **UI & Icons**
- **Shadcn/ui** - Sistema de componentes (47 componentes)
- **Lucide React** - Biblioteca de ícones moderna

### **Funcionalidades**
- **html2pdf.js** 0.10.1 - Exportação PDF visual
- **Print API** (Navegador) - Exportação PDF ATS

---

## 📁 **Estrutura do Projeto**

```
/
├── App.tsx                    # Componente principal do currículo
├── Attributions.md            # Licenças e atribuições
├── README.md                  # Este arquivo
│
├── components/
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/                    # 47 componentes Shadcn/ui
│
├── guidelines/
│   └── Guidelines.md          # Documentação completa (1000+ linhas)
│
└── styles/
    └── globals.css            # Estilos globais + Tailwind config
```

---

## 📚 **Documentação**

### **📖 Documentação Completa**
- **[Guidelines.md](guidelines/Guidelines.md)** - Documentação técnica completa
  - Decisões de arquitetura
  - Padrões de código
  - Design system
  - Workflow de desenvolvimento
  - Guia de contribuição

### **🎨 Design System**
- **Cores:** Custom palette com OKLCH color space
- **Tipografia:** System fonts com escala otimizada
- **Componentes:** 47 componentes Shadcn/ui disponíveis
- **Ícones:** Lucide React

### **⚙️ Otimizações**

#### **Para ATS (Applicant Tracking Systems)**
- ✅ Estrutura semântica HTML5
- ✅ Hierarquia clara (h1, h2, h3)
- ✅ Texto 100% selecionável
- ✅ Palavras-chave estratégicas
- ✅ Links clicáveis

#### **Para Impressão A4**
- ✅ Dimensões exatas (210mm x 297mm)
- ✅ Quebras de página (`break-inside-avoid`)
- ✅ Espaçamento ajustado para impressão
- ✅ Print styles do Tailwind (`print:`)

---

## 🚀 **Como Usar**

### **Visualização Web**
1. Acesse o projeto no Figma Make ou ambiente local
2. Navegue pelo currículo interativo
3. Links de email e LinkedIn são clicáveis

### **Exportação PDF Visual**
1. Clique no botão verde **"Exportar PDF"** (canto inferior direito)
2. Aguarde o download automático
3. Arquivo: `Curriculo_Pedro_Lucas_Gandara_Santos.pdf`

### **Exportação PDF para ATS**
1. Clique no botão escuro **"PDF para ATS (Ctrl+P)"**
2. Ou pressione `Ctrl+P` (Windows) / `Cmd+P` (Mac)
3. Selecione "Salvar como PDF" no diálogo de impressão
4. Texto 100% selecionável e parseável por ATS

---

## 🔧 **Desenvolvimento Local** (Opcional)

```bash
# Clonar repositório
git clone https://github.com/plgs2005/resume_figma.git

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

---

## 📝 **Padrões de Código**

### **Naming Conventions**
```tsx
// Componentes: PascalCase
export default function App() { }

// Funções: camelCase
const handleExportPDF = () => { }

// Arquivos: kebab-case ou PascalCase
alert-dialog.tsx, ImageWithFallback.tsx
```

### **Estrutura de Componentes**
```tsx
// 1. Imports
import React, { useState } from "react";

// 2. Component
export default function Component() {
  // State
  const [state, setState] = useState();
  
  // Handlers
  const handleClick = () => { };
  
  // Render
  return <div>...</div>;
}
```

---

## 📊 **Changelog**

### **v2.0.0** - 20/02/2026
- ✅ Refatoração estrutural completa
- ✅ Remoção de pasta `/resume` duplicada
- ✅ Criação de Guidelines.md completo
- ✅ Estrutura consolidada na raiz

### **v1.0.0** - Data Inicial
- ✅ Criação do currículo interativo
- ✅ Exportação PDF dupla (Visual + ATS)
- ✅ Integração com Shadcn/ui
- ✅ Otimizações ATS e impressão A4

---

## 🤝 **Como Contribuir**

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch feature: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

### **Convenção de Commits**
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação
refactor: Refatoração
perf:     Performance
test:     Testes
chore:    Manutenção
```

---

## 📄 **Licenças**

### **Código do Projeto**
Propriedade de Pedro Lucas Gandara Santos

### **Bibliotecas de Terceiros**
- **Shadcn/ui** - [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- **Lucide React** - ISC License
- **html2pdf.js** - MIT License

Ver [Attributions.md](Attributions.md) para detalhes completos.

---

## 👤 **Autor**

**Pedro Lucas Gandara Santos**

- 📧 Email: [plgsantos@icloud.com](mailto:plgsantos@icloud.com)
- 💼 LinkedIn: [linkedin.com/in/pedrolucassantos](https://linkedin.com/in/pedrolucassantos)
- 🐙 GitHub: [@plgs2005](https://github.com/plgs2005)
- 📂 Repositório: [plgs2005/resume_figma](https://github.com/plgs2005/resume_figma)

---

## 🎯 **Objetivos do Projeto**

Este currículo foi desenvolvido com 3 pilares:

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

## 🌟 **Features Futuras** (Roadmap)

- [ ] Versão em inglês (i18n)
- [ ] Temas customizáveis
- [ ] Seção de certificações
- [ ] Analytics de visualizações
- [ ] Modo escuro funcional
- [ ] Testes automatizados
- [ ] CI/CD com GitHub Actions
- [ ] Deploy automático (Vercel/Netlify)

---

## 📞 **Suporte**

Encontrou um bug ou tem uma sugestão? 

- 🐛 [Abrir Issue](https://github.com/plgs2005/resume_figma/issues)
- 💡 [Discussões](https://github.com/plgs2005/resume_figma/discussions)
- 📧 [Email direto](mailto:plgsantos@icloud.com)

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub! ⭐**

[![Star on GitHub](https://img.shields.io/github/stars/plgs2005/resume_figma?style=social)](https://github.com/plgs2005/resume_figma)

</div>

---

**📅 Última atualização:** 20 de Fevereiro de 2026  
**🏷️ Versão:** 2.0.0
