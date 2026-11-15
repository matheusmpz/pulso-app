#!/bin/sh
# Gera /config.js com a URL da API em tempo de execução.
# Permite usar a mesma imagem em qualquer ambiente, sem rebuild.
set -eu

DESTINO=/usr/share/nginx/html/config.js

# Remove aspas e barras invertidas para não quebrar o JavaScript gerado
limpar() { printf '%s' "$1" | tr -d '"\\'; }

API="$(limpar "${API_URL:-http://localhost:8080}")"
WS="$(limpar "${WS_URL:-}")"

{
  echo "// Gerado na subida do container (docker/40-pulso-config.sh)"
  printf 'window.__PULSO_CONFIG__ = { API_URL: "%s"' "$API"
  if [ -n "$WS" ]; then printf ', WS_URL: "%s"' "$WS"; fi
  echo ' }'
} > "$DESTINO"

echo "pulso: config.js gerado (API_URL=$API${WS:+, WS_URL=$WS})"
