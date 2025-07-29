/**
 * Geração de escalas de cores e gradientes
 * Cria light/base/dark variants e gradientes harmônicos
 */

import { hexToOklch, oklchToHex, OklchColor } from './color-space'
import { clampOklch } from './clamps'

export interface ColorScale {
  light: string    // L+0.12, C-0.02
  base: string     // Cor original (clampada)
  dark: string     // L-0.12, C-0.01
}

export interface ExtendedColorScale {
  25: string   // Extremamente claro
  50: string   // Muito claro
  100: string  // Claro
  300: string  // Light
  600: string  // Base
  700: string  // Dark
  900: string  // Muito escuro
  950: string  // Extremamente escuro
}

/**
 * Constrói escala básica de 3 tons (light/base/dark)
 */
export function buildScale(hex: string): ColorScale {
  try {
    const oklch = hexToOklch(hex)
    
    // Aplicar clamp na cor base primeiro
    const baseResult = clampOklch(oklch)
    const baseOklch = baseResult.color
    
    // Gerar light: L+0.12, C-0.02
    const lightOklch: OklchColor = {
      l: Math.min(0.95, baseOklch.l + 0.12),
      c: Math.max(0, baseOklch.c - 0.02),
      h: baseOklch.h
    }
    
    // Gerar dark: L-0.12, C-0.01
    const darkOklch: OklchColor = {
      l: Math.max(0.05, baseOklch.l - 0.12),
      c: Math.max(0, baseOklch.c - 0.01),
      h: baseOklch.h
    }
    
    // Aplicar clamps finais
    const lightResult = clampOklch(lightOklch)
    const darkResult = clampOklch(darkOklch)
    
    return {
      light: lightResult.hex,
      base: baseResult.hex,
      dark: darkResult.hex
    }
  } catch (error) {
    console.error('Error building color scale:', error)
    // Fallback para grayscale
    return {
      light: '#f7f7f7',
      base: '#666666',
      dark: '#333333'
    }
  }
}

/**
 * Constrói escala estendida de 6 tons (50, 100, 300, 600, 700, 900)
 */
export function buildExtendedScale(hex: string): ExtendedColorScale {
  try {
    const oklch = hexToOklch(hex)
    const baseResult = clampOklch(oklch)
    const baseOklch = baseResult.color
    
    // 25: Extremamente claro (background muito sutil)
    const color25: OklchColor = {
      l: Math.min(0.99, baseOklch.l + 0.40),
      c: Math.max(0, baseOklch.c - 0.10),
      h: baseOklch.h
    }
    
    // 50: Muito claro (background/surface)
    const color50: OklchColor = {
      l: Math.min(0.98, baseOklch.l + 0.30),
      c: Math.max(0, baseOklch.c - 0.08),
      h: baseOklch.h
    }
    
    // 100: Claro (hover backgrounds)
    const color100: OklchColor = {
      l: Math.min(0.95, baseOklch.l + 0.20),
      c: Math.max(0, baseOklch.c - 0.05),
      h: baseOklch.h
    }
    
    // 300: Light (nosso light padrão)
    const color300: OklchColor = {
      l: Math.min(0.90, baseOklch.l + 0.12),
      c: Math.max(0, baseOklch.c - 0.02),
      h: baseOklch.h
    }
    
    // 600: Base (cor original clampada)
    const color600 = baseOklch
    
    // 700: Dark (nosso dark padrão)
    const color700: OklchColor = {
      l: Math.max(0.10, baseOklch.l - 0.12),
      c: Math.max(0, baseOklch.c - 0.01),
      h: baseOklch.h
    }
    
    // 900: Muito escuro
    const color900: OklchColor = {
      l: Math.max(0.05, baseOklch.l - 0.25),
      c: Math.max(0, baseOklch.c - 0.03),
      h: baseOklch.h
    }
    
    // 950: Extremamente escuro
    const color950: OklchColor = {
      l: Math.max(0.02, baseOklch.l - 0.35),
      c: Math.max(0, baseOklch.c - 0.05),
      h: baseOklch.h
    }
    
    // Aplicar clamps e converter para HEX
    return {
      25: clampOklch(color25).hex,
      50: clampOklch(color50).hex,
      100: clampOklch(color100).hex,
      300: clampOklch(color300).hex,
      600: clampOklch(color600).hex,
      700: clampOklch(color700).hex,
      900: clampOklch(color900).hex,
      950: clampOklch(color950).hex
    }
  } catch (error) {
    console.error('Error building extended color scale:', error)
    // Fallback
    return {
      25: '#fefefe',
      50: '#fafafa',
      100: '#f4f4f5',
      300: '#d4d4d8',
      600: '#52525b',
      700: '#3f3f46',
      900: '#18181b',
      950: '#0c0a09'
    }
  }
}

