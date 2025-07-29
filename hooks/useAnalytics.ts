import { useQuery } from '@tanstack/react-query'
import { 
  AnalyticsOverview, 
  SalesData, 
  ProductAnalytics, 
  CustomerAnalytics, 
  PerformanceMetrics 
} from '@/stores/useAnalyticsStore'

// Hook para buscar overview analytics
export function useAnalyticsOverview(restaurantSlug: string, days: number = 30) {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview', restaurantSlug, days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/overview?restaurant=${restaurantSlug}&days=${days}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar overview analytics')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!restaurantSlug
  })
}

// Hook para buscar dados de vendas
export function useSalesData(restaurantSlug: string, days: number = 30) {
  return useQuery<SalesData[]>({
    queryKey: ['analytics', 'sales', restaurantSlug, days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/sales?restaurant=${restaurantSlug}&days=${days}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de vendas')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!restaurantSlug
  })
}

// Hook para buscar analytics de produtos
export function useProductAnalytics(restaurantSlug: string, days: number = 30, limit: number = 20) {
  return useQuery<ProductAnalytics[]>({
    queryKey: ['analytics', 'products', restaurantSlug, days, limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/products?restaurant=${restaurantSlug}&days=${days}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar analytics de produtos')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!restaurantSlug
  })
}

// Hook para buscar analytics de clientes
export function useCustomerAnalytics(restaurantSlug: string, days: number = 30) {
  return useQuery<CustomerAnalytics>({
    queryKey: ['analytics', 'customers', restaurantSlug, days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/customers?restaurant=${restaurantSlug}&days=${days}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar analytics de clientes')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!restaurantSlug
  })
}

// Hook para buscar métricas de performance
export function usePerformanceMetrics(restaurantSlug: string, days: number = 30) {
  return useQuery<PerformanceMetrics>({
    queryKey: ['analytics', 'performance', restaurantSlug, days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/performance?restaurant=${restaurantSlug}&days=${days}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar métricas de performance')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!restaurantSlug
  })
}

// Hook combinado para buscar todos os analytics
export function useAllAnalytics(restaurantSlug: string, days: number = 30) {
  const overview = useAnalyticsOverview(restaurantSlug, days)
  const sales = useSalesData(restaurantSlug, days)
  const products = useProductAnalytics(restaurantSlug, days)
  const customers = useCustomerAnalytics(restaurantSlug, days)
  const performance = usePerformanceMetrics(restaurantSlug, days)

  return {
    overview,
    sales,
    products,
    customers,
    performance,
    isLoading: overview.isLoading || sales.isLoading || products.isLoading || customers.isLoading || performance.isLoading,
    isError: overview.isError || sales.isError || products.isError || customers.isError || performance.isError,
    refetchAll: () => {
      overview.refetch()
      sales.refetch()
      products.refetch()
      customers.refetch()
      performance.refetch()
    }
  }
}