# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### 🔮 Planejado
- [ ] Versão em inglês (internacionalização i18n)
- [ ] Temas customizáveis (paletas de cores alternativas)
- [ ] Seção de certificações profissionais
- [ ] Modo escuro funcional para visualização
- [ ] Analytics de visualizações e downloads
- [ ] Testes automatizados (Jest + React Testing Library)
- [ ] CI/CD com GitHub Actions
- [ ] Deploy automático (Vercel/Netlify)

---

## [2.0.0] - 2026-02-20

### 🎉 **Refatoração Estrutural Completa**

Esta é uma **versão major** com mudanças significativas na estrutura do projeto.

### ✨ Added (Adicionado)
- ✅ **Guidelines.md completo** - Documentação técnica com 1000+ linhas
  - Decisões de arquitetura detalhadas
  - Padrões de código e naming conventions
  - Design system completo
  - Workflow de desenvolvimento
  - Guia de contribuição
  - Otimizações ATS e impressão
- ✅ **README.md profissional** - Vitrine do projeto no GitHub
  - Badges visuais (GitHub, React, TypeScript, Tailwind)
  - Funcionalidades destacadas
  - Instruções de uso completas
  - Tech stack detalhada
  - Guia de contribuição
- ✅ **CHANGELOG.md** - Este arquivo (histórico de versões)
- ✅ **DEVELOPMENT.md** - Workflow de desenvolvimento detalhado
- ✅ **DESIGN_SYSTEM.md** - Referência visual e UI
- ✅ Estrutura de documentação em `/guidelines/`

### 🔄 Changed (Modificado)
- ✅ **Estrutura de arquivos consolidada na raiz**
  - `/App.tsx` agora é o componente principal único
  - Todos os arquivos movidos de `/resume/` para raiz
  - Eliminação de duplicação de código
- ✅ **Organização de documentação**
  - Criada pasta `/guidelines/` para documentação técnica
  - Documentos principais na raiz (README, CHANGELOG)
- ✅ **Melhorias no Git workflow**
  - Convenções de commit padronizadas
  - Processo de PR documentado
  - Versionamento manual via MCP GitHub

### 🗑️ Removed (Removido)
- ✅ **Pasta `/resume/` completamente deletada**
  - Era duplicação desnecessária do código
  - Criada originalmente como backup de segurança no Figma Make
  - Após migração para GitHub, não era mais necessária
- ✅ Arquivos duplicados removidos:
  - `/resume/App.tsx` (duplicado)
  - `/resume/components/` (duplicado)
  - `/resume/styles/` (duplicado)

### 🐛 Fixed (Corrigido)
- ✅ Estrutura de imports simplificada
- ✅ Paths de arquivos corrigidos após consolidação
- ✅ Eliminação de confusão de estrutura flat vs. nested

### 📚 Documentation (Documentação)
- ✅ Guidelines.md criado com documentação completa
- ✅ README.md criado para apresentação no GitHub
- ✅ CHANGELOG.md criado para histórico de versões
- ✅ DEVELOPMENT.md criado para workflow
- ✅ DESIGN_SYSTEM.md criado para referência visual
- ✅ Comentários no código atualizados

### 🔧 Chore (Manutenção)
- ✅ Commits organizados no GitHub via MCP
- ✅ Mensagens de commit padronizadas
- ✅ Versionamento semântico implementado

---

## [1.0.0] - Data Inicial

### 🎉 **Lançamento Inicial**

Versão inicial do currículo interativo para Tech Lead/Engenheiro Sênior.

### ✨ Added (Adicionado)

#### **Funcionalidades Core**
- ✅ **Currículo interativo completo** em React + TypeScript
- ✅ **Exportação PDF dupla**:
  - PDF Visual (html2pdf.js) - Alta qualidade, preserva estilos
  - PDF para ATS (Print nativo) - Texto selecionável, compatível com ATS
- ✅ **Otimização para ATS** (Applicant Tracking Systems)
  - Estrutura semântica HTML5
  - Texto 100% selecionável
  - Hierarquia clara (h1, h2, h3)
  - Palavras-chave estratégicas
- ✅ **Otimização para impressão A4**
  - Dimensões exatas (210mm x 297mm)
  - Quebras de página inteligentes (`break-inside-avoid`)
  - Print styles do Tailwind CSS
  - Cores e espaçamento otimizados

#### **Design e UI**
- ✅ **Design responsivo** (Mobile, Tablet, Desktop)
- ✅ **Sistema de componentes Shadcn/ui**
  - 47 componentes disponíveis
  - Totalmente customizáveis
- ✅ **Biblioteca de ícones Lucide React**
  - Mail, Phone, MapPin, LinkedIn
  - Download, Printer, ExternalLink
- ✅ **Design System completo**
  - Palette de cores customizada (OKLCH color space)
  - Tipografia otimizada (system fonts)
  - Espaçamento consistente
  - Raio de borda padronizado

