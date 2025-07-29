/**
 * Conversões de espaço de cores e cálculos de diferença
 * Usa OKLCH para precisão perceptual
 */

import { oklch, formatHex, differenceItp } from 'culori'

export interface OklchColor {
  l: number  // Lightness: 0-1
  c: number  // Chroma: 0-1+ (typically 0-0.4)
  h: number  // Hue: 0-360 degrees
}

export interface HexColor {
  hex: string
}

/**
 * Converte HEX para OKLCH
 */
export function hexToOklch(hex: string): OklchColor {
  try {
    const normalized = normalizeHex(hex)
    const oklchColor = oklch(normalized)
    
    if (!oklchColor) {
      throw new Error(`Invalid hex color: ${hex}`)
    }

    return {
      l: oklchColor.l || 0,
      c: oklchColor.c || 0,
      h: oklchColor.h || 0
    }
  } catch (error) {
    console.error('Error converting HEX to OKLCH:', error)
    // Fallback para preto
    return { l: 0, c: 0, h: 0 }
  }
}

/**
 * Converte OKLCH para HEX
 */
export function oklchToHex(color: OklchColor): string {
  try {
    const result = formatHex({
      mode: 'oklch',
      l: Math.max(0, Math.min(1, color.l)),
      c: Math.max(0, color.c),
      h: color.h
    })
    
    return result || '#000000'
  } catch (error) {
    console.error('Error converting OKLCH to HEX:', error)
    return '#000000'
  }
}

/**
 * Normaliza cor HEX
 */
export function normalizeHex(hex: string): string {
  if (!hex) return '#000000'
  
  // Remove espaços e converte para lowercase
  const cleaned = hex.trim().toLowerCase()
  
  // Adiciona # se não tiver
  const withHash = cleaned.startsWith('#') ? cleaned : `#${cleaned}`
  
  // Valida formato
  if (!/^#[0-9a-f]{6}$/i.test(withHash)) {
    throw new Error(`Invalid hex format: ${hex}`)
  }
  
  return withHash
}

/**
 * Valida se a cor HEX é válida
 */
export function isValidHex(hex: string): boolean {
  try {
    normalizeHex(hex)
    return true
  } catch {
    return false
  }
}

/**
 * Calcula diferença ΔE00 entre duas cores
 * Usa implementação robusta da culori
 */
export function calculateDeltaE00(color1: string, color2: string): number {
  try {
    const hex1 = normalizeHex(color1)
    const hex2 = normalizeHex(color2)
    
    // Usar differenceItp que é baseado em OKLCH (melhor que CIE76)
    const difference = differenceItp()(hex1, hex2)
    
    return difference || 0
  } catch (error) {
    console.error('Error calculating ΔE00:', error)
    return 0
  }
}

/**
 * Calcula diferença de matiz absoluta
 */
export function calculateHueDifference(color1: string, color2: string): number {
  try {
    const oklch1 = hexToOklch(color1)
    const oklch2 = hexToOklch(color2)
    
    let diff = Math.abs(oklch1.h - oklch2.h)
    
    // Considerar a natureza circular do matiz (0° = 360°)
    if (diff > 180) {
      diff = 360 - diff
    }
    
    return diff
  } catch (error) {
    console.error('Error calculating hue difference:', error)
    return 0
  }
}

/**
 * Calcula diferença de luminosidade
 */
export function calculateLightnessDifference(color1: string, color2: string): number {
  try {
    const oklch1 = hexToOklch(color1)
    const oklch2 = hexToOklch(color2)
    
    return Math.abs(oklch1.l - oklch2.l)
  } catch (error) {
    console.error('Error calculating lightness difference:', error)
    return 0
  }
}

/**
 * Utilitários para clampagem de valores OKLCH
 */
export function clampLightness(l: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, l))
}

export function clampChroma(c: number, max = 0.4): number {
  return Math.max(0, Math.min(max, c))
}

export function clampHue(h: number): number {
  // Normaliza hue para 0-360
  while (h < 0) h += 360
  while (h >= 360) h -= 360
  return h
}

/**
 * Debug: informações sobre uma cor
 */
export function debugColor(hex: string): {
  hex: string
  oklch: OklchColor
  isValid: boolean
  lightness: 'very-dark' | 'dark' | 'medium' | 'light' | 'very-light'
  chroma: 'gray' | 'muted' | 'vivid' | 'saturated'
} {
  const isValid = isValidHex(hex)
  const oklch = isValid ? hexToOklch(hex) : { l: 0, c: 0, h: 0 }
  
  const lightness = oklch.l < 0.2 ? 'very-dark' 
    : oklch.l < 0.4 ? 'dark'
    : oklch.l < 0.6 ? 'medium'
    : oklch.l < 0.8 ? 'light'
    : 'very-light'
    
  const chroma = oklch.c < 0.05 ? 'gray'
    : oklch.c < 0.1 ? 'muted'
    : oklch.c < 0.2 ? 'vivid'
    : 'saturated'
  
  return {
    hex: isValid ? normalizeHex(hex) : '#000000',
    oklch,
    isValid,
    lightness,
    chroma
  }
}