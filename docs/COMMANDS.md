# 🚀 Comandos Práticos - Setup e Desenvolvimento Local

## 📋 Setup Inicial (Primeira Vez)

### 1. Clonar Repositório

```bash
# Via HTTPS
git clone https://github.com/plgs2005/resume_figma.git

# Via SSH (se configurado)
git clone git@github.com:plgs2005/resume_figma.git

# Entrar na pasta
cd resume_figma
```

### 2. Verificar Estrutura de Arquivos

```bash
# Listar arquivos na raiz
ls -la

# Verificar se os arquivos críticos existem
test -f index.html && echo "✅ index.html OK" || echo "❌ index.html FALTANDO"
test -f main.tsx && echo "✅ main.tsx OK" || echo "❌ main.tsx FALTANDO"
test -f App.tsx && echo "✅ App.tsx OK" || echo "❌ App.tsx FALTANDO"
test -f package.json && echo "✅ package.json OK" || echo "❌ package.json FALTANDO"
test -f vite.config.ts && echo "✅ vite.config.ts OK" || echo "❌ vite.config.ts FALTANDO"
test -f styles/globals.css && echo "✅ globals.css OK" || echo "❌ globals.css FALTANDO"
test -f scripts/fix-figma-imports.sh && echo "✅ fix-imports.sh OK" || echo "❌ fix-imports.sh FALTANDO"
```

### 3. Corrigir Imports Versionados (CRÍTICO!)

```bash
# Dar permissão de execução ao script
chmod +x scripts/fix-figma-imports.sh

# Rodar correção automática
npm run fix-imports

# OU rodar diretamente:
./scripts/fix-figma-imports.sh
```

**Output esperado:**
```
=== Fix Figma Make Versioned Imports ===

  Corrigindo: ./App.tsx
  Corrigindo: ./components/ui/accordion.tsx
  Corrigindo: ./components/ui/alert.tsx
  ...

Concluído! 48 arquivo(s) corrigido(s).

Próximo passo: npm run dev
```

### 4. Instalar Dependências

```bash
# Instalar todas as dependências do package.json
npm install

# OU com output detalhado:
npm install --verbose

# OU com cache limpo (se houver problemas):
npm clean-install
```

**Tempo esperado:** 1-3 minutos (dependendo da conexão)

**Output esperado (final):**
```
added 214 packages, and audited 215 packages in 2m

47 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### 5. Verificar Instalação

```bash
# Verificar se node_modules foi criado
test -d node_modules && echo "✅ node_modules criado" || echo "❌ node_modules FALTANDO"

# Verificar pacotes críticos
test -d node_modules/react && echo "✅ React instalado"
test -d node_modules/lucide-react && echo "✅ Lucide React instalado"
test -d node_modules/tailwindcss && echo "✅ Tailwind CSS instalado"
test -d node_modules/vite && echo "✅ Vite instalado"
```

### 6. Rodar Dev Server

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

**Output esperado:**
```
  VITE v6.0.7  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Abrir no navegador:**
```bash
# Linux
xdg-open http://localhost:5173

# macOS
open http://localhost:5173

# Windows (PowerShell)
start http://localhost:5173
```

---

## 🔄 Comandos de Desenvolvimento Diário

### Dev Server

```bash
# Iniciar dev server (porta 5173)
npm run dev

# Iniciar dev server em porta customizada
npm run dev -- --port 3000

# Iniciar e abrir browser automaticamente
npm run dev -- --open

# Iniciar e expor na rede local
npm run dev -- --host
```

### Type Checking

```bash
# Validar TypeScript (sem compilar)
npm run type-check

# Type check em modo watch (detecta mudanças)
npx tsc --noEmit --watch
```

### Build de Produção

```bash
# Build otimizado (gera pasta dist/)
npm run build

# Build com type checking rigoroso
npm run build:strict

# Preview da build de produção
npm run preview
```

### Limpeza

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpar cache npm
npm cache clean --force

