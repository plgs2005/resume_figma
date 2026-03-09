# 🔧 Development Guide - Currículo Interativo

> **Guia completo de desenvolvimento, Git workflow e boas práticas**  
> Para desenvolvedores que contribuem ou mantêm o projeto

---

## 📖 Índice

1. [Setup do Ambiente](#-setup-do-ambiente)
2. [Comandos de Desenvolvimento](#-comandos-de-desenvolvimento)
3. [Git Workflow](#-git-workflow)
4. [Convenções de Commit](#-convenções-de-commit)
5. [Processo de Pull Request](#-processo-de-pull-request)
6. [Estrutura de Branches](#-estrutura-de-branches)
7. [Debugging](#-debugging)
8. [Testing](#-testing)
9. [Deploy](#-deploy)
10. [Troubleshooting](#-troubleshooting)

---

## 🚀 Setup do Ambiente

### **Pré-requisitos**

```bash
# Versões recomendadas:
Node.js:   v18.x ou superior
npm:       v9.x ou superior
Git:       v2.x ou superior
```

### **Ambiente: Figma Make**

Este projeto foi desenvolvido no **Figma Make** (ambiente de desenvolvimento web integrado):

**Características:**
- ✅ Preview em tempo real
- ✅ Sem necessidade de setup local
- ✅ Integração com GitHub via MCP
- ⚠️ **Limitação:** Escrita inconsistente no filesystem
- ⚠️ **Limitação:** Sem controle de versão nativo

**Como trabalhar:**
1. Acesse o projeto no Figma Make
2. Edite arquivos diretamente no editor
3. Preview automático das mudanças
4. Use MCP GitHub para commits (veja seção [Git Workflow](#-git-workflow))

---

### **Ambiente: Local (Opcional)**

Se preferir desenvolver localmente:

```bash
# 1. Clonar repositório
git clone https://github.com/plgs2005/resume_figma.git
cd resume_figma

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:5173 (ou porta indicada)
```

### **IDE Recomendada (Local)**

**Visual Studio Code** com extensões:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

**Configuração VSCode:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## ⚡ Comandos de Desenvolvimento

### **No Figma Make**

```bash
# Preview automático (sem comandos necessários)
# As mudanças são refletidas instantaneamente

# Salvar arquivos:
# Automático a cada edição

# Exportar projeto:
# Botão "Download" na interface do Figma Make
```

---

### **Desenvolvimento Local (se aplicável)**

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build de produção
npm run preview

# Linting (verificar erros)
npm run lint

# Linting com correção automática
npm run lint:fix

# Type checking (TypeScript)
npm run type-check

# Formatar código com Prettier
npm run format
```

---

## 🌿 Git Workflow

### **Contexto: GitHub via MCP**

Este projeto usa **MCP (Model Context Protocol)** para interagir com GitHub diretamente do Figma Make.

**Como funciona:**
1. Edite arquivos no Figma Make
2. Use assistente AI para criar commits via MCP
3. Commits vão direto para o repositório GitHub
4. Sem necessidade de `git push` manual

---

### **Workflow Padrão**

#### **1. Desenvolvimento de Features**

```bash
# Opção A: Figma Make (Recomendado para este projeto)
1. Edite arquivos no Figma Make
2. Use MCP GitHub para commit:
   - Mensagem: "feat(scope): descrição"
   - Selecione arquivos alterados
   - Confirm commit

# Opção B: Ambiente Local
1. Crie branch feature:
   git checkout -b feature/nome-da-feature

2. Faça suas alterações

3. Stage arquivos:
   git add .

4. Commit:
   git commit -m "feat(scope): descrição"

5. Push:
   git push origin feature/nome-da-feature

6. Crie Pull Request no GitHub
```

#### **2. Correções de Bugs**

```bash
# Mesmo processo, mas use:
git commit -m "fix(scope): descrição da correção"
```

#### **3. Atualizações de Documentação**

```bash
git commit -m "docs(scope): atualiza documentação"
```

---

### **Estratégia de Branches**

```
main
├── develop              # Branch de desenvolvimento ativo
│   ├── feature/pdf-improvements
│   ├── feature/new-section
│   └── feature/i18n
└── hotfix/critical-bug  # Correções urgentes
```

**Regras:**
- ✅ **main** - Sempre estável, pronto para produção
- ✅ **develop** - Desenvolvimento ativo, merge de features
- ✅ **feature/** - Novas funcionalidades
- ✅ **fix/** - Correções de bugs
- ✅ **hotfix/** - Correções urgentes de produção
- ✅ **docs/** - Apenas documentação

---

## 📝 Convenções de Commit

### **Formato Padrão**

```
<tipo>(<escopo>): <descrição curta>

<descrição detalhada (opcional)>

<breaking changes / notas (opcional)>
```

### **Tipos de Commit**

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **feat** | Nova funcionalidade | `feat(pdf): adiciona exportação em batch` |
| **fix** | Correção de bug | `fix(print): corrige quebra de página` |
| **docs** | Documentação | `docs(readme): atualiza instruções` |
| **style** | Formatação | `style(app): corrige indentação` |
| **refactor** | Refatoração | `refactor(components): extrai Header` |
| **perf** | Performance | `perf(pdf): otimiza geração` |
| **test** | Testes | `test(app): adiciona testes unitários` |
| **chore** | Manutenção | `chore(deps): atualiza dependências` |

### **Escopos Comuns**

```
app          - App.tsx ou componente principal
pdf          - Funcionalidades de PDF
print        - Impressão e estilos print
ats          - Otimizações ATS
ui           - Componentes UI
styles       - Estilos e CSS
docs         - Documentação
guidelines   - Guidelines e guias
```

### **Exemplos de Commits**

#### **✅ Bons Commits**

```bash
# Feature completa
feat(pdf): adiciona exportação PDF em alta resolução

Implementa exportação usando html2pdf.js com qualidade 98%.
Inclui opções de formato A4 e otimização de quebras de página.

# Bug fix com contexto
fix(print): corrige overflow em seção de experiência

O texto estava sendo cortado na impressão A4.
Ajusta padding e adiciona break-inside-avoid.

# Documentação
docs(guidelines): adiciona seção de deployment

Inclui instruções para Vercel e Netlify.

# Refatoração importante
refactor: remove pasta /resume e consolida estrutura

BREAKING CHANGE: Todos os imports agora apontam para raiz.
Atualizar paths de imports em projetos dependentes.
```

#### **❌ Commits Ruins**

```bash
# Sem tipo ou escopo
"mudanças"
"fix bug"
"updates"

# Descrição vaga
"feat: melhorias"
"fix: correções"
"refactor: mudanças"

# Sem contexto
"add feature"
"remove file"
```

---

### **Commit Message Template**

Crie um template Git local:

```bash
# Criar arquivo .gitmessage
cat > ~/.gitmessage << EOF
# <tipo>(<escopo>): <descrição curta>

# Descrição detalhada (opcional):
# - O que foi mudado?
# - Por quê foi mudado?
# - Como afeta o projeto?

# Breaking changes (se aplicável):
# BREAKING CHANGE: descrição

# Tipos: feat, fix, docs, style, refactor, perf, test, chore
# Escopos: app, pdf, print, ats, ui, styles, docs
EOF

# Configurar Git para usar o template
git config --global commit.template ~/.gitmessage
```

---

## 🔄 Processo de Pull Request

### **1. Antes de Criar o PR**

**Checklist:**
- [ ] Código testado localmente ou no Figma Make
- [ ] Sem erros TypeScript
- [ ] Lint passou sem erros
- [ ] Commits seguem convenção
- [ ] Branch está atualizada com main
- [ ] Documentação atualizada (se necessário)

### **2. Criando o Pull Request**

**Template de PR:**

```markdown
## 📋 Descrição

[Descrição clara do que foi alterado e por quê]

## 🎯 Tipo de Mudança

- [ ] 🐛 Bug fix (correção que não quebra funcionalidade existente)
- [ ] ✨ Nova feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (fix ou feature que quebra funcionalidade existente)
- [ ] 📚 Documentação (mudanças apenas em documentação)
- [ ] 🎨 Estilo (formatação, espaçamento, sem mudança de código)
- [ ] ♻️ Refatoração (nem fix nem feature)
- [ ] ⚡ Performance (melhoria de performance)
- [ ] ✅ Testes (adição ou correção de testes)

## 🧪 Como Foi Testado

[Descreva como você testou suas mudanças]

- [ ] Testado no Figma Make
- [ ] Testado localmente
- [ ] Testado impressão A4
- [ ] Testado exportação PDF Visual
- [ ] Testado exportação PDF ATS
- [ ] Testado responsividade (mobile/tablet/desktop)

## 📸 Screenshots (se aplicável)

[Adicione screenshots ou GIFs demonstrando as mudanças visuais]

## ✅ Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Realizei self-review do código
- [ ] Comentei código complexo quando necessário
- [ ] Atualizei documentação relacionada
- [ ] Minhas mudanças não geram warnings
- [ ] Adicionei testes (se aplicável)
- [ ] Todos os testes passam
- [ ] Validei compatibilidade ATS (se aplicável)
- [ ] Validei impressão A4 (se aplicável)

## 🔗 Issues Relacionadas

Closes #[número-da-issue]

## 📝 Notas Adicionais

[Qualquer informação adicional relevante]
```

---

### **3. Review Process**

**Para Reviewers:**

Validar:
- ✅ Código segue padrões do projeto
- ✅ Funcionalidade implementada corretamente
- ✅ Testes adequados (se aplicável)
- ✅ Documentação atualizada
- ✅ Performance não foi impactada negativamente
- ✅ Compatibilidade ATS mantida (se aplicável)
- ✅ Impressão A4 funciona corretamente

**Comentários devem ser:**
- Construtivos e respeitosos
- Específicos e acionáveis
- Focados no código, não na pessoa

---

### **4. Merge**

**Estratégias:**

```bash
# Squash and Merge (Recomendado para features)
# Combina todos os commits em um único commit limpo
git merge --squash feature/nome

# Merge Commit (Para branches importantes)
# Preserva histórico completo
git merge --no-ff feature/nome

# Rebase and Merge (Para histórico linear)
# Reaplica commits em cima do main
git rebase main
```

---

## 🐛 Debugging

### **No Figma Make**

```javascript
// Console do navegador (F12)
console.log('Debug:', variavel);
console.error('Erro:', erro);
console.table(array); // Para arrays/objetos

// React Developer Tools (extensão Chrome/Firefox)
// Inspecionar componentes e state
```

### **Debugging de PDF**

```javascript
// Testar geração sem download
const handleTestPDF = () => {
  const element = document.getElementById("resume-content");
  console.log('Elemento:', element);
  console.log('Dimensões:', {
    width: element.offsetWidth,
    height: element.offsetHeight
  });
};

// Verificar biblioteca carregada
console.log('html2pdf disponível:', typeof window.html2pdf);
```

### **Debugging de Print**

```javascript
// Simular print media query
// Chrome DevTools → Rendering → Emulate CSS media
// Selecionar: print

// Ou via código:
window.matchMedia('print').matches // false/true
```

### **Debugging TypeScript**

```typescript
// Type checking manual
const value: string = "teste";
console.log(typeof value); // "string"

// Verificar tipos em tempo de compilação
// npm run type-check
```

---

## 🧪 Testing

### **Testes Manuais (Atual)**

Checklist de testes antes de cada release:

**Funcionalidade:**
- [ ] Currículo renderiza corretamente
- [ ] Botão PDF Visual funciona
- [ ] Botão PDF ATS funciona (Ctrl+P)
- [ ] Links de email e LinkedIn clicáveis
- [ ] Scroll suave
- [ ] Botões flutuantes sempre visíveis

**Design:**
- [ ] Texto legível
- [ ] Hierarquia visual clara
- [ ] Espaçamento consistente
- [ ] Cores corretas
- [ ] Ícones aparecem

**Responsividade:**
- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)
- [ ] Orientação portrait/landscape

**Impressão:**
- [ ] Dimensões A4 (210mm x 297mm)
- [ ] Quebras de página adequadas
- [ ] Sem elementos cortados
- [ ] Botões ocultos
- [ ] Cores otimizadas

**ATS:**
- [ ] Texto 100% selecionável
- [ ] Estrutura semântica (<h1>, <h2>, etc.)
- [ ] Sem tabelas complexas
- [ ] Palavras-chave presentes

**Navegadores:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

### **Testes Automatizados (Futuro)**

#### **Unit Tests (Jest + React Testing Library)**

```typescript
// Exemplo: App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renderiza nome corretamente', () => {
    render(<App />);
    expect(screen.getByText(/Pedro Lucas/i)).toBeInTheDocument();
  });

  test('botões de exportação aparecem', () => {
    render(<App />);
    expect(screen.getByText(/Exportar PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF para ATS/i)).toBeInTheDocument();
  });
});
```

#### **E2E Tests (Playwright)**

```typescript
// Exemplo: resume.spec.ts
import { test, expect } from '@playwright/test';

test('exportação de PDF funciona', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Aguarda botão aparecer
  await page.waitForSelector('[data-testid="export-pdf"]');
  
  // Clica no botão
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="export-pdf"]');
  const download = await downloadPromise;
  
  // Valida download
  expect(download.suggestedFilename()).toContain('Curriculo');
});
```

---

## 🚀 Deploy

### **Ambientes**

| Ambiente | URL | Branch | Auto-Deploy |
|----------|-----|--------|-------------|
| **Produção** | TBD | `main` | ❌ Manual |
| **Staging** | TBD | `develop` | ❌ Futuro |
| **Preview** | Figma Make | - | ✅ Automático |

---

### **Deploy Manual (Atual)**

#### **Via Figma Make**

```
1. Edite arquivos no Figma Make
2. Preview automático disponível
3. Exporte via botão "Download" se necessário
4. Faça commit no GitHub via MCP
```

#### **Via Netlify (Futuro)**

```bash
# 1. Conectar repositório GitHub ao Netlify

# 2. Configurar build settings:
Build command:    npm run build
Publish directory: dist
Node version:      18.x

# 3. Deploy automático a cada push no main
```

#### **Via Vercel (Futuro)**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Deploy de produção
vercel --prod
```

---

### **CI/CD (Futuro com GitHub Actions)**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## 🔧 Troubleshooting

### **Problemas Comuns**

#### **1. PDF não gera corretamente**

```javascript
// Verificar se biblioteca carregou
console.log('html2pdf:', typeof window.html2pdf); // deve ser "function"

// Se undefined, recarregar página
window.location.reload();

// Verificar elemento existe
const element = document.getElementById("resume-content");
console.log('Elemento:', element); // não deve ser null
```

#### **2. Quebras de página ruins na impressão**

```css
/* Adicionar break-inside-avoid em mais elementos */
.section-item {
  break-inside: avoid;
  page-break-inside: avoid; /* Fallback para navegadores antigos */
}
```

#### **3. Texto não selecionável no PDF ATS**

```javascript
// Usar Print do navegador ao invés de PDF Visual
// Ctrl+P → Salvar como PDF
// Nunca usar screenshot ou imagem
```

#### **4. Estilos não aparecem na impressão**

```css
/* Usar @media print no globals.css */
@media print {
  .elemento {
    background: white !important;
    color: black !important;
  }
}

/* Ou usar variant print: do Tailwind */
<div className="bg-gray-100 print:bg-white">
```

#### **5. Erro TypeScript em imports**

```typescript
// Verificar path correto
// ✅ Correto (estrutura atual):
import { Button } from './components/ui/button';

// ❌ Incorreto (estrutura antiga):
import { Button } from './resume/components/ui/button';
```

#### **6. Figma Make não salva alterações**

```
1. Aguardar alguns segundos (salvamento automático)
2. Verificar conexão com internet
3. Fazer commit manual via MCP GitHub como backup
4. Se persistir, exportar projeto e trabalhar localmente
```

---

## 📚 Recursos Adicionais

### **Documentação do Projeto**
- [Guidelines Completo](Guidelines.md)
- [README Principal](../README.md)
- [Design System](DESIGN_SYSTEM.md)
- [Changelog](../CHANGELOG.md)

### **Documentação Externa**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)

---

## 👤 Contato

**Dúvidas ou problemas?**

- 📧 Email: plgsantos@icloud.com
- 💼 LinkedIn: [linkedin.com/in/pedrolucassantos](https://linkedin.com/in/pedrolucassantos)
- 🐙 GitHub Issues: [plgs2005/resume_figma/issues](https://github.com/plgs2005/resume_figma/issues)

---

**📅 Última atualização:** 20 de Fevereiro de 2026  
**📄 Versão:** 1.0.0
