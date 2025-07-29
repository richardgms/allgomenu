'use client'

import React, { useState } from 'react'
import { RefreshCw, Bell, Search, Filter, AlertCircle, ChefHat, CheckCircle, Truck, DollarSign, MoreHorizontal, Eye, MessageSquare, Kanban, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderKanban } from '@/components/orders/OrderKanban'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react'

interface Order {
  id: string
  customer: {
    name: string
    phone: string
    address?: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    notes?: string
  }>
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  createdAt: string
  estimatedTime?: number
  deliveryType: 'pickup' | 'delivery'
  notes?: string
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: {
      name: 'João Silva',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - Centro'
    },
    items: [
      { id: '1', name: 'Pizza Margherita', quantity: 1, price: 35.90 },
      { id: '2', name: 'Coca-Cola 350ml', quantity: 2, price: 5.90 }
    ],
    total: 47.70,
    status: 'pending',
    paymentMethod: 'Dinheiro',
    paymentStatus: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    deliveryType: 'delivery',
    notes: 'Sem cebola na pizza'
  },
  {
    id: 'ORD-002',
    customer: {
      name: 'Maria Santos',
      phone: '(11) 88888-8888'
    },
    items: [
      { id: '3', name: 'Hambúrguer Clássico', quantity: 2, price: 28.90 },
      { id: '4', name: 'Batata Frita', quantity: 1, price: 12.90 }
    ],
    total: 70.70,
    status: 'preparing',
    paymentMethod: 'PIX',
    paymentStatus: 'paid',
    createdAt: '2024-01-15T10:15:00Z',
    estimatedTime: 25,
    deliveryType: 'pickup'
  },
  {
    id: 'ORD-003',
    customer: {
      name: 'Pedro Costa',
      phone: '(11) 77777-7777',
      address: 'Av. Principal, 456 - Jardim'
    },
    items: [
      { id: '5', name: 'Pizza Calabresa', quantity: 1, price: 38.90 }
    ],
    total: 38.90,
    status: 'ready',
    paymentMethod: 'Cartão',
    paymentStatus: 'paid',
    createdAt: '2024-01-15T09:45:00Z',
    deliveryType: 'delivery'
  }
]

const statusConfig = {
  pending: { label: 'Pendente', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparando', icon: ChefHat, color: 'bg-orange-100 text-orange-800' },
  ready: { label: 'Pronto', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  out_for_delivery: { label: 'Saiu para entrega', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelado', icon: AlertCircle, color: 'bg-red-100 text-red-800' }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending'),
    confirmed: orders.filter(o => o.status === 'confirmed'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
    out_for_delivery: orders.filter(o => o.status === 'out_for_delivery')
  }

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }

  // Converter orders para formato do Kanban
  const convertToKanbanFormat = (orders: Order[]) => {
    return orders.map(order => ({
      id: order.id,
      code: order.id,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      status: order.status.toUpperCase() as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED',
      total: order.total,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      createdAt: new Date(order.createdAt),
      deliveryAddress: order.customer.address
    }))
  }

  const handleViewOrder = (order: any) => {
    // Converter de volta para o formato original
    const originalOrder = orders.find(o => o.id === order.id)
    if (originalOrder) {
      setSelectedOrder(originalOrder)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const orderTime = new Date(dateString)
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`
    } else {
      return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}min atrás`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Pedidos</h1>
          <p className="text-gray-600">
            Acompanhe e gerencie pedidos em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </Button>
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <Kanban className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold">{ordersByStatus.pending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Preparando</p>
                <p className="text-2xl font-bold">{ordersByStatus.preparing.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Prontos</p>
                <p className="text-2xl font-bold">{ordersByStatus.ready.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Entregando</p>
                <p className="text-2xl font-bold">{ordersByStatus.out_for_delivery.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Faturamento</p>
                <p className="text-2xl font-bold">R$ 847</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - apenas para modo lista */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por ID ou nome do cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="out_for_delivery">Saiu para entrega</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content - Kanban ou Lista */}
      {viewMode === 'kanban' ? (
        <OrderKanban
          orders={convertToKanbanFormat(orders)}
          onUpdateOrderStatus={(orderId, status) => 
            updateOrderStatus(orderId, status.toLowerCase() as Order['status'])
          }
          onViewOrder={handleViewOrder}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status]
            const Icon = statusInfo.icon
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customer.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="outline">
                          {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                        </Badge>
                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {order.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{getTimeAgo(order.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation() }}>
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation() }}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}
                        >
                          <SelectTrigger className="w-40" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="preparing">Preparando</SelectItem>
                            <SelectItem value="ready">Pronto</SelectItem>
                            <SelectItem value="out_for_delivery">Saiu para entrega</SelectItem>
                            <SelectItem value="delivered">Entregue</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          {order.items.map((item, index) => (
                            <span key={item.id}>
                              {item.quantity}x {item.name}
                              {index < order.items.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {order.deliveryType === 'delivery' && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>Entrega</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{order.estimatedTime ? `${order.estimatedTime} min` : 'Aguardando'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {order.notes && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                        <strong>Observações:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Informações completas do pedido
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nome:</strong> {selectedOrder.customer.name}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.customer.phone}</p>
                    {selectedOrder.customer.address && (
                      <p><strong>Endereço:</strong> {selectedOrder.customer.address}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Informações do Pedido</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Tipo:</strong> {selectedOrder.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}</p>
                    <p><strong>Pagamento:</strong> {selectedOrder.paymentMethod}</p>
                    <p><strong>Status:</strong> {statusConfig[selectedOrder.status].label}</p>
                    <p><strong>Horário:</strong> {getTimeAgo(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                <div className="border rounded-lg">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item.id} className={`p-3 flex items-center justify-between ${index !== selectedOrder.items.length - 1 ? 'border-b' : ''}`}>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.notes && (
                          <p className="text-sm text-gray-600">Obs: {item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">R$ {(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 border-t bg-gray-50 flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Ligar
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button>
                  Imprimir Comanda
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}