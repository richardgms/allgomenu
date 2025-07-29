'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Clock, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw
} from 'lucide-react'

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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalSales: 12450.50,
        totalOrders: 156,
        totalCustomers: 89,
        averageOrderValue: 79.81,
        salesGrowth: 12.5,
        topProducts: [
          { id: '1', name: 'Pizza Margherita', sales: 45, revenue: 1350.00 },
          { id: '2', name: 'Hambúrguer Clássico', sales: 38, revenue: 1140.00 },
          { id: '3', name: 'Batata Frita', sales: 67, revenue: 670.00 },
          { id: '4', name: 'Refrigerante', sales: 89, revenue: 445.00 },
        ],
        recentOrders: [
          { id: 'ORD-001', customer: 'João Silva', total: 89.50, status: 'preparing', time: '5 min' },
          { id: 'ORD-002', customer: 'Maria Santos', total: 145.00, status: 'ready', time: '12 min' },
          { id: 'ORD-003', customer: 'Pedro Costa', total: 67.80, status: 'delivered', time: '25 min' },
          { id: 'ORD-004', customer: 'Ana Lima', total: 98.20, status: 'pending', time: '2 min' },
        ]
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Acompanhe o desempenho do seu restaurante em tempo real
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Vendas Hoje"
          value={`R$ ${stats?.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={stats?.salesGrowth}
          trendLabel="vs. ontem"
        />
        <StatCard
          title="Pedidos"
          value={stats?.totalOrders.toString() || '0'}
          icon={ShoppingBag}
          trend={8.2}
          trendLabel="vs. ontem"
        />
        <StatCard
          title="Clientes"
          value={stats?.totalCustomers.toString() || '0'}
          icon={Users}
          trend={-2.1}
          trendLabel="vs. ontem"
        />
        <StatCard
          title="Ticket Médio"
          value={`R$ ${stats?.averageOrderValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend={5.3}
          trendLabel="vs. ontem"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pedidos Recentes
              </CardTitle>
              <CardDescription>
                Acompanhe os pedidos em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <div className="text-right">
                        <p className="font-medium">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-gray-500">{order.time} atrás</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Produtos Populares
              </CardTitle>
              <CardDescription>
                Seus produtos mais vendidos hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance das Vendas</CardTitle>
            <CardDescription>
              Vendas dos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, index) => {
                const value = Math.floor(Math.random() * 100) + 20
                return (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-20 text-sm">{day}</div>
                    <div className="flex-1">
                      <Progress value={value} className="h-2" />
                    </div>
                    <div className="w-16 text-sm font-medium text-right">
                      R$ {(value * 50).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Atual</CardTitle>
            <CardDescription>
              Resumo do funcionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Restaurante</span>
                <Badge className="bg-green-100 text-green-800">Aberto</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pedidos Pendentes</span>
                <Badge variant="secondary">4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tempo Médio de Preparo</span>
                <span className="text-sm font-medium">18 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Produtos Disponíveis</span>
                <span className="text-sm font-medium">23/25</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avaliação Média</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}