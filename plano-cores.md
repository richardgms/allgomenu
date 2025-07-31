# Plano Detalhado: Sistema Unificado de Cores Personalizáveis

---

## Análise do Sistema Atual

### Arquitetura Existente

1. **theme-builder.ts**
   Gera paletas a partir de 2 cores base
2. **ThemeProvider.tsx**
   Provider básico para injeção de CSS
3. **RestaurantThemeProvider.tsx**
   Provider específico com CSS forçado (!important)
4. **3 arquivos CSS**

   * globals.css
   * tokens.css
   * components.css
5. **tailwind.config.js**
   Mapeamento de variáveis CSS para classes Tailwind

### Problemas Identificados

* CSS conflitante entre sistemas (shadcn vs custom vs Tailwind)
* Múltiplas formas de definir cores (HEX, OKLCH, CSS vars)
* !important overrides causando inconsistências
* Falta de controle granular para tons claros/médios/escuros
* Dificuldade de personalização manual dos componentes

---

## Solução Proposta: Sistema de Paleta Centralizada

### 1. Nova Estrutura de Arquivos

lib/
└── theme/
    ├── palette-generator.ts      # ✨ NOVO - Gerador de paletas inteligente
    ├── theme-tokens.ts          # ✨ NOVO - Tokens semânticos centralizados
    ├── theme-injector.ts        # ✨ NOVO - Injetor CSS simplificado
    └── theme-presets.ts         # ✨ NOVO - Presets e validações

styles/
└── design-tokens.css            # ✨ NOVO - Tokens únicos e centralizados
    component-mappings.css       # ✨ NOVO - Mapeamento componentes → tokens
    legacy-compatibility.css     # ✨ NOVO - Aliases de compatibilidade


### 2. Gerador de Paleta Inteligente

ts
// lib/theme/palette-generator.ts
export interface PaletteConfig {
  primary: string       // Cor base (HEX)
  secondary: string     // Cor secundária (HEX)

  // Controles Granulares Personalizáveis
  lightness: {
    light: number       // 0.1 - 0.9 (padrão: 0.8)
    medium: number      // 0.3 - 0.7 (padrão: 0.5)
    dark: number        // 0.1 - 0.5 (padrão: 0.2)
  }

  saturation: {
    boost: number       // 0.8 - 1.2 (padrão: 1.0)
    muted: number       // 0.2 - 0.8 (padrão: 0.5)
  }

  contrast: {
    text: 'high' | 'medium' | 'low'        // AA, AAA compliance
    backgrounds: 'subtle' | 'bold'         // Intensidade dos fundos
  }
}

export function generatePalette(config: PaletteConfig): ThemeTokens {
  // Algoritmo que gera:
  // - 9 tons de cada cor (25, 50, 100…900)
  // - Cores de texto com contraste garantido
  // - Superfícies e fundos adaptativos
  // - Estados hover/active/focus automáticos
}


### 3. Tokens Semânticos Centralizados

ts
// lib/theme/theme-tokens.ts
export interface ThemeTokens {
  // CORES BASE (geradas automaticamente)
  primary: ColorScale      // 9 tons: 25, 50, …900
  secondary: ColorScale    // 9 tons: 25, 50, …900
  neutral: ColorScale      // Cinzas baseados na primary

  // COMPONENTES ESPECÍFICOS (mapeamento semântico)
  button: {
    primary:   VariantStyles
    secondary: VariantStyles
    ghost:     VariantStyles
    outline:   VariantStyles
  }

  sidebar: {
    background: string
    item:       StateStyles
    text:       StateStyles
    border:     string
    indicator:  string
  }

  card: {
    background: string
    border:     string
    text:       string
    header:     string
  }

  input: {
    background:  string
    border:      string
    text:        string
    placeholder: string
    focus:       FocusStyles
  }

  // ESTADOS SEMÂNTICOS (fixos)
  semantic: {
    success: VariantStyles
    warning: VariantStyles
    error:   VariantStyles
    info:    VariantStyles
  }
}


### 4. Mapeamento Unificado CSS → Componentes

css
/* styles/design-tokens.css */
:root {
  /* === PALETA BASE (gerada dinamicamente) === */
  --primary-25:  #fefefe;
  --primary-50:  #eff6ff;
  /* … */
  --primary-500: #3b82f6;  /* COR BASE */
  /* … */
  --primary-900: #1e3a8a;

  /* === TOKENS SEMÂNTICOS === */
  --sidebar-bg:              var(--primary-25);
  --sidebar-item-normal:     var(--neutral-600);
  --sidebar-item-hover:      var(--primary-50);
  --sidebar-item-active:     var(--primary-100);
  --sidebar-text-normal:     var(--neutral-700);
  --sidebar-text-active:     var(--primary-700);

  --btn-primary-bg:          var(--primary-600);
  --btn-primary-text:        var(--neutral-25);
  --btn-primary-hover:       var(--primary-700);
  --btn-primary-focus:       var(--primary-500);

  --btn-ghost-bg:            transparent;
  --btn-ghost-text:          var(--neutral-700);
  --btn-ghost-hover:         var(--primary-50);
  --btn-ghost-hover-text:    var(--primary-700);

  --card-bg:                 var(--neutral-25);
  --card-border:             var(--neutral-200);
  --card-text:               var(--neutral-800);
}

