# Sistema de Tipografia Profissional

## Visão Geral

O sistema de tipografia foi padronizado para usar a fonte **Inter** como padrão fixo em todo o projeto. A fonte Inter foi escolhida por sua excelente legibilidade, modernidade e adequação para interfaces de usuário.

## Implementação

### 1. Fonte Principal
- **Fonte:** Inter (Google Fonts)
- **Pesos disponíveis:** 300, 400, 500, 600, 700, 800, 900
- **Carregamento:** Automático via CSS import

### 2. Escala Tipográfica

| Classe CSS | Tamanho | Uso |
|------------|---------|-----|
| `--font-size-xs` | 12px | Tags, legendas, textos muito pequenos |
| `--font-size-sm` | 14px | Textos de suporte, descrições |
| `--font-size-md` | 16px | Texto de corpo, botões, links |
| `--font-size-lg` | 20px | Títulos de cards, seções |
| `--font-size-xl` | 24px | Subtítulos principais |
| `--font-size-xxl` | 32px | Números de destaque |
| `--font-size-xxxl` | 48px | Título principal do dashboard |

### 3. Classes Utilitárias

#### Títulos
- `.text-display` - Título principal (48px, Bold)
- `.text-heading-1` - Título grande (32px, Bold)
- `.text-heading-2` - Título médio (24px, Semibold)
- `.text-heading-3` - Título pequeno (20px, Medium)

#### Texto de Corpo
- `.text-body-large` - Texto grande (16px, Regular)
- `.text-body` - Texto normal (14px, Regular)
- `.text-body-small` - Texto pequeno (12px, Regular)

#### Números de Destaque
- `.text-number-large` - Número grande (32px, Bold)
- `.text-number` - Número normal (24px, Semibold)

#### Botões e Links
- `.text-button` - Botão normal (16px, Medium)
- `.text-button-small` - Botão pequeno (14px, Medium)

#### Labels e Captions
- `.text-label` - Label (14px, Medium)
- `.text-caption` - Caption (12px, Regular)

### 4. Aplicação Automática

A fonte Inter é aplicada automaticamente em:
- **Dashboard Admin:** Via `AdminLayout.tsx`
- **Página Pública:** Via `page.tsx` com carregamento automático do Google Fonts
- **CSS Global:** Via `globals.css` com import automático

### 5. Remoção da Configuração de Fonte

As seguintes mudanças foram implementadas:

#### Arquivos Modificados:
1. **`app/admin/settings/page.tsx`**
   - Removida opção de configuração de fonte
   - Atualizada descrição para indicar tipografia fixa

2. **`app/[slug]/page.tsx`**
   - Removida lógica de carregamento dinâmico de fontes
   - Aplicada fonte Inter como padrão fixo

3. **`components/AdminLayout.tsx`**
   - Atualizada aplicação da fonte para usar Inter diretamente

4. **`app/globals.css`**
   - Adicionado import da fonte Inter
   - Criadas variáveis CSS para tipografia
   - Adicionadas classes utilitárias

5. **`prisma/schema.prisma`**
   - Atualizada documentação do schema para remover referência à fonte

### 6. Benefícios

1. **Consistência Visual:** Tipografia uniforme em todo o sistema
2. **Performance:** Carregamento otimizado de uma única fonte
3. **Manutenibilidade:** Sistema simplificado sem opções desnecessárias
4. **Profissionalismo:** Fonte moderna e adequada para dashboards
5. **Acessibilidade:** Excelente legibilidade em diferentes tamanhos

### 7. Uso Recomendado

```html
<!-- Título principal do dashboard -->
<h1 class="text-display">Bem-vindo de volta</h1>

<!-- Subtítulo -->
<p class="text-heading-2">Aqui está um resumo do seu restaurante hoje</p>

<!-- Títulos de cards -->
<h3 class="text-heading-3">Pedidos hoje</h3>

<!-- Números de destaque -->
<p class="text-number-large">12</p>

<!-- Textos de suporte -->
<p class="text-body">+20% vs ontem</p>

<!-- Botões -->
<button class="text-button">Salvar</button>

<!-- Labels -->
<label class="text-label">Nome do restaurante</label>

<!-- Captions -->
<p class="text-caption">Informações de debug</p>
```

### 8. Responsividade

O sistema é totalmente responsivo e se adapta automaticamente a diferentes tamanhos de tela, mantendo a legibilidade e hierarquia visual em todos os dispositivos. 