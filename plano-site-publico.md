🍽️ Plano de Refatoração - Site Público do Restaurante
==================================================

🎯 Visão Geral do Projeto
-------------------------

### Objetivo

Refatorar completamente a página pública do site do restaurante (`app/[slug]/page.tsx`), mantendo as posições dos componentes atuais, mas tornando a interface mais **harmoniosa, bonita e profissional**, utilizando componentes shadcn/ui para alcançar a mesma qualidade visual do dashboard administrativo.

### Escopo

- **Refatoração completa da UI** com componentes shadcn/ui
- **Melhoria na experiência visual** sem alterar a funcionalidade
- **Harmonização do design** com o padrão do dashboard
- **Modernização dos componentes** mantendo responsividade
- **Otimização da arquitetura** de componentes

---

🗓️ Cronograma Executivo
-----------------------

| Fase | Duração | Período |
|------|---------|---------|
| Fase 1 - Análise e Preparação | 1 dia | Dia 1 |
| Fase 2 - Header e Navegação | 1 dia | Dia 2 |
| Fase 3 - Seção Hero e Featured | 1 dia | Dia 3 |
| Fase 4 - Menu e Categorias | 2 dias | Dias 4-5 |
| Fase 5 - Carrinho e Checkout | 2 dias | Dias 6-7 |
| Fase 6 - Otimizações e Testes | 1 dia | Dia 8 |

**Total: 8 dias (1.6 semanas)**

---

🏗️ FASE 1: Análise e Preparação (1 dia)
=======================================

## 1.1 Mapeamento dos Componentes Atuais

### Estrutura Identificada na Página Atual:
```
📍 Header Fixo (sticky)
├── Logo e Nome do Restaurante
├── Status (Aberto/Fechado)  
├── Tempo de Entrega
└── Botão do Carrinho

📍 Seção Hero/Banner
├── Imagem de Fundo
├── Informações do Restaurante
└── Botões de Ação

📍 Produtos em Destaque
├── Grid de Produtos Featured
└── Cards de Produtos

📍 Menu Completo
├── Navegação por Categorias
├── Lista de Produtos por Categoria
└── Modal de Detalhes do Produto

📍 Carrinho Lateral (Sheet)
├── Lista de Itens
├── Resumo de Valores
└── Checkout Flow

📍 Modais de Checkout
├── Dados do Cliente
├── Endereço de Entrega
├── Método de Pagamento  
└── Confirmação
```

## 1.2 Componentes shadcn/ui Selecionados

### Componentes Principais:
- ✅ **Card**: Para produtos, resumos e seções
- ✅ **Badge**: Para status, categorias e promoções
- ✅ **Button**: Para todas as ações e navegação
- ✅ **Sheet**: Para carrinho lateral
- ✅ **Dialog**: Para modais de produto e checkout
- ✅ **Input**: Para formulários de checkout
- ✅ **Separator**: Para divisões visuais
- ✅ **Skeleton**: Para estados de carregamento

### Componentes de Apoio:
- **Avatar**: Para logo do restaurante
- **Progress**: Para indicador de progresso do checkout
- **Select**: Para seleção de opções
- **Tabs**: Para navegação entre categorias
- **Alert**: Para mensagens de status
- **Scroll Area**: Para listas longas

---

📱 FASE 2: Header e Navegação (1 dia)
=====================================

## 2.1 Refatoração do Header Sticky

### Componentes shadcn/ui Aplicados:
```typescript
// components/public/PublicHeader.tsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ShoppingBag } from 'lucide-react'

export function PublicHeader({ restaurant, cartItemCount, onCartClick }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Logo e Info do Restaurante */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={restaurant.themeConfig?.logo} alt={restaurant.name} />
            <AvatarFallback>{restaurant.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="grid gap-1">
            <h1 className="text-lg font-semibold">{restaurant.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={restaurant.isCurrentlyOpen ? "default" : "destructive"}>
                {restaurant.isCurrentlyOpen ? '● Aberto' : '● Fechado'}
              </Badge>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {restaurant.deliveryTime}min
              </span>
            </div>
          </div>
        </div>

        {/* Botão do Carrinho */}
        <Button onClick={onCartClick} className="relative" size="lg">
          <ShoppingBag className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Carrinho</span>
          {cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
              {cartItemCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  )
}
```

