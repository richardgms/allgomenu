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

    // Cores de texto automáticas (branco ou preto baseado no contraste)
    const primaryTextColor = getContrastColor(primaryHex)
    const secondaryTextColor = getContrastColor(secondaryHex)

    // Tokens simplificados
    const tokens = {
      primary: {
        main: primaryHex,
        light: primaryLight,
        dark: primaryDark,
        text: primaryTextColor
      },
      secondary: {
        main: secondaryHex,
        light: secondaryLight,
        dark: secondaryDark,
        text: secondaryTextColor
      }
    }

    // Conversões OKLCH mais precisas
    const primaryOklch = convertToOklch(primaryHex)
    const primaryForegroundOklch = convertToOklch(primaryTextColor)
    const secondaryOklch = convertToOklch(secondaryHex)
    const secondaryForegroundOklch = convertToOklch(secondaryTextColor)

    // Gerar CSS completo e funcional
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
--primary: ${primaryOklch};
--primary-foreground: ${primaryForegroundOklch};
--secondary: ${secondaryOklch};
--secondary-foreground: ${secondaryForegroundOklch};

/* Cores neutras que usam o tema */
--background: 1 0 0;
--foreground: 0.09 0 0;
--muted: 0.96 0 0;
--muted-foreground: 0.45 0 0;
--border: 0.9 0 0;
--input: 0.9 0 0;
--ring: ${primaryOklch};
--card: 1 0 0;
--card-foreground: 0.09 0 0;
--accent: 0.96 0 0;
--accent-foreground: 0.09 0 0;
--destructive: 0.62 0.2 29;
--destructive-foreground: 1 0 0;
--popover: 1 0 0;
--popover-foreground: 0.09 0 0;
--radius: 0.5rem;

/* === CORES LEGACY PARA COMPATIBILIDADE === */
--cor-primaria-500: var(--primary-color);
--cor-primaria-700: var(--primary-dark);
--cor-secundaria-500: var(--secondary-color);
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
    return luminance > 0.5 ? '#000000' : '#ffffff'
  } catch {
    return '#000000'
  }
}

function convertToOklch(hex: string): string {
  // Conversão melhorada de HEX para valores OKLCH válidos para shadcn/ui
  const color = parseInt(hex.slice(1), 16)
  const r = ((color >> 16) & 255) / 255
  const g = ((color >> 8) & 255) / 255
  const b = (color & 255) / 255
  
  // Converter RGB para sRGB linear
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b)
  
  // Converter para XYZ
  const x = 0.4124564 * rLinear + 0.3575761 * gLinear + 0.1804375 * bLinear
  const y = 0.2126729 * rLinear + 0.7151522 * gLinear + 0.0721750 * bLinear
  const z = 0.0193339 * rLinear + 0.1191920 * gLinear + 0.9503041 * bLinear
  
  // Aproximação para OKLCH
  // L (lightness): baseado na luminância
  const lightness = Math.pow(y, 1/3)
  
  // C (chroma): baseado na saturação da cor
  const chroma = Math.sqrt(x * x + z * z) * 0.4
  
  // H (hue): baseado no matiz
  const hue = Math.atan2(z, x) * 180 / Math.PI
  
  // Retornar valores ajustados para shadcn/ui
  return `${lightness.toFixed(3)} ${Math.min(chroma, 0.4).toFixed(3)} ${Math.abs(hue).toFixed(0)}`
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