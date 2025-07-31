import { 
  oklch, 
  formatHex, 
  differenceEuclidean, 
  clampChroma,
  interpolate,
  samples
} from 'culori'

// Fallback contrast function if wcag21 import fails
function calculateContrast(color1: string, color2: string): number {
  try {
    // Try to import wcag21 dynamically
    const { wcag21 } = require('culori/fn')
    return wcag21(color1, color2)
  } catch {
    // Fallback: Simple contrast calculation
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16)
      const r = (rgb >> 16) & 255
      const g = (rgb >> 8) & 255  
      const b = rgb & 255
      
      const rsRGB = r / 255
      const gsRGB = g / 255
      const bsRGB = b / 255
      
      const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
      const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
      const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)
      
      return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }
}

export interface PaletteConfig {
  primary: string
  secondary: string
  lightness: {
    light: number    // 0.1 - 0.9 (default: 0.8)
    medium: number   // 0.3 - 0.7 (default: 0.5)  
    dark: number     // 0.1 - 0.5 (default: 0.2)
  }
  saturation: {
    boost: number    // 0.8 - 1.2 (default: 1.0)
    muted: number    // 0.2 - 0.8 (default: 0.5)
  }
  contrast: {
    text: 'high' | 'medium' | 'low'
    backgrounds: 'subtle' | 'bold'
  }
}

export interface ColorScale {
  25: string   // Lightest
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string  // Base color
  600: string
  700: string
  800: string
  900: string  // Darkest
}

export interface VariantStyles {
  bg: string
  text: string
  hover: string
  active: string
  focus: string
  border?: string
}

export interface StateStyles {
  normal: string
  hover: string
  active: string
  disabled?: string
}

export interface FocusStyles {
  ring: string
  borderColor: string
}

export interface SemanticTokens {
  success: VariantStyles
  warning: VariantStyles
  error: VariantStyles
  info: VariantStyles
}

export interface ComponentTokens {
  button: {
    primary: VariantStyles
    secondary: VariantStyles
    ghost: VariantStyles
    outline: VariantStyles
  }
  sidebar: {
    background: string
    item: StateStyles
    text: StateStyles
    border: string
    indicator: string
  }
  card: {
    background: string
    border: string
    text: string
    header: string
  }
  input: {
    background: string
    border: string
    text: string
    placeholder: string
    focus: FocusStyles
  }
}

export interface ThemeTokens {
  primary: ColorScale
  secondary: ColorScale
  neutral: ColorScale
  semantic: SemanticTokens
  components: ComponentTokens
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

// Default configuration
export const DEFAULT_PALETTE_CONFIG: PaletteConfig = {
  primary: '#3b82f6',
  secondary: '#10b981',
  lightness: {
    light: 0.9,     // Tons mais claros
    medium: 0.65,   // Tons médios mais claros  
    dark: 0.35      // Tons escuros mais claros
  },
  saturation: {
    boost: 1.0,
    muted: 0.5
  },
  contrast: {
    text: 'high',
    backgrounds: 'subtle'
  }
}

// WCAG contrast requirements
const CONTRAST_REQUIREMENTS = {
  high: 4.5,   // WCAG AA for normal text
  medium: 3.0, // WCAG AA for large text
  low: 2.0     // Minimum readable
}

/**
 * Validates a palette configuration
 */
export function validatePaletteConfig(config: Partial<PaletteConfig>): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Validate colors
  if (config.primary && !isValidHex(config.primary)) {
    errors.push({
      field: 'primary',
      message: 'Primary color must be a valid HEX color',
      code: 'INVALID_COLOR_FORMAT'
    })
  }

  if (config.secondary && !isValidHex(config.secondary)) {
    errors.push({
      field: 'secondary', 
      message: 'Secondary color must be a valid HEX color',
      code: 'INVALID_COLOR_FORMAT'
    })
  }

  // Validate lightness values
  if (config.lightness) {
    const { light, medium, dark } = config.lightness
    
    if (light !== undefined && (light < 0.1 || light > 0.9)) {
      errors.push({
        field: 'lightness.light',
        message: 'Light value must be between 0.1 and 0.9',
        code: 'LIGHTNESS_OUT_OF_RANGE'
      })
    }

    if (medium !== undefined && (medium < 0.3 || medium > 0.7)) {
      errors.push({
        field: 'lightness.medium',
        message: 'Medium value must be between 0.3 and 0.7',
        code: 'LIGHTNESS_OUT_OF_RANGE'
      })
    }

    if (dark !== undefined && (dark < 0.1 || dark > 0.5)) {
      errors.push({
        field: 'lightness.dark',
        message: 'Dark value must be between 0.1 and 0.5',
        code: 'LIGHTNESS_OUT_OF_RANGE'
      })
    }

    // Check for conflicts
    if (light !== undefined && medium !== undefined && dark !== undefined) {
      if (dark >= medium || medium >= light) {
        errors.push({
          field: 'lightness',
          message: 'Lightness values must be in ascending order: dark < medium < light',
          code: 'LIGHTNESS_CONFLICT'
        })
      }
    }
  }

