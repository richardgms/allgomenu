'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Truck
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Order {
  id: string
  code: string
  customerName: string
  customerPhone: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  total: number
  items: OrderItem[]
  createdAt: Date
  deliveryAddress?: string
}

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

interface OrderKanbanProps {
  orders: Order[]
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void
  onViewOrder: (order: Order) => void
}

const statusColumns = [
  { 
    id: 'PENDING', 
    title: 'Novos Pedidos', 
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-600'
  },
  { 
    id: 'CONFIRMED', 
    title: 'Confirmados', 
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
    iconColor: 'text-blue-600'
  },
  { 
    id: 'PREPARING', 
    title: 'Preparando', 
    color: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    icon: Clock,
    iconColor: 'text-orange-600'
  },
  { 
    id: 'READY', 
    title: 'Prontos', 
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  { 
    id: 'DELIVERED', 
    title: 'Entregues', 
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    icon: Truck,
    iconColor: 'text-gray-600'
  }
] as const

export function OrderKanban({ orders, onUpdateOrderStatus, onViewOrder }: OrderKanbanProps) {
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null)

  const getColumnOrders = (status: Order['status']) => {
    return orders.filter(order => order.status === status)
  }

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrder(orderId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: Order['status']) => {
    e.preventDefault()
    if (draggedOrder && draggedOrder !== newStatus) {
      onUpdateOrderStatus(draggedOrder, newStatus)
    }
    setDraggedOrder(null)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d atrás`
  }

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'PREPARING', 
      'PREPARING': 'READY',
      'READY': 'DELIVERED',
      'DELIVERED': null,
      'CANCELLED': null
    }
    return statusFlow[currentStatus]
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {statusColumns.map((column) => {
        const columnOrders = getColumnOrders(column.id as Order['status'])
        const Icon = column.icon
        
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Order['status'])}
          >
            {/* Column Header */}
            <div className={`rounded-t-lg border-2 ${column.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${column.iconColor}`} />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {columnOrders.length}
                </Badge>
              </div>
            </div>

            {/* Column Content */}
            <div className={`min-h-96 border-2 border-t-0 ${column.color} rounded-b-lg p-2 space-y-3`}>
              {columnOrders.map((order) => (
                <Card
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className={`cursor-move hover:shadow-md transition-shadow ${
                    draggedOrder === order.id ? 'opacity-50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {order.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {order.customerName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            #{order.code}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewOrder(order)}>
                            Ver detalhes
                          </DropdownMenuItem>
                          {getNextStatus(order.status) && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateOrderStatus(order.id, getNextStatus(order.status)!)}
                            >
                              Avançar status
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Order Value */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-600">
                        R$ {order.total.toFixed(2)}
                      </span>
                      <Badge className={column.badge}>
                        {column.title}
                      </Badge>
                    </div>

                    {/* Order Items Summary */}
                    <div className="space-y-1 mb-3">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="truncate">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-muted-foreground">
                            R$ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{order.items.length - 2} itens...
                        </p>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{order.customerPhone}</span>
                      </div>
                      
                      {order.deliveryAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(order.createdAt)}</span>
                      </div>
                    </div>

                    {/* Quick Action */}
                    {getNextStatus(order.status) && (
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => onUpdateOrderStatus(order.id, getNextStatus(order.status)!)}
                      >
                        Avançar
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {columnOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Icon className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Nenhum pedido</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}