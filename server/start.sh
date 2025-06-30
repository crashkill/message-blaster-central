#!/bin/bash

# Script de inicialização limpa do servidor Galatéia
echo "🚀 Iniciando Galatéia Sender..."

# Limpa processos anteriores
echo "🧹 Limpando processos anteriores..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "node.*index.js" 2>/dev/null || true

# Aguarda um pouco para garantir que tudo foi limpo
sleep 2

# Verifica se a porta está livre
if lsof -i:3001 >/dev/null 2>&1; then
    echo "❌ Porta 3001 ainda está ocupada"
    exit 1
fi

echo "✅ Porta 3001 livre"

# Remove arquivos de cache problemáticos (se existirem)
rm -rf .wwebjs_cache 2>/dev/null || true
rm -rf .wwebjs_auth 2>/dev/null || true

# Inicia o servidor
echo "🌟 Iniciando servidor..."
node index.js 