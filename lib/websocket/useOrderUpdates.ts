import { useState, useEffect, useCallback } from 'react'
import { useOrderStore } from '@/stores/useOrderStore'

interface OrderUpdate {
  id: string
  type: 'new_order' | 'status_change' | 'cancelled'
  orderId: string
  customerName: string
  message: string
  timestamp: Date
  read: boolean
}

export function useOrderUpdates(restaurantSlug: string) {
  const [updates, setUpdates] = useState<OrderUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { orders, fetchOrders, previousOrderCount } = useOrderStore()

  // Simular conexão WebSocket com polling
  useEffect(() => {
    if (!restaurantSlug) return

    setIsConnected(true)
    
    // Polling para verificar novos pedidos
    const interval = setInterval(async () => {
      try {
        await fetchOrders(restaurantSlug)
        
        // Verificar se há novos pedidos
        if (orders.length > previousOrderCount) {
          const newOrders = orders.slice(0, orders.length - previousOrderCount)
          
          newOrders.forEach(order => {
            const update: OrderUpdate = {
              id: Math.random().toString(36),
              type: 'new_order',
              orderId: order.id,
              customerName: order.customerName,
              message: `Novo pedido de ${order.customerName} - R$ ${order.total.toFixed(2)}`,
              timestamp: new Date(),
              read: false
            }
            
            setUpdates(prev => [update, ...prev])
            playNotificationSound()
          })
        }
      } catch (error) {
        console.error('Erro ao verificar pedidos:', error)
        setIsConnected(false)
      }
    }, 10000) // Verificar a cada 10 segundos

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [restaurantSlug, orders.length, previousOrderCount, fetchOrders])

  const markAsRead = useCallback((id: string) => {
    setUpdates(prev => prev.map(update => 
      update.id === id ? { ...update, read: true } : update
    ))
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  const unreadCount = updates.filter(update => !update.read).length

  return {
    updates,
    isConnected,
    unreadCount,
    markAsRead,
    clearUpdates
  }
}

function playNotificationSound() {
  try {
    // Criar som usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configurar som de notificação
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.log('Não foi possível tocar o som de notificação')
  }
}