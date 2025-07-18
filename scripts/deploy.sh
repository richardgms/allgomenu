#!/bin/bash

echo "🚀 Iniciando deploy do AllGoMenu..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está configurada"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Erro: NEXT_PUBLIC_SUPABASE_URL não está configurada"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Erro: NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurada"
    exit 1
fi

echo "✅ Variáveis de ambiente verificadas"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Executar migrações (se necessário)
echo "🗄️ Executando migrações do banco..."
npx prisma db push

# Build da aplicação
echo "🏗️ Executando build..."
npm run build

echo "✅ Deploy concluído com sucesso!" 