/**
 * Gera gradiente de marca com 3 stops
 * Formato: primary.base → primary.light → secondary.dark @ 135°
 */
export function gradientBrand(
  primaryHex: string,
  secondaryHex: string,
  angle = 135
): {
  css: string
  stops: Array<{ color: string; position: number }>
} {
  try {
    const primaryScale = buildScale(primaryHex)
    const secondaryScale = buildScale(secondaryHex)
    
    const stops = [
      { color: primaryScale.base, position: 0 },
      { color: primaryScale.light, position: 50 },
      { color: secondaryScale.dark, position: 100 }
    ]
    
    const css = `linear-gradient(${angle}deg, ${stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
    
    return { css, stops }
  } catch (error) {
    console.error('Error creating brand gradient:', error)
    return {
      css: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
      stops: [
        { color: '#6366f1', position: 0 },
        { color: '#8b5cf6', position: 50 },
        { color: '#d946ef', position: 100 }
      ]
    }
  }
}

/**
 * Gera estados de interação (hover/active/focus)
 */
export function buildInteractionStates(hex: string): {
  base: string
  hover: string    // ΔL -0.10, ΔC -0.01
  active: string   // ΔL -0.14, ΔC -0.02
  focus: string    // Para outline (mesma cor com alpha)
  disabled: string // Dessaturado
} {
  try {
    const oklch = hexToOklch(hex)
    const baseResult = clampOklch(oklch)
    const baseOklch = baseResult.color
    
    // Hover: escurecer um pouco
    const hoverOklch: OklchColor = {
      l: Math.max(0.05, baseOklch.l - 0.10),
      c: Math.max(0, baseOklch.c - 0.01),
      h: baseOklch.h
    }
    
    // Active: escurecer mais
    const activeOklch: OklchColor = {
      l: Math.max(0.05, baseOklch.l - 0.14),
      c: Math.max(0, baseOklch.c - 0.02),
      h: baseOklch.h
    }
    
    // Focus: mesma cor (para uso com alpha)
    const focusOklch = baseOklch
    
    // Disabled: muito dessaturado
    const disabledOklch: OklchColor = {
      l: baseOklch.l,
      c: Math.max(0, baseOklch.c * 0.2), // 80% menos saturado
      h: baseOklch.h
    }
    
    return {
      base: baseResult.hex,
      hover: clampOklch(hoverOklch).hex,
      active: clampOklch(activeOklch).hex,
      focus: clampOklch(focusOklch).hex,
      disabled: clampOklch(disabledOklch).hex
    }
  } catch (error) {
    console.error('Error building interaction states:', error)
    return {
      base: hex,
      hover: '#4a5568',
      active: '#2d3748',
      focus: hex,
      disabled: '#a0aec0'
    }
  }
}

/**
 * Gera escala de neutros warm baseada em uma cor
 */
export function buildNeutralScale(referenceHex?: string): {
  0: string    // Branco puro
  50: string   // Quase branco
  100: string  // Muito claro
  200: string  // Claro
  300: string  // Médio claro
  700: string  // Médio escuro
  900: string  // Escuro
  950: string  // Muito escuro
} {
  // Se não houver referência, usar neutros padrão
  if (!referenceHex) {
    return {
      0: '#ffffff',
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      700: '#44403c',
      900: '#1c1917',
      950: '#0c0a09'
    }
  }
  
  try {
    const refOklch = hexToOklch(referenceHex)
    // Usar apenas o hue da referência, com baixa saturação
    const hue = refOklch.h
    
    return {
      0: '#ffffff',
      50: oklchToHex({ l: 0.98, c: 0.002, h: hue }),
      100: oklchToHex({ l: 0.96, c: 0.005, h: hue }),
      200: oklchToHex({ l: 0.90, c: 0.008, h: hue }),
      300: oklchToHex({ l: 0.82, c: 0.010, h: hue }),
      700: oklchToHex({ l: 0.25, c: 0.015, h: hue }),
      900: oklchToHex({ l: 0.12, c: 0.010, h: hue }),
      950: oklchToHex({ l: 0.06, c: 0.008, h: hue })
    }
  } catch (error) {
    console.error('Error building neutral scale:', error)
    // Fallback para neutros padrão
    return {
      0: '#ffffff',
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      700: '#44403c',
      900: '#1c1917',
      950: '#0c0a09'
    }
  }
}