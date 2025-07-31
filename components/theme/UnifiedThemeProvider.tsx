'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { generatePalette, PaletteConfig, ThemeTokens, DEFAULT_PALETTE_CONFIG } from '@/lib/theme/palette-generator'
import { injectTheme, removeTheme } from '@/lib/theme/theme-injector'

export interface RestaurantStatus {
  restaurant: {
    id: string
    name: string
    slug: string
    isOpen: boolean
    themeConfig?: {
      primaryColor: string
      secondaryColor: string
      customConfig?: Partial<PaletteConfig>
    }
  }
  isOpen: boolean
}

export interface UnifiedThemeContextValue {
  tokens: ThemeTokens | null
  restaurantStatus: RestaurantStatus | null
  isLoading: boolean
  error: string | null
  applyTheme: (config: PaletteConfig) => Promise<void>
  applyColorsOnly: (primary: string, secondary: string) => Promise<void>
  resetTheme: () => void
  refreshTheme: () => Promise<void>
}

export interface UnifiedThemeProviderProps {
  children: React.ReactNode
  restaurantSlug: string
  initialThemeConfig?: {
    primaryColor?: string
    secondaryColor?: string
    customConfig?: Partial<PaletteConfig>
  }
  suppressHydrationWarning?: boolean
}

const UnifiedThemeContext = createContext<UnifiedThemeContextValue | null>(null)

