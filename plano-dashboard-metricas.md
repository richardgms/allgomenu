📊 Plano de Implementação - Dashboard de Métricas Funcionais
===============================================================

🎯 Visão Geral do Projeto
-------------------------

### Objetivo

Implementar um **dashboard de métricas funcionais e em tempo real** para o sistema AllGoMenu, fornecendo aos proprietários de restaurantes insights críticos sobre performance, vendas, pedidos e operações através de visualizações interativas e dados precisos.

### Escopo

- Dashboard principal com métricas em tempo real
- Sistema de analytics completo com APIs robustas  
- Gráficos interativos e responsivos
- Gerenciamento de estado global otimizado
- Interface intuitiva e mobile-first
- Integração com dados existentes do sistema

---

🗓️ Cronograma Executivo
-----------------------

| Fase | Duração | Período | Prioridade |
|------|---------|---------|------------|
| Fase 1 - Arquitetura e Estado Global | 3 dias | Dias 1-3 | Crítica |
| Fase 2 - APIs de Analytics | 4 dias | Dias 4-7 | Crítica |
| Fase 3 - Componentes de Visualização | 3 dias | Dias 8-10 | Alta |
| Fase 4 - Dashboard Principal | 4 dias | Dias 11-14 | Crítica |
| Fase 5 - Otimizações e Testes | 2 dias | Dias 15-16 | Média |

**Total: 16 dias (3.2 semanas)**

---

🏗️ FASE 1: Arquitetura e Estado Global (3 dias)
===============================================

## 1.1 Configuração do Gerenciamento de Estado (1.5 dias)

### Implementação Zustand Stores

```typescript
// stores/useAnalyticsStore.ts
interface AnalyticsStore {
  // Dados de métricas
  overview: OverviewMetrics | null
  sales: SalesData[]
  products: ProductAnalytics[]
  customers: CustomerMetrics | null
  
  // Estados de loading
  loading: {
    overview: boolean
    sales: boolean
    products: boolean
    customers: boolean
  }
  
  // Filtros ativos
  filters: {
    period: '7d' | '30d' | '90d' | '1y'
    dateRange: [Date, Date] | null
    category: string | null
  }
  
  // Ações
  setOverview: (data: OverviewMetrics) => void
  setSales: (data: SalesData[]) => void
  setProducts: (data: ProductAnalytics[]) => void
  setCustomers: (data: CustomerMetrics) => void
  setLoading: (key: string, loading: boolean) => void
  setFilters: (filters: Partial<AnalyticsFilters>) => void
  refreshData: () => Promise<void>
}
```

### React Query Configuration

```typescript
// lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

// hooks/useAnalytics.ts
export const useAnalyticsOverview = (slug: string, period: string) => {
  return useQuery({
    queryKey: ['analytics', 'overview', slug, period],
    queryFn: () => fetchAnalyticsOverview(slug, period),
    enabled: !!slug,
  })
}
```

## 1.2 Interfaces TypeScript (1 dia)

```typescript
// types/analytics.ts
export interface OverviewMetrics {
  revenue: {
    current: number
    previous: number
    growth: number
  }
  orders: {
    total: number
    completed: number
    cancelled: number
    pending: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  averageOrderValue: number
  conversionRate: number
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
  averageOrder: number
}

export interface ProductAnalytics {
  id: string
  name: string
  category: string
  sales: number
  revenue: number
  growth: number
  availability: boolean
}
```

## 1.3 Componentes ShadCN Necessários (0.5 dias)

**Componentes a serem integrados via MCP:**
- ✅ `progress` - Barras de progresso para métricas
- ✅ `skeleton` - Loading states elegantes
- ✅ `alert` - Notificações e feedback
- ✅ `tabs` - Navegação entre seções
- ✅ `select` - Filtros de período
- ✅ `card` - Containers de métricas
- ✅ `badge` - Indicadores de status
- ✅ `button` - Ações de refresh/export

---

📊 FASE 2: APIs de Analytics (4 dias)
====================================

## 2.1 API de Overview (1 dia)

