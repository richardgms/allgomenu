'use client'

/**
 * Theme Provider - Injeta CSS dinâmico no DOM
 * Sistema OKLCH com tokens semânticos
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { buildThemeTokens, type ThemeInput, type BuildThemeResult } from '@/lib/color/theme-builder'

interface ThemeContextValue {
  currentTheme: BuildThemeResult | null
  applyTheme: (input: ThemeInput) => void
  resetTheme: () => void
  isLoading: boolean
  error: string | null
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeInput
  tenantId?: string
}

export function ThemeProvider({ 
  children, 
  initialTheme,
  tenantId 
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<BuildThemeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ID do style tag específico do tenant
  const styleId = tenantId ? `tenant-theme-${tenantId}` : 'tenant-theme'

  // Função para injetar CSS no DOM
  const injectCSS = (css: string) => {
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

  // Aplicar tema
  const applyTheme = async (input: ThemeInput) => {
    try {
      setIsLoading(true)
      setError(null)

      // Simular delay mínimo para UX (evita flash)
      await new Promise(resolve => setTimeout(resolve, 50))

      const themeResult = buildThemeTokens(input)
      
      // Injetar CSS no DOM
      injectCSS(themeResult.css)
      
      setCurrentTheme(themeResult)
      
      // Tema aplicado com sucesso
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aplicar tema'
      setError(errorMessage)
      // Erro ao aplicar tema
    } finally {
      setIsLoading(false)
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

  // Aplicar tema inicial
  useEffect(() => {
    if (initialTheme) {
      applyTheme(initialTheme)
    } else {
      resetTheme()
    }
  }, []) // Apenas no mount

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [styleId])

  const contextValue: ThemeContextValue = {
    currentTheme,
    applyTheme,
    resetTheme,
    isLoading,
    error
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para usar o contexto de tema
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
  }
  
  return context
}



// Hook para aplicar tema de restaurante
export function useRestaurantTheme(restaurantData?: {
  themeConfig?: {
    primaryColor: string
    secondaryColor: string
  }
}) {
  const { applyTheme } = useTheme()

  useEffect(() => {
    if (restaurantData?.themeConfig) {
      applyTheme({
        primaryHex: restaurantData.themeConfig.primaryColor,
        secondaryHex: restaurantData.themeConfig.secondaryColor,
        name: 'Tema do Restaurante'
      })
    }
  }, [restaurantData?.themeConfig?.primaryColor, restaurantData?.themeConfig?.secondaryColor])
}