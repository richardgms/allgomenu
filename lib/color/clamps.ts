/**
 * Clamps e validações para cores OKLCH
 * Garante que as cores estejam dentro dos limites seguros para UI
 */

import { 
  hexToOklch, 
  oklchToHex, 
  calculateDeltaE00, 
  calculateHueDifference, 
  calculateLightnessDifference,
  clampLightness,
  clampChroma,
  clampHue,
  OklchColor
} from './color-space'

// Limites conforme especificação
export const OKLCH_LIMITS = {
  // Lightness para uso geral em UI
  L_MIN: 0.38,
  L_MAX: 0.82,
  
  // Lightness para botões (mais restritivo)
  L_BUTTON_MIN: 0.40,
  L_BUTTON_MAX: 0.80,
  
  // Chroma para UI geral
  C_UI_MAX: 0.15,
  
  // Chroma para texto colorido (mais conservador)
  C_TEXT_MAX: 0.12,
  
  // Diferenças mínimas entre primária e secundária
  DELTA_E00_MIN: 12,
  HUE_DIFF_MIN: 25,
  LIGHTNESS_DIFF_MIN: 0.12
} as const

export interface ClampResult {
  color: OklchColor
  hex: string
  wasAdjusted: boolean
  adjustments: string[]
}

/**
 * Aplica clamps a uma cor OKLCH
 */
export function clampOklch(
  color: OklchColor, 
  options: {
    context?: 'ui' | 'button' | 'text'
    forceLimits?: boolean
  } = {}
): ClampResult {
  const { context = 'ui', forceLimits = true } = options
  const adjustments: string[] = []
  let wasAdjusted = false
  
  let { l, c, h } = color
  
  // Aplicar limites de Lightness baseado no contexto
  const lMin = context === 'button' ? OKLCH_LIMITS.L_BUTTON_MIN : OKLCH_LIMITS.L_MIN
  const lMax = context === 'button' ? OKLCH_LIMITS.L_BUTTON_MAX : OKLCH_LIMITS.L_MAX
  
  if (forceLimits) {
    const originalL = l
    l = clampLightness(l, lMin, lMax)
    if (l !== originalL) {
      wasAdjusted = true
      adjustments.push(`Lightness ajustada de ${originalL.toFixed(2)} para ${l.toFixed(2)}`)
    }
  }
  
  // Aplicar limites de Chroma
  const cMax = context === 'text' ? OKLCH_LIMITS.C_TEXT_MAX : OKLCH_LIMITS.C_UI_MAX
  const originalC = c
  c = clampChroma(c, cMax)
  if (c !== originalC) {
    wasAdjusted = true
    adjustments.push(`Chroma reduzida de ${originalC.toFixed(2)} para ${c.toFixed(2)}`)
  }
  
  // Normalizar hue
  const originalH = h
  h = clampHue(h)
  if (h !== originalH) {
    wasAdjusted = true
    adjustments.push(`Hue normalizada de ${originalH.toFixed(1)}° para ${h.toFixed(1)}°`)
  }
  
  const clampedColor = { l, c, h }
  const hex = oklchToHex(clampedColor)
  
  return {
    color: clampedColor,
    hex,
    wasAdjusted,
    adjustments
  }
}

/**
 * Verifica se duas cores têm diferença suficiente
 */
export function ensureDifference(
  primaryHex: string, 
  secondaryHex: string
): {
  isValid: boolean
  deltaE00: number
  hueDifference: number
  lightnessDifference: number
  suggestions: string[]
} {
  const deltaE00 = calculateDeltaE00(primaryHex, secondaryHex)
  const hueDifference = calculateHueDifference(primaryHex, secondaryHex)
  const lightnessDifference = calculateLightnessDifference(primaryHex, secondaryHex)
  
  const suggestions: string[] = []
  
  // Verificar se atende aos critérios mínimos
  const meetsEDelta = deltaE00 >= OKLCH_LIMITS.DELTA_E00_MIN
  const meetsHue = hueDifference >= OKLCH_LIMITS.HUE_DIFF_MIN
  const meetsLightness = lightnessDifference >= OKLCH_LIMITS.LIGHTNESS_DIFF_MIN
  
  const isValid = meetsEDelta || meetsHue || meetsLightness
  
  if (!isValid) {
    if (deltaE00 < OKLCH_LIMITS.DELTA_E00_MIN) {
      suggestions.push(`Diferença perceptual muito baixa (ΔE00: ${deltaE00.toFixed(1)}, mín: ${OKLCH_LIMITS.DELTA_E00_MIN})`)
    }
    
    if (hueDifference < OKLCH_LIMITS.HUE_DIFF_MIN) {
      suggestions.push(`Diferença de matiz insuficiente (${hueDifference.toFixed(1)}°, mín: ${OKLCH_LIMITS.HUE_DIFF_MIN}°)`)
    }
    
    if (lightnessDifference < OKLCH_LIMITS.LIGHTNESS_DIFF_MIN) {
      suggestions.push(`Diferença de luminosidade insuficiente (${lightnessDifference.toFixed(2)}, mín: ${OKLCH_LIMITS.LIGHTNESS_DIFF_MIN})`)
    }
    
    suggestions.push('Sugestões: mova o matiz ±30°, ajuste a luminosidade ±15%, ou escolha cores mais contrastantes')
  }
  
  return {
    isValid,
    deltaE00,
    hueDifference,
    lightnessDifference,
    suggestions
  }
}