#### **Componentes**
- ✅ **Header** - Nome, cargo, contatos
- ✅ **Resumo Profissional** - Apresentação e foco
- ✅ **Conhecimentos Técnicos** - Skills categorizadas
  - Backend & API Management
  - Infraestrutura & DevOps
  - Frontend & Mobile
  - Metodologias & Soft Skills
- ✅ **Experiência Profissional** - Timeline de empresas
  - Cargos e períodos
  - Responsabilidades e conquistas
  - Projetos relevantes
- ✅ **Formação Acadêmica** - Educação formal

#### **UX e Interatividade**
- ✅ **Botões de ação flutuantes**
  - Exportar PDF Visual (verde)
  - PDF para ATS (escuro)
  - Texto expansível no hover
  - Sempre visíveis durante scroll
  - Ocultos na impressão
- ✅ **Links clicáveis**
  - Email (mailto:)
  - LinkedIn
  - URLs externas
- ✅ **Loading de biblioteca externa**
  - html2pdf.js carregado via CDN
  - Não bloqueia renderização inicial
  - Cleanup automático

#### **Tech Stack**
- ✅ React 18.x
- ✅ TypeScript 5.x
- ✅ Tailwind CSS v4.0
- ✅ Shadcn/ui (47 componentes)
- ✅ Lucide React (ícones)
- ✅ html2pdf.js 0.10.1

#### **Estrutura de Arquivos**
- ✅ `/App.tsx` - Componente principal
- ✅ `/components/ui/` - 47 componentes Shadcn/ui
- ✅ `/components/figma/ImageWithFallback.tsx`
- ✅ `/styles/globals.css` - Estilos globais + Tailwind config
- ✅ `/Attributions.md` - Licenças

#### **Otimizações Técnicas**
- ✅ **Performance**
  - Estado mínimo (apenas isReady)
  - Sem re-renders desnecessários
  - Carregamento assíncrono de bibliotecas
- ✅ **Acessibilidade**
  - Estrutura semântica
  - Hierarquia de headings
  - Texto alternativo
- ✅ **SEO-Ready**
  - Meta tags básicas
  - Estrutura semântica
  - Links otimizados

### 🔧 Technical Decisions (Decisões Técnicas)

#### **Arquitetura**
- ✅ Single Page Application (SPA)
- ✅ Component-Based Architecture
- ✅ Utility-First CSS (Tailwind v4)
- ✅ Estado local mínimo
- ✅ Estrutura flat na raiz (inicialmente com backup em `/resume`)

#### **Desenvolvimento**
- ✅ Desenvolvido no Figma Make
- ✅ Versionamento manual via GitHub MCP
- ✅ TypeScript para type safety
- ✅ Naming conventions padronizadas

---

## 📊 Tipos de Mudanças

Este changelog utiliza as seguintes categorias:

- **✨ Added** - Novas funcionalidades
- **🔄 Changed** - Mudanças em funcionalidades existentes
- **⚠️ Deprecated** - Funcionalidades que serão removidas
- **🗑️ Removed** - Funcionalidades removidas
- **🐛 Fixed** - Correções de bugs
- **🔒 Security** - Correções de segurança
- **📚 Documentation** - Mudanças na documentação
- **🔧 Chore** - Tarefas de manutenção

---

## 🔗 Links Úteis

- [Guidelines Completo](guidelines/Guidelines.md)
- [README Principal](README.md)
- [Workflow de Desenvolvimento](guidelines/DEVELOPMENT.md)
- [Design System](guidelines/DESIGN_SYSTEM.md)
- [Repositório GitHub](https://github.com/plgs2005/resume_figma)

---

## 🤝 Como Contribuir

Para entender como contribuir com mudanças documentadas:

1. Siga o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
2. Use [Semantic Versioning](https://semver.org/lang/pt-BR/)
3. Adicione mudanças em **[Unreleased]** primeiro
4. Mova para versão específica quando fazer release
5. Sempre inclua data no formato YYYY-MM-DD

### **Convenção de Versionamento**

```
MAJOR.MINOR.PATCH

MAJOR: Mudanças incompatíveis (breaking changes)
MINOR: Novas funcionalidades compatíveis
PATCH: Correções de bugs compatíveis
```

**Exemplos:**
- `1.0.0` → `2.0.0` - Breaking change (refatoração estrutural)
- `1.0.0` → `1.1.0` - Nova funcionalidade (adição de seção)
- `1.0.0` → `1.0.1` - Bug fix (correção de estilo)

---

## 👤 Mantenedor

**Pedro Lucas Gandara Santos**
- 📧 Email: plgsantos@icloud.com
- 💼 LinkedIn: [linkedin.com/in/pedrolucassantos](https://linkedin.com/in/pedrolucassantos)
- 🐙 GitHub: [@plgs2005](https://github.com/plgs2005)

---

**📅 Última atualização:** 20 de Fevereiro de 2026  
**🏷️ Versão atual:** 2.0.0