/* styles/component-mappings.css */
/* Sidebar */
.admin-sidebar { background: var(--sidebar-bg); }
.sidebar-item {
  color: var(--sidebar-text-normal);
  background: transparent;
}
.sidebar-item:hover {
  background: var(--sidebar-item-hover);
}
.sidebar-item.active {
  background: var(--sidebar-item-active);
  color: var(--sidebar-text-active);
}

/* Botões */
.btn-primary {
  background: var(--btn-primary-bg);
  color:      var(--btn-primary-text);
}
.btn-primary:hover {
  background: var(--btn-primary-hover);
}
button[data-variant="ghost"] {
  background: var(--btn-ghost-bg);
  color:      var(--btn-ghost-text);
}
button[data-variant="ghost"]:hover {
  background: var(--btn-ghost-hover);
  color:      var(--btn-ghost-hover-text);
}

/* Cards */
.card {
  background:   var(--card-bg);
  border-color: var(--card-border);
  color:        var(--card-text);
}


### 5. Interface de Personalização Simplificada

ts
export interface CustomizationControls {
  // CORES BASE
  primaryColor:   string   // Color picker
  secondaryColor: string   // Color picker

  // CONTROLES DE GERAÇÃO
  lightnessBoost: number   // Slider: 0.1 - 0.9
  saturationLevel:number   // Slider: 0.5 - 1.2
  contrastLevel:  'low' | 'medium' | 'high'  // Dropdown

  // PERSONALIZAÇÕES ESPECÍFICAS (opcionais)
  sidebarStyle: 'minimal' | 'tinted' | 'bold'
  buttonStyle:  'rounded' | 'sharp'  | 'pill'
  cardStyle:    'flat'    | 'elevated' | 'outlined'

  // OVERRIDES MANUAIS (avançado)
  manualOverrides?: {
    '--sidebar-item-hover'?: string
    '--btn-ghost-hover'?:    string
    '--card-bg'?:            string
    [key: string]:           string
  }
}


---

## 6. Implementação em Etapas

* ### Fase 1: Fundação (1–2 horas)

  1. Criar **palette-generator.ts** com algoritmo de geração inteligente
  2. Criar **theme-tokens.ts** com interface unificada
  3. Criar **design-tokens.css** com tokens centralizados

* ### Fase 2: Mapeamento (1 hora)

  1. Criar **component-mappings.css**, substituindo o CSS atual
  2. Remover !important overrides do RestaurantThemeProvider.tsx
  3. Simplificar injeção de CSS via theme-injector.ts

* ### Fase 3: Integração (1 hora)

  1. Atualizar tailwind.config.js para usar os novos tokens
  2. Criar aliases de compatibilidade (legacy-compatibility.css)
  3. Testar em componentes principais (sidebar, botões, cards)

* ### Fase 4: Interface de Customização (2 horas)

  1. Criar painel de controle visual para customização
  2. Implementar preview em tempo real
  3. Adicionar presets predefinidos

---

## 7. Vantagens do Novo Sistema

* ✅ **Controle Total:** Defina exatamente como cada tom é gerado
* ✅ **Personalização Fácil:** Um único ajuste de variável CSS adapta todo o sistema
* ✅ **Sem Conflitos:** Sistema único, sem CSS conflitante
* ✅ **Performance:** CSS minimal e sem !important
* ✅ **Manutenibilidade:** Código organizado e bem documentado
* ✅ **Flexibilidade:** Funciona com qualquer cor base
* ✅ **Acessibilidade:** Contraste garantido automaticamente

---

## 8. Exemplo de Uso Final

ts
const newTheme = generatePalette({
  primary:   '#e91e63',  // Rosa
  secondary: '#4caf50',  // Verde
  lightness: {
    light:  0.9,         // Fundos bem claros
    medium: 0.6,         // Tons médios suaves
    dark:   0.3          // Tons escuros suaves
  },
  contrast: { text: 'high', backgrounds: 'subtle' },
  manualOverrides: {
    '--sidebar-item-hover': '#fce4ec',
    '--btn-ghost-hover':     '#f3e5f5'
  }
});


---

## 9. Tarefas de Atualização

* [x] Analisar todos os arquivos relacionados à definição de cores
* [x] Mapear como componentes shadcn/ui usam variáveis CSS
* [x] Identificar o sistema atual de temas dinâmicos
* [x] Criar plano detalhado para unificação do sistema de cores

