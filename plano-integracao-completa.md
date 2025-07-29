🔗 Plano de Integração Completa - Site Público do Restaurante
============================================================

🎯 Visão Geral do Projeto
-------------------------

### Objetivo

Implementar a **integração completa e funcional do site público** com todas as configurações e dados do dashboard administrativo, garantindo que 100% das personalizações, configurações operacionais e dados em tempo real sejam refletidos na experiência do cliente final, utilizando componentes shadcn/ui v4 para uma interface moderna e profissional.

### Escopo

- **Integração completa de dados** - Status operacional, horários, configurações
- **Modernização visual total** - Migration para shadcn/ui v4 via MCP
- **Sistema de temas dinâmico** - Sincronização automática com dashboard
- **Funcionalidade 100% operacional** - Carrinho, checkout, pedidos WhatsApp
- **Performance otimizada** - Loading states, cache inteligente, responsividade
- **Experiência consistente** - Visual harmonizado com dashboard admin

---

🗓️ Cronograma Executivo
-----------------------

| Fase | Duração | Período | Prioridade |
|------|---------|---------|------------|
| Fase 1 - Integração de Dados do Dashboard | 2 dias | Dias 1-2 | Crítica |
| Fase 2 - Modernização Visual com shadcn/ui | 3 dias | Dias 3-5 | Alta |
| Fase 3 - Sistema de Temas Avançado | 2 dias | Dias 6-7 | Alta |
| Fase 4 - Experiência do Cliente | 2 dias | Dias 8-9 | Média |
| Fase 5 - Performance e Integrações | 1 dia | Dia 10 | Média |

**Total: 10 dias (2 semanas)**

---

🔄 FASE 1: Integração de Dados do Dashboard (2 dias)
===================================================

## 1.1 Status Operacional em Tempo Real (1 dia)

### Análise dos Gaps Atuais:
```typescript
// Estado atual - dados estáticos
interface Restaurant {
  name: string
  description: string
  themeConfig: { ... }
  deliveryTime: number
  minimumOrder: number
  deliveryFee: number
}

// Estado desejado - dados dinâmicos
interface RestaurantStatus {
  // Dados básicos existentes
  restaurant: Restaurant
  
  // Novos dados dinâmicos necessários
  operationalStatus: {
    isOpen: boolean
    isAcceptingOrders: boolean
    nextOpenTime?: string
    closesAt?: string
    pausedUntil?: string
    pauseReason?: string
  }
  
  deliveryConfig: {
    isDeliveryEnabled: boolean
    estimatedTime: number
    zones: DeliveryZone[]
    minimumOrderByZone: Record<string, number>
  }
  
  paymentMethods: {
    id: string
    name: string
    type: 'money' | 'card' | 'pix'
    isActive: boolean
    fee?: number
    instructions?: string
  }[]
  
  currentPromotions: {
    id: string
    name: string
    type: 'discount' | 'free_delivery' | 'combo'
    value: number
    conditions: any
    isActive: boolean
  }[]
}
```