/**
 * Harmoniza uma cor secundária baseada na primária
 * Move o hue para criar melhor diferenciação
 */
export function harmonizeSecondary(
  primaryHex: string,
  secondaryHex: string,
  strategy: 'complementary' | 'triadic' | 'analogous' = 'complementary'
): string {
  try {
    const primaryOklch = hexToOklch(primaryHex)
    const secondaryOklch = hexToOklch(secondaryHex)
    
    let newHue: number
    
    switch (strategy) {
      case 'complementary':
        // 180° opostos
        newHue = (primaryOklch.h + 180) % 360
        break
        
      case 'triadic':
        // 120° de diferença
        newHue = (primaryOklch.h + 120) % 360
        break
        
      case 'analogous':
        // 30° adjacentes (mas garante diferença mínima)
        const direction = Math.random() > 0.5 ? 1 : -1
        newHue = (primaryOklch.h + (45 * direction) + 360) % 360
        break
        
      default:
        newHue = secondaryOklch.h
    }
    
    // Manter lightness e chroma da secundária original, mas ajustar se necessário
    const harmonizedColor: OklchColor = {
      l: secondaryOklch.l,
      c: Math.min(secondaryOklch.c, OKLCH_LIMITS.C_UI_MAX), // Aplicar clamp de chroma
      h: newHue
    }
    
    // Aplicar clamps
    const clampResult = clampOklch(harmonizedColor)
    
    return clampResult.hex
  } catch (error) {
    console.error('Error harmonizing secondary color:', error)
    return secondaryHex // Retorna a cor original se houver erro
  }
}

/**
 * Auto-ajusta uma cor para uso como fundo de botão
 * Garante que fique na faixa segura para contraste
 */
export function adjustForButton(hex: string): ClampResult {
  const oklch = hexToOklch(hex)
  return clampOklch(oklch, { context: 'button', forceLimits: true })
}

/**
 * Auto-ajusta uma cor para uso em texto colorido
 * Aplica limites mais conservadores de chroma
 */
export function adjustForText(hex: string): ClampResult {
  const oklch = hexToOklch(hex)
  return clampOklch(oklch, { context: 'text', forceLimits: true })
}

/**
 * Valida um par de cores (primária + secundária)
 * Retorna resultado completo da validação
 */
export function validateColorPair(
  primaryHex: string,
  secondaryHex: string
): {
  primary: ClampResult
  secondary: ClampResult
  difference: ReturnType<typeof ensureDifference>
  isValidPair: boolean
  autoFixSuggestion?: string
} {
  // Aplicar clamps individuais
  const primaryOklch = hexToOklch(primaryHex)
  const secondaryOklch = hexToOklch(secondaryHex)
  
  const primary = clampOklch(primaryOklch)
  const secondary = clampOklch(secondaryOklch)
  
  // Verificar diferença usando as cores clampadas
  const difference = ensureDifference(primary.hex, secondary.hex)
  
  const isValidPair = difference.isValid
  
  let autoFixSuggestion: string | undefined
  if (!isValidPair) {
    if (difference.hueDifference < OKLCH_LIMITS.HUE_DIFF_MIN) {
      autoFixSuggestion = 'harmonize-complementary'
    } else if (difference.lightnessDifference < OKLCH_LIMITS.LIGHTNESS_DIFF_MIN) {
      autoFixSuggestion = 'adjust-lightness'
    } else {
      autoFixSuggestion = 'increase-chroma'
    }
  }
  
  return {
    primary,
    secondary,
    difference,
    isValidPair,
    autoFixSuggestion
  }
}