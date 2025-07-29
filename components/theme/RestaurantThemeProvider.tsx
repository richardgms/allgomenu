'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  const [lastAppliedConfig, setLastAppliedConfig] = useState<string | null>(null)
  const isApplyingTheme = useRef(false)
  const themeDebounceTimer = useRef<NodeJS.Timeout | null>(null)

  // ID do style tag específico do restaurante
  const styleId = `restaurant-theme-${restaurantSlug}`

  // Função simplificada para injetar CSS no DOM
  const injectCSS = (css: string) => {
    if (typeof window === 'undefined') return

// CSS injected silently

    // Remover style anterior se existir
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    // Criar novo style tag
    const style = document.createElement('style')
    style.id = styleId
    style.setAttribute('data-theme-provider', restaurantSlug)
    
    // CSS aplicado diretamente no :root
    style.textContent = `:root { ${css} }`
    
    // Inserir no head
    document.head.appendChild(style)
    
// Debug removed for performance
  }

  // Aplicar tema com debounce e controle de estado
  const applyTheme = async (input: ThemeInput) => {
    // Evitar múltiplas aplicações simultâneas
    if (isApplyingTheme.current) {
// Theme application in progress, skipping
      return
    }

    // Limpar timer anterior se existir
    if (themeDebounceTimer.current) {
      clearTimeout(themeDebounceTimer.current)
    }

    // Debounce de 300ms
    themeDebounceTimer.current = setTimeout(async () => {
      try {
        isApplyingTheme.current = true
        setError(null)
// Applying theme silently

        const themeResult = buildThemeTokens(input)
        
        // Injetar CSS no DOM
        injectCSS(themeResult.css)
        
        setCurrentTheme(themeResult)
// Theme applied successfully
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao aplicar tema'
        setError(errorMessage)
        console.error(`[Theme ${restaurantSlug}] Theme application error:`, err)
      } finally {
        isApplyingTheme.current = false
      }
    }, 300)
  }

  // Reset para tema padrão
  const resetTheme = () => {
    const defaultTheme: ThemeInput = {
      primaryHex: '#3b82f6',
      secondaryHex: '#10b981',
      name: 'Tema Padrão AllGoMenu'
    }
    applyTheme(defaultTheme)
  }

  // Função para calcular cor de contraste
  const getContrastColor = (hex: string): string => {
    try {
      const color = parseInt(hex.slice(1), 16)
      const r = (color >> 16) & 255
      const g = (color >> 8) & 255
      const b = color & 255
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance > 0.5 ? '#000000' : '#ffffff'
    } catch {
      return '#000000'
    }
  }

  // Buscar dados do restaurante e aplicar tema (otimizado para evitar reaplicações)
  useEffect(() => {
    let isCancelled = false

    const fetchAndApplyTheme = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Usar dados iniciais se disponíveis
        if (initialThemeConfig) {
          const themeConfig = initialThemeConfig as any
          const configKey = `${restaurantSlug}-${themeConfig?.primaryColor || '#3b82f6'}-${themeConfig?.secondaryColor || '#10b981'}`
          
          // Evitar reaplicação se a configuração não mudou
          if (lastAppliedConfig === configKey) {
  // Configuration unchanged, skipping reapplication
            setIsLoading(false)
            return
          }
          
          const themeInput: ThemeInput = {
            primaryHex: themeConfig?.primaryColor || '#3b82f6',
            secondaryHex: themeConfig?.secondaryColor || '#10b981',
            name: 'Tema do Restaurante'
          }

          if (!isCancelled) {
            await applyTheme(themeInput)
            setLastAppliedConfig(configKey)
            setIsLoading(false)
          }
          return
        }

        // Buscar da API se não tiver dados iniciais
        const response = await fetch(`/api/restaurant/${restaurantSlug}/status`)
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar dados: ${response.status}`)
        }

        const statusData: RestaurantStatus = await response.json()
        
        if (isCancelled) return

        setRestaurantStatus(statusData)

        // Extrair cores do tema
        const themeConfig = statusData.restaurant.themeConfig as any
        const configKey = `${restaurantSlug}-${themeConfig?.primaryColor || '#3b82f6'}-${themeConfig?.secondaryColor || '#10b981'}`
        
        // Evitar reaplicação se a configuração não mudou
        if (lastAppliedConfig === configKey) {
// Configuration unchanged, skipping reapplication
          setIsLoading(false)
          return
        }
        
        const themeInput: ThemeInput = {
          primaryHex: themeConfig?.primaryColor || '#3b82f6',
          secondaryHex: themeConfig?.secondaryColor || '#10b981',
          name: `Tema ${statusData.restaurant.name}`
        }

        await applyTheme(themeInput)
        setLastAppliedConfig(configKey)

      } catch (err) {
        if (isCancelled) return
        
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tema'
        setError(errorMessage)
        console.error('Restaurant theme loading error:', err)
        
        // Aplicar tema fallback
        resetTheme()
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchAndApplyTheme()

    return () => {
      isCancelled = true
      // Limpar timer de debounce
      if (themeDebounceTimer.current) {
        clearTimeout(themeDebounceTimer.current)
        themeDebounceTimer.current = null
      }
      isApplyingTheme.current = false
    }
  }, [restaurantSlug, initialThemeConfig])

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        const existingStyle = document.getElementById(styleId)
        if (existingStyle) {
          existingStyle.remove()
        }
      }
      // Limpar timers e referencias
      if (themeDebounceTimer.current) {
        clearTimeout(themeDebounceTimer.current)
        themeDebounceTimer.current = null
      }
      isApplyingTheme.current = false
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