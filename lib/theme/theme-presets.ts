import { PaletteConfig, ValidationResult, validatePaletteConfig } from './palette-generator'

export interface ThemePreset {
  id: string
  name: string
  description: string
  config: PaletteConfig
  preview: {
    primary: string
    secondary: string
    example: string
  }
  tags: string[]
  category: 'food' | 'elegant' | 'vibrant' | 'natural' | 'professional' | 'custom'
}

/**
 * Predefined theme presets for different restaurant types and styles
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classic-blue',
    name: 'Azul Clássico',
    description: 'Tema profissional e confiável com tons azuis',
    config: {
      primary: '#3b82f6',
      secondary: '#10b981',
      lightness: {
        light: 0.85,
        medium: 0.5,
        dark: 0.2
      },
      saturation: {
        boost: 1.0,
        muted: 0.6
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#3b82f6',
      secondary: '#10b981',
      example: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)'
    },
    tags: ['profissional', 'confiável', 'clássico'],
    category: 'professional'
  },
  {
    id: 'warm-orange',
    name: 'Laranja Acolhedor',
    description: 'Tons quentes perfeitos para restaurantes aconchegantes',
    config: {
      primary: '#f97316',
      secondary: '#eab308',
      lightness: {
        light: 0.8,
        medium: 0.5,
        dark: 0.25
      },
      saturation: {
        boost: 1.1,
        muted: 0.5
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#f97316',
      secondary: '#eab308',
      example: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)'
    },
    tags: ['acolhedor', 'quente', 'casual'],
    category: 'food'
  },
  {
    id: 'forest-green',
    name: 'Verde Natural',
    description: 'Inspirado na natureza, ideal para comida saudável',
    config: {
      primary: '#16a34a',
      secondary: '#84cc16',
      lightness: {
        light: 0.82,
        medium: 0.48,
        dark: 0.22
      },
      saturation: {
        boost: 0.95,
        muted: 0.6
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#16a34a',
      secondary: '#84cc16',
      example: 'linear-gradient(135deg, #16a34a 0%, #84cc16 100%)'
    },
    tags: ['natural', 'saudável', 'orgânico'],
    category: 'natural'
  },
  {
    id: 'elegant-purple',
    name: 'Roxo Elegante',
    description: 'Sofisticado e moderno para experiências premium',
    config: {
      primary: '#9333ea',
      secondary: '#c2410c',
      lightness: {
        light: 0.88,
        medium: 0.52,
        dark: 0.18
      },
      saturation: {
        boost: 1.05,
        muted: 0.55
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#9333ea',
      secondary: '#c2410c',
      example: 'linear-gradient(135deg, #9333ea 0%, #c2410c 100%)'
    },
    tags: ['elegante', 'sofisticado', 'premium'],
    category: 'elegant'
  },
  {
    id: 'vibrant-pink',
    name: 'Rosa Vibrante',
    description: 'Jovem e energético, perfeito para cafés e docerias',
    config: {
      primary: '#ec4899',
      secondary: '#f59e0b',
      lightness: {
        light: 0.87,
        medium: 0.55,
        dark: 0.2
      },
      saturation: {
        boost: 1.15,
        muted: 0.45
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#ec4899',
      secondary: '#f59e0b',
      example: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)'
    },
    tags: ['jovem', 'energético', 'doces'],
    category: 'vibrant'
  },
  {
    id: 'ocean-blue',
    name: 'Azul Oceano',
    description: 'Fresco e limpo, ideal para frutos do mar',
    config: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      lightness: {
        light: 0.85,
        medium: 0.5,
        dark: 0.2
      },
      saturation: {
        boost: 1.0,
        muted: 0.6
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      example: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
    },
    tags: ['fresco', 'limpo', 'frutos do mar'],
    category: 'food'
  },
  {
    id: 'earthy-brown',
    name: 'Marrom Terroso',
    description: 'Rústico e aconchegante para cafés tradicionais',
    config: {
      primary: '#a16207',
      secondary: '#dc2626',
      lightness: {
        light: 0.8,
        medium: 0.45,
        dark: 0.25
      },
      saturation: {
        boost: 0.9,
        muted: 0.7
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#a16207',
      secondary: '#dc2626',
      example: 'linear-gradient(135deg, #a16207 0%, #dc2626 100%)'
    },
    tags: ['rústico', 'tradicional', 'café'],
    category: 'food'
  },
  {
    id: 'royal-gold',
    name: 'Dourado Real',
    description: 'Luxuoso e exclusivo para restaurantes premium',
    config: {
      primary: '#d97706',
      secondary: '#7c2d12',
      lightness: {
        light: 0.9,
        medium: 0.55,
        dark: 0.15
      },
      saturation: {
        boost: 1.1,
        muted: 0.5
      },
      contrast: {
        text: 'high',
        backgrounds: 'subtle'
      }
    },
    preview: {
      primary: '#d97706',
      secondary: '#7c2d12',
      example: 'linear-gradient(135deg, #d97706 0%, #7c2d12 100%)'
    },
    tags: ['luxuoso', 'exclusivo', 'premium'],
    category: 'elegant'
  }
]

/**
 * Gets all available presets
 */
