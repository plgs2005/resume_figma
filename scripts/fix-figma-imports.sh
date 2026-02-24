#!/bin/bash
# =============================================================================
# fix-figma-imports.sh
# =============================================================================
# Remove sufixos de versao dos imports do Figma Make para compatibilidade
# com ambiente Node.js/Vite padrao.
#
# Exemplo de transformacao:
#   from "@radix-ui/react-accordion@1.2.3"  -->  from "@radix-ui/react-accordion"
#   from "lucide-react@0.487.0"             -->  from "lucide-react"
#   from "class-variance-authority@0.7.1"   -->  from "class-variance-authority"
#
# Uso:
#   chmod +x scripts/fix-figma-imports.sh
#   ./scripts/fix-figma-imports.sh
#
# Nota: Este script usa sed e eh compativel com Linux (GNU sed).
#       Para macOS (BSD sed), use: sed -i '' em vez de sed -i
# =============================================================================

set -euo pipefail

echo "=== Fix Figma Make Versioned Imports ==="
echo ""

# Detectar OS para compatibilidade do sed
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE="sed -i ''"
else
  SED_INPLACE="sed -i"
fi

# Contador de arquivos modificados
COUNT=0

# Buscar todos os arquivos .ts e .tsx (excluindo node_modules e dist)
while IFS= read -r -d '' file; do
  # Verificar se o arquivo contem imports versionados (padrao: from "pacote@versao")
  if grep -qE 'from\s+"[^"]+@[0-9]+\.[0-9]+' "$file"; then
    echo "  Corrigindo: $file"

    # Remover @versao dos imports entre aspas duplas
    # Regex: captura tudo antes de @versao dentro de aspas em statements from
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' -E 's/(from\s+"[^"@]+)@[0-9]+\.[0-9]+[^"]*(")/\1\2/g' "$file"
    else
      sed -i -E 's/(from\s+"[^"@]+)@[0-9]+\.[0-9]+[^"]*(")/\1\2/g' "$file"
    fi

    COUNT=$((COUNT + 1))
  fi
done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./dist/*" \
  -print0)

echo ""
if [ "$COUNT" -gt 0 ]; then
  echo "Concluido! $COUNT arquivo(s) corrigido(s)."
else
  echo "Nenhum import versionado encontrado. Tudo OK!"
fi
echo ""
echo "Proximo passo: npm run dev"
