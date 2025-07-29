/**
 * Cálculos de contraste WCAG e ajustes automáticos
 * Garante acessibilidade AA em todos os elementos críticos
 */

import { wcagContrast, oklch } from 'culori'
import { hexToOklch, oklchToHex, OklchColor } from './color-space'

// Padrões WCAG 2.2
export const WCAG_LEVELS = {
  AA: {
    NORMAL: 4.5,    // Texto normal
    LARGE: 3.0      // Texto grande (≥18px ou ≥14px bold)
  },
  AAA: {
    NORMAL: 7.0,    // Texto normal (ideal)
    LARGE: 4.5      // Texto grande (ideal)
  }
} as const

export type ContrastLevel = 'AA' | 'AAA'
export type TextSize = 'normal' | 'large'

export interface ContrastResult {
  ratio: number
  level: 'AAA' | 'AA' | 'FAIL'
  isAccessible: boolean
  recommendation?: string
}

/**
 * Calcula contraste entre duas cores
 */
export function calculateContrast(foreground: string, background: string): ContrastResult {
  try {
    const ratio = wcagContrast(foreground, background) || 0
    
    let level: 'AAA' | 'AA' | 'FAIL'
    let isAccessible: boolean
    let recommendation: string | undefined
    
    if (ratio >= WCAG_LEVELS.AAA.NORMAL) {
      level = 'AAA'
      isAccessible = true
    } else if (ratio >= WCAG_LEVELS.AA.NORMAL) {
      level = 'AA'
      isAccessible = true
    } else if (ratio >= WCAG_LEVELS.AA.LARGE) {
      level = 'AA'
      isAccessible = true
      recommendation = 'Adequado apenas para texto grande (≥18px)'
    } else {
      level = 'FAIL'
      isAccessible = false
      recommendation = `Contraste insuficiente (${ratio.toFixed(1)}:1). Mínimo: ${WCAG_LEVELS.AA.NORMAL}:1`
    }
    
    return {
      ratio,
      level,
      isAccessible,
      recommendation
    }
  } catch (error) {
    console.error('Error calculating contrast:', error)
    return {
      ratio: 0,
      level: 'FAIL',
      isAccessible: false,
      recommendation: 'Erro no cálculo de contraste'
    }
  }
}

/**
 * Determina a melhor cor de texto (#111 ou #fff) para um fundo
 */
export function accessibleText(
  background: string,
  targetLevel: ContrastLevel = 'AA',
  textSize: TextSize = 'normal'
): {
  color: string
  contrast: ContrastResult
  backgroundAdjusted?: string
} {
  const targetRatio = WCAG_LEVELS[targetLevel][textSize === 'large' ? 'LARGE' : 'NORMAL']
  
  // Testar cores padrão
  const blackContrast = calculateContrast('#111111', background)
  const whiteContrast = calculateContrast('#ffffff', background)
  
  // Escolher a melhor opção
  if (blackContrast.ratio >= targetRatio) {
    return {
      color: '#111111',
      contrast: blackContrast
    }
  }
  
  if (whiteContrast.ratio >= targetRatio) {
    return {
      color: '#ffffff',
      contrast: whiteContrast
    }
  }
  
  // Se nenhuma cor padrão funciona, ajustar o fundo
  const adjustment = adjustBackgroundForContrast(background, '#111111', targetLevel, textSize)
  
  if (adjustment.backgroundAdjusted) {
    return {
      color: '#111111',
      contrast: adjustment.finalContrast,
      backgroundAdjusted: adjustment.backgroundAdjusted
    }
  }
  
  // Fallback: usar a melhor opção disponível
  if (blackContrast.ratio > whiteContrast.ratio) {
    return {
      color: '#111111',
      contrast: blackContrast
    }
  }
  
  return {
    color: '#ffffff',
    contrast: whiteContrast
  }
}

/**
 * Ajusta o fundo para garantir contraste adequado
 * Altera a luminosidade em passos de ±0.02 até atingir o contraste
 */