export function UnifiedThemeProvider({
  children,
  restaurantSlug,
  initialThemeConfig,
  suppressHydrationWarning = false
}: UnifiedThemeProviderProps) {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null)
  const [restaurantStatus, setRestaurantStatus] = useState<RestaurantStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Control refs
  const isApplyingTheme = useRef(false)
  const isMounted = useRef(false)
  const lastAppliedConfig = useRef<string | null>(null)
  
  // Theme ID for this provider instance
  const themeId = `theme-${restaurantSlug}`

  /**
   * Core function to apply a complete palette configuration
   */
  const applyTheme = useCallback(async (config: PaletteConfig) => {
    if (isApplyingTheme.current) {
      console.log(`[UnifiedTheme ${restaurantSlug}] Already applying theme, skipping...`)
      return
    }

    try {
      console.log(`[UnifiedTheme ${restaurantSlug}] Applying theme configuration:`, config)
      isApplyingTheme.current = true
      setError(null)

      // Generate theme tokens
      const themeTokens = generatePalette(config)
      console.log(`[UnifiedTheme ${restaurantSlug}] Generated tokens successfully`)

      // Inject theme into DOM
      injectTheme(themeTokens, {
        restaurantSlug,
        priority: 'high'
      })
      console.log(`[UnifiedTheme ${restaurantSlug}] Theme injected into DOM`)

      // Update state
      setTokens(themeTokens)
      
      // Track applied config to avoid re-application
      const configKey = JSON.stringify(config)
      lastAppliedConfig.current = configKey

      console.log(`[UnifiedTheme ${restaurantSlug}] Theme applied successfully`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aplicar tema'
      setError(errorMessage)
      console.error(`[UnifiedTheme ${restaurantSlug}] Theme application error:`, err)
    } finally {
      isApplyingTheme.current = false
    }
  }, [restaurantSlug])

  /**
   * Simplified function to apply just primary and secondary colors
   */
  const applyColorsOnly = useCallback(async (primary: string, secondary: string) => {
    const config: PaletteConfig = {
      ...DEFAULT_PALETTE_CONFIG,
      primary,
      secondary
    }
    
    await applyTheme(config)
  }, [applyTheme])

  /**
   * Reset to default theme
   */
  const resetTheme = useCallback(() => {
    console.log(`[UnifiedTheme ${restaurantSlug}] Resetting to default theme`)
    applyTheme(DEFAULT_PALETTE_CONFIG)
  }, [applyTheme, restaurantSlug])

  /**
   * Fetch restaurant data and apply theme
   */
  const refreshTheme = useCallback(async () => {
    if (!isMounted.current) return

    try {
      console.log(`[UnifiedTheme ${restaurantSlug}] Fetching restaurant data...`)
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/restaurant/${restaurantSlug}/status`)
      
      if (!response.ok) {
        let errorMessage = `Erro ao carregar dados do restaurante: ${response.status}`
        
        if (response.status === 404) {
          errorMessage = 'Restaurante não encontrado. Verifique se o link está correto.'
        } else if (response.status >= 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.'
        } else if (response.status === 403) {
          errorMessage = 'Acesso negado ao restaurante.'
        }
        
        throw new Error(errorMessage)
      }

      const statusData: RestaurantStatus = await response.json()
      console.log(`[UnifiedTheme ${restaurantSlug}] Restaurant data received:`, statusData.restaurant.name)

      if (!isMounted.current) return

      setRestaurantStatus(statusData)

      // Extract theme configuration
      const themeConfig = statusData.restaurant.themeConfig
      const primaryColor = themeConfig?.primaryColor || '#3b82f6'
      const secondaryColor = themeConfig?.secondaryColor || '#10b981'
      const customConfig = themeConfig?.customConfig

      // Create palette configuration
      const paletteConfig: PaletteConfig = {
        ...DEFAULT_PALETTE_CONFIG,
        primary: primaryColor,
        secondary: secondaryColor,
        ...customConfig
      }

      // Check if we need to apply the theme
      const configKey = JSON.stringify(paletteConfig)
      if (lastAppliedConfig.current !== configKey) {
        await applyTheme(paletteConfig)
      }

    } catch (err) {
      if (!isMounted.current) return
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar tema'
      setError(errorMessage)
      
      console.error(`[UnifiedTheme ${restaurantSlug}] Error loading theme:`, {
        error: err,
        message: errorMessage,
        slug: restaurantSlug,
        timestamp: new Date().toISOString()
      })
      
      // Apply fallback theme for non-critical errors
      if (!errorMessage.includes('não encontrado') && !errorMessage.includes('not found')) {
        resetTheme()
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [restaurantSlug, applyTheme, resetTheme])

  // Initialize theme on mount
  useEffect(() => {
    isMounted.current = true

    const initialize = async () => {
      console.log(`[UnifiedTheme ${restaurantSlug}] Initializing...`)

      // Apply initial theme if provided
      if (initialThemeConfig) {
        console.log(`[UnifiedTheme ${restaurantSlug}] Applying initial theme config`)
        const primaryColor = initialThemeConfig.primaryColor || '#3b82f6'
        const secondaryColor = initialThemeConfig.secondaryColor || '#10b981'
        const customConfig = initialThemeConfig.customConfig

        const paletteConfig: PaletteConfig = {
          ...DEFAULT_PALETTE_CONFIG,
          primary: primaryColor,
          secondary: secondaryColor,
          ...customConfig
        }

        await applyTheme(paletteConfig)
      }

      // Then fetch full data from API
      await refreshTheme()
    }

    initialize()

    return () => {
      isMounted.current = false
      isApplyingTheme.current = false
    }
  }, [restaurantSlug, refreshTheme, applyTheme, initialThemeConfig])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeTheme(themeId)
      console.log(`[UnifiedTheme ${restaurantSlug}] Cleaned up theme on unmount`)
    }
  }, [themeId, restaurantSlug])

  const contextValue: UnifiedThemeContextValue = useMemo(() => ({
    tokens,
    restaurantStatus,
    isLoading,
    error,
    applyTheme,
    applyColorsOnly,
    resetTheme,
    refreshTheme
  }), [tokens, restaurantStatus, isLoading, error, applyTheme, applyColorsOnly, resetTheme, refreshTheme])

  return (
    <UnifiedThemeContext.Provider value={contextValue}>
      <div suppressHydrationWarning={suppressHydrationWarning || process.env.NODE_ENV === 'development'}>
        {children}
      </div>
    </UnifiedThemeContext.Provider>
  )
}

/**
 * Hook to use the unified theme context
 */
export function useUnifiedTheme(): UnifiedThemeContextValue {
  const context = useContext(UnifiedThemeContext)
  if (!context) {
    throw new Error('useUnifiedTheme must be used within a UnifiedThemeProvider')
  }
  return context
}

/**
 * Hook to get current theme tokens
 */
export function useThemeTokens(): ThemeTokens | null {
  const { tokens } = useUnifiedTheme()
  return tokens
}

/**
 * Hook to get restaurant status
 */
export function useRestaurantStatus(): RestaurantStatus | null {
  const { restaurantStatus } = useUnifiedTheme()
  return restaurantStatus
}