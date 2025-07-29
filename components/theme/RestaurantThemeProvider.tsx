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
    // Evitar múltiplas aplicações simultâneas
    if (isApplyingTheme.current) {
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

        const themeResult = buildThemeTokens(input)
        
        // Injetar CSS no DOM
        injectCSS(themeResult.css)
        
        setCurrentTheme(themeResult)
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao aplicar tema'
        setError(errorMessage)
        console.error(`[Theme ${restaurantSlug}] Theme application error:`, err)
      } finally {
        isApplyingTheme.current = false
      }
    }, 300)
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

  // Buscar dados do restaurante e aplicar tema (otimizado para evitar reaplicações)
  useEffect(() => {
    // Marcar como montado
    isMounted.current = true

    // Se já foi inicializado, não fazer nada
    if (hasInitialized.current) {
      return
    }

    // Se temos dados iniciais e já aplicamos o tema, não fazer nada
    if (initialThemeConfig && lastAppliedConfig) {
      hasInitialized.current = true
      return
    }

    // Resetar flag de inicialização quando o slug mudar
    hasInitialized.current = false

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
          
          // Se temos dados iniciais, não buscar da API
          return
        }

        // Buscar da API apenas se não tiver dados iniciais
        const response = await fetch(`/api/restaurant/${restaurantSlug}/status`)
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar dados: ${response.status}`)
        }

        const statusData: RestaurantStatus = await response.json()
        
        if (isCancelled || !isMounted.current) return

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
        
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar tema'
        setError(errorMessage)
        console.error(`[Theme ${restaurantSlug}] Error loading theme:`, err)
        
        // Aplicar tema fallback
        resetTheme()
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
      console.log(`[Theme] Applying theme from restaurant data:`, restaurantData.themeConfig)
      applyTheme({
        primaryHex: restaurantData.themeConfig.primaryColor,
        secondaryHex: restaurantData.themeConfig.secondaryColor,
        name: 'Tema do Restaurante'
      })
    }
  }, [restaurantData?.themeConfig?.primaryColor, restaurantData?.themeConfig?.secondaryColor, applyTheme])
}