#!/bin/bash

# 🧪 Script de Teste Automatizado - AllGoMenu APIs
# Este script testa todas as APIs implementadas

echo "🚀 Iniciando testes das APIs do AllGoMenu..."
echo "============================================="

BASE_URL="http://localhost:3000"
RESTAURANT_SLUG="wj-tapiocaria-cafe"
DAYS="30"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar uma API
test_api() {
    local name=$1
    local endpoint=$2
    local expected_field=$3
    
    echo -n "🔍 Testando $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        if echo "$body" | jq -e ".$expected_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PASSOU${NC}"
            echo "   📊 Dados: $(echo "$body" | jq -c ".$expected_field")"
        else
            echo -e "${YELLOW}⚠️  RESPOSTA SEM CAMPO ESPERADO${NC}"
            echo "   📝 Resposta: $body"
        fi
    else
        echo -e "${RED}❌ FALHOU (HTTP $http_code)${NC}"
        echo "   📝 Erro: $body"
    fi
    echo ""
}

# Verificar se o servidor está rodando
echo "🌐 Verificando se o servidor está rodando..."
if curl -s "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✅ Servidor rodando em $BASE_URL${NC}"
else
    echo -e "${RED}❌ Servidor não está rodando em $BASE_URL${NC}"
    echo "👉 Execute: npm run dev"
    exit 1
fi

echo ""
echo "🧪 Testando APIs de Analytics..."
echo "================================"

# Testar cada API
test_api "Overview Analytics" "/api/admin/analytics/overview?restaurant=$RESTAURANT_SLUG&days=$DAYS" "totalRevenue"
test_api "Sales Analytics" "/api/admin/analytics/sales?restaurant=$RESTAURANT_SLUG&days=$DAYS" "0.date"
test_api "Products Analytics" "/api/admin/analytics/products?restaurant=$RESTAURANT_SLUG&days=$DAYS" "0.name"
test_api "Customers Analytics" "/api/admin/analytics/customers?restaurant=$RESTAURANT_SLUG&days=$DAYS" "totalCustomers"
test_api "Performance Analytics" "/api/admin/analytics/performance?restaurant=$RESTAURANT_SLUG&days=$DAYS" "averagePreparationTime"

echo "🏁 Testes concluídos!"
echo ""
echo "📋 Próximos passos:"
echo "1. Abra http://localhost:3000/$RESTAURANT_SLUG/admin/analytics"
echo "2. Verifique se os gráficos carregam com dados reais"
echo "3. Teste os filtros de período (7d, 30d, 90d, 1y)"
echo "4. Confirme que o botão 'Atualizar' funciona"
echo "5. Verifique o React Query DevTools no navegador"