### Implementação da API de Status:
```typescript
// app/api/restaurant/[slug]/status/route.ts
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: params.slug },
      include: {
        operatingHours: true,
        deliveryZones: true,
        paymentMethods: { where: { isActive: true } },
        promotions: { where: { isActive: true, validUntil: { gte: new Date() } } }
      }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Calcular status operacional baseado em horários
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const todayHours = restaurant.operatingHours.find(h => h.dayOfWeek === currentDay)
    
    let isOpen = false
    let nextOpenTime = null
    let closesAt = null
    
    if (todayHours && !todayHours.isClosed) {
      const openTime = todayHours.openTime
      const closeTime = todayHours.closeTime
      
      isOpen = currentTime >= openTime && currentTime < closeTime
      
      if (isOpen) {
        closesAt = formatTime(closeTime)
      } else if (currentTime < openTime) {
        nextOpenTime = formatTime(openTime)
      }
    }

    // Verificar se está pausado manualmente
    const isPaused = restaurant.isPaused || false
    const pausedUntil = restaurant.pausedUntil
    const pauseReason = restaurant.pauseReason

    const status: RestaurantStatus = {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        slug: restaurant.slug,
        phone: restaurant.phone,
        whatsapp: restaurant.whatsapp,
        themeConfig: restaurant.themeConfig,
        deliveryTime: restaurant.deliveryTime,
        minimumOrder: restaurant.minimumOrder,
        deliveryFee: restaurant.deliveryFee
      },
      operationalStatus: {
        isOpen: isOpen && !isPaused,
        isAcceptingOrders: isOpen && !isPaused && restaurant.acceptingOrders,
        nextOpenTime,
        closesAt,
        pausedUntil,
        pauseReason
      },
      deliveryConfig: {
        isDeliveryEnabled: restaurant.deliveryEnabled,
        estimatedTime: restaurant.deliveryTime,
        zones: restaurant.deliveryZones.map(zone => ({
          id: zone.id,
          name: zone.name,
          fee: zone.fee,
          minimumOrder: zone.minimumOrder,
          estimatedTime: zone.estimatedTime
        })),
        minimumOrderByZone: restaurant.deliveryZones.reduce((acc, zone) => {
          acc[zone.id] = zone.minimumOrder
          return acc
        }, {})
      },
      paymentMethods: restaurant.paymentMethods,
      currentPromotions: restaurant.promotions.map(promo => ({
        id: promo.id,
        name: promo.name,
        type: promo.type,
        value: promo.value,
        conditions: promo.conditions,
        isActive: true
      }))
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching restaurant status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 1.2 Produtos e Menu Dinâmico (1 dia)

### Melhorias na API de Menu:
```typescript
// app/api/restaurant/[slug]/menu/route.ts - Aprimorada
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: params.slug }
    })

    const categories = await prisma.category.findMany({
      where: { 
        restaurantId: restaurant.id,
        isActive: true
      },
      include: {
        products: {
          where: { isActive: true },
          orderBy: [
            { isFeatured: 'desc' },
            { order: 'asc' },
            { name: 'asc' }
          ]
        }
      },
      orderBy: { order: 'asc' }
    })

    // Processar produtos com dados dinâmicos
    const processedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      order: category.order,
      products: category.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        promotionalPrice: product.promotionalPrice,
        imageUrl: product.imageUrl,
        isFeatured: product.isFeatured,
        isAvailable: product.isAvailable && product.stock > 0, // Verificar estoque
        options: product.options,
        allergens: product.allergens,
        nutritionalInfo: product.nutritionalInfo,
        preparationTime: product.preparationTime,
        category: category.name
      }))
    }))

    return NextResponse.json(processedCategories)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

🎨 FASE 2: Modernização Visual com shadcn/ui (3 dias)
====================================================

## 2.1 Identificação e Instalação de Componentes (0.5 dias)

### Componentes shadcn/ui Necessários via MCP:

#### Core UI (Essenciais):
- `card` - Estrutura principal para produtos e seções
- `badge` - Status, promoções, contadores
- `button` - Todas as ações e navegação
- `avatar` - Logo do restaurante com fallback
- `skeleton` - Estados de loading elegantes

#### Formulários e Interação:
- `input` - Campos de texto do checkout
- `textarea` - Observações e comentários
- `label` - Labels semânticos para acessibilidade
- `radio-group` - Seleções de entrega/pagamento
- `select` - Dropdowns de opções

#### Layout e Navegação:
- `sheet` - Carrinho lateral deslizante
- `dialog` - Modais de produto e checkout
- `tabs` - Navegação entre categorias
- `scroll-area` - Listas longas scrolláveis
- `separator` - Divisões visuais

#### Feedback Visual:
- `progress` - Indicador de progresso do checkout
- `alert` - Mensagens de erro/sucesso
- `sonner` - Toast notifications
- `tooltip` - Dicas contextuais

## 2.2 Refatoração do Header com shadcn/ui (0.5 dias)

