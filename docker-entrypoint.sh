#!/bin/sh
# Docker entrypoint script para JP Marcenaria Digital

set -e

# Função para log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando JP Marcenaria Digital..."

# Substituir variáveis de ambiente no index.html se necessário
if [ -n "$VITE_SUPABASE_URL" ]; then
    log "Configurando variáveis de ambiente..."
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__VITE_SUPABASE_URL__|$VITE_SUPABASE_URL|g" {} \;
fi

if [ -n "$VITE_SUPABASE_PUBLISHABLE_KEY" ]; then
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|__VITE_SUPABASE_PUBLISHABLE_KEY__|$VITE_SUPABASE_PUBLISHABLE_KEY|g" {} \;
fi

# Verificar se os arquivos estão no lugar correto
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    log "ERRO: index.html não encontrado!"
    exit 1
fi

log "Configuração concluída. Iniciando Nginx..."

# Executar comando passado como argumento
exec "$@"