export function getPresets(): ThemePreset[] {
  return [...THEME_PRESETS]
}

/**
 * Gets a preset by its ID
 */
export function getPresetById(id: string): ThemePreset | null {
  return THEME_PRESETS.find(preset => preset.id === id) || null
}

/**
 * Gets presets by category
 */
export function getPresetsByCategory(category: ThemePreset['category']): ThemePreset[] {
  return THEME_PRESETS.filter(preset => preset.category === category)
}

/**
 * Gets presets by tag
 */
export function getPresetsByTag(tag: string): ThemePreset[] {
  return THEME_PRESETS.filter(preset => 
    preset.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  )
}

/**
 * Searches presets by name or description
 */
export function searchPresets(query: string): ThemePreset[] {
  const lowercaseQuery = query.toLowerCase()
  return THEME_PRESETS.filter(preset => 
    preset.name.toLowerCase().includes(lowercaseQuery) ||
    preset.description.toLowerCase().includes(lowercaseQuery) ||
    preset.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

/**
 * Creates a custom preset from a palette configuration
 */
export function createCustomPreset(
  id: string,
  name: string,
  description: string,
  config: PaletteConfig,
  tags: string[] = []
): ThemePreset {
  return {
    id,
    name,
    description,
    config,
    preview: {
      primary: config.primary,
      secondary: config.secondary,
      example: `linear-gradient(135deg, ${config.primary} 0%, ${config.secondary} 100%)`
    },
    tags,
    category: 'custom'
  }
}

/**
 * Validates a theme preset
 */
export function validatePreset(preset: ThemePreset): ValidationResult {
  const errors: import('./palette-generator').ValidationError[] = []
  const warnings: import('./palette-generator').ValidationWarning[] = []

  // Validate basic structure
  if (!preset.id || preset.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Preset ID is required',
      code: 'MISSING_ID'
    })
  }

  if (!preset.name || preset.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Preset name is required',
      code: 'MISSING_NAME'
    })
  }

  if (!preset.description || preset.description.trim() === '') {
    warnings.push({
      field: 'description',
      message: 'Preset description is recommended',
      code: 'MISSING_DESCRIPTION'
    })
  }

  // Validate configuration
  const configValidation = validatePaletteConfig(preset.config)
  if (!configValidation.valid) {
    errors.push(...configValidation.errors)
    warnings.push(...configValidation.warnings)
  }

  // Validate preview
  if (!preset.preview || !preset.preview.primary || !preset.preview.secondary) {
    errors.push({
      field: 'preview',
      message: 'Preset preview colors are required',
      code: 'MISSING_PREVIEW'
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Gets all available categories
 */
export function getCategories(): ThemePreset['category'][] {
  return ['food', 'elegant', 'vibrant', 'natural', 'professional', 'custom']
}

/**
 * Gets all available tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>()
  THEME_PRESETS.forEach(preset => {
    preset.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Gets category information with descriptions
 */
export function getCategoryInfo(): Record<ThemePreset['category'], { name: string; description: string }> {
  return {
    food: {
      name: 'Gastronomia',
      description: 'Temas inspirados em diferentes tipos de culinária'
    },
    elegant: {
      name: 'Elegante',
      description: 'Temas sofisticados para experiências premium'
    },
    vibrant: {
      name: 'Vibrante',
      description: 'Cores energéticas e jovens'
    },
    natural: {
      name: 'Natural',
      description: 'Inspirado na natureza e ingredientes frescos'
    },
    professional: {
      name: 'Profissional',
      description: 'Temas confiáveis e corporativos'
    },
    custom: {
      name: 'Personalizado',
      description: 'Temas criados pelo usuário'
    }
  }
}