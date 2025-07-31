import { ThemeTokens } from './palette-generator'

export type CSSVariableMap = Record<string, string>

/**
 * Creates a mapping of theme tokens to CSS custom properties
 */
export function createTokenMapping(tokens: ThemeTokens): CSSVariableMap {
  const cssVars: CSSVariableMap = {}

  // Primary colors
  Object.entries(tokens.primary).forEach(([key, value]) => {
    cssVars[`--primary-${key}`] = value
  })

  // Secondary colors  
  Object.entries(tokens.secondary).forEach(([key, value]) => {
    cssVars[`--secondary-${key}`] = value
  })

  // Neutral colors
  Object.entries(tokens.neutral).forEach(([key, value]) => {
    cssVars[`--neutral-${key}`] = value
  })

  // Semantic colors
  Object.entries(tokens.semantic).forEach(([semanticKey, semanticValue]) => {
    Object.entries(semanticValue).forEach(([stateKey, stateValue]) => {
      cssVars[`--${semanticKey}-${stateKey}`] = stateValue
    })
  })

  // Component tokens - Buttons
  Object.entries(tokens.components.button).forEach(([variant, styles]) => {
    Object.entries(styles).forEach(([state, value]) => {
      cssVars[`--btn-${variant}-${state}`] = value
    })
  })

  // Component tokens - Sidebar
  cssVars['--sidebar-bg'] = tokens.components.sidebar.background
  cssVars['--sidebar-border'] = tokens.components.sidebar.border
  cssVars['--sidebar-indicator'] = tokens.components.sidebar.indicator
  
  Object.entries(tokens.components.sidebar.item).forEach(([state, value]) => {
    cssVars[`--sidebar-item-${state}`] = value
  })
  
  Object.entries(tokens.components.sidebar.text).forEach(([state, value]) => {
    cssVars[`--sidebar-text-${state}`] = value
  })

  // Component tokens - Card
  Object.entries(tokens.components.card).forEach(([key, value]) => {
    cssVars[`--card-${key}`] = value
  })

  // Component tokens - Input
  Object.entries(tokens.components.input).forEach(([key, value]) => {
    if (typeof value === 'object') {
      // Handle focus styles
      Object.entries(value).forEach(([subKey, subValue]) => {
        cssVars[`--input-${key}-${subKey}`] = subValue
      })
    } else {
      cssVars[`--input-${key}`] = value
    }
  })

  // Additional semantic mappings for shadcn/ui compatibility
  cssVars['--background'] = tokens.neutral[25]
  cssVars['--foreground'] = tokens.neutral[900]
  cssVars['--muted'] = tokens.neutral[100]
  cssVars['--muted-foreground'] = tokens.neutral[500]
  cssVars['--popover'] = tokens.neutral[25]
  cssVars['--popover-foreground'] = tokens.neutral[900]
  cssVars['--border'] = tokens.neutral[200]
  cssVars['--input-border'] = tokens.neutral[300]
  cssVars['--ring'] = tokens.primary[500]
  cssVars['--accent'] = tokens.neutral[100]
  cssVars['--accent-foreground'] = tokens.neutral[900]
  cssVars['--destructive'] = tokens.semantic.error.bg
  cssVars['--destructive-foreground'] = tokens.semantic.error.text

  // Legacy compatibility
  cssVars['--cor-primaria-500'] = tokens.primary[500]
  cssVars['--cor-primaria-600'] = tokens.primary[600]
  cssVars['--cor-primaria-700'] = tokens.primary[700]
  cssVars['--cor-secundaria-500'] = tokens.secondary[500]
  cssVars['--cor-secundaria-600'] = tokens.secondary[600]
  cssVars['--cor-secundaria-700'] = tokens.secondary[700]

  return cssVars
}

/**
 * Validates theme tokens structure
 */
export function validateTokens(tokens: ThemeTokens): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required color scales
  const requiredScales = ['primary', 'secondary', 'neutral']
  const requiredShades = ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900']

  for (const scale of requiredScales) {
    if (!tokens[scale as keyof ThemeTokens]) {
      errors.push(`Missing ${scale} color scale`)
      continue
    }

    const colorScale = tokens[scale as keyof Pick<ThemeTokens, 'primary' | 'secondary' | 'neutral'>]
    for (const shade of requiredShades) {
      if (!colorScale[shade as keyof typeof colorScale]) {
        errors.push(`Missing ${scale}.${shade} color`)
      }
    }
  }

  // Check semantic colors
  const requiredSemantic = ['success', 'warning', 'error', 'info']
  const requiredSemanticStates = ['bg', 'text', 'hover', 'active', 'focus']

  for (const semantic of requiredSemantic) {
    if (!tokens.semantic[semantic as keyof typeof tokens.semantic]) {
      errors.push(`Missing semantic.${semantic}`)
      continue
    }

    const semanticColor = tokens.semantic[semantic as keyof typeof tokens.semantic]
    for (const state of requiredSemanticStates) {
      if (!semanticColor[state as keyof typeof semanticColor]) {
        errors.push(`Missing semantic.${semantic}.${state}`)
      }
    }
  }

  // Check component tokens
  if (!tokens.components) {
    errors.push('Missing components tokens')
  } else {
    // Check button variants
    const requiredButtonVariants = ['primary', 'secondary', 'ghost', 'outline']
    for (const variant of requiredButtonVariants) {
      if (!tokens.components.button[variant as keyof typeof tokens.components.button]) {
        errors.push(`Missing components.button.${variant}`)
      }
    }

    // Check other components
    const requiredComponents = ['sidebar', 'card', 'input']
    for (const component of requiredComponents) {
      if (!tokens.components[component as keyof typeof tokens.components]) {
        errors.push(`Missing components.${component}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Creates CSS string from token mapping
 */
export function createCSSFromTokens(cssVars: CSSVariableMap, scope: string = ':root'): string {
  const declarations = Object.entries(cssVars)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n')

  return `${scope} {\n${declarations}\n}`
}

/**
 * Utility to get specific token values
 */
export function getTokenValue(tokens: ThemeTokens, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = tokens

  for (const part of parts) {
    if (current && typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * Utility to check if a color meets contrast requirements
 */
export function checkContrast(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  // This would use the contrast checking from palette-generator
  // For now, return true - will be implemented with actual contrast checking
  return true
}

// Re-export types from palette-generator for convenience
export type {
  ThemeTokens,
  ColorScale,
  VariantStyles,
  StateStyles,
  FocusStyles,
  SemanticTokens,
  ComponentTokens,
  PaletteConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './palette-generator'