### Implementação Completa:
```typescript
// components/public/PublicHeader.tsx - Versão shadcn/ui
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShoppingBag, Clock, AlertCircle } from 'lucide-react'

interface PublicHeaderProps {
  restaurant: Restaurant | null
  status: RestaurantStatus | null
  cartItemCount: number
  onCartClick: () => void
  loading?: boolean
}

export function PublicHeader({ 
  restaurant, 
  status, 
  cartItemCount, 
  onCartClick, 
  loading = false 
}: PublicHeaderProps) {
  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </header>
    )
  }

  if (!restaurant || !status) return null

  const { operationalStatus } = status
  const isOpen = operationalStatus.isOpen && operationalStatus.isAcceptingOrders

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          {/* Logo e Info do Restaurante */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={restaurant.themeConfig?.logo} 
                alt={restaurant.name} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {restaurant.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="grid gap-1">
              <h1 className="text-lg font-semibold leading-none">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={isOpen ? "default" : "destructive"}
                  className="text-xs"
                >
                  <div className="mr-1 h-2 w-2 rounded-full bg-current" />
                  {isOpen ? 'Aberto' : 'Fechado'}
                </Badge>
                
                {isOpen && (
                  <>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      <Clock className="mr-1 h-3 w-3 inline" />
                      {status.deliveryConfig.estimatedTime}min
                    </span>
                    {operationalStatus.closesAt && (
                      <span className="text-xs text-muted-foreground hidden md:inline">
                        Fecha às {operationalStatus.closesAt}
                      </span>
                    )}
                  </>
                )}
                
                {!isOpen && operationalStatus.nextOpenTime && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Abre às {operationalStatus.nextOpenTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botão do Carrinho */}
          <Button 
            onClick={onCartClick} 
            className="relative" 
            size="lg"
            disabled={!isOpen}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Carrinho</span>
            {cartItemCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                variant="destructive"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      {/* Alert de Status Especial */}
      {operationalStatus.pauseReason && (
        <Alert className="rounded-none border-x-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {operationalStatus.pauseReason}
            {operationalStatus.pausedUntil && (
              <> Voltamos às {format(new Date(operationalStatus.pausedUntil), 'HH:mm')}</>
            )}
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
```

## 2.3 Seção Hero Modernizada (1 dia)

### Implementação com Dados Dinâmicos:
```typescript
// components/public/HeroSection.tsx - Versão integrada
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, MapPin, Phone, Star, Truck, CreditCard } from 'lucide-react'

interface HeroSectionProps {
  restaurant: Restaurant
  status: RestaurantStatus
  onScrollToMenu: () => void
}

export function HeroSection({ restaurant, status, onScrollToMenu }: HeroSectionProps) {
  const { operationalStatus, deliveryConfig, currentPromotions } = status
  const isOpen = operationalStatus.isOpen && operationalStatus.isAcceptingOrders

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container max-w-screen-2xl">
        <Card className="mx-auto max-w-4xl shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4">
              <img 
                src={restaurant.themeConfig?.logo || '/default-restaurant.jpg'} 
                alt={restaurant.name}
                className="h-20 w-20 rounded-full object-cover mx-auto shadow-lg ring-4 ring-primary/10"
              />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {restaurant.name}
            </CardTitle>
            <CardDescription className="text-lg mt-2 max-w-2xl mx-auto">
              {restaurant.description}
            </CardDescription>
            
            {/* Status Badge Prominente */}
            <div className="flex justify-center mt-4">
              <Badge 
                variant={isOpen ? "default" : "destructive"} 
                className="text-sm px-4 py-2"
              >
                <div className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse" />
                {isOpen ? 'Aceitando Pedidos' : 'Fechado'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações Operacionais */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {isOpen ? (
                    <>Entrega: {deliveryConfig.estimatedTime} min</>
                  ) : operationalStatus.nextOpenTime ? (
                    <>Abre às {operationalStatus.nextOpenTime}</>
                  ) : (
                    'Horário não disponível'
                  )}
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>
                  {deliveryConfig.isDeliveryEnabled ? 'Entrega disponível' : 'Apenas retirada'}
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{restaurant.phone}</span>
              </div>
            </div>
            
            {/* Pedido Mínimo e Taxa */}
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                Pedido mínimo: R$ {restaurant.minimumOrder.toFixed(2)}
              </Badge>
              
              {deliveryConfig.isDeliveryEnabled && (
                <Badge variant="outline" className="text-base px-4 py-2">
                  Taxa de entrega: R$ {restaurant.deliveryFee.toFixed(2)}
                </Badge>
              )}
            </div>

            {/* Promoções Ativas */}
            {currentPromotions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-center font-medium text-primary">🎉 Promoções Ativas</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentPromotions.map(promo => (
                    <Badge key={promo.id} variant="destructive" className="text-xs">
                      {promo.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center pt-4">
              <Button 
                size="lg" 
                onClick={onScrollToMenu}
                disabled={!isOpen}
                className="px-8 py-3 text-lg"
              >
                {isOpen ? 'Ver Cardápio' : 'Restaurante Fechado'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
```

