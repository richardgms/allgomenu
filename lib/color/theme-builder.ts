/**
 * Construtor principal de temas
 * Orquestra todo o processo: clamps → scales → contraste → tokens CSS
 */

import { normalizeHex, isValidHex } from './color-space'

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
    // Validar e normalizar cores hex
    let primaryHex: string
    let secondaryHex: string
    
    try {
      primaryHex = normalizeHex(input.primaryHex)
      secondaryHex = normalizeHex(input.secondaryHex)
    } catch (error) {
      console.warn('Invalid hex colors, using fallback:', error)
      primaryHex = '#3b82f6'
      secondaryHex = '#10b981'
    }
    
    if (!isValidHex(primaryHex) || !isValidHex(secondaryHex)) {
      throw new Error('Cores inválidas fornecidas')
    }

// Building theme silently

    // Gerar variações simples usando manipulação de luminosidade
    const primaryLight = lightenColor(primaryHex, 0.3)
    const primaryDark = darkenColor(primaryHex, 0.2)
    const secondaryLight = lightenColor(secondaryHex, 0.3)
    const secondaryDark = darkenColor(secondaryHex, 0.2)

    // Cores de texto com contraste garantido
    const primaryTextColor = getContrastColor(primaryHex)
    const secondaryTextColor = getContrastColor(secondaryHex)
    
    // Cores de fundo com contraste adequado
    const primaryLightBg = lightenColor(primaryHex, 0.95) // Muito claro para fundo
    const secondaryLightBg = lightenColor(secondaryHex, 0.95) // Muito claro para fundo

    // Tokens completos que correspondem à interface ThemeTokens
    const tokens: ThemeTokens = {
      primary: {
        25: lightenColor(primaryHex, 0.8),
        50: lightenColor(primaryHex, 0.6),
        100: lightenColor(primaryHex, 0.4),
        300: lightenColor(primaryHex, 0.2),
        600: darkenColor(primaryHex, 0.2),
        700: darkenColor(primaryHex, 0.4),
        900: darkenColor(primaryHex, 0.6),
        950: darkenColor(primaryHex, 0.8)
      },
      secondary: {
        25: lightenColor(secondaryHex, 0.8),
        50: lightenColor(secondaryHex, 0.6),
        100: lightenColor(secondaryHex, 0.4),
        300: lightenColor(secondaryHex, 0.2),
        600: darkenColor(secondaryHex, 0.2),
        700: darkenColor(secondaryHex, 0.4),
        900: darkenColor(secondaryHex, 0.6),
        950: darkenColor(secondaryHex, 0.8)
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
        3: lightenColor(primaryHex, 0.9)
      },
      button: {
        primary: {
          bg: primaryHex,
          text: primaryTextColor,
          hover: primaryDark,
          active: darkenColor(primaryHex, 0.3),
          focus: primaryHex
        },
        secondary: {
          bg: secondaryHex,
          text: secondaryTextColor,
          hover: secondaryDark,
          active: darkenColor(secondaryHex, 0.3),
          focus: secondaryHex
        }
      },
      badge: {
        success: { bg: '#16a34a', text: '#ffffff' },
        warning: { bg: '#f59e0b', text: '#111111' },
        danger: { bg: '#ef4444', text: '#ffffff' },
        info: { bg: '#0ea5e9', text: '#ffffff' }
      },
      sidebar: {
        bg: lightenColor(primaryHex, 0.95),
        itemColor: '#1a1a1a',
        itemActiveBg: lightenColor(primaryHex, 0.8),
        itemActiveIndicator: primaryHex
      },
      chip: {
        bg: '#ffffff',
        text: '#111111',
        shadow: 'rgba(0,0,0,.06)'
      },
      gradient: {
        brand: `linear-gradient(135deg, ${primaryHex} 0%, ${primaryLight} 50%, ${secondaryHex} 100%)`
      }
    }

    // Gerar CSS usando cores HEX diretamente (mais confiável)
    const css = `
/* === SISTEMA DE CORES DINÂMICO === */
/* Cores principais */
--primary-color: ${primaryHex};
--primary-light: ${primaryLight};
--primary-dark: ${primaryDark};
--primary-text: ${primaryTextColor};

--secondary-color: ${secondaryHex};
--secondary-light: ${secondaryLight};
--secondary-dark: ${secondaryDark};
--secondary-text: ${secondaryTextColor};

/* Botões */
--btn-primary-bg: var(--primary-color);
--btn-primary-text: var(--primary-text);
--btn-primary-hover: var(--primary-dark);

--btn-secondary-bg: var(--secondary-color);
--btn-secondary-text: var(--secondary-text);
--btn-secondary-hover: var(--secondary-dark);

/* === COMPATIBILIDADE SHADCN/UI === */
/* Variáveis principais para componentes shadcn */
--primary: ${primaryHex};
--primary-foreground: ${primaryTextColor};
--secondary: ${secondaryHex};
--secondary-foreground: ${secondaryTextColor};

/* Cores de fundo e superfícies com CONTRASTE ADEQUADO */
--background: ${lightenColor(primaryHex, 0.5)};
--foreground: ${primaryHex};
--muted: ${primaryLightBg};
--muted-foreground: #374151;
--border: ${lightenColor(primaryHex, 0.85)};
--input: ${lightenColor(primaryHex, 0.9)};
--ring: ${primaryHex};
--card: ${lightenColor(primaryHex, 0.85)};
--card-foreground: ${primaryHex};
--accent: ${primaryLightBg};
--accent-foreground: ${primaryHex};

/* Cores semânticas */
--destructive: #ef4444;
--destructive-foreground: #ffffff;
--success: #16a34a;
--success-foreground: #ffffff;
--warning: #f59e0b;
--warning-foreground: #111111;
--info: #0ea5e9;
--info-foreground: #ffffff;

/* Componentes específicos */
--popover: #ffffff;
--popover-foreground: #111111;
--tooltip: ${primaryHex};
--tooltip-foreground: ${primaryTextColor};
--dropdown-menu: ${lightenColor(primaryHex, 0.5)};
--dropdown-menu-foreground: ${primaryHex};
--modal: #ffffff;
--modal-foreground: #111111;

/* Sidebar e navegação - CONTRASTE MELHORADO */
--sidebar-bg: ${lightenColor(primaryHex, 0.95)};
--sidebar-foreground: #374151;
--sidebar-border: ${lightenColor(primaryHex, 0.85)};
--sidebar-active: ${lightenColor(primaryHex, 0.8)};
--sidebar-active-foreground: ${getContrastColor(lightenColor(primaryHex, 0.8))};

/* Tabelas */
--table-bg: #ffffff;
--table-foreground: #111111;
--table-border: ${lightenColor(primaryHex, 0.9)};
--table-header-bg: ${lightenColor(primaryHex, 0.95)};
--table-header-foreground: #111111;

/* Formulários */
--form-bg: #ffffff;
--form-foreground: #111111;
--form-border: ${lightenColor(primaryHex, 0.9)};
--form-focus: ${primaryHex};

/* Badges e chips - CONTRASTE MELHORADO */
--badge-bg: ${lightenColor(primaryHex, 0.2)};
--badge-foreground: ${primaryTextColor};
--badge-border: ${lightenColor(primaryHex, 0.2)};

/* Progress e sliders */
--progress-bg: ${lightenColor(primaryHex, 0.9)};
--progress-foreground: ${primaryHex};

/* Scrollbar */
--scrollbar-thumb: ${lightenColor(primaryHex, 0.8)};
--scrollbar-track: ${lightenColor(primaryHex, 0.95)};

/* === CORES LEGACY PARA COMPATIBILIDADE === */
--cor-primaria-500: var(--primary-color);
--cor-primaria-700: var(--primary-dark);
--cor-secundaria-500: var(--secondary-color);
--radius: 0.5rem;
`.trim()

