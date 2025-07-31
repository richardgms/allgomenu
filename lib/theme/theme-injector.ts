import { ThemeTokens, createTokenMapping, createCSSFromTokens } from './theme-tokens'
import { generatePalette, DEFAULT_PALETTE_CONFIG, PaletteConfig } from './palette-generator'

export interface InjectionOptions {
  scope?: string           // CSS selector scope (default: ':root')
  priority?: 'normal' | 'high'  // CSS specificity level
  prefix?: string          // Variable prefix (default: '--')
  restaurantSlug?: string  // For scoped injection
}

// Global registry to track injected themes
const injectedThemes = new Map<string, HTMLStyleElement>()

/**
 * Generates CSS for component mappings using the new token system
 */
function generateComponentMappings(): string {
  return `
/* === COMPONENT MAPPINGS === */

/* Sidebar Components */
.sidebar, [data-sidebar], nav.admin-sidebar, aside.admin-sidebar {
  background-color: var(--sidebar-bg);
  border-color: var(--sidebar-border);
}

.sidebar-item, [data-sidebar-item], nav.admin-sidebar a, aside.admin-sidebar a {
  color: var(--sidebar-text-normal);
  background-color: var(--sidebar-item-normal);
  transition: all 0.2s ease;
}

.sidebar-item:hover, [data-sidebar-item]:hover, nav.admin-sidebar a:hover, aside.admin-sidebar a:hover {
  background-color: var(--sidebar-item-hover);
  color: var(--sidebar-text-hover);
}

.sidebar-item.active, .sidebar-item[data-state="active"], 
[data-sidebar-item].active, [data-sidebar-item][data-state="active"],
nav.admin-sidebar a.active, aside.admin-sidebar a.active {
  background-color: var(--sidebar-item-active);
  color: var(--sidebar-text-active);
}

.sidebar-item.active::before, .sidebar-item[data-state="active"]::before {
  background-color: var(--sidebar-indicator);
}

/* Button Components */
button, .btn, [role="button"] {
  transition: all 0.2s ease;
}

/* Primary buttons */
button[data-variant="default"], button:not([data-variant]):not([data-variant="secondary"]):not([data-variant="outline"]):not([data-variant="ghost"]),
.btn-primary, .bg-primary {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-color: var(--btn-primary-border);
}

button[data-variant="default"]:hover, button:not([data-variant]):not([data-variant="secondary"]):not([data-variant="outline"]):not([data-variant="ghost"]):hover,
.btn-primary:hover, .bg-primary:hover {
  background-color: var(--btn-primary-hover);
}

button[data-variant="default"]:active, button:not([data-variant]):not([data-variant="secondary"]):not([data-variant="outline"]):not([data-variant="ghost"]):active,
.btn-primary:active, .bg-primary:active {
  background-color: var(--btn-primary-active);
}

button[data-variant="default"]:focus-visible, button:not([data-variant]):not([data-variant="secondary"]):not([data-variant="outline"]):not([data-variant="ghost"]):focus-visible,
.btn-primary:focus-visible, .bg-primary:focus-visible {
  box-shadow: 0 0 0 2px var(--btn-primary-focus);
}

/* Secondary buttons */
button[data-variant="secondary"], .btn-secondary, .bg-secondary {
  background-color: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border-color: var(--btn-secondary-border);
}

button[data-variant="secondary"]:hover, .btn-secondary:hover, .bg-secondary:hover {
  background-color: var(--btn-secondary-hover);
}

button[data-variant="secondary"]:active, .btn-secondary:active, .bg-secondary:active {
  background-color: var(--btn-secondary-active);
}

button[data-variant="secondary"]:focus-visible, .btn-secondary:focus-visible, .bg-secondary:focus-visible {
  box-shadow: 0 0 0 2px var(--btn-secondary-focus);
}

/* Outline buttons */
button[data-variant="outline"], .btn-outline {
  background-color: var(--btn-outline-bg);
  color: var(--btn-outline-text);
  border-color: var(--btn-outline-border);
}

button[data-variant="outline"]:hover, .btn-outline:hover {
  background-color: var(--btn-outline-hover);
}

button[data-variant="outline"]:active, .btn-outline:active {
  background-color: var(--btn-outline-active);
}

button[data-variant="outline"]:focus-visible, .btn-outline:focus-visible {
  box-shadow: 0 0 0 2px var(--btn-outline-focus);
}

/* Ghost buttons */
button[data-variant="ghost"], .btn-ghost {
  background-color: var(--btn-ghost-bg);
  color: var(--btn-ghost-text);
  border-color: var(--btn-ghost-border);
}

button[data-variant="ghost"]:hover, .btn-ghost:hover {
  background-color: var(--btn-ghost-hover);
}

button[data-variant="ghost"]:active, .btn-ghost:active {
  background-color: var(--btn-ghost-active);
}

button[data-variant="ghost"]:focus-visible, .btn-ghost:focus-visible {
  box-shadow: 0 0 0 2px var(--btn-ghost-focus);
}

/* Card Components */
.card, [data-card], .bg-card {
  background-color: var(--card-background);
  border-color: var(--card-border);
  color: var(--card-text);
}

.card-header, [data-card-header] {
  color: var(--card-header);
}

/* Input Components */
input, textarea, select, .input {
  background-color: var(--input-background);
  border-color: var(--input-border);
  color: var(--input-text);
}

input::placeholder, textarea::placeholder, .input::placeholder {
  color: var(--input-placeholder);
}

input:focus, textarea:focus, select:focus, .input:focus {
  border-color: var(--input-focus-borderColor);
  box-shadow: 0 0 0 2px var(--input-focus-ring);
}

/* Semantic Colors */
.bg-success, [data-variant="success"] {
  background-color: var(--success-bg);
  color: var(--success-text);
}

.bg-warning, [data-variant="warning"] {
  background-color: var(--warning-bg);
  color: var(--warning-text);
}

.bg-error, .bg-destructive, [data-variant="destructive"] {
  background-color: var(--error-bg);
  color: var(--error-text);
}

.bg-info, [data-variant="info"] {
  background-color: var(--info-bg);
  color: var(--info-text);
}

/* Global Background and Text */
body, html {
  background-color: var(--background);
  color: var(--foreground);
}

/* Utility Classes */
.text-primary {
  color: var(--primary-600);
}

.text-secondary {
  color: var(--secondary-600);
}

.text-muted, .text-muted-foreground {
  color: var(--muted-foreground);
}

.border-primary {
  border-color: var(--primary-600);
}

.border-secondary {
  border-color: var(--secondary-600);
}

.border-border, .border {
  border-color: var(--border);
}

/* Smooth transitions for all themed elements */
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
`.trim()
}

