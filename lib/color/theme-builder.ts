/**
 * Construtor principal de temas
 * Orquestra todo o processo: clamps → scales → contraste → tokens CSS
 */

import { validateColorPair } from './clamps'
import { buildScale, buildExtendedScale, buildNeutralScale, buildInteractionStates, gradientBrand } from './scale'
import { accessibleText, getComponentTextColors } from './contrast'

export interface ThemeInput {
  primaryHex: string
  secondaryHex: string
  name?: string
}

export interface ThemeTokens {
  // Cores da marca (escalas)
  primary: {
    25: string
    50: string
    100: string
    300: string
    600: string
    700: string
    900: string
    950: string
  }
  secondary: {
    25: string
    50: string
    100: string
    300: string
    600: string
    700: string
    900: string
    950: string
  }
  
  // Neutros warm
  neutral: {
    0: string
    50: string
    100: string
    200: string
    300: string
    700: string
    900: string
    950: string
  }
  
  // Texto automático
  text: {
    strong: string
    body: string
    muted: string
    inverse: string
  }
  
  // Superfícies
  surface: {
    0: string  // Branco puro
    1: string  // Neutral-50
    2: string  // Neutral-100
    3: string  // Com tint brand
  }
  
  // Componentes com contraste garantido
  button: {
    primary: {
      bg: string
      text: string
      hover: string
      active: string
      focus: string
    }
    secondary: {
      bg: string
      text: string
      hover: string
      active: string
      focus: string
    }
  }
  
  // Badges semânticas (fixas)
  badge: {
    success: { bg: string; text: string }
    warning: { bg: string; text: string }
    danger: { bg: string; text: string }
    info: { bg: string; text: string }
  }
  
  // Sidebar
  sidebar: {
    bg: string
    itemColor: string
    itemActiveBg: string
    itemActiveIndicator: string
  }
  
  // Chips informativos
  chip: {
    bg: string
    text: string
    shadow: string
  }
  
  // Gradiente de marca
  gradient: {
    brand: string
  }
}

export interface BuildThemeResult {
  tokens: ThemeTokens
  css: string
  validation: {
    isValid: boolean
    adjustments: string[]
    warnings: string[]
  }
  metadata: {
    primaryOriginal: string
    secondaryOriginal: string
    primaryFinal: string
    secondaryFinal: string
    generatedAt: string
  }
}

/**
 * Cores semânticas fixas (independentes da marca)
 */
const SEMANTIC_COLORS = {
  success: '#16a34a',    // Verde L~0.78 C~0.07
  warning: '#f59e0b',    // Amarelo L~0.80 C~0.09  
  danger: '#ef4444',     // Vermelho L~0.58 C~0.10
  info: '#0ea5e9'        // Azul L~0.62 C~0.09
} as const

/**
 * Constrói tema completo com tokens e CSS
 */
