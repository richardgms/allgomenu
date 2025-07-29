'use client'

import { useRestaurantTheme } from '@/components/theme/RestaurantThemeProvider'
import { RestaurantStatus, ProcessedCategory } from '@/types/restaurant'
import { useQuery } from '@tanstack/react-query'

/**
 * Hook integrado para páginas públicas do restaurante
 * Combina dados de status e menu com sistema de tema
 */
export function useRestaurantPage(slug: string) {
  const {
    currentTheme,
    restaurantStatus,
    isLoading: themeLoading,
    error: themeError
  } = useRestaurantTheme()

  // Query para dados do menu
  const {
    data: menuData,
    isLoading: menuLoading,
    error: menuError,
    refetch: refetchMenu
  } = useQuery({
    queryKey: ['restaurant-menu', slug],
    queryFn: async (): Promise<ProcessedCategory[]> => {
      const response = await fetch(`/api/restaurant/${slug}/menu`)
      if (!response.ok) {
        throw new Error(`Erro ao carregar menu: ${response.status}`)
      }
      return response.json()
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 2
  })

  // Estados derivados
  const isLoading = themeLoading || menuLoading
  const hasError = !!themeError || !!menuError
  const error = themeError || (menuError as Error)?.message || null

  // Dados consolidados
  const restaurant = restaurantStatus?.restaurant || null
  const operationalStatus = restaurantStatus?.operationalStatus || null
  const deliveryConfig = restaurantStatus?.deliveryConfig || null
  const paymentMethods = restaurantStatus?.paymentMethods || null
  
  const categories = menuData || []
  const isOpen = operationalStatus?.isOpen && operationalStatus?.isAcceptingOrders

  // Estatísticas do menu
  const menuStats = {
    totalCategories: categories.length,
    totalProducts: categories.reduce((sum, cat) => sum + cat.productCount, 0),
    availableProducts: categories.reduce((sum, cat) => sum + cat.availableCount, 0),
    featuredProducts: categories.reduce((sum, cat) => sum + cat.featuredCount, 0)
  }

  // Métodos úteis
  const refreshData = async () => {
    await refetchMenu()
  }

  return {
    // Status geral
    isLoading,
    hasError,
    error,
    
    // Dados do restaurante
    restaurant,
    operationalStatus,
    deliveryConfig,
    paymentMethods,
    isOpen,
    
    // Menu
    categories,
    menuStats,
    
    // Tema
    currentTheme,
    
    // Status consolidado
    restaurantStatus,
    
    // Métodos
    refreshData
  }
}

/**
 * Hook simplificado apenas para dados de status
 */
export function useRestaurantStatus(slug: string) {
  const { restaurantStatus, isLoading, error } = useRestaurantTheme()
  
  return {
    restaurantStatus,
    isLoading,
    error,
    restaurant: restaurantStatus?.restaurant || null,
    operationalStatus: restaurantStatus?.operationalStatus || null,
    isOpen: restaurantStatus?.operationalStatus?.isOpen && 
           restaurantStatus?.operationalStatus?.isAcceptingOrders
  }
}

/**
 * Hook para gerenciamento de carrinho (placeholder)
 * Será expandido na Fase 4
 */
export function useRestaurantCart() {
  // Por enquanto, um estado simples local
  // Na Fase 4, isso será integrado com um sistema de carrinho mais robusto
  
  return {
    items: [],
    itemCount: 0,
    total: 0,
    addItem: () => {},
    removeItem: () => {},
    clearCart: () => {},
    isOpen: false,
    openCart: () => {},
    closeCart: () => {}
  }
}