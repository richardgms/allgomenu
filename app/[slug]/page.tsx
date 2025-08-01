'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Clock } from 'lucide-react'

// Componentes refatorados
import { PublicHeader } from '@/components/public/PublicHeader'
import { HeroSection } from '@/components/public/HeroSection'
import { FeaturedProducts } from '@/components/public/FeaturedProducts'
import { CategoryNavigation } from '@/components/public/CategoryNavigation'
import { CategorySection } from '@/components/public/CategorySection'
import { CartSheet } from '@/components/public/CartSheet'
import { CheckoutFlow } from '@/components/public/CheckoutFlow'

// Hooks integrados
import { useRestaurantPage, useRestaurantCart } from '@/hooks/useRestaurantPage'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { ProcessedProduct, CartItem } from '@/types/restaurant'

// Interfaces para checkout (temporárias - será movido para tipos compartilhados na Fase 4)
interface SavedAddress {
  id: string
  name: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  zipCode: string
  reference?: string
  isDefault?: boolean
}

interface CheckoutData {
  name: string
  phone: string
  deliveryType: 'delivery' | 'pickup'
  selectedAddressId?: string
  newAddress?: Omit<SavedAddress, 'id'>
  observations: string
  paymentMethod: 'money' | 'card' | 'pix'
  changeFor?: number
}

type CheckoutStep = 'customer' | 'address' | 'payment' | 'confirmation'

