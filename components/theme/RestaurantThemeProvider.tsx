'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { buildThemeTokens, type ThemeInput, type BuildThemeResult } from '@/lib/color/theme-builder'
import { RestaurantStatus } from '@/types/restaurant'

interface RestaurantThemeContextValue {
  currentTheme: BuildThemeResult | null
  restaurantStatus: RestaurantStatus | null
  applyTheme: (input: ThemeInput) => void
  resetTheme: () => void
  isLoading: boolean
  error: string | null
}

const RestaurantThemeContext = createContext<RestaurantThemeContextValue | null>(null)

interface RestaurantThemeProviderProps {
  children: React.ReactNode
  restaurantSlug: string
  initialThemeConfig?: any
  suppressHydrationWarning?: boolean
}

export function RestaurantThemeProvider({ 
  children, 
  restaurantSlug,
  initialThemeConfig,
  suppressHydrationWarning = false
}: RestaurantThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<BuildThemeResult | null>(null)
  const [restaurantStatus, setRestaurantStatus] = useState<RestaurantStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ID do style tag específico do restaurante
  const styleId = `restaurant-theme-${restaurantSlug}`

  // Função para injetar CSS no DOM
  const injectCSS = (css: string) => {
    if (typeof window === 'undefined') return

    // Remover style anterior se existir
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    // Criar novo style tag
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `:root { ${css} }`
    document.head.appendChild(style)
  }

  // Cache simples para evitar re-processamento desnecessário
  const [lastThemeConfig, setLastThemeConfig] = useState<string | null>(null)

  // Aplicar tema
  const applyTheme = async (input: ThemeInput) => {
    try {
      setError(null)

      // Verificar se é necessário re-processar o tema
      const themeKey = `${input.primaryHex}-${input.secondaryHex}`
      if (themeKey === lastThemeConfig && currentTheme) {
        return // Tema já aplicado
      }

      const themeResult = buildThemeTokens(input)
      
      // Injetar CSS no DOM
      injectCSS(themeResult.css)
      
      setCurrentTheme(themeResult)
      setLastThemeConfig(themeKey)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aplicar tema'
      setError(errorMessage)
      console.error('Theme application error:', err)
    }
  }

  // Reset para tema padrão
  const resetTheme = () => {
    const defaultTheme: ThemeInput = {
      primaryHex: '#dc2626',
      secondaryHex: '#059669',
      name: 'Tema Padrão AllGoMenu'
    }
    applyTheme(defaultTheme)
  }

  // Buscar status do restaurante e aplicar tema
  useEffect(() => {
    let isCancelled = false

    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch restaurant status (que inclui tema)
        const response = await fetch(`/api/restaurant/${restaurantSlug}/status`)
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar dados do restaurante: ${response.status}`)
        }

        const statusData: RestaurantStatus = await response.json()
        
        if (isCancelled) return

        setRestaurantStatus(statusData)

        // Extrair cores do tema
        const themeConfig = statusData.restaurant.themeConfig as any
        
        let themeInput: ThemeInput

        if (themeConfig?.primaryColor && themeConfig?.secondaryColor) {
          // Usar cores configuradas
          themeInput = {
            primaryHex: themeConfig.primaryColor,
            secondaryHex: themeConfig.secondaryColor,
            name: `Tema ${statusData.restaurant.name}`
          }
        } else if (themeConfig?.palette) {
          // Fallback para o sistema legado
          themeInput = {
            primaryHex: themeConfig.palette['cor-primaria-500'] || '#dc2626',
            secondaryHex: themeConfig.palette['cor-secundaria-500'] || '#059669',
            name: `Tema ${statusData.restaurant.name}`
          }
        } else {
          // Usar tema padrão
          themeInput = {
            primaryHex: '#dc2626',
            secondaryHex: '#059669',
            name: 'Tema Padrão AllGoMenu'
          }
        }

        await applyTheme(themeInput)

      } catch (err) {
        if (isCancelled) return
        
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tema do restaurante'
        setError(errorMessage)
        console.error('Restaurant theme loading error:', err)
        
        // Aplicar tema fallback em caso de erro
        resetTheme()
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    // Usar dados iniciais se disponíveis, senão buscar da API
    if (initialThemeConfig) {
      const themeConfig = initialThemeConfig as any
      
      let themeInput: ThemeInput = {
        primaryHex: '#dc2626',
        secondaryHex: '#059669',
        name: 'Tema Padrão AllGoMenu'
      }

      if (themeConfig?.primaryColor && themeConfig?.secondaryColor) {
        themeInput = {
          primaryHex: themeConfig.primaryColor,
          secondaryHex: themeConfig.secondaryColor,
          name: 'Tema do Restaurante'
        }
      } else if (themeConfig?.palette) {
        themeInput = {
          primaryHex: themeConfig.palette['cor-primaria-500'] || '#dc2626',
          secondaryHex: themeConfig.palette['cor-secundaria-500'] || '#059669',
          name: 'Tema do Restaurante'
        }
      }

      applyTheme(themeInput).then(() => {
        setIsLoading(false)
        // Ainda buscar dados atualizados da API em background
        fetchRestaurantData()
      })
    } else {
      fetchRestaurantData()
    }

    return () => {
      isCancelled = true
    }
  }, [restaurantSlug])

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        const existingStyle = document.getElementById(styleId)
        if (existingStyle) {
          existingStyle.remove()
        }
      }
    }
  }, [styleId])

  const contextValue: RestaurantThemeContextValue = {
    currentTheme,
    restaurantStatus,
    applyTheme,
    resetTheme,
    isLoading,
    error
  }

  return (
    <RestaurantThemeContext.Provider value={contextValue}>
      <div suppressHydrationWarning={suppressHydrationWarning}>
        {children}
      </div>
    </RestaurantThemeContext.Provider>
  )
}

// Hook para usar o contexto de tema do restaurante
export function useRestaurantTheme(): RestaurantThemeContextValue {
  const context = useContext(RestaurantThemeContext)
  
  if (!context) {
    throw new Error('useRestaurantTheme deve ser usado dentro de um RestaurantThemeProvider')
  }
  
  return context
}

// Hook simplificado para aplicar tema de restaurante (retrocompatibilidade)
export function useRestaurantThemeData(restaurantData?: {
  themeConfig?: {
    primaryColor: string
    secondaryColor: string
  }
}) {
  const { applyTheme } = useRestaurantTheme()

  useEffect(() => {
    if (restaurantData?.themeConfig) {
      applyTheme({
        primaryHex: restaurantData.themeConfig.primaryColor,
        secondaryHex: restaurantData.themeConfig.secondaryColor,
        name: 'Tema do Restaurante'
      })
    }
  }, [restaurantData?.themeConfig?.primaryColor, restaurantData?.themeConfig?.secondaryColor, applyTheme])
}