# 🧪 Guia Completo de Testes - AllGoMenu Dashboard

Este guia te ajudará a testar todas as implementações realizadas de forma sistemática.

## 📋 **Pré-requisitos**

1. **Banco de dados funcionando** (Supabase ou PostgreSQL local)
2. **Variáveis de ambiente configuradas** (.env.local)
3. **Dependencies instaladas** (`npm install`)

## 🚀 **1. Preparação Inicial**

### Passo 1: Sincronizar Banco e Dados
```bash
# Aplicar schema no banco
npm run db:push

# Popular com dados de teste
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

### Passo 2: Verificar Servidor
- Abra: http://localhost:3000
- Deve carregar a página inicial do AllGoMenu

---

## 🔍 **2. Testes das APIs de Analytics**

### Teste 1: API Overview
```bash
curl "http://localhost:3000/api/admin/analytics/overview?restaurant=wj-tapiocaria-cafe&days=30"
```
**Esperado**: JSON com totalRevenue, totalOrders, totalCustomers, etc.

### Teste 2: API Sales
```bash
curl "http://localhost:3000/api/admin/analytics/sales?restaurant=wj-tapiocaria-cafe&days=30"
```
**Esperado**: Array de dados de vendas por dia

### Teste 3: API Products
```bash
curl "http://localhost:3000/api/admin/analytics/products?restaurant=wj-tapiocaria-cafe&days=30"
```
**Esperado**: Array de produtos mais vendidos

### Teste 4: API Customers
```bash
curl "http://localhost:3000/api/admin/analytics/customers?restaurant=wj-tapiocaria-cafe&days=30"
```
**Esperado**: Dados de novos vs recorrentes clientes

### Teste 5: API Performance
```bash
curl "http://localhost:3000/api/admin/analytics/performance?restaurant=wj-tapiocaria-cafe&days=30"
```
**Esperado**: Métricas de tempo de preparo, entrega, etc.

---

## 🖥️ **3. Testes das Páginas Administrativas**

### 3.1 Dashboard Principal
**URL**: http://localhost:3000/wj-tapiocaria-cafe/admin/dashboard

**✅ Verificar**:
- [ ] Cards de estatísticas carregam
- [ ] Gráficos aparecem corretamente
- [ ] Não há erros no console
- [ ] LoadingSpinner aparece durante carregamento

### 3.2 Analytics Completo
**URL**: http://localhost:3000/wj-tapiocaria-cafe/admin/analytics

**✅ Verificar**:
- [ ] **Header** com filtros de período (7d, 30d, 90d, 1y)
- [ ] **Quick Stats** com dados reais
- [ ] **Aba Overview**:
  - [ ] Gráfico de tendência de vendas (AreaChart)
  - [ ] Gráfico de pedidos por dia (BarChart)
  - [ ] Métricas de performance (4 cards)
  - [ ] Gráfico de horários de pico (LineChart)
- [ ] **Aba Sales**:
  - [ ] Gráfico combinado de receita e pedidos
- [ ] **Aba Products**:
  - [ ] Lista de top produtos
  - [ ] Gráfico de pizza por categoria
- [ ] **Aba Customers**:
  - [ ] Análise de clientes (total, novos, recorrentes)
  - [ ] Top localizações de entrega
- [ ] **Botão Atualizar** funciona
- [ ] **Filtros de período** alteram os dados

### 3.3 Gestão de Menu
**URL**: http://localhost:3000/wj-tapiocaria-cafe/admin/menu

**✅ Verificar**:
- [ ] Lista de produtos e categorias
- [ ] Filtros funcionam
- [ ] Upload de imagem funciona
- [ ] Estados ativo/inativo funcionam

### 3.4 Pedidos
**URL**: http://localhost:3000/wj-tapiocaria-cafe/admin/orders

**✅ Verificar**:
- [ ] Interface Kanban carrega
- [ ] Filtros de status funcionam
- [ ] Modal de detalhes abre
- [ ] Busca por cliente funciona

### 3.5 Personalização
**URL**: http://localhost:3000/wj-tapiocaria-cafe/admin/customization

**✅ Verificar**:
- [ ] Presets de tema funcionam
- [ ] Color picker funciona
- [ ] Preview responsivo funciona
- [ ] Upload de logo funciona

### 3.6 Configurações
**URL**: http://localhost:3000/wj-tapiocaria-cafe/admin/settings

**✅ Verificar**:
- [ ] Página carrega sem erros
- [ ] Cards de configuração aparecem

---

## 🧩 **4. Testes de Estado Global (Zustand)**

### 4.1 Teste no Console do Navegador
```javascript
// Abra DevTools > Console e teste:

