# 🛠️ Comandos de Teste - AllGoMenu

## 🚀 **Comandos Essenciais**

### 1. Inicialização Completa
```bash
# 1. Sincronizar banco de dados
npm run db:push

# 2. Popular com dados de teste
npm run db:seed

# 3. Iniciar servidor
npm run dev
```

### 2. Teste Rápido das APIs
```bash
# Executar script de teste automatizado
./scripts/test-apis.sh
```

### 3. Testes Manuais das APIs
```bash
# API Overview
curl "http://localhost:3000/api/admin/analytics/overview?restaurant=wj-tapiocaria-cafe&days=30" | jq

# API Sales  
curl "http://localhost:3000/api/admin/analytics/sales?restaurant=wj-tapiocaria-cafe&days=30" | jq

# API Products
curl "http://localhost:3000/api/admin/analytics/products?restaurant=wj-tapiocaria-cafe&days=30" | jq

# API Customers
curl "http://localhost:3000/api/admin/analytics/customers?restaurant=wj-tapiocaria-cafe&days=30" | jq

# API Performance
curl "http://localhost:3000/api/admin/analytics/performance?restaurant=wj-tapiocaria-cafe&days=30" | jq
```

## 🌐 **URLs de Teste**

### Páginas Administrativas
```
Dashboard Principal:
http://localhost:3000/wj-tapiocaria-cafe/admin/dashboard

Analytics Completo:
http://localhost:3000/wj-tapiocaria-cafe/admin/analytics

Gestão de Menu:
http://localhost:3000/wj-tapiocaria-cafe/admin/menu

Pedidos:
http://localhost:3000/wj-tapiocaria-cafe/admin/orders

Personalização:
http://localhost:3000/wj-tapiocaria-cafe/admin/customization

Configurações:
http://localhost:3000/wj-tapiocaria-cafe/admin/settings
```

### Página do Cliente
```
http://localhost:3000/wj-tapiocaria-cafe
```

## 🧪 **Checklist de Testes**

### ✅ **APIs Funcionando**
- [ ] Overview retorna totalRevenue, totalOrders, etc.
- [ ] Sales retorna array de vendas por dia
- [ ] Products retorna top produtos ordenados por receita
- [ ] Customers retorna novos vs recorrentes
- [ ] Performance retorna métricas de tempo e pico

### ✅ **Dashboard Analytics**
- [ ] Cards de estatísticas mostram dados reais
- [ ] Gráfico de tendência de vendas (área)
- [ ] Gráfico de pedidos por dia (barra)
- [ ] Métricas de performance (4 cards)
- [ ] Gráfico de horários de pico (linha)
- [ ] Lista de top produtos
- [ ] Gráfico de pizza por categoria
- [ ] Análise de clientes
- [ ] Top localizações

### ✅ **Funcionalidades**
- [ ] Filtros de período (7d, 30d, 90d, 1y) alteram dados
- [ ] Botão "Atualizar" recarrega dados
- [ ] LoadingSpinner aparece durante carregamento
- [ ] Mensagens de erro quando não há dados
- [ ] React Query DevTools visível no navegador

### ✅ **Responsividade**
- [ ] Desktop (1920px): Layout fluído
- [ ] Tablet (768px): Gráficos se ajustam
- [ ] Mobile (375px): Cards empilham, gráficos legíveis

## 🐛 **Debug Comum**

### Problema: Banco não conecta
```bash
# Verificar variáveis de ambiente
cat .env.local | grep DATABASE_URL

# Testar conexão
npm run db:studio
```

### Problema: APIs retornam erro 500
```bash
# Verificar logs do servidor no terminal onde npm run dev está rodando
# Verificar se o banco tem dados:
npm run db:seed
```

### Problema: Gráficos não carregam
```bash
# Verificar no console do navegador (F12)
# Verificar se as APIs retornam dados válidos
./scripts/test-apis.sh
```

### Problema: React Query não funciona
```bash
# Verificar se providers.tsx está sendo usado no layout
# Verificar React Query DevTools no navegador
```

## 🎯 **Teste de Aceitação Final**

Execute este checklist para confirmar que tudo está funcionando:

1. **Preparação**:
   ```bash
   npm run db:push && npm run db:seed && npm run dev
   ```

2. **APIs**:
   ```bash
   ./scripts/test-apis.sh
   ```
   ✅ Todas as 5 APIs devem retornar status 200

3. **Frontend**:
   - Abra: http://localhost:3000/wj-tapiocaria-cafe/admin/analytics
   - ✅ Deve carregar sem erros
   - ✅ Gráficos devem mostrar dados reais
   - ✅ Filtros devem alterar os dados

4. **DevTools**:
   - F12 > Console: ✅ Sem erros vermelhos
   - F12 > React Query: ✅ Queries visíveis e funcionando

5. **Performance**:
   - ✅ Carregamento inicial < 3 segundos
   - ✅ Mudança de filtros < 1 segundo
   - ✅ Loading states visíveis

## 🚀 **Se Tudo Funcionar**

Parabéns! 🎉 Você tem:
- ✅ Estado global com Zustand
- ✅ Cache inteligente com React Query  
- ✅ APIs reais de analytics
- ✅ Dashboard com dados reais
- ✅ Interface responsiva e moderna

**Próximos passos**:
1. Implementar WebSockets para tempo real
2. Adicionar drag-and-drop funcional
3. Criar subpáginas de configurações
4. Adicionar testes automatizados