```typescript
// app/api/admin/analytics/overview/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const restaurant = searchParams.get('restaurant')
  const days = parseInt(searchParams.get('days') || '30')
  
  // Validações
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant slug required' }, { status: 400 })
  }
  
  try {
    // Buscar dados do restaurante
    const restaurantData = await prisma.restaurant.findUnique({
      where: { slug: restaurant }
    })
    
    if (!restaurantData) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }
    
    // Calcular período
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    // Métricas de receita
    const currentRevenue = await prisma.order.aggregate({
      where: {
        restaurantId: restaurantData.id,
        status: 'completed',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true },
      _count: true
    })
    
    // Período anterior para comparação
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)
    
    const previousRevenue = await prisma.order.aggregate({
      where: {
        restaurantId: restaurantData.id,
        status: 'completed',
        createdAt: { gte: previousStartDate, lt: startDate }
      },
      _sum: { total: true }
    })
    
    // Calcular crescimento
    const currentTotal = currentRevenue._sum.total || 0
    const previousTotal = previousRevenue._sum.total || 0
    const growth = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0
    
    // Status dos pedidos
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: {
        restaurantId: restaurantData.id,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: true
    })
    
    // Métricas de clientes
    const totalCustomers = await prisma.order.findMany({
      where: {
        restaurantId: restaurantData.id,
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { customerName: true, customerPhone: true },
      distinct: ['customerPhone']
    })
    
    const newCustomers = await prisma.order.findMany({
      where: {
        restaurantId: restaurantData.id,
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { customerPhone: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    })
    
    // Processar novos vs recorrentes
    const phoneFirstOrder = new Map()
    newCustomers.forEach(order => {
      if (!phoneFirstOrder.has(order.customerPhone)) {
        phoneFirstOrder.set(order.customerPhone, order.createdAt)
      }
    })
    
    const newCustomersCount = Array.from(phoneFirstOrder.values())
      .filter(firstOrder => firstOrder >= startDate).length
    
    const response: OverviewMetrics = {
      revenue: {
        current: currentTotal,
        previous: previousTotal,
        growth: Math.round(growth * 100) / 100
      },
      orders: {
        total: currentRevenue._count,
        completed: orderStats.find(s => s.status === 'completed')?._count || 0,
        cancelled: orderStats.find(s => s.status === 'cancelled')?._count || 0,
        pending: orderStats.find(s => s.status === 'pending')?._count || 0
      },
      customers: {
        total: totalCustomers.length,
        new: newCustomersCount,
        returning: totalCustomers.length - newCustomersCount
      },
      averageOrderValue: currentTotal / (currentRevenue._count || 1),
      conversionRate: currentRevenue._count > 0 ? 
        (orderStats.find(s => s.status === 'completed')?._count || 0) / currentRevenue._count * 100 : 0
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 2.2 API de Vendas por Período (1 dia)

```typescript
// app/api/admin/analytics/sales/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const restaurant = searchParams.get('restaurant')
  const days = parseInt(searchParams.get('days') || '30')
  
  try {
    const restaurantData = await prisma.restaurant.findUnique({
      where: { slug: restaurant }
    })
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    // Agrupar vendas por dia
    const salesByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        restaurantId: restaurantData!.id,
        status: 'completed',
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { total: true },
      _count: true,
      orderBy: { createdAt: 'asc' }
    })
    
    // Processar dados para gráfico
    const salesData: SalesData[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayData = salesByDay.find(s => 
        s.createdAt.toISOString().split('T')[0] === dateStr
      )
      
      salesData.push({
        date: dateStr,
        revenue: dayData?._sum.total || 0,
        orders: dayData?._count || 0,
        averageOrder: dayData?._count ? (dayData._sum.total || 0) / dayData._count : 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return NextResponse.json(salesData)
    
  } catch (error) {
    console.error('Sales analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 2.3 API de Produtos Mais Vendidos (1 dia)

```typescript
// app/api/admin/analytics/products/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const restaurant = searchParams.get('restaurant')
  const days = parseInt(searchParams.get('days') || '30')
  const limit = parseInt(searchParams.get('limit') || '10')
  
  try {
    const restaurantData = await prisma.restaurant.findUnique({
      where: { slug: restaurant }
    })
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    // Buscar itens de pedidos mais vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          restaurantId: restaurantData!.id,
          status: 'completed',
          createdAt: { gte: startDate, lte: endDate }
        }
      },
      _sum: { 
        quantity: true,
        subtotal: true 
      },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit
    })
    
    // Buscar informações dos produtos
    const productIds = topProducts.map(p => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true }
    })
    
    // Período anterior para calcular crescimento
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)
    
    const previousProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        order: {
          restaurantId: restaurantData!.id,
          status: 'completed',
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      },
      _sum: { quantity: true },
    })
    
    // Combinar dados
    const productAnalytics: ProductAnalytics[] = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId)!
      const previousData = previousProducts.find(p => p.productId === item.productId)
      
      const currentSales = item._sum.quantity || 0
      const previousSales = previousData?._sum.quantity || 0
      const growth = previousSales > 0 
        ? ((currentSales - previousSales) / previousSales) * 100 
        : 0
      
      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        sales: currentSales,
        revenue: item._sum.subtotal || 0,
        growth: Math.round(growth * 100) / 100,
        availability: product.available
      }
    })
    
    return NextResponse.json(productAnalytics)
    
  } catch (error) {
    console.error('Products analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 2.4 API de Métricas de Clientes (1 dia)

```typescript
// app/api/admin/analytics/customers/route.ts
export async function GET(request: NextRequest) {
  // Implementação similar com análise de:
  // - Novos clientes vs recorrentes
  // - Ticket médio por cliente
  // - Frequência de pedidos
  // - Horários de pico
  // - Métodos de pagamento preferidos
}
```

---

📈 FASE 3: Componentes de Visualização (3 dias)
==============================================

## 3.1 Componentes de Gráficos com Recharts (2 dias)

```typescript
// components/charts/SalesLineChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SalesData } from '@/types/analytics'

interface SalesLineChartProps {
  data: SalesData[]
  loading?: boolean
}

export function SalesLineChart({ data, loading }: SalesLineChartProps) {
  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
        />
        <YAxis 
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
        />
        <Tooltip 
          labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

```typescript
// components/charts/ProductsBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ProductAnalytics } from '@/types/analytics'

interface ProductsBarChartProps {
  data: ProductAnalytics[]
  loading?: boolean
}

export function ProductsBarChart({ data, loading }: ProductsBarChartProps) {
  if (loading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [value, 'Vendas']}
        />
        <Bar 
          dataKey="sales" 
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

## 3.2 Cards de Métricas Avançados (1 dia)

```typescript
// components/analytics/MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  growth?: number
  progress?: number
  icon?: React.ReactNode
  loading?: boolean
  variant?: 'default' | 'revenue' | 'orders' | 'customers'
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  growth, 
  progress, 
  icon, 
  loading,
  variant = 'default'
}: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[120px] mb-2" />
          <Skeleton className="h-3 w-[80px]" />
        </CardContent>
      </Card>
    )
  }

  const getVariantColor = () => {
    switch (variant) {
      case 'revenue':
        return 'text-green-600'
      case 'orders':
        return 'text-blue-600'
      case 'customers':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={getVariantColor()}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {subtitle && <span>{subtitle}</span>}
          {growth !== undefined && (
            <Badge 
              variant={growth >= 0 ? "default" : "destructive"}
              className="h-5 px-1"
            >
              {growth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(growth)}%
            </Badge>
          )}
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-3" />
        )}
      </CardContent>
    </Card>
  )
}
```

---

🎛️ FASE 4: Dashboard Principal (4 dias)
=======================================

## 4.1 Página Principal do Dashboard (2 dias)

```typescript
// app/[slug]/admin/dashboard/page.tsx
'use client'

