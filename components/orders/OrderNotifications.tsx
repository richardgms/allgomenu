'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, ShoppingBag, Clock, X, CheckCircle } from 'lucide-react'
import { useOrderUpdates } from '@/lib/websocket/useOrderUpdates'

interface OrderNotificationsProps {
  restaurantSlug: string
}

export function OrderNotifications({ restaurantSlug }: OrderNotificationsProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const { updates, isConnected, unreadCount, markAsRead, clearUpdates } = useOrderUpdates(restaurantSlug)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag className="h-5 w-5 text-green-600" />
      case 'status_change':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'cancelled':
        return <X className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {/* Indicador de conexão */}
      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      {showNotifications && (
        <div className="absolute right-0 top-10 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium">Notificações</h3>
            {updates.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  clearUpdates()
                  setShowNotifications(false)
                }}
                className="text-xs"
              >
                Limpar todas
              </Button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {updates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma notificação</p>
                <p className="text-xs mt-1">
                  Status: {isConnected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {updates.map((update) => (
                  <div 
                    key={update.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !update.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => markAsRead(update.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(update.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          !update.read ? 'font-medium text-gray-900' : 'text-gray-700'
                        }`}>
                          {update.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {update.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!update.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {updates.length > 0 && (
            <div className="p-2 border-t bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}