## 2.4 Grid de Produtos e Navegação (1 dia)

### Componentes Completos:
```typescript
// components/public/CategoryNavigation.tsx - Versão shadcn/ui
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

interface CategoryNavigationProps {
  categories: Category[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
  loading?: boolean
}

export function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  loading = false
}: CategoryNavigationProps) {
  if (loading) {
    return (
      <section className="py-8 border-b">
        <div className="container max-w-screen-2xl">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 border-b bg-muted/20">
      <div className="container max-w-screen-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore todas as categorias dos nossos produtos
          </p>
        </div>

        <Tabs 
          value={selectedCategory} 
          onValueChange={onCategorySelect} 
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <ScrollArea className="w-full max-w-4xl">
              <TabsList className="grid w-full gap-2" style={{
                gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)`
              }}>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 text-sm px-4 py-2"
                  >
                    <span>{category.name}</span>
                    <Badge 
                      variant="secondary" 
                      className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                    >
                      {category.products.length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <ProductGrid 
                products={category.products} 
                category={category}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
```

---

🎨 FASE 3: Sistema de Temas Avançado (2 dias)
============================================

## 3.1 Tema Dinâmico Completo (1 dia)

### Hook para Tema Dinâmico:
```typescript
// hooks/useRestaurantTheme.ts
import { useEffect } from 'react'
import { buildThemeTokens } from '@/lib/color'

interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  logo?: string
  colorPalette?: {
    primaryLight: string
    primaryBase: string
    primaryDark: string
    secondaryLight: string
    secondaryBase: string
    secondaryDark: string
  }
  fonts?: {
    heading: string
    body: string
  }
}

export function useRestaurantTheme(themeConfig: ThemeConfig | null) {
  useEffect(() => {
    if (!themeConfig?.colorPalette) return

    // Aplicar tokens de cor
    const tokens = buildThemeTokens(themeConfig.colorPalette)
    Object.entries(tokens).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })

    // Aplicar fontes se configuradas
    if (themeConfig.fonts) {
      if (themeConfig.fonts.heading) {
        document.documentElement.style.setProperty(
          '--font-heading', 
          themeConfig.fonts.heading
        )
      }
      if (themeConfig.fonts.body) {
        document.documentElement.style.setProperty(
          '--font-body', 
          themeConfig.fonts.body
        )
      }
    }

    // Cleanup
    return () => {
      Object.keys(tokens).forEach(key => {
        document.documentElement.style.removeProperty(key)
      })
      if (themeConfig.fonts?.heading) {
        document.documentElement.style.removeProperty('--font-heading')
      }
      if (themeConfig.fonts?.body) {
        document.documentElement.style.removeProperty('--font-body')
      }
    }
  }, [themeConfig])
}
```

## 3.2 ThemeProvider Integrado (1 dia)

### Componente ThemeProvider:
```typescript
// components/theme/RestaurantThemeProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRestaurantTheme } from '@/hooks/useRestaurantTheme'

interface RestaurantThemeContextType {
  theme: ThemeConfig | null
  updateTheme: (theme: ThemeConfig) => void
  isLoading: boolean
}

