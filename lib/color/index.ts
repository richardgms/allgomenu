// === SISTEMA OKLCH (NOVO) ===

// Conversões e utilitários de espaço de cores
export {
  hexToOklch,
  oklchToHex,
  normalizeHex,
  isValidHex,
  calculateDeltaE00,
  calculateHueDifference,
  calculateLightnessDifference,
  clampLightness,
  clampChroma,
  clampHue,
  debugColor,
  type OklchColor
} from './color-space';

// Clamps e validações
export {
  clampOklch,
  ensureDifference,
  harmonizeSecondary,
  adjustForButton,
  adjustForText,
  validateColorPair,
  OKLCH_LIMITS,
  type ClampResult
} from './clamps';

// Contraste e acessibilidade WCAG
export {
  calculateContrast,
  accessibleText,
  adjustBackgroundForContrast,
  ensureAA,
  getComponentTextColors,
  batchContrastTest,
  WCAG_LEVELS,
  type ContrastLevel,
  type TextSize,
  type ContrastResult
} from './contrast';

// Escalas e gradientes
export {
  buildScale,
  buildExtendedScale,
  buildNeutralScale,
  buildInteractionStates,
  gradientBrand,
  type ColorScale,
  type ExtendedColorScale
} from './scale';

// Construtor principal de temas
export {
  buildThemeTokens,
  type ThemeInput,
  type ThemeTokens,
  type BuildThemeResult
} from './theme-builder';

// === SISTEMA LEGADO (compatibilidade) ===









// Funções existentes
export { areColorsTooSimilar } from './validators'; 