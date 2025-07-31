# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-07-31-unified-color-system/spec.md

## Core APIs

### Palette Generator API

```typescript
// lib/theme/palette-generator.ts
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

export function generatePalette(config: PaletteConfig): ThemeTokens
export function validatePaletteConfig(config: Partial<PaletteConfig>): ValidationResult
export function getContrastRatio(color1: string, color2: string): number
```

### Theme Tokens API

```typescript
// lib/theme/theme-tokens.ts
export interface ThemeTokens {
  primary: ColorScale
  secondary: ColorScale
  neutral: ColorScale
  semantic: SemanticTokens
  components: ComponentTokens
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

export function createTokenMapping(tokens: ThemeTokens): CSSVariableMap
export function validateTokens(tokens: ThemeTokens): ValidationResult
```

### Theme Injector API

```typescript
// lib/theme/theme-injector.ts
export interface InjectionOptions {
  scope?: string           // CSS selector scope (default: ':root')
  priority?: 'normal' | 'high'  // CSS specificity level
  prefix?: string          // Variable prefix (default: '--')
}

export function injectTheme(tokens: ThemeTokens, options?: InjectionOptions): void
export function removeTheme(scope?: string): void
export function updateThemeVariable(variable: string, value: string): void
export function getAppliedTheme(): ThemeTokens | null
```

### Theme Presets API

```typescript
// lib/theme/theme-presets.ts
export interface ThemePreset {
  name: string
  description: string
  config: PaletteConfig
  preview: {
    primary: string
    secondary: string
    example: string
  }
}

export function getPresets(): ThemePreset[]
export function getPresetByName(name: string): ThemePreset | null
export function createCustomPreset(name: string, config: PaletteConfig): ThemePreset
export function validatePreset(preset: ThemePreset): ValidationResult
```

## Integration APIs

### Restaurant Theme Integration

```typescript
// Integration with existing restaurant theme system
export function convertLegacyTheme(legacyConfig: any): PaletteConfig
export function applyToRestaurant(restaurantId: string, config: PaletteConfig): Promise<void>
export function getRestaurantTheme(restaurantId: string): Promise<PaletteConfig | null>
```

### Component Theme Hooks

```typescript
// React hooks for component theme integration
export function useThemeTokens(): ThemeTokens
export function useComponentTokens(component: string): ComponentTokens
export function useThemePreview(config: PaletteConfig): ThemeTokens
```

## Error Handling

All APIs return consistent error types:

```typescript
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
```

Common error codes:
- `INVALID_COLOR_FORMAT`: Color string is not valid HEX format
- `CONTRAST_TOO_LOW`: Generated colors fail WCAG contrast requirements  
- `SATURATION_OUT_OF_RANGE`: Saturation values outside acceptable range
- `LIGHTNESS_CONFLICT`: Lightness values create impossible color combinations