export function adjustBackgroundForContrast(
  background: string,
  foreground: string,
  targetLevel: ContrastLevel = 'AA',
  textSize: TextSize = 'normal',
  maxSteps = 6 // Limite de ±0.12 em passos de 0.02
): {
  backgroundAdjusted?: string
  finalContrast: ContrastResult
  steps: number
  direction: 'lighter' | 'darker' | 'none'
} {
  const targetRatio = WCAG_LEVELS[targetLevel][textSize === 'large' ? 'LARGE' : 'NORMAL']
  const originalContrast = calculateContrast(foreground, background)
  
  if (originalContrast.ratio >= targetRatio) {
    return {
      finalContrast: originalContrast,
      steps: 0,
      direction: 'none'
    }
  }
  
  const oklch = hexToOklch(background)
  let bestResult = {
    hex: background,
    contrast: originalContrast,
    steps: 0
  }
  
  // Tentar escurecer (reduzir L)
  for (let step = 1; step <= maxSteps; step++) {
    const darkerL = Math.max(0.1, oklch.l - (step * 0.02))
    const darkerHex = oklchToHex({ ...oklch, l: darkerL })
    const contrast = calculateContrast(foreground, darkerHex)
    
    if (contrast.ratio >= targetRatio) {
      return {
        backgroundAdjusted: darkerHex,
        finalContrast: contrast,
        steps: step,
        direction: 'darker'
      }
    }
    
    if (contrast.ratio > bestResult.contrast.ratio) {
      bestResult = { hex: darkerHex, contrast, steps: step }
    }
  }
  
  // Tentar clarear (aumentar L)
  for (let step = 1; step <= maxSteps; step++) {
    const lighterL = Math.min(0.95, oklch.l + (step * 0.02))
    const lighterHex = oklchToHex({ ...oklch, l: lighterL })
    const contrast = calculateContrast(foreground, lighterHex)
    
    if (contrast.ratio >= targetRatio) {
      return {
        backgroundAdjusted: lighterHex,
        finalContrast: contrast,
        steps: step,
        direction: 'lighter'
      }
    }
    
    if (contrast.ratio > bestResult.contrast.ratio) {
      bestResult = { hex: lighterHex, contrast, steps: step }
    }
  }
  
  // Se não conseguiu atingir o alvo, retornar a melhor tentativa
  const direction = bestResult.steps > 0 
    ? (bestResult.hex !== background ? (hexToOklch(bestResult.hex).l > oklch.l ? 'lighter' : 'darker') : 'none')
    : 'none'
  
  return {
    backgroundAdjusted: bestResult.hex !== background ? bestResult.hex : undefined,
    finalContrast: bestResult.contrast,
    steps: bestResult.steps,
    direction
  }
}

/**
 * Valida se um elemento tem contraste adequado
 */
export function ensureAA(
  foreground: string,
  background: string,
  textSize: TextSize = 'normal'
): {
  isValid: boolean
  contrast: ContrastResult
  suggestion?: string
} {
  const contrast = calculateContrast(foreground, background)
  const minRatio = WCAG_LEVELS.AA[textSize === 'large' ? 'LARGE' : 'NORMAL']
  
  const isValid = contrast.ratio >= minRatio
  
  let suggestion: string | undefined
  if (!isValid) {
    if (contrast.ratio >= WCAG_LEVELS.AA.LARGE) {
      suggestion = 'Use texto maior (≥18px) ou ajuste as cores'
    } else {
      const needed = minRatio - contrast.ratio
      suggestion = `Aumente o contraste em ${needed.toFixed(1)} para atingir AA`
    }
  }
  
  return {
    isValid,
    contrast,
    suggestion
  }
}

/**
 * Gera cores de texto automáticas para componentes específicos
 */
export function getComponentTextColors(backgroundColor: string): {
  primary: string      // Texto principal
  secondary: string    // Texto secundário (mais sutil)
  muted: string       // Texto menos importante
} {
  const oklch = hexToOklch(backgroundColor)
  const isLight = oklch.l > 0.6
  
  if (isLight) {
    return {
      primary: '#111111',
      secondary: '#4a5568',
      muted: '#718096'
    }
  } else {
    return {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.8)',
      muted: 'rgba(255, 255, 255, 0.6)'
    }
  }
}

/**
 * Testa contraste de uma lista de combinações
 */
export function batchContrastTest(
  combinations: Array<{ fg: string; bg: string; name: string }>
): Array<{
  name: string
  fg: string
  bg: string
  result: ContrastResult
  recommendation: string
}> {
  return combinations.map(({ fg, bg, name }) => {
    const result = calculateContrast(fg, bg)
    
    let recommendation: string
    if (result.isAccessible) {
      recommendation = `✅ ${result.level} (${result.ratio.toFixed(1)}:1)`
    } else {
      recommendation = `❌ ${result.recommendation}`
    }
    
    return {
      name,
      fg,
      bg,
      result,
      recommendation
    }
  })
}