export default function RestaurantPage() {
  const { slug } = useParams() as { slug: string }
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Hooks integrados
  const {
    isLoading,
    hasError,
    error,
    errorDetails,
    restaurant,
    operationalStatus,
    deliveryConfig,
    paymentMethods,
    isOpen,
    categories,
    menuStats,
    restaurantStatus,
    refreshData
  } = useRestaurantPage(slug)

  // Hook para navegação com scroll spy
  const scrollSpy = useScrollSpy({
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0.1,
    offset: 128 // Header (64px) + navegação (~64px)
  })

  // Estados da UI
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('customer')
  
  // Estados temporários do carrinho (será refatorado na Fase 4)
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Estados do checkout
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    name: '',
    phone: '',
    deliveryType: 'delivery',
    observations: '',
    paymentMethod: 'money'
  })
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])

  // Scroll para seção do menu
  const scrollToMenu = () => {
    if (categories.length > 0) {
      scrollSpy.scrollToSection(`category-${categories[0].id}`)
    }
  }

  // Funções do carrinho (temporárias - será refatorado na Fase 4)
  const addToCart = (product: ProcessedProduct, quantity: number, observation?: string) => {
    const existingItemIndex = cart.findIndex(
      item => item.id === product.id && item.observation === observation
    )

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += quantity
      setCart(updatedCart)
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.effectivePrice,
        quantity,
        imageUrl: product.imageUrl,
        observation
      }
      setCart([...cart, newItem])
    }
  }

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
  }

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  // Funções do checkout
  const handleCheckout = () => {
    setShowCart(false)
    setShowCheckout(true)
    setCheckoutStep('customer')
  }

  const handleCheckoutDataChange = (data: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...data }))
  }

  const handleConfirmOrder = async () => {
    if (!restaurant) return

    try {
      // Gerar mensagem do WhatsApp
      const orderItems = cart.map(item => 
        `${item.quantity}x ${item.name}${item.observation ? ` (${item.observation})` : ''} - ${formatPrice(item.price * item.quantity)}`
      ).join('\n')

      const deliveryInfo = checkoutData.deliveryType === 'delivery' && checkoutData.newAddress
        ? `\n📍 *Endereço:*\n${checkoutData.newAddress.street}, ${checkoutData.newAddress.number}${checkoutData.newAddress.complement ? `, ${checkoutData.newAddress.complement}` : ''}\n${checkoutData.newAddress.neighborhood}, ${checkoutData.newAddress.city}${checkoutData.newAddress.reference ? `\nReferência: ${checkoutData.newAddress.reference}` : ''}`
        : checkoutData.deliveryType === 'pickup' ? '\n🏪 *Retirada no local*' : ''

      const paymentInfo = checkoutData.paymentMethod === 'money' 
        ? `💰 Dinheiro${checkoutData.changeFor ? ` (troco para ${formatPrice(checkoutData.changeFor)})` : ''}`
        : checkoutData.paymentMethod === 'card' ? '💳 Cartão na entrega' : '📱 PIX'

      const total = cartSubtotal + (restaurant.deliveryFee || 0)

      const message = `🍽️ *Novo Pedido - ${restaurant.name}*

👤 *Cliente:* ${checkoutData.name}
📞 *Telefone:* ${checkoutData.phone}

📋 *Itens do Pedido:*
${orderItems}

💰 *Resumo:*
Subtotal: ${formatPrice(cartSubtotal)}
Taxa de entrega: ${formatPrice(restaurant.deliveryFee || 0)}
*Total: ${formatPrice(total)}*

${deliveryInfo}

💳 *Pagamento:* ${paymentInfo}

${checkoutData.observations ? `📝 *Observações:* ${checkoutData.observations}` : ''}

_Pedido realizado através do site ${restaurant.name}_`

      // Gerar URL do WhatsApp
      const whatsappUrl = `https://wa.me/${(restaurant.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank')
      
      // Limpar carrinho e fechar modals
      clearCart()
      setShowCheckout(false)
      
      // Mostrar mensagem de sucesso (você pode adicionar um toast aqui)
      alert('Pedido enviado com sucesso! Você será redirecionado para o WhatsApp.')
      
    } catch (error) {
      console.error('Erro ao processar pedido:', error)
      alert('Erro ao processar pedido. Tente novamente.')
    }
  }

  // Get featured products from all categories
  const featuredProducts = categories.flatMap(category => 
    category.products.filter(product => product.isFeatured)
  )

  // Renderização de loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Carregando restaurante...</h3>
            <p className="text-muted-foreground text-sm">
              Preparando cardápio e configurações
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Renderização de erro
  if (hasError || !restaurant) {
    const getErrorTitle = () => {
      if (error?.includes('não encontrado') || error?.includes('not found')) {
        return 'Restaurante não encontrado'
      }
      if (error?.includes('servidor') || error?.includes('server')) {
        return 'Erro do servidor'
      }
      if (error?.includes('rede') || error?.includes('network')) {
        return 'Erro de conexão'
      }
      return 'Ops! Algo deu errado'
    }

    const getErrorEmoji = () => {
      if (error?.includes('não encontrado') || error?.includes('not found')) {
        return '🔍'
      }
      if (error?.includes('servidor') || error?.includes('server')) {
        return '🔧'
      }
      if (error?.includes('rede') || error?.includes('network')) {
        return '📡'
      }
      return '😔'
    }

    const getHelpText = () => {
      if (error?.includes('não encontrado') || error?.includes('not found')) {
        return 'Verifique se o endereço está correto ou se o restaurante ainda está ativo.'
      }
      if (error?.includes('servidor') || error?.includes('server')) {
        return 'Nossos servidores estão com problemas temporários. Tente novamente em alguns minutos.'
      }
      if (error?.includes('rede') || error?.includes('network')) {
        return 'Verifique sua conexão com a internet e tente novamente.'
      }
      return 'Ocorreu um erro inesperado. Tente recarregar a página.'
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <Alert className="mb-6" variant={error?.includes('não encontrado') ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Não foi possível carregar os dados do restaurante.'}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold mb-3">{getErrorEmoji()}</h1>
              <h2 className="text-2xl font-bold mb-3">{getErrorTitle()}</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                {getHelpText()}
              </p>
            </div>

            {/* Detalhes técnicos para debug (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && errorDetails && (
              <details className="text-left bg-muted/50 p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium mb-2">Detalhes do erro (desenvolvimento)</summary>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({
                    slug,
                    hasThemeError: errorDetails.hasThemeError,
                    hasMenuError: errorDetails.hasMenuError,
                    themeError: errorDetails.themeError,
                    menuError: errorDetails.menuError,
                    canRetry: errorDetails.canRetry
                  }, null, 2)}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 justify-center">
              {errorDetails?.canRetry !== false && (
                <Button onClick={refreshData} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="default"
                className="gap-2"
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header Fixo */}
      <PublicHeader 
        restaurantStatus={restaurantStatus}
        cartItemCount={cartItemCount}
        onCartClick={() => setShowCart(true)}
        loading={isLoading}
      />

      {/* Seção Hero */}
      <HeroSection 
        restaurantStatus={restaurantStatus}
        onScrollToMenu={scrollToMenu}
        loading={isLoading}
      />

      {/* Produtos em Destaque */}
      {featuredProducts.length > 0 && (
        <FeaturedProducts 
          products={featuredProducts}
          loading={isLoading}
          onAddToCart={addToCart}
        />
      )}

      {/* Header do Menu */}
      {categories.length > 0 && (
        <section className="py-12 bg-muted/20" ref={menuRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Nosso Cardápio
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore todas as categorias dos nossos produtos
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Navegação Fixa */}
      {categories.length > 0 && (
        <CategoryNavigation
          categories={categories}
          activeSection={scrollSpy.activeSection}
          onNavigate={scrollSpy.scrollToSection}
          loading={isLoading}
        />
      )}

      {/* Menu com Scroll Contínuo */}
      {categories.length > 0 ? (
        <div className="space-y-16 py-8">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              onAddToCart={addToCart}
              loading={isLoading}
              scrollSpy={scrollSpy}
            />
          ))}
        </div>
      ) : !isLoading && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="rounded-full bg-muted/50 p-6 mx-auto w-fit mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cardápio em Breve</h3>
              <p className="text-muted-foreground text-sm">
                Estamos preparando nosso cardápio. Volte em breve!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Carrinho Lateral */}
      <CartSheet
        open={showCart}
        onOpenChange={setShowCart}
        cart={cart}
        onUpdateQuantity={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        deliveryFee={restaurant?.deliveryFee || 0}
        minimumOrder={restaurant?.minimumOrder || 0}
      />

      {/* Fluxo de Checkout */}
      <CheckoutFlow
        open={showCheckout}
        onOpenChange={setShowCheckout}
        step={checkoutStep}
        onStepChange={setCheckoutStep}
        checkoutData={checkoutData}
        onDataChange={handleCheckoutDataChange}
        cart={cart}
        deliveryFee={restaurant?.deliveryFee || 0}
        savedAddresses={savedAddresses}
        onConfirmOrder={handleConfirmOrder}
      />
    </div>
  )
}