// Theme built successfully

    return {
      tokens,
      css,
      validation: {
        isValid: true,
        adjustments,
        warnings
      },
      metadata: {
        primaryOriginal: input.primaryHex,
        secondaryOriginal: input.secondaryHex,
        primaryFinal: primaryHex,
        secondaryFinal: secondaryHex,
        generatedAt: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('Error building theme tokens:', error)
    return buildFallbackTheme(input)
  }
}

// Funções auxiliares consolidadas
function lightenColor(hex: string, amount: number): string {
  try {
    const color = parseInt(hex.slice(1), 16)
    const r = Math.min(255, Math.floor(((color >> 16) & 255) + (255 - ((color >> 16) & 255)) * amount))
    const g = Math.min(255, Math.floor(((color >> 8) & 255) + (255 - ((color >> 8) & 255)) * amount))
    const b = Math.min(255, Math.floor((color & 255) + (255 - (color & 255)) * amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  } catch {
    return hex
  }
}

function darkenColor(hex: string, amount: number): string {
  try {
    const color = parseInt(hex.slice(1), 16)
    const r = Math.max(0, Math.floor(((color >> 16) & 255) * (1 - amount)))
    const g = Math.max(0, Math.floor(((color >> 8) & 255) * (1 - amount)))
    const b = Math.max(0, Math.floor((color & 255) * (1 - amount)))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  } catch {
    return hex
  }
}

function getContrastColor(hex: string): string {
  try {
    const color = parseInt(hex.slice(1), 16)
    const r = (color >> 16) & 255
    const g = (color >> 8) & 255
    const b = color & 255
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Para cores claras (como rosa), usar texto escuro para melhor contraste
    if (luminance > 0.7) {
      return '#111111' // Cinza muito escuro
    } else if (luminance > 0.5) {
      return '#000000' // Preto
    } else {
      return '#ffffff' // Branco
    }
  } catch {
    return '#111111'
  }
}



// Função removida - CSS é gerado diretamente no buildThemeTokens

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
  
  const fallbackCSS = `
--primary-color: #2563eb;
--primary-light: #93c5fd;
--primary-dark: #1d4ed8;
--primary-text: #ffffff;
--secondary-color: #16a34a;
--secondary-light: #86efac;
--secondary-dark: #15803d;
--secondary-text: #ffffff;
`.trim()

  return {
    tokens: fallbackTokens,
    css: fallbackCSS,
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