const RestaurantThemeContext = createContext<RestaurantThemeContextType>({
  theme: null,
  updateTheme: () => {},
  isLoading: true
})

interface RestaurantThemeProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeConfig
  slug: string
}

export function RestaurantThemeProvider({ 
  children, 
  initialTheme, 
  slug 
}: RestaurantThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig | null>(initialTheme || null)
  const [isLoading, setIsLoading] = useState(!initialTheme)

  // Aplicar tema usando hook
  useRestaurantTheme(theme)

  // Buscar tema se não foi fornecido inicialmente
  useEffect(() => {
    if (!initialTheme && slug) {
      fetchRestaurantTheme(slug)
        .then(setTheme)
        .finally(() => setIsLoading(false))
    }
  }, [initialTheme, slug])

  const updateTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme)
    // Opcionalmente, persistir no localStorage ou cache
    localStorage.setItem(`theme-${slug}`, JSON.stringify(newTheme))
  }

  return (
    <RestaurantThemeContext.Provider value={{
      theme,
      updateTheme,
      isLoading
    }}>
      {children}
    </RestaurantThemeContext.Provider>
  )
}

export const useRestaurantThemeContext = () => useContext(RestaurantThemeContext)

async function fetchRestaurantTheme(slug: string): Promise<ThemeConfig | null> {
  try {
    const response = await fetch(`/api/restaurant/${slug}`)
    const data = await response.json()
    return data.themeConfig || null
  } catch (error) {
    console.error('Error fetching theme:', error)
    return null
  }
}
```

---

🛒 FASE 4: Experiência do Cliente (2 dias)
==========================================

## 4.1 Carrinho Avançado com shadcn/ui (1 dia)

### CartSheet Completo:
```typescript
// components/public/CartSheet.tsx - Versão final integrada
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Minus, Plus, X, ShoppingBag, AlertTriangle } from 'lucide-react'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  restaurant: Restaurant
  deliveryConfig: DeliveryConfig
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
  loading?: boolean
}

