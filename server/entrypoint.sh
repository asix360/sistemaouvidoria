#!/bin/sh
set -e

echo "⏳ Aguardando banco de dados PostgreSQL estar disponível..."
# Executa migrações/push do schema Prisma sem apagar dados
npx prisma db push

echo "🌱 Verificando e executando seed inicial do banco de dados..."
node dist/seed.js || true

echo "🚀 Iniciando servidor backend Ouvidoria UPA..."
exec node dist/index.js
