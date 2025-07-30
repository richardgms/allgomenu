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
      console.log(`[Menu] Fetching menu for restaurant: ${slug}`)
      
      try {
        const response = await fetch(`/api/restaurant/${slug}/menu`)
        
        if (!response.ok) {
          let errorMessage = `Erro ao carregar menu: ${response.status}`
          
          if (response.status === 404) {
            errorMessage = 'Menu não encontrado para este restaurante'
          } else if (response.status >= 500) {
            errorMessage = 'Erro do servidor ao carregar menu. Tente novamente.'
          } else if (response.status === 403) {
            errorMessage = 'Acesso negado ao menu do restaurante'
          }
          
          console.error(`[Menu] Error fetching menu for ${slug}:`, {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            timestamp: new Date().toISOString()
          })
          
          throw new Error(errorMessage)
        }
        
        const data = await response.json()
        
        // Validar se os dados retornados são válidos
        if (!Array.isArray(data)) {
          throw new Error('Formato de dados do menu inválido')
        }
        
        console.log(`[Menu] Menu data received for ${slug}:`, data.length, 'categories')
        return data
        
      } catch (error) {
        // Re-throw para que o React Query possa capturar
        if (error instanceof Error) {
          console.error(`[Menu] Exception while fetching menu for ${slug}:`, error.message)
          throw error
        }
        throw new Error('Erro desconhecido ao carregar menu')
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error) => {
      // Não tentar novamente para erros 404 ou 403
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('403'))) {
        return false
      }
      // Tentar até 3 vezes para outros erros
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Backoff exponencial
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true // Tentar novamente ao reconectar
  })

  // Estados derivados
  const isLoading = themeLoading || menuLoading
  const hasError = !!themeError || !!menuError
  
  // Priorizar erro de tema (mais crítico) sobre erro de menu
  const error = themeError || (menuError as Error)?.message || null
  const errorDetails = {
    hasThemeError: !!themeError,
    hasMenuError: !!menuError,
    themeError: themeError,
    menuError: menuError instanceof Error ? menuError.message : null,
    canRetry: !error?.includes('não encontrado') && !error?.includes('not found')
  }

  // Dados consolidados
  const restaurant = restaurantStatus?.restaurant || null
  const operationalStatus = restaurantStatus?.operationalStatus || null
  const deliveryConfig = restaurantStatus?.deliveryConfig || null
  const paymentMethods = restaurantStatus?.paymentMethods || null
  
  const categories = menuData || []
  const isOpen = operationalStatus?.isOpen && operationalStatus?.isAcceptingOrders

  // Estatísticas do menu
  const menuStats = {
    totalCategories: categories?.length || 0,
    totalProducts: categories?.reduce((sum: number, cat: any) => sum + (cat.productCount || 0), 0) || 0,
    availableProducts: categories?.reduce((sum: number, cat: any) => sum + (cat.availableCount || 0), 0) || 0,
    featuredProducts: categories?.reduce((sum: number, cat: any) => sum + (cat.featuredCount || 0), 0) || 0
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
    errorDetails,
    
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