import { useAnalyticsOverview, useAnalyticsSales, useAnalyticsProducts } from '@/hooks/useAnalytics'
import { MetricCard } from '@/components/analytics/MetricCard'
import { SalesLineChart } from '@/components/charts/SalesLineChart'
import { ProductsBarChart } from '@/components/charts/ProductsBarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  RefreshCw,
  Calendar
} from 'lucide-react'
import { useState } from 'react'

interface DashboardPageProps {
  params: { slug: string }
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  
  // Hooks para dados
  const { 
    data: overview, 
    isLoading: overviewLoading, 
    error: overviewError,
    refetch: refetchOverview 
  } = useAnalyticsOverview(params.slug, selectedPeriod)
  
  const { 
    data: salesData, 
    isLoading: salesLoading 
  } = useAnalyticsSales(params.slug, selectedPeriod)
  
  const { 
    data: productsData, 
    isLoading: productsLoading 
  } = useAnalyticsProducts(params.slug, selectedPeriod, 8)

  const handleRefresh = () => {
    refetchOverview()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Visão geral das métricas do seu restaurante
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Error State */}
      {overviewError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(overview?.revenue.current || 0)}
          subtitle={`vs ${formatCurrency(overview?.revenue.previous || 0)} período anterior`}
          growth={overview?.revenue.growth}
          icon={<DollarSign className="h-4 w-4" />}
          loading={overviewLoading}
          variant="revenue"
        />
        
        <MetricCard
          title="Pedidos"
          value={overview?.orders.total || 0}
          subtitle={`${overview?.orders.completed || 0} concluídos`}
          progress={overview?.orders.total ? (overview.orders.completed / overview.orders.total) * 100 : 0}
          icon={<ShoppingBag className="h-4 w-4" />}
          loading={overviewLoading}
          variant="orders"
        />
        
        <MetricCard
          title="Clientes"
          value={overview?.customers.total || 0}
          subtitle={`${overview?.customers.new || 0} novos clientes`}
          icon={<Users className="h-4 w-4" />}
          loading={overviewLoading}
          variant="customers"
        />
        
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(overview?.averageOrderValue || 0)}
          subtitle={`Taxa conversão: ${overview?.conversionRate?.toFixed(1) || 0}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={overviewLoading}
        />
      </div>

      {/* Status dos Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Status dos Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                Concluídos: {overview?.orders.completed || 0}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                Pendentes: {overview?.orders.pending || 0}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">
                Cancelados: {overview?.orders.cancelled || 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesLineChart data={salesData || []} loading={salesLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsBarChart data={productsData || []} loading={productsLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}