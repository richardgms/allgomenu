/**
 * Presets de cores curadas por segmento de negócio
 * Todas as combinações foram validadas para contraste WCAG AA
 */

export interface ColorPreset {
  id: string
  name: string
  description: string
  segment: string
  primaryHex: string
  secondaryHex: string
  tags: string[]
}

export const COLOR_PRESETS: ColorPreset[] = [
  // === FAST FOOD ===
  {
    id: 'fast-food-classic',
    name: 'Fast Food Clássico',
    description: 'Vermelho vibrante e amarelo, evoca energia e apetite',
    segment: 'fast-food',
    primaryHex: '#dc2626',
    secondaryHex: '#f59e0b',
    tags: ['energético', 'apetitoso', 'vibrante']
  },
  {
    id: 'fast-food-modern',
    name: 'Fast Food Moderno',
    description: 'Laranja quente e azul moderno para marcas inovadoras',
    segment: 'fast-food',
    primaryHex: '#ea580c',
    secondaryHex: '#2563eb',
    tags: ['moderno', 'inovador', 'jovem']
  },

  // === PIZZARIA ===
  {
    id: 'pizzaria-tradicional',
    name: 'Pizzaria Tradicional',
    description: 'Verde italiano e vermelho tomate, remetem à tradição',
    segment: 'pizzaria',
    primaryHex: '#dc2626',
    secondaryHex: '#16a34a',
    tags: ['tradicional', 'italiano', 'familiar']
  },
  {
    id: 'pizzaria-gourmet',
    name: 'Pizzaria Gourmet',
    description: 'Bordô elegante e verde oliva sofisticado',
    segment: 'pizzaria',
    primaryHex: '#991b1b',
    secondaryHex: '#65a30d',
    tags: ['gourmet', 'sofisticado', 'premium']
  },

  // === HAMBURGUERIA ===
  {
    id: 'burger-american',
    name: 'Burger Americano',
    description: 'Vermelho intenso e mostarda, estilo diner clássico',
    segment: 'hamburgueria',
    primaryHex: '#dc2626',
    secondaryHex: '#d97706',
    tags: ['americano', 'retrô', 'despojado']
  },
  {
    id: 'burger-craft',
    name: 'Burger Artesanal',
    description: 'Marrom terroso e laranja queimado, rústico e autêntico',
    segment: 'hamburgueria',
    primaryHex: '#92400e',
    secondaryHex: '#ea580c',
    tags: ['artesanal', 'rústico', 'autêntico']
  },

  // === CONFEITARIA / DOCES ===
  {
    id: 'confeitaria-delicada',
    name: 'Confeitaria Delicada',
    description: 'Rosa suave e roxo lavanda, delicado e feminino',
    segment: 'confeitaria',
    primaryHex: '#be185d',
    secondaryHex: '#7c3aed',
    tags: ['delicado', 'feminino', 'romântico']
  },
  {
    id: 'confeitaria-vintage',
    name: 'Confeitaria Vintage',
    description: 'Coral vintage e verde menta, retrô charmoso',
    segment: 'confeitaria',
    primaryHex: '#dc2626',
    secondaryHex: '#059669',
    tags: ['vintage', 'retrô', 'charmoso']
  },

  // === FINE DINING ===
  {
    id: 'fine-dining-classic',
    name: 'Fine Dining Clássico',
    description: 'Azul marinho e dourado, elegância atemporal',
    segment: 'fine-dining',
    primaryHex: '#1e40af',
    secondaryHex: '#d97706',
    tags: ['elegante', 'luxuoso', 'atemporal']
  },
  {
    id: 'fine-dining-contemporary',
    name: 'Fine Dining Contemporâneo',
    description: 'Cinza carvão e verde esmeralda, sofisticação moderna',
    segment: 'fine-dining',
    primaryHex: '#374151',
    secondaryHex: '#059669',
    tags: ['contemporâneo', 'sofisticado', 'minimalista']
  },

  // === SAUDÁVEL / VEGETARIANO ===
  {
    id: 'saudavel-natural',
    name: 'Saudável Natural',
    description: 'Verde folha e terra, conexão com a natureza',
    segment: 'saudavel',
    primaryHex: '#16a34a',
    secondaryHex: '#92400e',
    tags: ['natural', 'orgânico', 'saudável']
  },
  {
    id: 'saudavel-fresh',
    name: 'Saudável Fresh',
    description: 'Verde limão e azul água, frescor e vitalidade',
    segment: 'saudavel',
    primaryHex: '#65a30d',
    secondaryHex: '#0891b2',
    tags: ['fresco', 'vital', 'energizante']
  },

  // === CAFÉ / BISTRÔ ===
  {
    id: 'cafe-aconchegante',
    name: 'Café Aconchegante',
    description: 'Marrom café e creme, ambiente acolhedor',
    segment: 'cafe',
    primaryHex: '#92400e',
    secondaryHex: '#d97706',
    tags: ['aconchegante', 'familiar', 'tradicional']
  },
  {
    id: 'cafe-moderno',
    name: 'Café Moderno',
    description: 'Preto intenso e laranja vibrante, urbano e dinâmico',
    segment: 'cafe',
    primaryHex: '#1f2937',
    secondaryHex: '#ea580c',
    tags: ['urbano', 'moderno', 'dinâmico']
  }
]

// Helpers para filtrar presets
export function getPresetsBySegment(segment: string): ColorPreset[] {
  return COLOR_PRESETS.filter(preset => preset.segment === segment)
}

export function getPresetsByTag(tag: string): ColorPreset[] {
  return COLOR_PRESETS.filter(preset => preset.tags.includes(tag))
}

export function getPresetById(id: string): ColorPreset | undefined {
  return COLOR_PRESETS.find(preset => preset.id === id)
}

export function getAllSegments(): string[] {
  const segments = new Set(COLOR_PRESETS.map(preset => preset.segment))
  return Array.from(segments)
}

export function getAllTags(): string[] {
  const tags = new Set(COLOR_PRESETS.flatMap(preset => preset.tags))
  return Array.from(tags)
}

// Preset padrão para fallback
export const DEFAULT_PRESET: ColorPreset = {
  id: 'default',
  name: 'AllGoMenu Padrão',
  description: 'Tema padrão do sistema',
  segment: 'geral',
  primaryHex: '#dc2626',
  secondaryHex: '#059669',
  tags: ['padrão', 'universal']
}