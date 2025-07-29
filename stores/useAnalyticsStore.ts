import { create } from 'zustand'

export interface AnalyticsOverview {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  averageOrderValue: number
  conversionRate: number
  revenueChange: number
  ordersChange: number
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
}

export interface ProductAnalytics {
  id: string
  name: string
  category: string
  totalSold: number
  revenue: number
  averageRating?: number
  views: number
}

export interface CustomerAnalytics {
  newCustomers: number
  returningCustomers: number
  totalCustomers: number
  averageOrderValue: number
  topLocations: Array<{
    location: string
    count: number
  }>
}

export interface PerformanceMetrics {
  averagePreparationTime: number
  averageDeliveryTime: number
  orderAccuracy: number
  customerSatisfaction: number
  peakHours: Array<{
    hour: number
    orderCount: number
  }>
}

interface AnalyticsStore {
  overview: AnalyticsOverview | null
  salesData: SalesData[]
  productAnalytics: ProductAnalytics[]
  customerAnalytics: CustomerAnalytics | null
  performanceMetrics: PerformanceMetrics | null
  
  isLoading: boolean
  error: string | null
  dateRange: {
    from: Date
    to: Date
  }
  
  // Actions
  setOverview: (overview: AnalyticsOverview) => void
  setSalesData: (salesData: SalesData[]) => void
  setProductAnalytics: (productAnalytics: ProductAnalytics[]) => void
  setCustomerAnalytics: (customerAnalytics: CustomerAnalytics) => void
  setPerformanceMetrics: (performanceMetrics: PerformanceMetrics) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  setDateRange: (from: Date, to: Date) => void
  
  // Computed getters
  getTotalRevenue: () => number
  getRevenueGrowth: () => number
  getTopProducts: (limit?: number) => ProductAnalytics[]
  getSalesGrowthData: () => SalesData[]
}

const defaultDateRange = {
  from: new Date(new Date().setDate(new Date().getDate() - 30)),
  to: new Date()
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  overview: null,
  salesData: [],
  productAnalytics: [],
  customerAnalytics: null,
  performanceMetrics: null,
  
  isLoading: false,
  error: null,
  dateRange: defaultDateRange,
  
  setOverview: (overview) => set({ overview, error: null }),
  
  setSalesData: (salesData) => set({ salesData, error: null }),
  
  setProductAnalytics: (productAnalytics) => set({ productAnalytics, error: null }),
  
  setCustomerAnalytics: (customerAnalytics) => set({ customerAnalytics, error: null }),
  
  setPerformanceMetrics: (performanceMetrics) => set({ performanceMetrics, error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearError: () => set({ error: null }),
  
  setDateRange: (from, to) => set({ 
    dateRange: { from, to }
  }),
  
  getTotalRevenue: () => {
    const { salesData } = get()
    return salesData.reduce((total, day) => total + day.revenue, 0)
  },
  
  getRevenueGrowth: () => {
    const { salesData } = get()
    if (salesData.length < 2) return 0
    
    const currentPeriod = salesData.slice(-7)
    const previousPeriod = salesData.slice(-14, -7)
    
    const currentRevenue = currentPeriod.reduce((sum, day) => sum + day.revenue, 0)
    const previousRevenue = previousPeriod.reduce((sum, day) => sum + day.revenue, 0)
    
    if (previousRevenue === 0) return 0
    
    return ((currentRevenue - previousRevenue) / previousRevenue) * 100
  },
  
  getTopProducts: (limit = 10) => {
    const { productAnalytics } = get()
    return productAnalytics
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  },
  
  getSalesGrowthData: () => {
    const { salesData } = get()
    
    return salesData.map((current, index) => {
      if (index === 0) {
        return { ...current, growth: 0 }
      }
      
      const previous = salesData[index - 1]
      const growth = previous.revenue === 0 ? 0 : 
        ((current.revenue - previous.revenue) / previous.revenue) * 100
      
      return { ...current, growth }
    })
  }
}))