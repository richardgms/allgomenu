'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { buildThemeTokens } from '@/lib/color'

export function useTheme() {
  const { restaurant } = useAuth()
  const [currentTheme, setCurrentTheme] = useState<any>(null)

  // Aplicar tema quando o restaurante mudar
  useEffect(() => {
    if (restaurant?.themeConfig) {
      const themeConfig = restaurant.themeConfig as any
      
      // Tema aplicado com sucesso
      
      // Aplicar tema usando o novo sistema
      const themeResult = buildThemeTokens({
        primaryHex: themeConfig.primaryColor,
        secondaryHex: themeConfig.secondaryColor,
        name: 'Tema do Restaurante'
      })
      
      // Aplicar CSS no document
      if (typeof document !== 'undefined') {
        const root = document.documentElement
        const styleId = 'restaurant-theme-style'
        let style = document.getElementById(styleId) as HTMLStyleElement
        if (!style) {
          style = document.createElement('style')
          style.id = styleId
          document.head.appendChild(style)
        }
        style.textContent = themeResult.css
      }
      
      setCurrentTheme(themeResult)
    }
  }, [restaurant])

  // Função para aplicar tema manualmente
  const applyThemeToDocument = (palette: any) => {
    const themeResult = buildThemeTokens({
      primaryHex: palette.primaryColor || palette.primary,
      secondaryHex: palette.secondaryColor || palette.secondary,
      name: 'Tema Manual'
    })
    
    // Aplicar CSS no document
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      const styleId = 'manual-theme-style'
      let style = document.getElementById(styleId) as HTMLStyleElement
      if (!style) {
        style = document.createElement('style')
        style.id = styleId
        document.head.appendChild(style)
      }
      style.textContent = themeResult.css
    }
    
    setCurrentTheme(themeResult)
  }

  // Função para resetar tema
  const resetTheme = () => {
    const root = document.documentElement
    root.style.removeProperty('--primary-light')
    root.style.removeProperty('--primary-base')
    root.style.removeProperty('--primary-dark')
    root.style.removeProperty('--secondary-light')
    root.style.removeProperty('--secondary-base')
    root.style.removeProperty('--secondary-dark')
    setCurrentTheme(null)
  }

  return {
    currentTheme,
    applyTheme: applyThemeToDocument,
    resetTheme,
    isThemeApplied: !!currentTheme
  }
} 

// Mobile hook for responsive design
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(window.innerWidth < 768)
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < 768)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
