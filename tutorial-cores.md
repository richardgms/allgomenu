Vou te ajudar a entender como mudar as cores dos componentes do shadcn/ui no seu dashboard admin, especialmente os botões do sidebar. Primeiro, vou analisar a estrutura do seu projeto para entender como está organizado.

Ran tool
Read file: tailwind.config.js
Search files...
Read file: styles/component-mappings.css
Search files...
Read file: styles/design-tokens.css
Search files...
Agora vou analisar como o sistema de cores funciona e te explicar como personalizar os componentes do sidebar. Baseado na análise do código, vou te dar uma explicação completa:

## 🎨 Como Mudar as Cores dos Componentes do shadcn/ui no Dashboard Admin

### **1. Entendendo o Sistema Atual**

O seu projeto tem um sistema de cores bem estruturado com:

- **Variáveis CSS dinâmicas** definidas em `styles/design-tokens.css`
- **Mapeamento de componentes** em `styles/component-mappings.css`
- **Injeção de tema** via `RestaurantThemeProvider.tsx`
- **Configuração Tailwind** em `tailwind.config.js`

### **2. Como Funciona a Personalização de Cores**

#### **A. Paleta de Cores Base**
As cores são definidas através de variáveis CSS que são injetadas dinamicamente:

```css
/* Exemplo das variáveis do sidebar */
--sidebar-bg: var(--primary-25);
--sidebar-item-normal: transparent;
--sidebar-item-hover: var(--primary-50);
--sidebar-item-active: var(--primary-100);
--sidebar-text-normal: var(--neutral-700);
--sidebar-text-hover: var(--neutral-800);
--sidebar-text-active: var(--primary-700);
```

#### **B. Escalas de Cores Disponíveis**
Para cada cor (primária e secundária), você tem 11 tons:
- `--primary-25` (mais claro)
- `--primary-50`
- `--primary-100`
- `--primary-200`
- `--primary-300`
- `--primary-400`
- `--primary-500` (cor base)
- `--primary-600`
- `--primary-700`
- `--primary-800`
- `--primary-900` (mais escuro)

### **3. Como Personalizar os Botões do Sidebar**

#### **A. Acessando a Personalização**
1. Vá para **Personalização** no menu admin
2. Na aba **Cores**, você pode:
   - Escolher a cor primária e secundária
   - Ajustar a saturação e luminosidade
   - Ver preview em tempo real

#### **B. Controle Manual das Cores do Sidebar**

Para ter controle total sobre os tons dos botões do sidebar, você pode editar o arquivo `styles/design-tokens.css`:

Read file: styles/design-tokens.css
### **4. Guia Prático para Personalizar as Cores**

#### **A. Personalização via Interface (Recomendado)**

1. **Acesse a Personalização:**
   - Vá para `/admin/customization`
   - Clique na aba **Cores**

2. **Escolha as Cores Base:**
   - **Cor Primária:** Define a cor principal do sistema
   - **Cor Secundária:** Define a cor complementar

3. **Ajuste os Controles:**
   - **Luminosidade:** Controla se os tons serão mais claros ou escuros
   - **Saturação:** Controla a intensidade das cores
   - **Contraste:** Define o nível de contraste entre elementos

#### **B. Personalização Manual (Avançado)**

Se você quiser controle total sobre cada elemento, pode editar diretamente as variáveis CSS. Vou te mostrar como:

### **5. Como Aplicar as Mudanças**

#### **A. Via Interface Web (Mais Fácil)**
1. Acesse `/admin/customization`
2. Escolha as cores na paleta
3. As mudanças são aplicadas automaticamente

#### **B. Via Código (Para Desenvolvedores)**

### **6. Como Pegar o Tom da Paleta e Ajustar o Brightness**

#### **A. Entendendo as Escalas de Cores**

Cada cor tem 11 tons disponíveis:
- **25-100:** Tons muito claros (para backgrounds suaves)
- **200-400:** Tons médios (para elementos secundários)
- **500:** Cor base (tom central)
- **600-800:** Tons escuros (para textos e elementos ativos)
- **900:** Tom mais escuro (para contraste máximo)

#### **B. Escolhendo o Tom Adequado**

Para cada elemento do sidebar, escolha o tom baseado na função:

1. **Background do Sidebar:** `--primary-25` (muito claro)
2. **Botões Normais:** `transparent` (sem background)
3. **Botões Hover:** `--primary-50` (claro)
4. **Botões Ativos:** `--primary-100` (médio-claro)
5. **Texto Normal:** `--neutral-700` (cinza escuro)
6. **Texto Ativo:** `--primary-700` (cor primária escura)

### **7. Dicas para Contraste Correto**

#### **A. Regras de Contraste**
- **Texto sobre fundo claro:** Use tons escuros (600-900)
- **Texto sobre fundo escuro:** Use tons claros (25-100)
- **Elementos ativos:** Use tons médios-escuros (400-700)
- **Elementos hover:** Use tons médios (200-400)

#### **B. Exemplos de Combinações**

```css
/* Contraste Alto */
--sidebar-item-active: var(--primary-200);
--sidebar-text-active: var(--primary-800);

/* Contraste Médio */
--sidebar-item-active: var(--primary-100);
--sidebar-text-active: var(--primary-700);

/* Contraste Suave */
--sidebar-item-active: var(--primary-50);
--sidebar-text-active: var(--primary-600);
```

### **8. Como Testar as Mudanças**

1. **Edite o arquivo** `styles/design-tokens.css`
2. **Salve o arquivo**
3. **Recarregue a página** do admin
4. **Observe as mudanças** no sidebar

### **9. Sistema de Preview**

O sistema já tem um preview em tempo real na página de personalização. Você pode:

1. Ir para `/admin/customization`
2. Escolher cores na paleta
3. Ver as mudanças aplicadas instantaneamente
4. Salvar quando estiver satisfeito

### **10. Resumo das Variáveis Principais**

```css
/* Background do sidebar */
--sidebar-bg: var(--primary-25);

/* Estados dos botões */
--sidebar-item-normal: transparent;
--sidebar-item-hover: var(--primary-50);
--sidebar-item-active: var(--primary-100);

/* Cores do texto */
--sidebar-text-normal: var(--neutral-700);
--sidebar-text-hover: var(--neutral-800);
--sidebar-text-active: var(--primary-700);

/* Indicador ativo */
--sidebar-indicator: var(--primary-600);
```

Agora você tem controle total sobre as cores dos botões do sidebar! Pode ajustar cada tom individualmente para criar o contraste perfeito para seu design. 🎨