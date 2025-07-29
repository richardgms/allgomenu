'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatCard } from '@/components/StatCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { 
  useAnalyticsOverview, 
  useSalesData, 
  useProductAnalytics, 
  useCustomerAnalytics,
  usePerformanceMetrics 
} from '@/hooks/useAnalytics'


export default function AnalyticsPage() {
  const params = useParams()
  const restaurantSlug = params.slug as string
  const [dateRange, setDateRange] = useState('30d')
  
  // Converter período para dias
  const getDaysFromRange = (range: string) => {
    switch (range) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      default: return 30
    }
  }
  
  const days = getDaysFromRange(dateRange)
  
  // Hooks para buscar dados
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useAnalyticsOverview(restaurantSlug, days)
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useSalesData(restaurantSlug, days)
  const { data: productData, isLoading: productLoading, refetch: refetchProducts } = useProductAnalytics(restaurantSlug, days)
  const { data: customerData, isLoading: customerLoading, refetch: refetchCustomers } = useCustomerAnalytics(restaurantSlug, days)
  const { data: performanceData, isLoading: performanceLoading, refetch: refetchPerformance } = usePerformanceMetrics(restaurantSlug, days)
  
  const isLoading = overviewLoading || salesLoading || productLoading || customerLoading || performanceLoading
  
  const refetchAll = () => {
    refetchOverview()
    refetchSales()
    refetchProducts()
    refetchCustomers()
    refetchPerformance()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Relatórios detalhados e insights do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refetchAll} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {isLoading && !overview ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <LoadingSpinner className="mx-auto" />
            </Card>
          ))}
        </div>
      ) : overview ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Receita Total"
            value={`R$ ${overview.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend={overview.revenueChange}
            trendLabel="vs. período anterior"
          />
          <StatCard
            title="Total de Pedidos"
            value={overview.totalOrders.toString()}
            icon={ShoppingBag}
            trend={overview.ordersChange}
            trendLabel="vs. período anterior"
          />
          <StatCard
            title="Total de Clientes"
            value={overview.totalCustomers.toString()}
            icon={Users}
            trend={0} // TODO: calcular mudança de clientes
            trendLabel="vs. período anterior"
          />
          <StatCard
            title="Ticket Médio"
            value={`R$ ${overview.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={Clock}
            trend={0} // TODO: calcular mudança de ticket médio
            trendLabel="vs. período anterior"
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Erro ao carregar dados de overview</p>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Vendas</CardTitle>
                <CardDescription>
                  Evolução das vendas nos últimos {days} dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : salesData && salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'revenue' ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : value,
                          name === 'revenue' ? 'Receita' : name === 'orders' ? 'Pedidos' : 'Clientes'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado de vendas encontrado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders by Date */}
            <Card>
              <CardHeader>
                <CardTitle>Pedidos por Dia</CardTitle>
                <CardDescription>
                  Número de pedidos nos últimos {days} dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : salesData && salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado de pedidos encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>
                  Indicadores de qualidade do serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : performanceData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{performanceData.averagePreparationTime} min</p>
                        <p className="text-sm text-gray-600">Tempo de Preparo</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{performanceData.averageDeliveryTime} min</p>
                        <p className="text-sm text-gray-600">Tempo de Entrega</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{performanceData.orderAccuracy}%</p>
                        <p className="text-sm text-gray-600">Precisão dos Pedidos</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{performanceData.customerSatisfaction}/5</p>
                        <p className="text-sm text-gray-600">Satisfação</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Erro ao carregar métricas de performance
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hourly Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Horários de Pico</CardTitle>
                <CardDescription>
                  Distribuição de pedidos por hora do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : performanceData?.peakHours ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData.peakHours.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="orderCount"
                        stroke="#00C49F"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado de horários encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Detalhado de Vendas</CardTitle>
              <CardDescription>
                Análise completa do desempenho financeiro nos últimos {days} dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : salesData && salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : value,
                        name === 'revenue' ? 'Receita' : name === 'orders' ? 'Pedidos' : 'Clientes'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#0088FE" name="Receita (R$)" />
                    <Bar dataKey="orders" fill="#00C49F" name="Número de Pedidos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  Nenhum dado de vendas encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Produtos</CardTitle>
                <CardDescription>
                  Produtos mais vendidos no período de {days} dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : productData && productData.length > 0 ? (
                  <div className="space-y-4">
                    {productData.slice(0, 10).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.totalSold} vendas • {product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <Progress 
                            value={productData.length > 0 ? (product.totalSold / Math.max(...productData.map(p => p.totalSold))) * 100 : 0} 
                            className="w-20 h-2 mt-1" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    Nenhum produto encontrado
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Categoria</CardTitle>
                <CardDescription>
                  Distribuição de receita por categoria de produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : productData && productData.length > 0 ? (
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={(() => {
                            const categoryMap = new Map<string, { name: string; value: number; color: string }>()
                            const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']
                            
                            productData.forEach((product) => {
                              if (categoryMap.has(product.category)) {
                                categoryMap.get(product.category)!.value += product.revenue
                              } else {
                                categoryMap.set(product.category, {
                                  name: product.category,
                                  value: product.revenue,
                                  color: colors[categoryMap.size % colors.length]
                                })
                              }
                            })
                            
                            return Array.from(categoryMap.values())
                          })()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(() => {
                            const categoryMap = new Map<string, { name: string; value: number; color: string }>()
                            const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']
                            
                            productData.forEach((product) => {
                              if (categoryMap.has(product.category)) {
                                categoryMap.get(product.category)!.value += product.revenue
                              } else {
                                categoryMap.set(product.category, {
                                  name: product.category,
                                  value: product.revenue,
                                  color: colors[categoryMap.size % colors.length]
                                })
                              }
                            })
                            
                            return Array.from(categoryMap.values())
                          })().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    Nenhum dado de categoria encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Clientes</CardTitle>
                <CardDescription>
                  Comportamento e segmentação de clientes nos últimos {days} dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customerLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : customerData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Total de Clientes</p>
                        <p className="text-sm text-gray-500">Fizeram pedido no período</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{customerData.totalCustomers}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Novos Clientes</p>
                        <p className="text-sm text-gray-500">Primeiro pedido no período</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{customerData.newCustomers}</p>
                        <p className="text-sm text-blue-600">
                          {customerData.totalCustomers > 0 
                            ? `${Math.round((customerData.newCustomers / customerData.totalCustomers) * 100)}% do total`
                            : '0% do total'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Clientes Recorrentes</p>
                        <p className="text-sm text-gray-500">Já fizeram pedidos antes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{customerData.returningCustomers}</p>
                        <p className="text-sm text-green-600">
                          {customerData.totalCustomers > 0 
                            ? `${Math.round((customerData.returningCustomers / customerData.totalCustomers) * 100)}% do total`
                            : '0% do total'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Ticket Médio</p>
                        <p className="text-sm text-gray-500">Valor médio por pedido</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">R$ {customerData.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Erro ao carregar dados de clientes
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Localizações</CardTitle>
                <CardDescription>
                  Principais regiões de entrega
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customerLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : customerData?.topLocations && customerData.topLocations.length > 0 ? (
                  <div className="space-y-4">
                    {customerData.topLocations.map((location, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.location}</span>
                          <span className="text-sm font-medium">{location.count} pedidos</span>
                        </div>
                        <Progress 
                          value={customerData.topLocations.length > 0 
                            ? (location.count / Math.max(...customerData.topLocations.map(l => l.count))) * 100 
                            : 0
                          } 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado de localização encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}