export function CartSheet({ 
  open, 
  onOpenChange, 
  cart, 
  restaurant,
  deliveryConfig,
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  loading = false
}: CartSheetProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = deliveryConfig.isDeliveryEnabled ? restaurant.deliveryFee : 0
  const total = subtotal + deliveryFee
  
  const isMinimumOrderMet = subtotal >= restaurant.minimumOrder
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Seu Carrinho
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Revise seus itens antes de finalizar o pedido
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  Seu carrinho está vazio
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicione produtos do cardápio para continuar
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <Card key={`${item.id}-${item.observation || 'no-obs'}`} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.imageUrl || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium leading-tight text-sm">
                            {item.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem(item.id)}
                            className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.observation && (
                          <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>Obs:</strong> {item.observation}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <span className="font-medium text-sm">
                            R$ {(item.price * item.quantity).toFixed(2)}
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
          <SheetFooter className="flex-col space-y-4 pt-4 border-t">
            {/* Aviso de pedido mínimo */}
            {!isMinimumOrderMet && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Pedido mínimo: R$ {restaurant.minimumOrder.toFixed(2)}
                  <br />
                  Adicione mais R$ {(restaurant.minimumOrder - subtotal).toFixed(2)} para continuar
                </AlertDescription>
              </Alert>
            )}

            {/* Resumo do pedido */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              
              {deliveryConfig.isDeliveryEnabled && (
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-medium text-base">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              onClick={onCheckout} 
              size="lg" 
              className="w-full"
              disabled={!isMinimumOrderMet || loading}
            >
              {loading ? 'Processando...' : 'Finalizar Pedido'}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

## 4.2 Checkout Flow Otimizado (1 dia)

### CheckoutFlow com Validações:
```typescript
// components/public/CheckoutFlow.tsx - Versão final
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, CreditCard, Smartphone, Banknote, MapPin, User, AlertCircle } from 'lucide-react'

const CHECKOUT_STEPS = [
  { key: 'customer', label: 'Seus Dados', progress: 25, icon: User },
  { key: 'address', label: 'Endereço', progress: 50, icon: MapPin },
  { key: 'payment', label: 'Pagamento', progress: 75, icon: CreditCard },
  { key: 'confirmation', label: 'Confirmação', progress: 100, icon: Check }
]

interface CheckoutFlowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: CheckoutStep
  onStepChange: (direction: 'next' | 'back') => void
  checkoutData: CheckoutData
  onDataChange: (data: Partial<CheckoutData>) => void
  cart: CartItem[]
  restaurant: Restaurant
  deliveryConfig: DeliveryConfig
  onConfirmOrder: () => Promise<void>
  isSubmitting?: boolean
}

export function CheckoutFlow({ 
  open, 
  onOpenChange, 
  step, 
  onStepChange, 
  checkoutData, 
  onDataChange,
  cart,
  restaurant,
  deliveryConfig,
  onConfirmOrder,
  isSubmitting = false
}: CheckoutFlowProps) {
  const currentStepIndex = CHECKOUT_STEPS.findIndex(s => s.key === step)
  const currentStep = CHECKOUT_STEPS[currentStepIndex]
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = checkoutData.deliveryType === 'delivery' ? restaurant.deliveryFee : 0
  const total = subtotal + deliveryFee

  const isStepValid = (stepKey: CheckoutStep): boolean => {
    switch (stepKey) {
      case 'customer':
        return !!(checkoutData.name.trim() && 
                 checkoutData.phone.trim() && 
                 checkoutData.deliveryType)
      case 'address':
        return checkoutData.deliveryType === 'pickup' || 
               !!(checkoutData.newAddress?.street && 
                  checkoutData.newAddress?.number && 
                  checkoutData.newAddress?.neighborhood && 
                  checkoutData.newAddress?.city)
      case 'payment':
        return !!(checkoutData.paymentMethod && 
                 (checkoutData.paymentMethod !== 'money' || 
                  !checkoutData.changeFor || 
                  checkoutData.changeFor >= total))
      case 'confirmation':
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (step === 'confirmation') {
      await onConfirmOrder()
    } else {
      onStepChange('next')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3">
            <currentStep.icon className="h-5 w-5" />
            Finalizar Pedido
            <Badge variant="outline" className="ml-auto">
              {currentStep.label}
            </Badge>
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <Progress value={currentStep.progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Passo {currentStepIndex + 1} de {CHECKOUT_STEPS.length}</span>
              <span>{currentStep.progress}% concluído</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'customer' && (
            <CustomerStep 
              data={checkoutData} 
              onChange={onDataChange}
              deliveryEnabled={deliveryConfig.isDeliveryEnabled}
            />
          )}
          
          {step === 'address' && (
            <AddressStep 
              data={checkoutData} 
              onChange={onDataChange}
              restaurant={restaurant}
            />
          )}
          
          {step === 'payment' && (
            <PaymentStep 
              data={checkoutData} 
              onChange={onDataChange}
              total={total}
              paymentMethods={restaurant.paymentMethods || []}
            />
          )}
          
          {step === 'confirmation' && (
            <ConfirmationStep 
              data={checkoutData}
              cart={cart}
              restaurant={restaurant}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
            />
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-6 border-t">
          {currentStepIndex > 0 && (
            <Button 
              variant="outline" 
              onClick={() => onStepChange('back')}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Voltar
            </Button>
          )}
          
          <Button 
            onClick={handleNext}
            disabled={!isStepValid(step) || isSubmitting}
            className="w-full sm:w-auto sm:flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processando...
              </>
            ) : step === 'confirmation' ? (
              'Confirmar Pedido'
            ) : (
              'Continuar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componentes dos steps individuais seguem padrão similar...
```

---

⚡ FASE 5: Performance e Integrações (1 dia)
===========================================

## 5.1 Otimizações de Performance

### Lazy Loading e Memoização:
```typescript
// app/[slug]/page.tsx - Versão otimizada
'use client'
import dynamic from 'next/dynamic'
import { memo, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy loading de componentes pesados
const CartSheet = dynamic(() => import('@/components/public/CartSheet'), {
  loading: () => <div>Carregando carrinho...</div>
})

const CheckoutFlow = dynamic(() => import('@/components/public/CheckoutFlow'), {
  loading: () => <div>Carregando checkout...</div>
})

// Memoização de componentes
const MemoizedProductGrid = memo(ProductGrid)
const MemoizedCategoryNavigation = memo(CategoryNavigation)

// Hook otimizado para dados do restaurante
function useRestaurantData(slug: string) {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => fetchRestaurantStatus(slug),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  })
}
```

## 5.2 Cache Inteligente e Estados de Loading

### Sistema de Cache:
```typescript
// lib/cache.ts
class RestaurantCache {
  private cache = new Map()
  private readonly TTL = 5 * 60 * 1000 // 5 minutos

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

export const restaurantCache = new RestaurantCache()
```

---

📝 Entregáveis Finais
====================

### APIs Implementadas:
- ✅ `/api/restaurant/[slug]/status` - Status operacional completo
- ✅ `/api/restaurant/[slug]/menu` - Menu com dados dinâmicos
- ✅ `/api/restaurant/[slug]/featured` - Produtos em destaque (existente)

### Componentes Refatorados:
- ✅ `components/public/PublicHeader.tsx` - Header com dados dinâmicos
- ✅ `components/public/HeroSection.tsx` - Hero integrado com status
- ✅ `components/public/CategoryNavigation.tsx` - Navegação modernizada
- ✅ `components/public/ProductGrid.tsx` - Grid com shadcn/ui
- ✅ `components/public/CartSheet.tsx` - Carrinho avançado
- ✅ `components/public/CheckoutFlow.tsx` - Checkout otimizado

### Hooks e Utilitários:
- ✅ `hooks/useRestaurantTheme.ts` - Tema dinâmico
- ✅ `hooks/useRestaurantData.ts` - Dados com cache
- ✅ `components/theme/RestaurantThemeProvider.tsx` - Provider de tema
- ✅ `lib/cache.ts` - Sistema de cache inteligente

### Componentes shadcn/ui Utilizados:
- **Layout**: `card`, `sheet`, `dialog`, `tabs`, `scroll-area`
- **Formulários**: `input`, `textarea`, `label`, `radio-group`, `select`
- **Feedback**: `badge`, `button`, `avatar`, `skeleton`, `progress`, `alert`
- **Utilitários**: `separator`, `tooltip`, `sonner`

---

🎯 Critérios de Sucesso
======================

1. **Integração 100%**: ✅ Todos os dados do dashboard refletem no site público
2. **Visual Moderno**: ✅ Interface completamente modernizada com shadcn/ui v4  
3. **Tema Dinâmico**: ✅ Sincronização automática de cores e marca
4. **Funcionalidade Completa**: ✅ Carrinho, checkout e pedidos funcionais
5. **Performance Otimizada**: ✅ Loading states, cache, lazy loading
6. **Responsividade Total**: ✅ Mobile-first e adaptável
7. **Acessibilidade**: ✅ Navegação por teclado e screen readers

---

⏱️ Estimativa de Recursos
========================

- **Desenvolvedor Frontend**: 10 dias completos
- **QA/Tester**: 2 dias (testes de integração)
- **Designer Review**: 1 dia (validação visual)

**Total estimado: 2 semanas para integração completa**

---

💡 Próximos Passos Recomendados
==============================

1. **Implementar APIs de Status** (Fase 1)
2. **Instalar componentes shadcn/ui via MCP** (Fase 2)  
3. **Refatorar componentes principais** (Fase 2-3)
4. **Integrar sistema de temas** (Fase 3)
5. **Otimizar carrinho e checkout** (Fase 4)
6. **Implementar otimizações finais** (Fase 5)

Este plano garante que o site público tenha **integração completa** com o dashboard administrativo, proporcionando uma experiência de cliente moderna, funcional e consistente com a identidade visual configurada pelos proprietários dos restaurantes.