export function buildThemeTokens(input: ThemeInput): BuildThemeResult {
  const adjustments: string[] = []
  const warnings: string[] = []
  
  try {
    // 1. Validar e ajustar cores de entrada
    const validation = validateColorPair(input.primaryHex, input.secondaryHex)
    
    const primaryFinal = validation.primary.hex
    const secondaryFinal = validation.secondary.hex
    
    // Registrar ajustes
    if (validation.primary.wasAdjusted) {
      adjustments.push(...validation.primary.adjustments)
    }
    if (validation.secondary.wasAdjusted) {
      adjustments.push(...validation.secondary.adjustments)
    }
    
    // Avisar sobre diferença insuficiente
    if (!validation.isValidPair) {
      warnings.push('Cores muito similares - considere usar sugestão de harmonização')
      warnings.push(...validation.difference.suggestions)
    }
    
    // 2. Gerar escalas de cores
    const primaryExtended = buildExtendedScale(primaryFinal)
    const secondaryScale = buildScale(secondaryFinal)
    const secondaryExtended = buildExtendedScale(secondaryFinal)
    const neutrals = buildNeutralScale(primaryFinal)
    
    // 3. Estados de interação
    const primaryStates = buildInteractionStates(primaryExtended[600])
    const secondaryStates = buildInteractionStates(secondaryExtended[600])
    
    // 4. Cores de texto automáticas para botões
    const primaryButtonText = accessibleText(primaryStates.base)
    const secondaryButtonText = accessibleText(secondaryStates.base)
    
    // 5. Cores semânticas com contraste garantido
    const badgeColors = {
      success: {
        bg: SEMANTIC_COLORS.success,
        text: accessibleText(SEMANTIC_COLORS.success).color
      },
      warning: {
        bg: SEMANTIC_COLORS.warning,
        text: accessibleText(SEMANTIC_COLORS.warning).color
      },
      danger: {
        bg: SEMANTIC_COLORS.danger,
        text: accessibleText(SEMANTIC_COLORS.danger).color
      },
      info: {
        bg: SEMANTIC_COLORS.info,
        text: accessibleText(SEMANTIC_COLORS.info).color
      }
    }
    
    // 6. Surface com tint brand
    const surface3Tint = buildExtendedScale(primaryFinal)[50] // Muito sutil
    
    // 7. Gradiente de marca
    const brandGradient = gradientBrand(primaryFinal, secondaryFinal)
    
    // 8. Montar tokens
    const tokens: ThemeTokens = {
      primary: primaryExtended,
      secondary: {
        25: secondaryExtended[25],
        50: secondaryExtended[50],
        100: secondaryExtended[100],
        300: secondaryExtended[300],
        600: secondaryExtended[600],
        700: secondaryExtended[700],
        900: secondaryExtended[900],
        950: secondaryExtended[950]
      },
      neutral: neutrals,
      text: {
        strong: '#111111',
        body: '#1a1a1a',
        muted: '#667085',
        inverse: '#ffffff'
      },
      surface: {
        0: neutrals[0],
        1: neutrals[50],
        2: neutrals[100],
        3: surface3Tint
      },
      button: {
        primary: {
          bg: primaryStates.base,
          text: primaryButtonText.color,
          hover: primaryStates.hover,
          active: primaryStates.active,
          focus: primaryStates.focus
        },
        secondary: {
          bg: secondaryStates.base,
          text: secondaryButtonText.color,
          hover: secondaryStates.hover,
          active: secondaryStates.active,
          focus: secondaryStates.focus
        }
      },
      badge: badgeColors,
      sidebar: {
        bg: neutrals[100],
        itemColor: '#1a1a1a',
        itemActiveBg: primaryExtended[100],
        itemActiveIndicator: primaryExtended[700]
      },
      chip: {
        bg: neutrals[0],
        text: '#111111',
        shadow: 'rgba(0,0,0,.06)'
      },
      gradient: {
        brand: brandGradient.css
      }
    }
    
    // 9. Gerar CSS
    const css = generateCSS(tokens)
    
    return {
      tokens,
      css,
      validation: {
        isValid: validation.isValidPair,
        adjustments,
        warnings
      },
      metadata: {
        primaryOriginal: input.primaryHex,
        secondaryOriginal: input.secondaryHex,
        primaryFinal,
        secondaryFinal,
        generatedAt: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('Error building theme tokens:', error)
    
    // Fallback para tema padrão
    return buildFallbackTheme(input)
  }
}

/**
 * Gera string CSS com todas as variáveis
 */
function generateCSS(tokens: ThemeTokens): string {
  return `
/* === TOKENS SEMÂNTICOS (OKLCH) === */

/* Marca */
--primary-25: ${tokens.primary[25]};
--primary-50: ${tokens.primary[50]};
--primary-100: ${tokens.primary[100]};
--primary-300: ${tokens.primary[300]};
--primary-600: ${tokens.primary[600]};
--primary-700: ${tokens.primary[700]};
--primary-900: ${tokens.primary[900]};
--primary-950: ${tokens.primary[950]};

--secondary-25: ${tokens.secondary[25]};
--secondary-50: ${tokens.secondary[50]};
--secondary-100: ${tokens.secondary[100]};
--secondary-300: ${tokens.secondary[300]};
--secondary-600: ${tokens.secondary[600]};
--secondary-700: ${tokens.secondary[700]};
--secondary-900: ${tokens.secondary[900]};
--secondary-950: ${tokens.secondary[950]};

/* Neutros warm */
--neutral-0: ${tokens.neutral[0]};
--neutral-50: ${tokens.neutral[50]};
--neutral-100: ${tokens.neutral[100]};
--neutral-200: ${tokens.neutral[200]};
--neutral-300: ${tokens.neutral[300]};
--neutral-700: ${tokens.neutral[700]};
--neutral-900: ${tokens.neutral[900]};
--neutral-950: ${tokens.neutral[950]};

/* Texto */
--text-strong: ${tokens.text.strong};
--text-body: ${tokens.text.body};
--text-muted: ${tokens.text.muted};
--text-inverse: ${tokens.text.inverse};

/* Superfícies */
--surface-0: ${tokens.surface[0]};
--surface-1: ${tokens.surface[1]};
--surface-2: ${tokens.surface[2]};
--surface-3: ${tokens.surface[3]};

/* Aliases semânticos para superfícies */
--surface-bg: ${tokens.surface[1]};
--surface-card: ${tokens.surface[0]};
--border-color: ${tokens.neutral[200]};

/* Botões */
--btn-primary-bg: ${tokens.button.primary.bg};
--btn-primary-text: ${tokens.button.primary.text};
--btn-primary-hover: ${tokens.button.primary.hover};
--btn-primary-active: ${tokens.button.primary.active};
--btn-primary-focus: ${tokens.button.primary.focus};

--btn-secondary-bg: ${tokens.button.secondary.bg};
--btn-secondary-text: ${tokens.button.secondary.text};
--btn-secondary-hover: ${tokens.button.secondary.hover};
--btn-secondary-active: ${tokens.button.secondary.active};
--btn-secondary-focus: ${tokens.button.secondary.focus};

/* Badges (semânticas fixas) */
--badge-success-bg: ${tokens.badge.success.bg};
--badge-success-text: ${tokens.badge.success.text};
--badge-warning-bg: ${tokens.badge.warning.bg};
--badge-warning-text: ${tokens.badge.warning.text};
--badge-danger-bg: ${tokens.badge.danger.bg};
--badge-danger-text: ${tokens.badge.danger.text};
--badge-info-bg: ${tokens.badge.info.bg};
--badge-info-text: ${tokens.badge.info.text};

/* Sidebar */
--sidebar-bg: ${tokens.sidebar.bg};
--sidebar-item-color: ${tokens.sidebar.itemColor};
--sidebar-item-active-bg: ${tokens.sidebar.itemActiveBg};
--sidebar-item-active-indicator: ${tokens.sidebar.itemActiveIndicator};

/* Chips informativos */
--chip-bg: ${tokens.chip.bg};
--chip-text: ${tokens.chip.text};
--chip-shadow: ${tokens.chip.shadow};

/* Gradiente */
--gradient-brand: ${tokens.gradient.brand};

/* === ALIASES LEGADOS (manter por 1 release) === */
--cor-primaria-500: var(--primary-600);
--cor-primaria-700: var(--primary-700);
--cor-secundaria-500: var(--secondary-600);
--cor-neutra-100: var(--neutral-100);
--cor-neutra-700: var(--neutral-700);
--cor-sucesso: var(--badge-success-bg);
--cor-aviso: var(--badge-warning-bg);
--cor-perigo: var(--badge-danger-bg);
`.trim()
}

/**
 * Tema fallback em caso de erro
 */
function buildFallbackTheme(input: ThemeInput): BuildThemeResult {
  const fallbackTokens: ThemeTokens = {
    primary: {
      25: '#fefefe',
      50: '#eff6ff',
      100: '#dbeafe',
      300: '#93c5fd',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a',
      950: '#0c0a09'
    },
    secondary: {
      25: '#fefefe',
      50: '#eff6ff',
      100: '#dbeafe',
      300: '#93c5fd',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a',
      950: '#0c0a09'
    },
    neutral: {
      0: '#ffffff',
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      700: '#44403c',
      900: '#1c1917',
      950: '#0c0a09'
    },
    text: {
      strong: '#111111',
      body: '#1a1a1a',
      muted: '#667085',
      inverse: '#ffffff'
    },
    surface: {
      0: '#ffffff',
      1: '#fafaf9',
      2: '#f5f5f4',
      3: '#eff6ff'
    },
    button: {
      primary: {
        bg: '#2563eb',
        text: '#ffffff',
        hover: '#1d4ed8',
        active: '#1e40af',
        focus: '#2563eb'
      },
      secondary: {
        bg: '#16a34a',
        text: '#ffffff',
        hover: '#15803d',
        active: '#166534',
        focus: '#16a34a'
      }
    },
    badge: {
      success: { bg: '#16a34a', text: '#ffffff' },
      warning: { bg: '#f59e0b', text: '#111111' },
      danger: { bg: '#ef4444', text: '#ffffff' },
      info: { bg: '#0ea5e9', text: '#ffffff' }
    },
    sidebar: {
      bg: '#f5f5f4',
      itemColor: '#1a1a1a',
      itemActiveBg: '#dbeafe',
      itemActiveIndicator: '#1d4ed8'
    },
    chip: {
      bg: '#ffffff',
      text: '#111111',
      shadow: 'rgba(0,0,0,.06)'
    },
    gradient: {
      brand: 'linear-gradient(135deg, #2563eb 0%, #93c5fd 50%, #15803d 100%)'
    }
  }
  
  return {
    tokens: fallbackTokens,
    css: generateCSS(fallbackTokens),
    validation: {
      isValid: false,
      adjustments: ['Erro no processamento - usando tema fallback'],
      warnings: ['Verifique as cores de entrada']
    },
    metadata: {
      primaryOriginal: input.primaryHex,
      secondaryOriginal: input.secondaryHex,
      primaryFinal: '#2563eb',
      secondaryFinal: '#16a34a',
      generatedAt: new Date().toISOString()
    }
  }
}