// Verificar stores disponíveis
console.log('Testing Zustand stores...');

// Se você conseguir acessar as stores, teste:
// (Note: stores só são acessíveis dentro dos componentes React)
```

### 4.2 Verificar React Query DevTools
- [ ] Aba "React Query" aparece no DevTools
- [ ] Queries aparecem com status (fresh, stale, loading)
- [ ] Cache funciona (dados persistem entre navegações)

---

## 📱 **5. Testes de Responsividade**

### 5.1 Desktop (1920x1080)
- [ ] Layout fluído
- [ ] Gráficos responsivos
- [ ] Cards organizados em grade

### 5.2 Tablet (768px)
- [ ] Sidebar colapsa
- [ ] Gráficos se ajustam
- [ ] Cards empilham

### 5.3 Mobile (375px)
- [ ] Menu hambúrguer
- [ ] Gráficos legíveis
- [ ] Cards em coluna única

---

## ⚡ **6. Testes de Performance**

### 6.1 Loading States
- [ ] LoadingSpinner aparece em todos os gráficos
- [ ] Skeleton loading nos cards
- [ ] Transições suaves

### 6.2 Cache
- [ ] Primeira visita: dados carregam da API
- [ ] Segunda visita: dados carregam do cache
- [ ] Botão atualizar revalida cache

---

## 🐛 **7. Testes de Error Handling**

### 7.1 API Offline
```bash
# Pare o servidor e teste as páginas
# Deve mostrar mensagens de erro apropriadas
```

### 7.2 Dados Inexistentes
- Teste com restaurant slug inválido
- Deve mostrar "Nenhum dado encontrado"

---

## 📊 **8. Checklist Final**

### APIs ✅
- [ ] Overview API retorna dados válidos
- [ ] Sales API retorna array de vendas
- [ ] Products API retorna top produtos
- [ ] Customers API retorna análise de clientes
- [ ] Performance API retorna métricas

### Frontend ✅
- [ ] Dashboard carrega sem erros
- [ ] Analytics mostra dados reais
- [ ] Gráficos são interativos
- [ ] Filtros funcionam
- [ ] Loading states aparecem
- [ ] Error states funcionam
- [ ] Responsivo em todos os tamanhos

### Funcionalidades ✅
- [ ] React Query cache funciona
- [ ] Zustand stores funcionam
- [ ] DevTools disponíveis
- [ ] Performance adequada
- [ ] Sem erros no console

---

## 🚨 **Problemas Comuns e Soluções**

### Erro: "Can't reach database"
```bash
# Verificar .env.local tem DATABASE_URL correto
# Testar conexão com o banco
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
npm install
```

### Gráficos não aparecem
- Verificar se Recharts está instalado
- Verificar dados da API estão no formato correto

### React Query não funciona
- Verificar se Providers está configurado no layout
- Verificar se QueryClient está inicializado

---

## 📈 **Métricas de Sucesso**

✅ **100% Funcionando**: Todas as APIs retornam dados, todos os gráficos carregam, sem erros no console
✅ **90% Funcionando**: APIs funcionam, gráficos carregam, erros menores no console
✅ **80% Funcionando**: Maioria das funcionalidades funciona, alguns erros
❌ **<80%**: Muitos erros, funcionalidades quebradas

---

## 🎯 **Próximos Passos Após Testes**

Se todos os testes passaram:
1. ✅ **Implementar WebSockets** para tempo real
2. ✅ **Adicionar drag-and-drop** nas páginas
3. ✅ **Criar subpáginas** de configurações
4. ✅ **Otimizar performance** se necessário

---

**💡 Dica**: Execute este guia passo a passo e anote quais itens funcionam e quais precisam de ajustes!