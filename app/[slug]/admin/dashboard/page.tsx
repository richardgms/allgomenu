'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SalesLineChart } from '@/components/charts/SalesLineChart'
import { ProductsBarChart } from '@/components/charts/ProductsBarChart'
import { MetricCard } from '@/components/charts/MetricCard'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Clock, 
  Star,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { 
  useAnalyticsOverview, 
  useSalesData, 
  useProductAnalytics,
  useAllAnalytics 
} from '@/hooks/useAnalytics'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  salesGrowth: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    customer: string
    total: number
    status: string
    time: string
  }>
}

export default function AdminDashboard() {
  const params = useParams()
  const slug = params.slug as string
  const [selectedPeriod, setSelectedPeriod] = useState('30')

  // Hooks para dados reais
  const { 
    data: overview, 
    isLoading: overviewLoading, 
    error: overviewError,
    refetch: refetchOverview 
  } = useAnalyticsOverview(slug, parseInt(selectedPeriod))
  
  const { 
    data: salesData, 
    isLoading: salesLoading,
    refetch: refetchSales 
  } = useSalesData(slug, parseInt(selectedPeriod))
  
  const { 
    data: productsData, 
    isLoading: productsLoading,
    refetch: refetchProducts 
  } = useProductAnalytics(slug, parseInt(selectedPeriod))

  const handleRefresh = () => {
    refetchOverview()
    refetchSales()
    refetchProducts()
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
            Visão geral das métricas do seu restaurante em tempo real
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
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={overviewLoading || salesLoading || productsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(overviewLoading || salesLoading || productsLoading) ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Error State */}
      {overviewError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(overview?.totalRevenue || 0)}
          subtitle={`${selectedPeriod} dias`}
          growth={overview?.revenueChange}
          icon={<DollarSign className="h-4 w-4" />}
          loading={overviewLoading}
          variant="revenue"
        />
        
        <MetricCard
          title="Total de Pedidos"
          value={overview?.totalOrders || 0}
          subtitle={`${selectedPeriod} dias`}
          growth={overview?.ordersChange}
          icon={<ShoppingBag className="h-4 w-4" />}
          loading={overviewLoading}
          variant="orders"
        />
        
        <MetricCard
          title="Clientes Únicos"
          value={overview?.totalCustomers || 0}
          subtitle={`${selectedPeriod} dias`}
          icon={<Users className="h-4 w-4" />}
          loading={overviewLoading}
          variant="customers"
        />
        
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(overview?.averageOrderValue || 0)}
          subtitle={`Taxa conversão: ${overview?.conversionRate?.toFixed(1) || 0}%`}
          progress={overview?.conversionRate}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={overviewLoading}
        />
      </div>

      {/* Gráficos Principais */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales">Evolução de Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos Mais Vendidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <SalesLineChart 
            data={salesData || []} 
            loading={salesLoading}
            title="Evolução de Vendas"
            height={350}
          />
        </TabsContent>
        
        <TabsContent value="products">
          <div className="grid gap-4 lg:grid-cols-2">
            <ProductsBarChart 
              data={productsData || []} 
              loading={productsLoading}
              title="Por Quantidade Vendida"
              height={350}
              dataKey="sales"
            />
            <ProductsBarChart 
              data={productsData || []} 
              loading={productsLoading}
              title="Por Receita Gerada"
              height={350}
              dataKey="revenue"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Resumo de Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Resumo Operacional
            </CardTitle>
            <CardDescription>
              Status atual do restaurante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status do Restaurante</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de Produtos</span>
                <span className="text-sm font-medium">{overview?.totalProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Conversão</span>
                <span className="text-sm font-medium">{overview?.conversionRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Período Analisado</span>
                <span className="text-sm font-medium">{selectedPeriod} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top 5 Produtos
            </CardTitle>
            <CardDescription>
              Produtos mais vendidos no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productsLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
              ) : (
                productsData?.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum produto encontrado no período
                  </p>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}