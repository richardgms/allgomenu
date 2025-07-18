# Sistema de Configurações - All Go Menu

## Visão Geral

O painel administrativo de configurações permite que você gerencie todos os aspectos do seu restaurante na plataforma All Go Menu. O painel é organizado em abas para facilitar a navegação e configuração.

## Estrutura das Configurações

### 1. Informações Básicas 🏪

Configure as informações principais do seu restaurante:

- **Nome do Restaurante** (obrigatório)
- **Telefone** - Número de contato principal
- **WhatsApp** - Número para pedidos (formato: 5511999999999)
- **Email** - Email de contato
- **Descrição** - Conte sobre seu restaurante
- **Endereço** - Endereço completo para entrega

### 2. Entrega 🚚

Configure as opções de entrega:

- **Taxa de Entrega** - Valor cobrado pela entrega (R$)
- **Pedido Mínimo** - Valor mínimo para realizar pedidos (R$)
- **Tempo de Entrega** - Tempo estimado em minutos
- **Raio de Entrega** - Distância máxima para entrega (km)

### 3. Horários ⏰

Configure os horários de funcionamento para cada dia da semana:

- **Checkbox "Aberto"** - Marque para dias de funcionamento
- **Horário de Abertura** - Hora que o restaurante abre
- **Horário de Fechamento** - Hora que o restaurante fecha
- **Fechado** - Desmarque para dias que não funciona

### 4. WhatsApp 📱

Configure o template de mensagem enviado para o WhatsApp:

- **Template de Mensagem** - Personalize a mensagem do pedido
- **Variáveis Disponíveis** - Clique para inserir variáveis automaticamente
- **Preview** - Visualize como ficará a mensagem

#### Variáveis Disponíveis:
- `{{restaurantName}}` - Nome do restaurante
- `{{customerName}}` - Nome do cliente
- `{{customerPhone}}` - Telefone do cliente
- `{{deliveryAddress}}` - Endereço de entrega
- `{{orderItems}}` - Lista de itens do pedido
- `{{totalAmount}}` - Valor total
- `{{paymentMethod}}` - Método de pagamento
- `{{deliveryType}}` - Tipo de entrega
- `{{timestamp}}` - Data e hora do pedido

### 5. Personalização 🎨

Personalize a aparência do seu restaurante:

- **Cor Primária** - Cor principal dos botões e elementos
- **Cor Secundária** - Cor secundária para destaques
- **Fonte** - Escolha entre fontes disponíveis
- **Layout** - Estilo de layout (Padrão, Compacto, Amplo)
- **Logo** - Upload do logo do restaurante

#### Fontes Disponíveis:
- Inter (padrão)
- Roboto
- Open Sans
- Poppins
- Lato

### 6. Status 🔄

Controle o status de funcionamento:

- **Toggle Aberto/Fechado** - Ative/desative recebimento de pedidos
- **Indicador Visual** - Mostra o status atual
- **Mensagem para Clientes** - Quando fechado, clientes veem aviso

## Como Usar

### Acessando as Configurações

1. Faça login no painel administrativo
2. Vá para o Dashboard
3. Clique em "Configurações" ou acesse `/admin/settings`

### Navegação por Abas

- Clique nas abas no topo para navegar entre seções
- Cada aba tem um ícone e nome descritivo
- As configurações são salvas globalmente

### Salvando Configurações

1. Faça as alterações desejadas em qualquer aba
2. Clique em "Salvar Configurações" no final da página
3. Aguarde a confirmação de sucesso
4. As mudanças são aplicadas imediatamente no site

## Funcionalidades Avançadas

### Upload de Logo

- Suporte para PNG, JPG, GIF, WebP
- Tamanho máximo: 2MB
- Redimensionamento automático
- Preview em tempo real

### Personalização de Cores

- Seletor de cores visual
- Campo de texto para códigos hex
- Preview das cores em tempo real
- Aplicação automática no site

### Template do WhatsApp

- Editor de texto completo
- Botões para inserir variáveis
- Preview com dados de exemplo
- Suporte a formatação markdown

## Aplicação no Site

### Cores Personalizadas

As cores são aplicadas automaticamente usando variáveis CSS:

```css
:root {
  --primary-color: #DC2626;
  --secondary-color: #059669;
}
```

### Fonte Personalizada

A fonte é carregada dinamicamente do Google Fonts:

```javascript
// Aplicação automática da fonte
root.style.setProperty('--font-family', theme.font)
```

### Logo

O logo é exibido no cabeçalho do site ao lado do nome do restaurante.

## Validações

### Campos Obrigatórios

- Nome do restaurante (sempre obrigatório)
- Validação de formato de email
- Validação de números (preços, tempo, etc.)

### Validações de Upload

- Tipos de arquivo permitidos
- Tamanho máximo de arquivo
- Validação de imagem válida

### Validações de Horário

- Horário de abertura deve ser anterior ao fechamento
- Formato de hora válido (HH:MM)

## Troubleshooting

### Problemas Comuns

1. **Logo não aparece**
   - Verifique se o arquivo foi enviado corretamente
   - Confirme que salvou as configurações
   - Verifique o tamanho do arquivo (máx. 2MB)

2. **Cores não aplicam**
   - Aguarde alguns segundos para aplicação
   - Recarregue a página do restaurante
   - Verifique se o código da cor está correto

3. **WhatsApp não funciona**
   - Confirme o número no formato correto
   - Verifique se o template está preenchido
   - Teste com um pedido real

### Logs e Depuração

- Erros são mostrados em notificações na tela
- Verifique o console do navegador para erros
- Logs detalhados no servidor

## Segurança

### Validações de Segurança

- Autenticação JWT obrigatória
- Validação de permissões por restaurante
- Sanitização de dados de entrada
- Proteção contra XSS

### Upload Seguro

- Validação de tipo de arquivo
- Verificação de tamanho
- Armazenamento em serviço externo
- URLs seguras para imagens

## Performance

### Otimizações

- Carregamento lazy de fontes
- Compressão de imagens
- Cache de configurações
- Aplicação assíncrona de temas

### Limites

- Logo: máximo 2MB
- Template WhatsApp: máximo 2000 caracteres
- Tempo de resposta: < 2 segundos

## API

### Endpoints Principais

```
GET /api/admin/me - Carregar dados do usuário e restaurante
PUT /api/admin/restaurant/[slug] - Salvar configurações
POST /api/admin/upload - Upload de imagens
```

### Estrutura de Dados

```typescript
interface Restaurant {
  name: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  deliveryTime?: number;
  deliveryRadius?: number;
  isOpen: boolean;
  openingHours?: OpeningHours;
  themeConfig?: ThemeConfig;
  whatsappTemplate?: string;
}
```

## Suporte

Para suporte técnico ou dúvidas sobre as configurações:

1. Verifique esta documentação
2. Consulte os logs de erro
3. Entre em contato com o suporte técnico

---

*Documentação atualizada em: Dezembro 2024* 