  // Validate saturation values
  if (config.saturation) {
    const { boost, muted } = config.saturation

    if (boost !== undefined && (boost < 0.8 || boost > 1.2)) {
      errors.push({
        field: 'saturation.boost',
        message: 'Boost value must be between 0.8 and 1.2',
        code: 'SATURATION_OUT_OF_RANGE'
      })
    }

    if (muted !== undefined && (muted < 0.2 || muted > 0.8)) {
      errors.push({
        field: 'saturation.muted',
        message: 'Muted value must be between 0.2 and 0.8', 
        code: 'SATURATION_OUT_OF_RANGE'
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Generates a complete color scale from a base color using OKLCH
 */
function generateColorScale(baseColor: string, config: PaletteConfig): ColorScale {
  const baseOklch = oklch(baseColor)
  if (!baseOklch) {
    throw new Error(`Invalid color: ${baseColor}`)
  }

  // Define lightness stops for scale
  const lightnessStops = [
    0.98,  // 25 - Nearly white
    0.95,  // 50 - Very light
    0.90,  // 100 - Light
    0.80,  // 200 - Light-medium
    0.65,  // 300 - Medium-light
    0.50,  // 400 - Medium
    baseOklch.l || 0.5,  // 500 - Base color
    Math.max(0.35, (baseOklch.l || 0.5) - 0.15),  // 600 - Medium-dark
    Math.max(0.25, (baseOklch.l || 0.5) - 0.25),  // 700 - Dark
    Math.max(0.15, (baseOklch.l || 0.5) - 0.35),  // 800 - Very dark
    0.10   // 900 - Nearly black
  ]

  // Generate scale with clamped chroma to ensure valid colors
  const scale: Partial<ColorScale> = {}
  const scaleKeys = ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const

  lightnessStops.forEach((lightness, index) => {
    const key = scaleKeys[index]
    
    // Adjust chroma based on lightness and config
    let chroma = (baseOklch.c || 0) * config.saturation.boost
    
    // Reduce chroma for very light and very dark colors
    if (lightness > 0.9 || lightness < 0.2) {
      chroma *= config.saturation.muted
    }

    const color = clampChroma({
      mode: 'oklch',
      l: lightness,
      c: chroma,
      h: baseOklch.h || 0
    })

    scale[key] = formatHex(color) || baseColor
  })

  return scale as ColorScale
}

/**
 * Generates neutral gray scale based on primary color
 */
function generateNeutralScale(primaryColor: string): ColorScale {
  const primaryOklch = oklch(primaryColor)
  const hue = primaryOklch?.h || 0

  const neutralBase = {
    mode: 'oklch' as const,
    l: 0.5,
    c: 0.02, // Very low chroma for warm neutrals
    h: hue
  }

  const lightnessStops = [0.98, 0.95, 0.90, 0.80, 0.65, 0.50, 0.5, 0.35, 0.25, 0.15, 0.10]
  const scale: Partial<ColorScale> = {}
  const scaleKeys = ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const

  lightnessStops.forEach((lightness, index) => {
    const key = scaleKeys[index]
    const color = clampChroma({
      ...neutralBase,
      l: lightness
    })
    scale[key] = formatHex(color) || '#000000'
  })

  return scale as ColorScale
}

/**
 * Calculates WCAG contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  return calculateContrast(color1, color2) || 0
}

/**
 * Finds the best text color (black or white) for a background
 */
function getBestTextColor(backgroundColor: string, requirement: 'high' | 'medium' | 'low' = 'high'): string {
  const requiredRatio = CONTRAST_REQUIREMENTS[requirement]
  
  const whiteContrast = getContrastRatio(backgroundColor, '#ffffff')
  const blackContrast = getContrastRatio(backgroundColor, '#000000')

  // Prefer white text if it meets requirements
  if (whiteContrast >= requiredRatio) return '#ffffff'
  
  // Fall back to black if it's better
  if (blackContrast >= requiredRatio) return '#000000'
  
  // Return the better option even if neither meets requirements
  return whiteContrast > blackContrast ? '#ffffff' : '#000000'
}

/**
 * Generates semantic color tokens (success, warning, error, info)
 */
function generateSemanticTokens(config: PaletteConfig): SemanticTokens {
  const contrastLevel = config.contrast.text

  // Fixed semantic colors for consistency
  const semanticColors = {
    success: '#16a34a',
    warning: '#f59e0b', 
    error: '#ef4444',
    info: '#0ea5e9'
  }

  const createVariantStyles = (bgColor: string): VariantStyles => {
    const textColor = getBestTextColor(bgColor, contrastLevel)
    const hoverColor = oklch(bgColor)
    const hoverHex = formatHex({
      mode: 'oklch',
      l: Math.max(0.1, (hoverColor?.l || 0.5) - 0.1),
      c: hoverColor?.c || 0,
      h: hoverColor?.h || 0
    }) || bgColor

    return {
      bg: bgColor,
      text: textColor,
      hover: hoverHex,
      active: hoverHex,
      focus: bgColor,
      border: bgColor
    }
  }

  return {
    success: createVariantStyles(semanticColors.success),
    warning: createVariantStyles(semanticColors.warning),
    error: createVariantStyles(semanticColors.error),
    info: createVariantStyles(semanticColors.info)
  }
}

/**
 * Generates component-specific tokens
 */
function generateComponentTokens(
  primaryScale: ColorScale, 
  secondaryScale: ColorScale, 
  neutralScale: ColorScale, 
  config: PaletteConfig
): ComponentTokens {
  const contrastLevel = config.contrast.text

  return {
    button: {
      primary: {
        bg: primaryScale[600],
        text: getBestTextColor(primaryScale[600], contrastLevel),
        hover: primaryScale[700],
        active: primaryScale[800],
        focus: primaryScale[500],
        border: primaryScale[600]
      },
      secondary: {
        bg: secondaryScale[600],
        text: getBestTextColor(secondaryScale[600], contrastLevel),
        hover: secondaryScale[700],
        active: secondaryScale[800],
        focus: secondaryScale[500],
        border: secondaryScale[600]
      },
      ghost: {
        bg: 'transparent',
        text: neutralScale[700],
        hover: primaryScale[50],
        active: primaryScale[100],
        focus: primaryScale[500],
        border: 'transparent'
      },
      outline: {
        bg: 'transparent',
        text: primaryScale[600],
        hover: primaryScale[50],
        active: primaryScale[100],
        focus: primaryScale[500],
        border: primaryScale[300]
      }
    },
    sidebar: {
      background: primaryScale[25],
      item: {
        normal: 'transparent',
        hover: primaryScale[50],
        active: primaryScale[100]
      },
      text: {
        normal: neutralScale[700],
        hover: neutralScale[800],
        active: primaryScale[700]
      },
      border: primaryScale[200],
      indicator: primaryScale[600]
    },
    card: {
      background: neutralScale[25],
      border: neutralScale[200],
      text: neutralScale[800],
      header: neutralScale[900]
    },
    input: {
      background: neutralScale[25],
      border: neutralScale[300],
      text: neutralScale[800],
      placeholder: neutralScale[400],
      focus: {
        ring: primaryScale[500],
        borderColor: primaryScale[500]
      }
    }
  }
}

/**
 * Main function to generate complete theme tokens
 */
export function generatePalette(config: PaletteConfig = DEFAULT_PALETTE_CONFIG): ThemeTokens {
  // Validate configuration
  const validation = validatePaletteConfig(config)
  if (!validation.valid) {
    throw new Error(`Invalid palette configuration: ${validation.errors.map(e => e.message).join(', ')}`)
  }

  // Merge with defaults
  const fullConfig = {
    ...DEFAULT_PALETTE_CONFIG,
    ...config,
    lightness: { ...DEFAULT_PALETTE_CONFIG.lightness, ...config.lightness },
    saturation: { ...DEFAULT_PALETTE_CONFIG.saturation, ...config.saturation },
    contrast: { ...DEFAULT_PALETTE_CONFIG.contrast, ...config.contrast }
  }

  try {
    // Generate color scales
    const primaryScale = generateColorScale(fullConfig.primary, fullConfig)
    const secondaryScale = generateColorScale(fullConfig.secondary, fullConfig)
    const neutralScale = generateNeutralScale(fullConfig.primary)

    // Generate semantic and component tokens
    const semantic = generateSemanticTokens(fullConfig)
    const components = generateComponentTokens(primaryScale, secondaryScale, neutralScale, fullConfig)

    return {
      primary: primaryScale,
      secondary: secondaryScale,
      neutral: neutralScale,
      semantic,
      components
    }
  } catch (error) {
    throw new Error(`Failed to generate palette: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Helper function to validate HEX color format
 */
function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}