import { create } from 'zustand'
import { Order, OrderStatus } from '@prisma/client'

interface OrderStore {
  orders: Order[]
  selectedOrder: Order | null
  previousOrderCount: number
  isLoading: boolean
  error: string | null
  filters: {
    status: OrderStatus | 'ALL'
    search: string
    dateRange: {
      from: Date | null
      to: Date | null
    }
  }
  
  // Actions
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  fetchOrders: (restaurantSlug: string) => Promise<void>
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  removeOrder: (orderId: string) => void
  setSelectedOrder: (order: Order | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Filter actions
  setStatusFilter: (status: OrderStatus | 'ALL') => void
  setSearchFilter: (search: string) => void
  setDateRangeFilter: (from: Date | null, to: Date | null) => void
  clearFilters: () => void
  
  // Order actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  markWhatsAppSent: (orderId: string) => void
  
  // Computed getters
  getOrdersByStatus: (status: OrderStatus) => Order[]
  getFilteredOrders: () => Order[]
  getTotalsByStatus: () => Record<OrderStatus, number>
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  previousOrderCount: 0,
  isLoading: false,
  error: null,
  filters: {
    status: 'ALL',
    search: '',
    dateRange: {
      from: null,
      to: null
    }
  },
  
  setOrders: (orders) => {
    const previousCount = get().orders.length
    set({ orders, previousOrderCount: previousCount, error: null })
  },
  
  fetchOrders: async (restaurantSlug: string) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`/api/admin/orders?restaurant=${restaurantSlug}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const orders = await response.json()
      get().setOrders(orders)
    } catch (error) {
      set({ error: error.message, isLoading: false })
    } finally {
      set({ isLoading: false })
    }
  },
  
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders]
  })),
  
  updateOrder: (orderId, updates) => set((state) => ({
    orders: state.orders.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ),
    selectedOrder: state.selectedOrder?.id === orderId 
      ? { ...state.selectedOrder, ...updates } 
      : state.selectedOrder
  })),
  
  removeOrder: (orderId) => set((state) => ({
    orders: state.orders.filter(order => order.id !== orderId),
    selectedOrder: state.selectedOrder?.id === orderId ? null : state.selectedOrder
  })),
  
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearError: () => set({ error: null }),
  
  setStatusFilter: (status) => set((state) => ({
    filters: { ...state.filters, status }
  })),
  
  setSearchFilter: (search) => set((state) => ({
    filters: { ...state.filters, search }
  })),
  
  setDateRangeFilter: (from, to) => set((state) => ({
    filters: { ...state.filters, dateRange: { from, to } }
  })),
  
  clearFilters: () => set({
    filters: {
      status: 'ALL',
      search: '',
      dateRange: { from: null, to: null }
    }
  }),
  
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date() }
        : order
    )
  })),
  
  markWhatsAppSent: (orderId) => set((state) => ({
    orders: state.orders.map(order => 
      order.id === orderId 
        ? { ...order, whatsappSent: true, sentAt: new Date() }
        : order
    )
  })),
  
  getOrdersByStatus: (status) => {
    const { orders } = get()
    return orders.filter(order => order.status === status)
  },
  
  getFilteredOrders: () => {
    const { orders, filters } = get()
    
    return orders.filter(order => {
      // Status filter
      if (filters.status !== 'ALL' && order.status !== filters.status) {
        return false
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = 
          order.customerName.toLowerCase().includes(searchTerm) ||
          order.customerPhone.includes(searchTerm) ||
          order.code.toLowerCase().includes(searchTerm)
        
        if (!matchesSearch) return false
      }
      
      // Date range filter
      if (filters.dateRange.from && order.createdAt < filters.dateRange.from) {
        return false
      }
      
      if (filters.dateRange.to && order.createdAt > filters.dateRange.to) {
        return false
      }
      
      return true
    })
  },
  
  getTotalsByStatus: () => {
    const { orders } = get()
    const totals = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY: 0,
      DELIVERED: 0,
      CANCELLED: 0
    }
    
    orders.forEach(order => {
      totals[order.status]++
    })
    
    return totals
  }
}))

// WebSocket store para notificações em tempo real
interface WebSocketStore {
  socket: WebSocket | null
  isConnected: boolean
  notifications: OrderNotification[]
  connect: (restaurantSlug: string) => void
  disconnect: () => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

interface OrderNotification {
  id: string
  type: 'new_order' | 'order_update' | 'order_cancelled'
  orderId: string
  customerName: string
  message: string
  timestamp: Date
  read: boolean
}

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  connect: (restaurantSlug: string) => {
    const { socket } = get()
    
    // Fechar conexão existente se houver
    if (socket) {
      socket.close()
    }

    // Criar nova conexão WebSocket
    const newSocket = new WebSocket(`ws://localhost:3000/api/ws?restaurant=${restaurantSlug}`)
    
    newSocket.onopen = () => {
      console.log('WebSocket conectado')
      set({ isConnected: true })
    }
    
    newSocket.onclose = () => {
      console.log('WebSocket desconectado')
      set({ isConnected: false, socket: null })
    }
    
    newSocket.onerror = (error) => {
      console.error('Erro no WebSocket:', error)
      set({ isConnected: false })
    }
    
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'order_notification') {
        const notification: OrderNotification = {
          id: Math.random().toString(36),
          type: data.event,
          orderId: data.order.id,
          customerName: data.order.customerName,
          message: getNotificationMessage(data.event, data.order),
          timestamp: new Date(),
          read: false
        }
        
        set((state) => ({
          notifications: [notification, ...state.notifications]
        }))
        
        // Tocar som de notificação
        playNotificationSound()
      }
    }
    
    set({ socket: newSocket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.close()
    }
    set({ socket: null, isConnected: false })
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  }
}))

// Funções auxiliares
function getNotificationMessage(type: string, order: any): string {
  switch (type) {
    case 'new_order':
      return `Novo pedido de ${order.customerName}`
    case 'order_update':
      return `Pedido de ${order.customerName} foi atualizado`
    case 'order_cancelled':
      return `Pedido de ${order.customerName} foi cancelado`
    default:
      return `Atualização do pedido de ${order.customerName}`
  }
}

function playNotificationSound() {
  // Criar e tocar som de notificação
  const audio = new Audio('/sounds/notification.wav')
  audio.volume = 0.6
  audio.play().catch(console.error)
}
