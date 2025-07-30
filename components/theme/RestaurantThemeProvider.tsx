'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
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
  const initialConfigRef = useRef(initialThemeConfig)
  const hasInitialized = useRef(false)
  const isMounted = useRef(false)

  // ID do style tag específico do restaurante
  const styleId = `restaurant-theme-${restaurantSlug}`

  // Função simplificada para injetar CSS no DOM
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
    style.setAttribute('data-theme-provider', restaurantSlug)
    
    // CSS aplicado diretamente no :root com overrides
    style.textContent = `
      :root { 
        ${css} 
      }
      
      /* APLICAÇÃO GLOBAL DAS CORES DO TEMA - FORÇADA */
      
      /* Background principal */
      body, html {
        background-color: var(--background) !important;
        color: var(--foreground) !important;
      }
      
      /* Sidebar - TODOS os elementos */
      .sidebar, [data-sidebar], nav, aside {
        background-color: var(--sidebar-bg) !important;
        border-color: var(--sidebar-border) !important;
      }
      
      .sidebar-item, [data-sidebar-item], nav a, aside a {
        color: var(--sidebar-foreground) !important;
      }
      
      .sidebar-item[data-state="active"], [data-sidebar-item][data-state="active"], nav a.active, aside a.active {
        background-color: var(--sidebar-active) !important;
        color: var(--sidebar-active-foreground) !important;
      }
      
      /* Cards - TODOS os containers */
      .card, [data-card], .bg-card, .bg-white, div[class*="bg-"] {
        background-color: var(--card) !important;
        color: var(--card-foreground) !important;
        border-color: var(--border) !important;
      }
      
      /* Buttons - TODOS os tipos */
      button, .btn, [data-button], input[type="button"], input[type="submit"] {
        transition: all 0.2s !important;
      }
      
      /* Button default/primary - FORÇAR */
      button[data-variant="default"], 
      .btn-primary, 
      .bg-primary,
      button:not([data-variant]),
      button[class*="bg-"] {
        background-color: var(--primary) !important;
        color: var(--primary-foreground) !important;
        border-color: var(--primary) !important;
      }
      
      button[data-variant="default"]:hover, 
      .btn-primary:hover, 
      .bg-primary:hover,
      button:not([data-variant]):hover,
      button[class*="bg-"]:hover {
        background-color: var(--primary-dark) !important;
      }
      
      /* Button secondary */
      button[data-variant="secondary"], 
      .btn-secondary, 
      .bg-secondary {
        background-color: var(--secondary) !important;
        color: var(--secondary-foreground) !important;
        border-color: var(--secondary) !important;
      }
      
      /* Button outline */
      button[data-variant="outline"], 
      .btn-outline, 
      .border-primary {
        background-color: transparent !important;
        color: var(--primary) !important;
        border-color: var(--primary) !important;
      }
      
      button[data-variant="outline"]:hover, 
      .btn-outline:hover, 
      .border-primary:hover {
        background-color: var(--primary) !important;
        color: var(--primary-foreground) !important;
      }
      
      /* Button ghost */
      button[data-variant="ghost"], 
      .btn-ghost {
        background-color: transparent !important;
        color: var(--foreground) !important;
      }
      
      button[data-variant="ghost"]:hover, 
      .btn-ghost:hover {
        background-color: var(--accent) !important;
        color: var(--accent-foreground) !important;
      }
      
      /* Inputs - TODOS os tipos */
      .input, input, textarea, select, .bg-input, input[type="text"], input[type="email"], input[type="password"] {
        background-color: var(--input) !important;
        border-color: var(--border) !important;
        color: var(--foreground) !important;
      }
      
      .input:focus, input:focus, textarea:focus, select:focus {
        border-color: var(--ring) !important;
        box-shadow: 0 0 0 2px var(--ring) !important;
      }
      
      /* Tabs */
      .tabs-trigger, [data-tabs-trigger] {
        color: var(--muted-foreground) !important;
      }
      
      .tabs-trigger[data-state="active"], [data-tabs-trigger][data-state="active"] {
        color: var(--primary) !important;
        border-color: var(--primary) !important;
      }
      
      /* Badges - FORÇAR APLICAÇÃO */
      .badge, [data-slot="badge"], span[data-slot="badge"], .bg-primary {
        background-color: var(--badge-bg) !important;
        color: var(--badge-foreground) !important;
        border-color: var(--badge-border) !important;
      }
      
      .badge.border-transparent.bg-primary,
      [data-slot="badge"].border-transparent.bg-primary,
      span[data-slot="badge"].border-transparent.bg-primary,
      .bg-primary {
        background-color: var(--primary) !important;
        color: var(--primary-foreground) !important;
        border-color: transparent !important;
      }
      
      .badge.border-transparent.bg-secondary,
      [data-slot="badge"].border-transparent.bg-secondary,
      span[data-slot="badge"].border-transparent.bg-secondary,
      .bg-secondary {
        background-color: var(--secondary) !important;
        color: var(--secondary-foreground) !important;
        border-color: transparent !important;
      }
      
      /* Headers e textos */
      h1, h2, h3, h4, h5, h6, .text-foreground, .text-black {
        color: var(--foreground) !important;
      }
      
      /* Textos específicos */
      .text-muted-foreground, .text-muted, .text-gray-500, .text-gray-600 {
        color: var(--muted-foreground) !important;
      }
      
      .text-primary {
        color: var(--primary) !important;
      }
      
      .text-secondary {
        color: var(--secondary) !important;
      }
      
      /* Links */
      a, .text-primary {
        color: var(--primary) !important;
      }
      
      a:hover, .text-primary:hover {
        color: var(--primary-dark) !important;
      }
      
      /* Backgrounds específicos */
      .bg-background {
        background-color: var(--background) !important;
      }
      
      .bg-muted {
        background-color: var(--muted) !important;
      }
      
      .bg-accent {
        background-color: var(--accent) !important;
      }
      
      /* Bordas */
      .border-border, .border-gray-200 {
        border-color: var(--border) !important;
      }
      
      .border-primary {
        border-color: var(--primary) !important;
      }
      
      .border-secondary {
        border-color: var(--secondary) !important;
      }
      
      /* Transições suaves */
      * {
        transition: background-color 0.2s, color 0.2s, border-color 0.2s !important;
      }
    `
    
    // Inserir no head
    document.head.appendChild(style)
  }

  // Aplicar tema com debounce e controle de estado
  const applyTheme = useCallback(async (input: ThemeInput) => {
    console.log(`[Theme ${restaurantSlug}] applyTheme called with:`, input)
    
    // Evitar múltiplas aplicações simultâneas
    if (isApplyingTheme.current) {
      console.log(`[Theme ${restaurantSlug}] Already applying theme, skipping...`)
      return
    }

    // Limpar timer anterior se existir
    if (themeDebounceTimer.current) {
      clearTimeout(themeDebounceTimer.current)
    }

    // Debounce de 300ms
    themeDebounceTimer.current = setTimeout(async () => {
      try {
        console.log(`[Theme ${restaurantSlug}] Starting theme application...`)
        isApplyingTheme.current = true
        setError(null)

        const themeResult = buildThemeTokens(input)
        console.log(`[Theme ${restaurantSlug}] Theme tokens built successfully`)
        
        // Injetar CSS no DOM
        injectCSS(themeResult.css)
        console.log(`[Theme ${restaurantSlug}] CSS injected into DOM`)
        
        setCurrentTheme(themeResult)
        console.log(`[Theme ${restaurantSlug}] Theme state updated`)
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao aplicar tema'
        setError(errorMessage)
        console.error(`[Theme ${restaurantSlug}] Theme application error:`, err)
      } finally {
        isApplyingTheme.current = false
        console.log(`[Theme ${restaurantSlug}] Theme application finished`)
      }
    }, 100) // Reduzir debounce para 100ms para debug
  }, [restaurantSlug])

  // Reset para tema padrão
  const resetTheme = useCallback(() => {
    console.log(`[Theme ${restaurantSlug}] Resetting theme to default`)
    const defaultTheme: ThemeInput = {
      primaryHex: '#3b82f6',
      secondaryHex: '#10b981',
      name: 'Tema Padrão AllGoMenu'
    }
    applyTheme(defaultTheme)
  }, [applyTheme, restaurantSlug])

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

  // Buscar dados do restaurante e aplicar tema - versão simplificada para debug
  useEffect(() => {
    // Marcar como montado
    isMounted.current = true

    console.log(`[Theme ${restaurantSlug}] useEffect triggered:`, {
      hasInitialized: hasInitialized.current,
      hasInitialConfig: !!initialThemeConfig,
      lastAppliedConfig,
      currentTheme: !!currentTheme,
      isLoading,
      error
    })

    // Sempre tentar inicializar se não há tema atual
    if (!currentTheme || error) {
      console.log(`[Theme ${restaurantSlug}] No current theme or has error, proceeding with initialization...`)
    } else if (hasInitialized.current) {
      console.log(`[Theme ${restaurantSlug}] Already initialized with theme, skipping...`)
      return
    }

    // Resetar flag de inicialização
    hasInitialized.current = false

    let isCancelled = false

    const fetchAndApplyTheme = async () => {
      try {
        console.log(`[Theme ${restaurantSlug}] Starting fetchAndApplyTheme, hasInitialConfig:`, !!initialThemeConfig)
        setIsLoading(true)
        setError(null)

        // Aplicar tema inicial se disponível, mas sempre buscar dados completos da API
        if (initialThemeConfig && !currentTheme) {
          console.log(`[Theme ${restaurantSlug}] Applying initial theme config while fetching full data:`, initialThemeConfig)
          const themeConfig = initialThemeConfig as any
          const configKey = `${restaurantSlug}-${themeConfig?.primaryColor || '#3b82f6'}-${themeConfig?.secondaryColor || '#10b981'}`
          
          // Aplicar tema inicial se não foi aplicado ainda
          if (lastAppliedConfig !== configKey) {
            const themeInput: ThemeInput = {
              primaryHex: themeConfig?.primaryColor || '#3b82f6',
              secondaryHex: themeConfig?.secondaryColor || '#10b981',
              name: 'Tema do Restaurante'
            }

            console.log(`[Theme ${restaurantSlug}] Applying initial theme...`)
            await applyTheme(themeInput)
            setLastAppliedConfig(configKey)
            console.log(`[Theme ${restaurantSlug}] Initial theme applied, continuing to fetch full data...`)
          }
        }

        // Buscar da API apenas se não tiver dados iniciais
        console.log(`[Theme ${restaurantSlug}] Fetching restaurant status from API...`)
        const response = await fetch(`/api/restaurant/${restaurantSlug}/status`)
        
        console.log(`[Theme ${restaurantSlug}] API response status:`, response.status, response.statusText)
        
        if (!response.ok) {
          let errorMessage = `Erro ao carregar dados do restaurante: ${response.status}`
          
          if (response.status === 404) {
            errorMessage = 'Restaurante não encontrado. Verifique se o link está correto.'
          } else if (response.status >= 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.'
          } else if (response.status === 403) {
            errorMessage = 'Acesso negado ao restaurante.'
          }
          
          console.error(`[Theme ${restaurantSlug}] API error:`, errorMessage)
          throw new Error(errorMessage)
        }

        const statusData: RestaurantStatus = await response.json()
        console.log(`[Theme ${restaurantSlug}] API data received:`, statusData)
        
        if (isCancelled || !isMounted.current) {
          console.log(`[Theme ${restaurantSlug}] Component cancelled or unmounted, aborting...`)
          return
        }

        // Validar se os dados essenciais estão presentes
        if (!statusData || !statusData.restaurant) {
          console.error(`[Theme ${restaurantSlug}] Invalid data structure:`, { statusData, hasRestaurant: !!statusData?.restaurant })
          throw new Error('Dados do restaurante incompletos ou inválidos')
        }

        console.log(`[Theme ${restaurantSlug}] Setting restaurant status:`, statusData.restaurant.name)
        setRestaurantStatus(statusData)

        // Extrair cores do tema
        const themeConfig = statusData.restaurant.themeConfig as any
        const configKey = `${restaurantSlug}-${themeConfig?.primaryColor || '#3b82f6'}-${themeConfig?.secondaryColor || '#10b981'}`
        
        // Evitar reaplicação se a configuração não mudou
        if (lastAppliedConfig === configKey) {
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
        
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar tema'
        setError(errorMessage)
        
        // Log detalhado para debug
        console.error(`[Theme ${restaurantSlug}] Error loading theme:`, {
          error: err,
          message: errorMessage,
          slug: restaurantSlug,
          timestamp: new Date().toISOString(),
          hasInitialConfig: !!initialThemeConfig
        })
        
        // Aplicar tema fallback apenas se não for um erro de restaurante não encontrado
        if (!errorMessage.includes('não encontrado') && !errorMessage.includes('not found')) {
          resetTheme()
        }
      } finally {
        if (!isCancelled && isMounted.current) {
          setIsLoading(false)
          hasInitialized.current = true
        }
      }
    }

    fetchAndApplyTheme()

    return () => {
      isCancelled = true
      isMounted.current = false
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

  const contextValue: RestaurantThemeContextValue = useMemo(() => ({
    currentTheme,
    restaurantStatus,
    applyTheme,
    resetTheme,
    isLoading,
    error
  }), [currentTheme, restaurantStatus, applyTheme, resetTheme, isLoading, error])

  return (
    <RestaurantThemeContext.Provider value={contextValue}>
      <div suppressHydrationWarning={suppressHydrationWarning || process.env.NODE_ENV === 'development'}>
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
      console.log(`[Theme] Applying theme from restaurant data:`, restaurantData.themeConfig)
      applyTheme({
        primaryHex: restaurantData.themeConfig.primaryColor,
        secondaryHex: restaurantData.themeConfig.secondaryColor,
        name: 'Tema do Restaurante'
      })
    }
  }, [restaurantData?.themeConfig?.primaryColor, restaurantData?.themeConfig?.secondaryColor, applyTheme])
}