# Limpar dist/
rm -rf dist
```

---

## 🔍 Debugging e Diagnóstico

### Verificar Versões

```bash
# Verificar versões instaladas
node --version          # Deve ser 18+
npm --version           # Deve ser 9+
npx vite --version      # Deve ser 6.0.7

# Ver todas as versões de dependências
npm list --depth=0

# Ver versões de pacotes específicos
npm list react react-dom lucide-react tailwindcss vite
```

### Verificar Imports Versionados (antes de fix)

```bash
# Procurar imports versionados em todos os arquivos
grep -r 'from.*@[0-9]\+\.[0-9]' --include="*.ts" --include="*.tsx" .

# Contar quantos imports versionados existem
grep -r 'from.*@[0-9]\+\.[0-9]' --include="*.ts" --include="*.tsx" . | wc -l

# Ver arquivos específicos com imports versionados
find . -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from.*@[0-9]\+\.[0-9]'
```

### Verificar Imports Após Correção

```bash
# Se retornar vazio, está tudo OK!
grep -r 'from.*@[0-9]\+\.[0-9]' --include="*.ts" --include="*.tsx" .

# Ver imports do lucide-react em App.tsx (deve estar sem versão)
grep 'lucide-react' App.tsx
# ✅ Esperado: from "lucide-react"
# ❌ Problema: from "lucide-react@0.487.0"
```

### Verificar CSS (Tailwind)

```bash
# Ver se globals.css existe e tem conteúdo
cat styles/globals.css | head -20

# Procurar por @import "tailwindcss" (deve existir)
grep '@import "tailwindcss"' styles/globals.css

# Ver se main.tsx importa globals.css
grep 'globals.css' main.tsx
# ✅ Esperado: import "./styles/globals.css";
```

### Verificar TypeScript Config

```bash
# Ver configuração TS
cat tsconfig.json

# Validar JSON (se houver erro de sintaxe)
node -e "console.log(JSON.parse(require('fs').readFileSync('tsconfig.json')))"
```

### Logs Detalhados

```bash
# Dev server com logs detalhados
npm run dev -- --debug

# Build com logs detalhados
npm run build -- --debug

# npm install com logs
npm install --loglevel verbose
```

---

## 🔧 Correção de Problemas Comuns

### Problema: "Cannot find module 'lucide-react@0.487.0'"

```bash
# 1. Re-rodar fix de imports
npm run fix-imports

# 2. Verificar se funcionou
grep 'lucide-react' App.tsx

# 3. Se persistir, editar manualmente App.tsx
# Mudar: from "lucide-react@0.487.0"
# Para:  from "lucide-react"

# 4. Reiniciar dev server
npm run dev
```

### Problema: Layout sem estilos

```bash
# 1. Verificar se Tailwind está instalado
npm list tailwindcss @tailwindcss/vite

# 2. Se não estiver, instalar
npm install tailwindcss@4.0.0 @tailwindcss/vite@4.0.0 --save-dev

# 3. Verificar vite.config.ts
cat vite.config.ts

# 4. Deve ter:
# import tailwindcss from "@tailwindcss/vite";
# plugins: [ react(), tailwindcss() ]

# 5. Reiniciar dev server
npm run dev
```

### Problema: TypeScript errors

```bash
# 1. Limpar cache TS
rm -rf node_modules/.cache

# 2. Reinstalar types
npm install --save-dev @types/react @types/react-dom

# 3. Type check
npm run type-check

# 4. Se for erro de config, regenerar tsconfig
npx tsc --init
```

### Problema: Port 5173 já em uso

```bash
# 1. Encontrar processo usando porta 5173
lsof -i :5173          # macOS/Linux
netstat -ano | findstr :5173   # Windows

# 2. Matar processo
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows

# 3. OU usar porta diferente
npm run dev -- --port 3000
```

### Problema: html2pdf não carrega

```bash
# 1. Verificar se script está no App.tsx
grep 'html2pdf' App.tsx

