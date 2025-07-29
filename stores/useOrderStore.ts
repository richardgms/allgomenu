import { create } from 'zustand'
import { Order, OrderStatus } from '@prisma/client'

interface OrderStore {
  orders: Order[]
  selectedOrder: Order | null
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
  
  setOrders: (orders) => set({ orders, error: null }),
  
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