### Melhorias Visuais:
- **Header com blur backdrop** para efeito moderno
- **Avatar component** para logo com fallback elegante
- **Badge redesenhado** com variants apropriados
- **Button aprimorado** com ícones Lucide
- **Layout responsivo** otimizado

---

🌟 FASE 3: Seção Hero e Featured (1 dia)
=======================================

## 3.1 Seção Hero Refatorada

### Componentes shadcn/ui Aplicados:
```typescript
// components/public/HeroSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, MapPin, Phone } from 'lucide-react'

export function HeroSection({ restaurant }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
      <div className="container max-w-screen-2xl">
        <Card className="mx-auto max-w-4xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img 
                src={restaurant.themeConfig?.logo || '/default-restaurant.jpg'} 
                alt={restaurant.name}
                className="h-20 w-20 rounded-full object-cover mx-auto shadow-lg"
              />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold">
              {restaurant.name}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {restaurant.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{restaurant.deliveryTime} min</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Entrega disponível</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{restaurant.phone}</span>
              </div>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="text-base px-4 py-2">
                Pedido mínimo: {formatPrice(restaurant.minimumOrder)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
```

## 3.2 Produtos em Destaque Refatorados

### Componentes shadcn/ui Aplicados:
```typescript
// components/public/FeaturedProducts.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function FeaturedProducts({ products, loading, onProductClick }: FeaturedProductsProps) {
  if (loading) {
    return (
      <section className="py-12">
        <div className="container max-w-screen-2xl">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container max-w-screen-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Produtos em Destaque</h2>
          <p className="text-muted-foreground mt-2">
            Nossos pratos mais pedidos e favoritos dos clientes
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="group cursor-pointer transition-all hover:shadow-lg">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={product.imageUrl || '/placeholder-food.jpg'}
                  alt={product.name}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
                {product.promotionalPrice && (
                  <Badge className="absolute top-2 left-2" variant="destructive">
                    Promoção
                  </Badge>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {product.promotionalPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.promotionalPrice)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => onProductClick(product)}
                    disabled={!product.isAvailable}
                  >
                    {product.isAvailable ? 'Adicionar' : 'Indisponível'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

🍽️ FASE 4: Menu e Categorias (2 dias)
=====================================

## 4.1 Navegação por Categorias (Dia 4)

### Componentes shadcn/ui Aplicados:
```typescript
// components/public/CategoryNavigation.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CategoryNavigation({ categories, selectedCategory, onCategorySelect }: CategoryNavigationProps) {
  return (
    <section className="py-8 border-b">
      <div className="container max-w-screen-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Nosso Cardápio</h2>
          <p className="text-muted-foreground mt-2">
            Explore todas as categorias dos nossos produtos
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={onCategorySelect} className="w-full">
          <div className="flex justify-center mb-8">
            <ScrollArea className="w-full max-w-2xl">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2"
                  >
                    {category.name}
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                      {category.products.length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <ProductGrid products={category.products} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
```

## 4.2 Grid de Produtos e Modal de Detalhes (Dia 5)

### Componentes shadcn/ui Aplicados:
```typescript
// components/public/ProductGrid.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Minus, Plus } from 'lucide-react'

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [observation, setObservation] = useState('')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer transition-all hover:shadow-md">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={product.imageUrl || '/placeholder-food.jpg'}
              alt={product.name}
              className="h-40 w-full object-cover transition-transform group-hover:scale-105"
            />
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Indisponível</Badge>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {product.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              {product.promotionalPrice ? (
                <div className="space-y-1">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.promotionalPrice)}
                  </span>
                  <br />
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <img
            src={product.imageUrl || '/placeholder-food.jpg'}
            alt={product.name}
            className="h-48 w-full object-cover rounded-lg"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatPrice(product.promotionalPrice || product.price)}
            </span>
            {product.promotionalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observações (opcional)</Label>
            <Textarea
              id="observation"
              placeholder="Ex: sem cebola, ponto da carne, etc..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => addToCart(product, quantity, observation)}
            className="w-full"
            size="lg"
          >
            Adicionar ao Carrinho - {formatPrice((product.promotionalPrice || product.price) * quantity)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

🛒 FASE 5: Carrinho e Checkout (2 dias)
======================================

## 5.1 Carrinho Lateral com Sheet (Dia 6)

### Componentes shadcn/ui Aplicados:
```typescript
// components/public/CartSheet.tsx
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Minus, Plus, X } from 'lucide-react'

export function CartSheet({ open, onOpenChange, cart, onUpdateQuantity, onRemoveItem, onCheckout }: CartSheetProps) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 5.00 // Exemplo
  const finalTotal = total + deliveryFee

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Seu Carrinho
            <Badge variant="secondary">{cart.length} itens</Badge>
          </SheetTitle>
          <SheetDescription>
            Revise seus itens antes de finalizar o pedido
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 my-4">
          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.imageUrl || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium leading-tight">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem(item.id)}
                            className="h-6 w-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.observation && (
                          <p className="text-sm text-muted-foreground">
                            Obs: {item.observation}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {cart.length > 0 && (
          <SheetFooter className="flex-col space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxa de entrega</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
            
            <Button onClick={onCheckout} size="lg" className="w-full">
              Finalizar Pedido
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

## 5.2 Fluxo de Checkout com Dialogs (Dia 7)

### Componentes shadcn/ui Aplicados:
```typescript
// components/public/CheckoutFlow.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const CHECKOUT_STEPS = [
  { key: 'customer', label: 'Seus Dados', progress: 25 },
  { key: 'address', label: 'Endereço', progress: 50 },
  { key: 'payment', label: 'Pagamento', progress: 75 },
  { key: 'confirmation', label: 'Confirmação', progress: 100 }
]

export function CheckoutFlow({ open, onOpenChange, step, onStepChange, checkoutData, onDataChange }: CheckoutFlowProps) {
  const currentStep = CHECKOUT_STEPS.find(s => s.key === step)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Finalizar Pedido
            <Badge variant="outline">{currentStep?.label}</Badge>
          </DialogTitle>
          <DialogDescription>
            <Progress value={currentStep?.progress} className="mt-2" />
            <span className="text-xs text-muted-foreground mt-1 block">
              Passo {CHECKOUT_STEPS.findIndex(s => s.key === step) + 1} de {CHECKOUT_STEPS.length}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'customer' && <CustomerStep data={checkoutData} onChange={onDataChange} />}
          {step === 'address' && <AddressStep data={checkoutData} onChange={onDataChange} />}
          {step === 'payment' && <PaymentStep data={checkoutData} onChange={onDataChange} />}
          {step === 'confirmation' && <ConfirmationStep data={checkoutData} />}
        </div>

        <DialogFooter className="flex-col space-y-2">
          <div className="flex gap-2 w-full">
            {step !== 'customer' && (
              <Button variant="outline" onClick={() => onStepChange('back')} className="flex-1">
                Voltar
              </Button>
            )}
            <Button 
              onClick={() => onStepChange('next')} 
              className="flex-1"
              disabled={!isStepValid(step, checkoutData)}
            >
              {step === 'confirmation' ? 'Confirmar Pedido' : 'Continuar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CustomerStep({ data, onChange }: StepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seus Dados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Digite seu nome"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone/WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-2">
          <Label>Tipo de entrega</Label>
          <RadioGroup
            value={data.deliveryType}
            onValueChange={(value) => onChange({ deliveryType: value as 'delivery' | 'pickup' })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery">Entrega</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Retirada no local</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}

// AddressStep, PaymentStep, e ConfirmationStep seguem o mesmo padrão...
```

---

⚡ FASE 6: Otimizações e Testes (1 dia)
======================================

## 6.1 Otimizações de Performance

### Implementações:
- **Lazy loading** de componentes pesados
- **Skeleton loading** para melhor UX
- **Memoização** de componentes com React.memo
- **Debounce** em inputs de busca
- **Otimização de imagens** com Next/Image

## 6.2 Responsividade e Acessibilidade

### Melhorias:
- **Grid responsivo** com breakpoints consistentes
- **Navegação por teclado** em todos os componentes
- **Labels apropriados** para screen readers
- **Contraste adequado** seguindo WCAG
- **Focus states** visíveis

## 6.3 Testes de Qualidade

### Checklist:
- ✅ Todos os componentes funcionam em mobile
- ✅ Navegação por teclado está funcional
- ✅ Loading states estão implementados
- ✅ Error states são tratados adequadamente
- ✅ Integração com tema está preservada

---

🛠️ Stack Tecnológica Utilizada
==============================

### Componentes shadcn/ui v4:
- **Card**: Estrutura principal dos elementos
- **Badge**: Status, categorias e contadores
- **Button**: Todas as ações e navegação
- **Sheet**: Carrinho lateral
- **Dialog**: Modals de produto e checkout
- **Input/Textarea**: Formulários
- **Separator**: Divisões visuais
- **Skeleton**: Estados de carregamento
- **Progress**: Indicador de progresso
- **Tabs**: Navegação por categorias
- **ScrollArea**: Listas scrolláveis
- **Avatar**: Logo do restaurante

### Ícones:
- **Lucide React**: Ícones consistentes e modernos

### Funcionalidades Mantidas:
- **Sistema de temas** dinâmico
- **Carrinho funcional** com localStorage
- **Checkout completo** multi-step
- **Integração WhatsApp** para pedidos
- **Responsividade** mobile-first

---

📝 Entregáveis Finais
====================

### Componentes Refatorados:
- ✅ `app/[slug]/page.tsx` - Página principal refatorada
- ✅ `components/public/PublicHeader.tsx` - Header moderno
- ✅ `components/public/HeroSection.tsx` - Seção hero elegante
- ✅ `components/public/FeaturedProducts.tsx` - Produtos destacados
- ✅ `components/public/CategoryNavigation.tsx` - Navegação categorias
- ✅ `components/public/ProductGrid.tsx` - Grid de produtos
- ✅ `components/public/CartSheet.tsx` - Carrinho lateral
- ✅ `components/public/CheckoutFlow.tsx` - Fluxo checkout

### Melhorias Implementadas:
- **Visual moderno** com componentes shadcn/ui
- **Experiência consistente** com dashboard admin
- **Performance otimizada** com lazy loading
- **Acessibilidade aprimorada** seguindo padrões
- **Responsividade total** mobile-first

---

🎯 Critérios de Sucesso
======================

1. **Visual Profissional**: Interface harmonizada com dashboard ✅
2. **Componentes Consistentes**: Uso completo de shadcn/ui ✅
3. **Funcionalidade Preservada**: Todos os recursos mantidos ✅
4. **Responsividade**: Funcional em todos os dispositivos ✅
5. **Performance**: Carregamento rápido e suave ✅
6. **Acessibilidade**: Navegação por teclado e screen readers ✅

---

⏱️ Estimativa de Recursos
========================

- **Desenvolvedor Frontend**: 8 dias completos
- **Designer de Review**: 2 dias (revisão e ajustes)
- **QA/Tester**: 1 dia (testes finais)

**Total estimado: ~2 semanas para refatoração completa**