# 2. Verificar URL do CDN
grep 'cdnjs.cloudflare.com' App.tsx

# 3. Testar CDN manualmente
curl -I https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js

# 4. Se CDN estiver down, alternativa: instalar via npm
npm install html2pdf.js

# 5. Editar App.tsx para usar import local
# import html2pdf from "html2pdf.js";
```

---

## 📦 Gerenciamento de Dependências

### Atualizar Pacotes

```bash
# Ver pacotes desatualizados
npm outdated

# Atualizar patch/minor versions (seguro)
npm update

# Atualizar major versions (CUIDADO - pode quebrar)
npm install lucide-react@latest
npm install tailwindcss@latest

# Atualizar TODOS os pacotes (NÃO recomendado sem testes)
npx npm-check-updates -u
npm install
```

### Ver Tamanho de Dependências

```bash
# Tamanho de node_modules
du -sh node_modules

# Tamanho detalhado por pacote
du -sh node_modules/* | sort -hr | head -20

# Ver bundle size da build
npm run build
ls -lh dist/assets/

# Analisar bundle (instalar ferramenta)
npm install --save-dev vite-bundle-visualizer
```

### Limpar Dependências Não Usadas

```bash
# Encontrar dependências não usadas
npx depcheck

# Remover pacote específico
npm uninstall <package-name>

# Reinstalar apenas o necessário
rm -rf node_modules package-lock.json
npm install --omit=dev  # Apenas production dependencies
```

---

## 🌳 Git - Comandos Úteis

### Status e Logs

```bash
# Ver status atual
git status

# Ver histórico de commits
git log --oneline

# Ver último commit
git log -1

# Ver mudanças não commitadas
git diff

# Ver mudanças em arquivo específico
git diff App.tsx
```

### Commits

```bash
# Adicionar todos os arquivos modificados
git add .

# Adicionar arquivo específico
git add App.tsx

# Commit com mensagem
git commit -m "feat: adiciona funcionalidade X"

# Commit com mensagem multilinhas
git commit -m "feat: adiciona funcionalidade X" -m "Descrição detalhada aqui"

# Amend do último commit (se errou algo)
git add .
git commit --amend --no-edit
```

### Push/Pull

```bash
# Push para branch main
git push origin main

# Pull do remoto
git pull origin main

# Push forçado (CUIDADO!)
git push origin main --force

# Push e criar branch remota
git push -u origin nome-da-branch
```

### Branches

```bash
# Ver branches
git branch

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Mudar de branch
git checkout main

# Deletar branch local
git branch -d feature/velha

# Deletar branch remota
git push origin --delete feature/velha
```

### Desfazer Mudanças

```bash
# Desfazer mudanças em arquivo (antes de add)
git checkout -- App.tsx

# Desfazer add (antes de commit)
git reset App.tsx

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1

# Voltar para commit específico
git reset --hard <commit-hash>
```

---

## 🚀 Workflow Completo - Exemplo Prático

### Cenário: Atualizar conteúdo do currículo

```bash
# 1. Garantir que está na main atualizada
git checkout main
git pull origin main

# 2. Criar branch para mudança
git checkout -b feat/update-experience

# 3. Abrir editor e modificar App.tsx
code App.tsx  # VSCode
vim App.tsx   # Vim
nano App.tsx  # Nano

# 4. Iniciar dev server para testar
npm run dev

# 5. Abrir browser em localhost:5173
# (Fazer alterações, salvar, ver hot reload)

# 6. Testar funcionalidades
# - Botão "Exportar PDF"
# - Botão "PDF para ATS" (Ctrl+P)
# - Responsividade (mobile/tablet/desktop)

# 7. Ver mudanças
git diff App.tsx

# 8. Adicionar ao stage
git add App.tsx

# 9. Commit com mensagem descritiva
git commit -m "feat(experience): adiciona projeto API Gateway na Empresa X

- Descrição de 3 novas responsabilidades
- Ajusta período de atuação
- Adiciona keywords: Apigee, OAuth2, GCP"

# 10. Push para branch remota
git push -u origin feat/update-experience

# 11. (Opcional) Criar Pull Request no GitHub
# - Ir para https://github.com/plgs2005/resume_figma
# - Clicar "Compare & pull request"
# - Adicionar descrição
# - Criar PR

# 12. (Ou) Fazer merge direto
git checkout main
git merge feat/update-experience
git push origin main

# 13. Deletar branch feature (após merge)
git branch -d feat/update-experience
git push origin --delete feat/update-experience

# 14. Build de produção (opcional)
npm run build
```

---

## 🧪 Testes Manuais - Checklist

```bash
# Após qualquer mudança, executar:

# 1. Type check
npm run type-check
# ✅ Esperado: "No errors found"

# 2. Build de produção
npm run build
# ✅ Esperado: "✓ built in X ms"

# 3. Preview da build
npm run preview
# ✅ Esperado: Abre em http://localhost:4173

# 4. Testar no browser:
# - [ ] Layout correto (wrapper cinza, currículo branco)
# - [ ] Header escuro visível
# - [ ] Botões flutuantes (verde + escuro)
# - [ ] Botão "Exportar PDF" gera PDF
# - [ ] Botão "PDF para ATS" abre impressão
# - [ ] Links clicáveis (email, LinkedIn)
# - [ ] Responsivo (F12 → Toggle device toolbar)

# 5. Testar impressão (Ctrl+P):
# - [ ] Botões desaparecem
# - [ ] Cabe em 1-2 páginas A4
# - [ ] Sem elementos cortados
# - [ ] Header mantém fundo escuro

# 6. Validar PDF exportado:
# - [ ] Qualidade visual boa
# - [ ] Texto legível
# - [ ] Formato A4
# - [ ] Nome correto do arquivo
```

---

## 📚 Scripts Customizados (package.json)

### Scripts Existentes

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:strict": "tsc -b && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "fix-imports": "bash scripts/fix-figma-imports.sh"
  }
}
```

### Scripts Adicionais (opcional - adicionar ao package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "dev:open": "vite --open",
    "dev:host": "vite --host",
    "build": "vite build",
    "build:strict": "tsc -b && vite build",
    "build:analyze": "vite build && vite-bundle-visualizer",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "fix-imports": "bash scripts/fix-figma-imports.sh",
    "clean": "rm -rf node_modules dist package-lock.json",
    "reinstall": "npm run clean && npm install",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "check-size": "du -sh node_modules dist",
    "outdated": "npm outdated"
  }
}
```

**Usar novos scripts:**
```bash
npm run dev:open       # Abre browser automaticamente
npm run dev:host       # Expõe na rede local
npm run build:analyze  # Analisa tamanho do bundle
npm run type-check:watch  # Type check em modo watch
npm run clean          # Limpa completamente
npm run reinstall      # Reinstala do zero
npm run check-size     # Ver tamanho de node_modules e dist
```

---

## 🎯 Comandos Rápidos - TL;DR

```bash
# Setup inicial (uma vez)
git clone https://github.com/plgs2005/resume_figma.git
cd resume_figma
chmod +x scripts/fix-figma-imports.sh
npm run fix-imports
npm install
npm run dev

# Desenvolvimento diário
npm run dev              # Dev server
npm run type-check       # Validar TS
npm run build            # Build produção
npm run preview          # Preview build

# Atualizar código do GitHub
git pull origin main
npm run fix-imports      # Se puxou código do Make
npm run dev

# Push de mudanças
git add .
git commit -m "feat: descrição"
git push origin main

# Resolver problemas
npm run fix-imports      # Corrige imports versionados
rm -rf node_modules && npm install  # Reinstala dependências
npm cache clean --force  # Limpa cache npm
```

---

**✅ Com esses comandos, você tem controle COMPLETO sobre o setup, desenvolvimento e debugging do projeto local!**