/**
 * Injects theme tokens as CSS custom properties into the DOM
 */
export function injectTheme(tokens: ThemeTokens, options: InjectionOptions = {}): void {
  if (typeof window === 'undefined') {
    console.warn('[ThemeInjector] Cannot inject theme on server side')
    return
  }

  const {
    scope = ':root',
    priority = 'normal',
    prefix = '--',
    restaurantSlug = 'default'
  } = options

  // Create unique ID for this theme injection
  const themeId = `theme-${restaurantSlug}`

  // Remove existing theme if present
  removeTheme(themeId)

  try {
    // Generate CSS variables from tokens
    const cssVars = createTokenMapping(tokens)
    const tokenCSS = createCSSFromTokens(cssVars, scope)
    
    // Generate component mappings
    const componentCSS = generateComponentMappings()

    // Combine all CSS
    const fullCSS = `
/* === AUTO-GENERATED THEME TOKENS === */
${tokenCSS}

${componentCSS}

/* === THEME METADATA === */
/* Generated: ${new Date().toISOString()} */
/* Restaurant: ${restaurantSlug} */
/* Tokens: ${Object.keys(cssVars).length} variables */
`.trim()

    // Create and inject style element
    const styleElement = document.createElement('style')
    styleElement.id = themeId
    styleElement.setAttribute('data-theme-injector', restaurantSlug)
    styleElement.setAttribute('data-theme-priority', priority)
    
    if (priority === 'high') {
      styleElement.setAttribute('data-priority', 'high')
    }

    styleElement.textContent = fullCSS

    // Insert into document head
    document.head.appendChild(styleElement)

    // Track in registry
    injectedThemes.set(themeId, styleElement)

    console.log(`[ThemeInjector] Theme '${themeId}' injected successfully with ${Object.keys(cssVars).length} variables`)

  } catch (error) {
    console.error(`[ThemeInjector] Failed to inject theme '${themeId}':`, error)
    throw new Error(`Theme injection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Removes an injected theme from the DOM
 */
export function removeTheme(themeId: string): void {
  if (typeof window === 'undefined') return

  // Try to get from registry first
  const styleElement = injectedThemes.get(themeId)
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement)
    injectedThemes.delete(themeId)
    console.log(`[ThemeInjector] Theme '${themeId}' removed from registry`)
    return
  }

  // Fallback: try to find by ID
  const existingStyle = document.getElementById(themeId)
  if (existingStyle) {
    existingStyle.remove()
    injectedThemes.delete(themeId)
    console.log(`[ThemeInjector] Theme '${themeId}' removed by ID`)
  }
}

/**
 * Updates a specific theme variable without re-injecting the entire theme
 */
export function updateThemeVariable(variable: string, value: string, themeId: string = 'theme-default'): void {
  if (typeof window === 'undefined') return

  const styleElement = injectedThemes.get(themeId)
  if (!styleElement) {
    console.warn(`[ThemeInjector] Theme '${themeId}' not found for variable update`)
    return
  }

  try {
    // Update CSS custom property directly on document root
    document.documentElement.style.setProperty(variable, value)
    console.log(`[ThemeInjector] Updated ${variable} = ${value}`)
  } catch (error) {
    console.error(`[ThemeInjector] Failed to update variable ${variable}:`, error)
  }
}

/**
 * Gets the currently applied theme tokens (if available)
 */
export function getAppliedTheme(themeId: string = 'theme-default'): ThemeTokens | null {
  if (typeof window === 'undefined') return null

  const styleElement = injectedThemes.get(themeId)
  if (!styleElement) {
    console.warn(`[ThemeInjector] Theme '${themeId}' not found`)
    return null
  }

  // For now, return null - would need to parse CSS back to tokens
  // This could be implemented if needed for debugging/inspection
  return null
}

/**
 * Lists all currently injected themes
 */
export function getInjectedThemes(): string[] {
  return Array.from(injectedThemes.keys())
}

/**
 * Clears all injected themes
 */
export function clearAllThemes(): void {
  if (typeof window === 'undefined') return

  const themeIds = Array.from(injectedThemes.keys())
  themeIds.forEach(removeTheme)
  
  console.log(`[ThemeInjector] Cleared ${themeIds.length} themes`)
}

/**
 * Utility to inject theme from restaurant config
 */
export function injectRestaurantTheme(
  primaryColor: string, 
  secondaryColor: string, 
  restaurantSlug: string,
  customConfig?: Partial<PaletteConfig>
): void {
  console.log(`[ThemeInjector] Injecting restaurant theme for ${restaurantSlug}`)
  
  try {
    
    // Create palette configuration
    const config = {
      ...DEFAULT_PALETTE_CONFIG,
      primary: primaryColor,
      secondary: secondaryColor,
      ...customConfig
    }
    
    console.log(`[ThemeInjector] Generating palette with config:`, config)
    
    // Generate theme tokens
    const tokens = generatePalette(config)
    
    // Inject the theme
    injectTheme(tokens, {
      restaurantSlug,
      priority: 'high'
    })
    
    console.log(`[ThemeInjector] Successfully injected theme for ${restaurantSlug}`)
    
  } catch (error) {
    console.error(`[ThemeInjector] Failed to inject restaurant theme:`, error)
    throw new Error(`Restaurant theme injection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}