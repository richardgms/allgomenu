'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { buildThemeTokens } from '@/lib/color'
import { TabsContent } from '@/components/ui/tabs'

// Componentes refatorados
import { PublicHeader } from '@/components/public/PublicHeader'
import { HeroSection } from '@/components/public/HeroSection'
import { FeaturedProducts } from '@/components/public/FeaturedProducts'
import { CategoryNavigation } from '@/components/public/CategoryNavigation'
import { ProductGrid } from '@/components/public/ProductGrid'
import { CartSheet } from '@/components/public/CartSheet'
import { CheckoutFlow } from '@/components/public/CheckoutFlow'

// Interfaces
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  observation?: string
}

interface Restaurant {
  id: string
  name: string
  description: string
  phone: string
  address: string
  deliveryFee: number
  minimumOrder: number
  deliveryTime: number
  isCurrentlyOpen: boolean
  themeConfig: {
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
  }
  deliveryEnabled: boolean
  whatsapp: string
  deliveryZones?: {
    name: string
    price: number
    radius: number
  }[]
  whatsappTemplate?: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isFeatured: boolean
  options: any
  promotionalPrice?: number
  isAvailable?: boolean
}

interface Category {
  id: string
  name: string
  products: Product[]
}

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
  const { slug } = useParams()
  
  // Estados principais
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados da UI
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('customer')
  const [activeCategory, setActiveCategory] = useState<string>('')
  
  // Estados do checkout
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    name: '',
    phone: '',
    deliveryType: 'delivery',
    observations: '',
    paymentMethod: 'money'
  })
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])

  // Carregar dados do restaurante e menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Buscar dados do restaurante
        const restaurantResponse = await fetch(`/api/restaurant/${slug}`)
        if (!restaurantResponse.ok) {
          throw new Error('Restaurante não encontrado')
        }
        const restaurantData = await restaurantResponse.json()
        setRestaurant(restaurantData)

        // Aplicar tema
        if (restaurantData.themeConfig?.colorPalette) {
          const tokens = buildThemeTokens(restaurantData.themeConfig.colorPalette)
          Object.entries(tokens).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value)
          })
        }

        // Buscar menu
        const menuResponse = await fetch(`/api/restaurant/${slug}/menu`)
        if (menuResponse.ok) {
          const menuData = await menuResponse.json()
          setMenu(menuData)
          
          // Definir categoria ativa inicial
          if (menuData.length > 0) {
            setActiveCategory(menuData[0].id)
          }
        }

        // Buscar produtos em destaque
        const featuredResponse = await fetch(`/api/restaurant/${slug}/featured`)
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedProducts(featuredData)
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${slug}`)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
      }
    }
  }, [slug])

  // Salvar carrinho no localStorage
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`cart-${slug}`, JSON.stringify(cart))
    }
  }, [cart, slug])

  // Funções do carrinho
  const addToCart = (product: Product, quantity: number, observation?: string) => {
    const currentPrice = product.promotionalPrice || product.price
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
        price: currentPrice,
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

      const total = cartSubtotal + restaurant.deliveryFee

      const message = `🍽️ *Novo Pedido - ${restaurant.name}*

👤 *Cliente:* ${checkoutData.name}
📞 *Telefone:* ${checkoutData.phone}

📋 *Itens do Pedido:*
${orderItems}

💰 *Resumo:*
Subtotal: ${formatPrice(cartSubtotal)}
Taxa de entrega: ${formatPrice(restaurant.deliveryFee)}
*Total: ${formatPrice(total)}*

${deliveryInfo}

💳 *Pagamento:* ${paymentInfo}

${checkoutData.observations ? `📝 *Observações:* ${checkoutData.observations}` : ''}

_Pedido realizado através do site ${restaurant.name}_`

      // Gerar URL do WhatsApp
      const whatsappUrl = `https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      
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

  // Renderização de loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando restaurante...</p>
        </div>
      </div>
    )
  }

  // Renderização de erro
  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">😔</h1>
          <h2 className="text-2xl font-bold mb-2">Restaurante não encontrado</h2>
          <p className="text-muted-foreground">{error || 'O restaurante solicitado não existe.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header Fixo */}
      <PublicHeader 
        restaurant={restaurant}
        cartItemCount={cartItemCount}
        onCartClick={() => setShowCart(true)}
      />

      {/* Seção Hero */}
      <HeroSection restaurant={restaurant} />

      {/* Produtos em Destaque */}
      {featuredProducts.length > 0 && (
        <FeaturedProducts 
          products={featuredProducts}
          loading={false}
          onProductClick={(product) => addToCart(product, 1)}
        />
      )}

      {/* Menu Completo */}
      {menu.length > 0 && (
        <CategoryNavigation
          categories={menu}
          selectedCategory={activeCategory}
          onCategorySelect={setActiveCategory}
        >
          {menu.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <ProductGrid 
                products={category.products}
                onAddToCart={addToCart}
              />
            </TabsContent>
          ))}
        </CategoryNavigation>
      )}

      {/* Carrinho Lateral */}
      <CartSheet
        open={showCart}
        onOpenChange={setShowCart}
        cart={cart}
        onUpdateQuantity={updateCartItemQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        deliveryFee={restaurant.deliveryFee}
        minimumOrder={restaurant.minimumOrder}
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
        deliveryFee={restaurant.deliveryFee}
        savedAddresses={savedAddresses}
        onConfirmOrder={handleConfirmOrder}
      />
    </div>
  )
}