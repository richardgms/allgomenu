'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice, generateColorPalette, applyIntelligentTheme } from '@/lib/utils'
// A interface CartItem será definida localmente para adicionar o campo 'observation'
// import { CartItem } from '@/types'

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  observation?: string;
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
    font: string
  }
  deliveryEnabled: boolean
  whatsapp: string
  deliveryZones?: {
    name: string;
    price: number;
    radius: number;
  }[];
  whatsappTemplate?: string; // Adicionado para armazenar o template personalizado
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
  newAddress?: SavedAddress
  observations: string
  paymentMethod: 'money' | 'card' | 'pix'
  changeFor?: number
}

type CheckoutStep = 'review' | 'customer' | 'address' | 'payment' | 'confirmation'

// Função para converter hex para RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export default function RestaurantPage() {
  const { slug } = useParams()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('review')
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null)
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    name: '',
    phone: '',
    deliveryType: 'delivery',
    observations: '',
    paymentMethod: 'money'
  })
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productQuantity, setProductQuantity] = useState(1)
  const [productObservation, setProductObservation] = useState('')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddress, setNewAddress] = useState<SavedAddress>({
    id: '',
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    zipCode: '',
    reference: ''
  })
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  const isClickScrolling = useRef(false);
  const activeCategoryRef = useRef(activeCategory);
  const scrollSpyTimeout = useRef<NodeJS.Timeout | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  activeCategoryRef.current = activeCategory;

  const scrollToActiveCategory = (categoryId: string) => {
    if (!categoryScrollRef.current) return;
    
    const activeButton = categoryScrollRef.current.querySelector(`[data-category="${categoryId}"]`) as HTMLElement;
    if (!activeButton) return;
    
    const container = categoryScrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    
    // Calcular a posição ideal para centralizar o botão
    const containerCenter = containerRect.width / 2;
    const buttonCenter = buttonRect.left - containerRect.left + buttonRect.width / 2;
    const scrollAmount = buttonCenter - containerCenter;
    
    container.scrollTo({
      left: container.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    isClickScrolling.current = true;
    setActiveCategory(categoryId);

    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerHeight = window.matchMedia("(min-width: 768px)").matches ? 64 : 56;
      const categoryNav = document.getElementById('category-nav-sticky');
      const categoryNavHeight = categoryNav ? categoryNav.offsetHeight : 80;
      const offset = headerHeight + categoryNavHeight;

      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset + 15;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setTimeout(() => {
        isClickScrolling.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    if (menu.length === 0) return;

    const handleScroll = () => {
      if (isClickScrolling.current) return;
      
      if (scrollSpyTimeout.current) clearTimeout(scrollSpyTimeout.current);

      scrollSpyTimeout.current = setTimeout(() => {
        const headerHeight = window.matchMedia("(min-width: 768px)").matches ? 64 : 56;
        const categoryNav = document.getElementById('category-nav-sticky');
        const categoryNavHeight = categoryNav ? categoryNav.offsetHeight : 80;
        const offset = headerHeight + categoryNavHeight;

        let newActiveCategory = '';
        for (const category of menu) {
            const element = document.getElementById(`category-${category.id}`);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= offset) {
                    newActiveCategory = category.id;
                } else {
                    break; 
                }
            }
        }

        if (newActiveCategory && newActiveCategory !== activeCategoryRef.current) {
          setActiveCategory(newActiveCategory);
          // Rolar a barra de categorias para mostrar a categoria ativa
          scrollToActiveCategory(newActiveCategory);
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollSpyTimeout.current) clearTimeout(scrollSpyTimeout.current);
    };
  }, [menu]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${slug}`)
    const savedCustomerData = localStorage.getItem(`customer-data-${slug}`)
    const savedAddressesData = localStorage.getItem(`addresses-${slug}`)

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
      }
    }

    if (savedCustomerData) {
      try {
        const customerData = JSON.parse(savedCustomerData)
        setCheckoutData(prev => ({ ...prev, ...customerData }))
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error)
      }
    }

    if (savedAddressesData) {
      try {
        setSavedAddresses(JSON.parse(savedAddressesData))
      } catch (error) {
        console.error('Erro ao carregar endereços:', error)
      }
    }
  }, [slug])

  // Salvar dados no localStorage
  useEffect(() => {
    if (slug) {
      localStorage.setItem(`cart-${slug}`, JSON.stringify(cart))
    }
  }, [cart, slug])

  useEffect(() => {
    if (slug && (checkoutData.name || checkoutData.phone)) {
      const customerData = {
        name: checkoutData.name,
        phone: checkoutData.phone,
        paymentMethod: checkoutData.paymentMethod
      }
      localStorage.setItem(`customer-data-${slug}`, JSON.stringify(customerData))
    }
  }, [checkoutData.name, checkoutData.phone, checkoutData.paymentMethod, slug])

  useEffect(() => {
    if (slug) {
      localStorage.setItem(`addresses-${slug}`, JSON.stringify(savedAddresses))
    }
  }, [savedAddresses, slug])

  useEffect(() => {
    fetchRestaurant()
    fetchMenu()
    fetchFeaturedProducts()
  }, [slug])

  // Aplicar tema dinamicamente
  useEffect(() => {
    if (restaurant?.themeConfig) {
      const { primaryColor, secondaryColor, font } = restaurant.themeConfig;
      
      // Aplicar tema inteligente baseado na claridade da cor primária
      const intelligentTheme = applyIntelligentTheme(primaryColor || '#DC2626', secondaryColor || '#059669');
      
      // Aplicar cores principais
      document.documentElement.style.setProperty('--primary-color', primaryColor || '#DC2626');
      document.documentElement.style.setProperty('--secondary-color', secondaryColor || '#059669');
      document.documentElement.style.setProperty('--font-family', font || 'Inter');
      
      // Aplicar background inteligente
      document.documentElement.style.setProperty('--page-background', intelligentTheme.backgroundColor);
      document.documentElement.style.setProperty('--button-color', intelligentTheme.buttonColor);
      document.documentElement.style.setProperty('--use-secondary-for-buttons', intelligentTheme.useSecondaryForButtons ? 'true' : 'false');
      
      // Gerar variações das cores para hover e outros estados
      const primaryRgb = hexToRgb(primaryColor || '#DC2626');
      const secondaryRgb = hexToRgb(secondaryColor || '#059669');
      
      if (primaryRgb) {
        document.documentElement.style.setProperty('--primary-dark', `rgb(${Math.max(primaryRgb.r - 30, 0)}, ${Math.max(primaryRgb.g - 30, 0)}, ${Math.max(primaryRgb.b - 30, 0)})`);
        document.documentElement.style.setProperty('--primary-light', `rgb(${Math.min(primaryRgb.r + 30, 255)}, ${Math.min(primaryRgb.g + 30, 255)}, ${Math.min(primaryRgb.b + 30, 255)})`);
      }
      
      if (secondaryRgb) {
        document.documentElement.style.setProperty('--secondary-dark', `rgb(${Math.max(secondaryRgb.r - 30, 0)}, ${Math.max(secondaryRgb.g - 30, 0)}, ${Math.max(secondaryRgb.b - 30, 0)})`);
        document.documentElement.style.setProperty('--secondary-light', `rgb(${Math.min(secondaryRgb.r + 30, 255)}, ${Math.min(secondaryRgb.g + 30, 255)}, ${Math.min(secondaryRgb.b + 30, 255)})`);
      }
      
      // Aplicar fonte
      if (font && font !== 'Inter') {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700;800;900&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        // Aplicar fonte ao body
        document.body.style.fontFamily = font;
      }
    }
  }, [restaurant])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurant/${slug}`)
      const data = await response.json()
      
      if (data.success) {
        setRestaurant(data.data)
      } else {
        setError(data.error || 'Restaurante não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar restaurante')
    }
  }

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/restaurant/${slug}/menu`)
      const data = await response.json()
      
      if (data.success) {
        setMenu(data.data)
        if (data.data.length > 0) {
          setActiveCategory(data.data[0].id)
        }
      } else {
        setError(data.error || 'Erro ao carregar cardápio')
      }
    } catch (err) {
      setError('Erro ao carregar cardápio')
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(`/api/restaurant/${slug}/featured`)
      const data = await response.json()
      
      if (data.success) {
        setFeaturedProducts(data.data)
      } else {
        console.error('Erro ao carregar produtos em destaque:', data.error)
      }
    } catch (err) {
      console.error('Erro ao carregar produtos em destaque:', err)
    }
  }

  const addToCart = (product: Product, quantity: number = 1, observation: string = '') => {
    setCart(prevCart => {
      const trimmedObservation = observation.trim();
      // Tenta encontrar um item existente com a mesma observação para agrupar
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id && (item.observation || '') === trimmedObservation
      );

      if (existingItemIndex > -1) {
        // Se encontrar, atualiza a quantidade
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Senão, adiciona como um novo item
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          imageUrl: product.imageUrl,
          observation: trimmedObservation || undefined,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const handleAddToCartFromModal = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, productQuantity, productObservation);
    setSelectedProduct(null); // Fecha o modal
  };

  const removeFromCart = (productId: string, observation?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.id === productId && (item.observation || '') === (observation || ''))
    ));
  };

  const updateQuantity = (productId: string, quantity: number, observation?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, observation);
      return;
    }
    setCart(prev => prev.map(item =>
      (item.id === productId && (item.observation || '') === (observation || '')) 
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = () => {
    setCart([])
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)
  
  // Calcular taxa de entrega baseada nas zonas configuradas
  const calculateDeliveryFee = () => {
    if (checkoutData.deliveryType !== 'delivery' || !restaurant) {
      return 0;
    }
    
    // Encontrar endereço selecionado diretamente para evitar ReferenceError
    const selectedAddress = savedAddresses.find(addr => addr.id === checkoutData.selectedAddressId);
    
    if (selectedAddress && restaurant.deliveryZones && restaurant.deliveryZones.length > 0) {
      const zone = restaurant.deliveryZones.find(z => z.name === selectedAddress.neighborhood);
      if (zone) {
        return zone.price;
      }
    }
    
    // Fallback para taxa padrão
    return restaurant.deliveryFee || 0;
  };
  
  const deliveryFee = calculateDeliveryFee()
  const finalTotal = cartTotal + Number(deliveryFee)

  const saveAddress = (address: Omit<SavedAddress, 'id'>) => {
    const newAddress: SavedAddress = {
      ...address,
      id: Date.now().toString()
    }

    if (address.isDefault) {
      setSavedAddresses(prev => 
        prev.map(addr => ({ ...addr, isDefault: false }))
      )
    }

    setSavedAddresses(prev => [...prev, newAddress])
    setCheckoutData(prev => ({ ...prev, selectedAddressId: newAddress.id }))
    setShowAddressForm(false)
  }

  const updateAddress = (addressId: string, updatedAddress: Omit<SavedAddress, 'id'>) => {
    if (updatedAddress.isDefault) {
      setSavedAddresses(prev => 
        prev.map(addr => ({ ...addr, isDefault: false }))
      )
    }

    setSavedAddresses(prev => 
      prev.map(addr => 
        addr.id === addressId 
          ? { ...updatedAddress, id: addressId }
          : addr
      )
    )
    setEditingAddress(null)
    setShowAddressForm(false)
  }

  const deleteAddress = (addressId: string) => {
    setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId))
    if (checkoutData.selectedAddressId === addressId) {
      setCheckoutData(prev => ({ ...prev, selectedAddressId: undefined }))
    }
  }

  const getSelectedAddress = () => {
    return savedAddresses.find(addr => addr.id === checkoutData.selectedAddressId)
  }

  const formatAddressForWhatsApp = (address: SavedAddress) => {
    let formatted = `${address.street}, ${address.number}`
    if (address.complement) formatted += ` - ${address.complement}`
    formatted += `\n${address.neighborhood}, ${address.city}`
    if (address.zipCode) formatted += ` - CEP: ${address.zipCode}`
    if (address.reference) formatted += `\nReferência: ${address.reference}`
    return formatted
  }

  const generateWhatsAppMessage = () => {
    if (!restaurant) return ''
    
    let message = `🍽️ *NOVO PEDIDO - ${restaurant.name.toUpperCase()}*\n\n`
    message += `👤 *Cliente:* ${checkoutData.name}\n`
    message += `📱 *Telefone:* ${checkoutData.phone}\n`
    
    if (checkoutData.deliveryType === 'delivery') {
      const address = getSelectedAddress()
      if (address) {
        message += `🚚 *Entrega:*\n${formatAddressForWhatsApp(address)}\n`
      }
    } else {
      message += `🏪 *Retirada no local*\n`
    }
    
    message += `\n📋 *PEDIDO:*\n`
    
    cart.forEach(item => {
      message += `• ${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}\n`
      if (item.observation) {
        message += `  📝 Obs: ${item.observation}\n`
      }
    })
    
    message += `\n💰 *RESUMO:*\n`
    message += `Subtotal: ${formatPrice(cartTotal)}\n`
    
    if (deliveryFee > 0) {
      message += `Taxa de entrega: ${formatPrice(deliveryFee)}\n`
    }
    
    message += `*Total: ${formatPrice(finalTotal)}*\n`
    
    message += `\n💳 *Pagamento:* ${
      checkoutData.paymentMethod === 'money' ? 'Dinheiro' :
      checkoutData.paymentMethod === 'card' ? 'Cartão' : 'PIX'
    }`
    
    if (checkoutData.paymentMethod === 'money' && checkoutData.changeFor) {
      message += ` - Troco para ${formatPrice(checkoutData.changeFor)}`
    }
    
    if (checkoutData.observations) {
      message += `\n\n📝 *Observações:* ${checkoutData.observations}`
    }
    
    message += `\n\n⏰ Pedido feito em: ${new Date().toLocaleString('pt-BR')}`
    
    return message
  }

  const handleCheckout = () => {
    if (!restaurant?.whatsapp) {
      alert('WhatsApp não configurado para este restaurante')
      return
    }
    
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
    
    // Limpar carrinho após envio
    clearCart()
    setShowCart(false)
    setShowCheckout(false)
    setCheckoutStep('review')
    setCheckoutData({
      name: checkoutData.name,
      phone: checkoutData.phone,
      deliveryType: 'delivery',
      observations: '',
      paymentMethod: checkoutData.paymentMethod
    })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
        value = `(${value}`;
    }
    
    setCheckoutData({...checkoutData, phone: value });
  };

  const nextStep = () => {
    const steps: CheckoutStep[] = ['review', 'customer', 'address', 'payment', 'confirmation']
    const currentIndex = steps.indexOf(checkoutStep)
    if (currentIndex < steps.length - 1) {
      setCheckoutStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: CheckoutStep[] = ['review', 'customer', 'address', 'payment', 'confirmation']
    const currentIndex = steps.indexOf(checkoutStep)
    if (currentIndex > 0) {
      setCheckoutStep(steps[currentIndex - 1])
    }
  }

  const canProceedToNextStep = () => {
    switch (checkoutStep) {
      case 'review':
        return cart.length > 0
      case 'customer':
        return checkoutData.name && checkoutData.phone
      case 'address':
        return checkoutData.deliveryType === 'pickup' || checkoutData.selectedAddressId
      case 'payment':
        return checkoutData.paymentMethod
      case 'confirmation':
        return true
      default:
        return false
    }
  }

  const getStepTitle = () => {
    switch (checkoutStep) {
      case 'review': return 'Revisão do Pedido'
      case 'customer': return 'Seus Dados'
      case 'address': return 'Endereço de Entrega'
      case 'payment': return 'Forma de Pagamento'
      case 'confirmation': return 'Confirmação'
      default: return ''
    }
  }

  const getStepNumber = () => {
    const steps: CheckoutStep[] = ['review', 'customer', 'address', 'payment', 'confirmation']
    return steps.indexOf(checkoutStep) + 1
  }

  // Função para obter a cor correta do botão baseado no tema inteligente
  const getButtonColor = () => {
    if (!restaurant?.themeConfig) return '#DC2626';
    
    const { primaryColor, secondaryColor } = restaurant.themeConfig;
    const intelligentTheme = applyIntelligentTheme(primaryColor || '#DC2626', secondaryColor || '#059669');
    
    return intelligentTheme.buttonColor;
  };

  // Função para obter a paleta de cores do botão
  const getButtonColorPalette = () => {
    const buttonColor = getButtonColor();
    return generateColorPalette(buttonColor);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6">{error || 'Restaurante não encontrado'}</p>
            <a 
              href="/admin" 
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              Acessar Painel Admin
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-family, Inter)', backgroundColor: 'var(--page-background, #f9fafb)' }}>
      {/* Header Fixo Mobile-First */}
      <header className="sticky top-0 z-50 bg-white shadow-lg border-b-2" style={{ borderColor: 'var(--primary-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {restaurant.themeConfig?.logo && (
                <img
                  src={restaurant.themeConfig.logo}
                  alt={restaurant.name}
                  className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-xl flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{restaurant.name}</h1>
                <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isCurrentlyOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.isCurrentlyOpen ? '● Aberto' : '● Fechado'}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{restaurant.deliveryTime}min</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Cart Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowCart(true)}
                  className="relative flex items-center gap-2 text-white font-semibold py-1.5 px-4 rounded-xl shadow-md hover:scale-105 transition-transform text-sm"
                  style={{ 
                    backgroundColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primary
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  
                  <div className="sm:hidden">
                    <span className="text-sm font-bold">Carrinho</span>
                  </div>
                  
                  <div className="hidden sm:block text-left">
                    <span className="text-sm font-bold">Ver Carrinho</span>
                    <span className="block text-[10px] font-semibold opacity-90">{cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'} • {formatPrice(cartTotal)}</span>
                  </div>

                  {cartItemCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full text-xs font-bold text-white"
                      style={{ 
                        backgroundColor: getButtonColorPalette().primaryDarker
                      }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Mobile-Optimized */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-4 md:py-8" style={{ 
        background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)` 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg md:text-2xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto font-medium leading-relaxed">
              {restaurant.description}
            </p>
            
            <div className="grid grid-cols-2 gap-3 max-w-4xl mx-auto md:grid-cols-3 md:gap-6">
              {/* Tempo de Entrega */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg md:rounded-2xl md:p-6">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto mb-2 opacity-70 md:w-8 md:h-8 md:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-bold md:text-lg">Entrega</div>
                  <div className="text-lg font-normal opacity-90 md:text-xl">{restaurant.deliveryTime} min</div>
                </div>
              </div>

              {/* Taxa de Entrega / Retirada */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg md:rounded-2xl md:p-6">
                <div className="text-center">
                  {restaurant.deliveryEnabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto mb-2 opacity-70 md:w-8 md:h-8 md:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto mb-2 opacity-70 md:w-8 md:h-8 md:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A2.25 2.25 0 0011.25 11.25H4.5A2.25 2.25 0 002.25 13.5V21M3 3h18M5.25 3v18m13.5-18v18M9 6.75h6.375a.625.625 0 01.625.625v3.75a.625.625 0 01-.625.625H9v-5z" />
                    </svg>
                  )}
                  <div className="text-sm font-bold md:text-lg">
                    {restaurant.deliveryEnabled ? 'Taxa de Entrega' : 'Retirada'}
                  </div>
                  <div className="text-lg font-normal opacity-90 md:text-xl">
                    {restaurant.deliveryEnabled ? formatPrice(restaurant.deliveryFee) : 'No local'}
                  </div>
                </div>
              </div>
              
              {/* Pedido Mínimo */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-lg md:rounded-2xl md:p-6 col-span-2 md:col-span-1">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto mb-2 opacity-70 md:w-8 md:h-8 md:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                  <div className="text-sm font-bold md:text-lg">Pedido Mínimo</div>
                  <div className="text-lg font-normal opacity-90 md:text-xl">{formatPrice(restaurant.minimumOrder)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section Mobile-Optimized */}
      <section className="py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 md:mb-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              Nosso Cardápio
            </h2>
            <p className="text-base md:text-xl text-gray-600 hidden md:block">
              Descubra nossos pratos deliciosos
            </p>
          </div>
        </div>

          {menu.length === 0 ? (
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Cardápio em Preparação</h3>
                <p className="text-gray-600">Nossos pratos estão sendo preparados com carinho.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Category Navigation - Melhorado e Fixo */}
              <div id="category-nav-sticky" className="sticky top-16 md:top-20 z-40 bg-white md:shadow-sm py-2 border-b">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Container centralizado para desktop */}
                  <div className="hidden md:flex justify-center items-center">
                    <div className="flex gap-2 p-1">
                      {menu.map((category) => {
                        const isActive = activeCategory === category.id;
                        const colorPalette = getButtonColorPalette();
                        
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 select-none whitespace-nowrap ${
                              isActive 
                                ? 'text-white shadow-lg transform scale-105' 
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            style={isActive ? { 
                              backgroundColor: colorPalette.primary
                            } : {}}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Scroll horizontal para mobile */}
                  <div className="md:hidden">
                    <div 
                      ref={categoryScrollRef}
                      className="flex overflow-x-auto px-4 gap-3 scrollbar-hide"
                    >
                      {menu.map((category) => {
                        const isActive = activeCategory === category.id;
                        const colorPalette = getButtonColorPalette();
                        
                        return (
                          <button
                            key={category.id}
                            data-category={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 select-none whitespace-nowrap flex-shrink-0 ${
                              isActive 
                                ? 'text-white shadow-lg' 
                                : 'text-gray-700 hover:text-gray-900 border border-gray-200 bg-white hover:shadow-md'
                            }`}
                            style={isActive ? { 
                              backgroundColor: colorPalette.primary
                            } : {}}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Gradiente de scroll indicator */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none">
                      <div className="h-full w-full bg-gradient-to-l from-gray-50 via-gray-50/50 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Products Section */}
              {featuredProducts.length > 0 && (
                <div className="py-6 md:py-8 bg-gray-50 border-b">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">Destaques</h2>
                    </div>

                    <div className="relative">
                      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                        {featuredProducts.map(product => {
                          const colorPalette = getButtonColorPalette();
                          const isAvailable = product.isAvailable !== false;
                          const hasPromo = product.promotionalPrice && product.promotionalPrice < product.price;

                          return (
                            <div
                              key={product.id}
                              className={`flex-shrink-0 w-48 bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ${
                                isAvailable ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (!isAvailable) return;
                                setSelectedProduct(product);
                                setProductQuantity(1);
                                setProductObservation('');
                                setShowProductModal(true);
                              }}
                            >
                              <div className="relative">
                                <img
                                  className="aspect-square w-full object-cover"
                                  src={product.imageUrl || '/placeholder.png'}
                                  alt={product.name}
                                />
                              </div>
                              <div className="p-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {hasPromo ? (
                                    <>
                                      <p className="text-base font-bold text-gray-900">{formatPrice(product.promotionalPrice!)}</p>
                                      <p className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</p>
                                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                        -{Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)}%
                                      </span>
                                    </>
                                  ) : (
                                    <p className="text-base font-bold text-gray-900">{formatPrice(product.price)}</p>
                                  )}
                                </div>

                                <h3 className="mt-2 font-semibold text-gray-700 truncate">{product.name}</h3>

                                <div className="mt-3">
                                  {!isAvailable && (
                                    <div className="w-full text-center text-sm bg-red-500 text-white py-1.5 px-3 rounded-md font-bold">
                                      Esgotado
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Renderização das categorias e produtos */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                {menu.map(category => (
                  <div key={category.id} id={`category-${category.id}`} className="mb-12">
                    {/* Título da categoria */}
                    <div className="mb-4">
                      <h3 className="category-title text-xl md:text-2xl font-bold text-gray-800 mb-4">
                        {category.name}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {category.products.map((product) => {
                        const colorPalette = getButtonColorPalette();
                        
                        return (
                          <button
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product);
                              setProductQuantity(1);
                              setProductObservation('');
                            }}
                            className="w-full text-left bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group select-none flex items-center p-3 border border-gray-100 hover:border-gray-200"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 line-clamp-2 group-hover:text-gray-900">{product.name}</h4>
                              <p className="text-gray-500 text-sm mt-1 line-clamp-1 group-hover:text-gray-600">{product.description}</p>
                              <div className="flex items-center mt-2">
                                <p 
                                  className="font-bold text-lg"
                                  style={{ 
                                    color: colorPalette.primary
                                  }}
                                >
                                  {formatPrice(product.price)}
                                </p>
                                {product.isFeatured && (
                                  <span 
                                    className="ml-2 px-2 py-1 text-xs font-bold rounded-full text-white"
                                    style={{ 
                                      backgroundColor: colorPalette.primaryDark
                                    }}
                                  >
                                    ⭐ Destaque
                                  </span>
                                )}
                              </div>
                            </div>
                            {product.imageUrl && (
                              <div className="w-24 h-24 flex-shrink-0 ml-4">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl"/>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full max-h-[90vh] flex flex-col">
            <div className="relative w-full aspect-square">
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover rounded-t-xl" />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: 0, border: 'none', background: 'none' }}
              >
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '0.75rem',
                    backgroundColor: 'var(--primary-color)',
                    opacity: 0.5,
                  }}
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 relative z-10 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <p className="text-gray-600 mt-2 text-sm">{selectedProduct.description}</p>
              
              <div className="mt-4">
                <label htmlFor="observation" className="block text-sm font-medium text-gray-700">Alguma observação?</label>
                <textarea
                  id="observation"
                  value={productObservation}
                  onChange={(e) => setProductObservation(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2 transition-colors resize-none"
                  placeholder="Ex: bem assadinha, sem coco, etc."
                />
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setProductQuantity(q => Math.max(1, q - 1))} 
                    className="px-4 py-2 text-lg font-bold bg-white hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                    style={{ color: getButtonColorPalette().primary }}
                    disabled={productQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-5 py-2 text-base font-bold text-gray-800 bg-white border-l border-r">{productQuantity}</span>
                  <button 
                    onClick={() => setProductQuantity(q => q + 1)} 
                    className="px-4 py-2 text-lg font-bold bg-white hover:bg-gray-50 transition-colors"
                    style={{ color: getButtonColorPalette().primary }}
                  >
                    +
                  </button>
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCartFromModal}
                  className="flex-1 text-white rounded-xl px-4 py-3 font-bold transition-all duration-300 transform hover:scale-105"
                  style={{
                    backgroundColor: getButtonColorPalette().primary
                  }}
                  onMouseEnter={(e) => {
                    const colorPalette = getButtonColorPalette();
                    e.currentTarget.style.backgroundColor = colorPalette.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    const colorPalette = getButtonColorPalette();
                    e.currentTarget.style.backgroundColor = colorPalette.primary;
                  }}
                >
                  Adicionar {formatPrice(selectedProduct.price * productQuantity)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal do Carrinho */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Meu Carrinho</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Carrinho vazio</h3>
                  <p className="text-gray-600 mb-6">Adicione alguns itens deliciosos do nosso cardápio!</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    style={{ 
                      backgroundColor: getButtonColorPalette().primary
                    }}
                  >
                    Ver Cardápio
                  </button>
                </div>
              ) : (
                <>
                  {/* Lista de itens do carrinho */}
                  <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg"/>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          {item.observation && <p className="text-xs text-gray-500 italic">Obs: {item.observation}</p>}
                          <p className="text-sm text-primary" style={{ color: 'var(--primary-color)' }}>{formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border rounded-xl overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.observation)} className="px-2 py-1 text-sm bg-white hover:bg-gray-100">-</button>
                          <span className="px-3 text-sm bg-white border-l border-r">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.observation)} className="px-2 py-1 text-sm bg-white hover:bg-gray-100">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.observation)} className="text-red-500 hover:text-red-700 pl-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>

                  {/* Resumo do carrinho */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal ({cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'})</span>
                      <span className="font-semibold">{formatPrice(cartTotal)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Taxa de entrega</span>
                        <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span 
                          className="text-lg font-bold"
                          style={{ 
                            color: getButtonColorPalette().primary
                          }}
                        >
                          {formatPrice(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-4">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-3 px-4 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                    >
                      Limpar Carrinho
                    </button>
                    <button
                      onClick={() => {
                        setShowCart(false)
                        setShowCheckout(true)
                      }}
                      disabled={!restaurant.isCurrentlyOpen}
                      className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {restaurant.isCurrentlyOpen ? 'Finalizar Pedido' : 'Restaurante Fechado'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-auto my-8">
            {/* Header com progresso */}
            <div className="p-6 border-b bg-gradient-to-r from-primary to-secondary text-white rounded-t-2xl" style={{ 
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)` 
            }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center justify-between mb-2">
                {['review', 'customer', 'address', 'payment', 'confirmation'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      getStepNumber() > index + 1 ? 'bg-green-500' :
                      getStepNumber() === index + 1 ? 'bg-white' :
                      'bg-white/30'
                    }`}
                    style={getStepNumber() === index + 1 ? { color: getButtonColorPalette().primary } : {}}
                    >
                      {getStepNumber() > index + 1 ? '✓' : index + 1}
                    </div>
                    {index < 4 && (
                      <div className={`w-12 h-1 mx-2 ${
                        getStepNumber() > index + 1 ? 'bg-green-500' : 'bg-white/30'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm opacity-90">
                  Etapa {getStepNumber()} de 5: {getStepTitle()}
                </p>
              </div>
            </div>

            {/* Conteúdo das etapas */}
            <div className="p-6">
              {/* Etapa 1: Revisão do Pedido */}
              {checkoutStep === 'review' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Revise seu pedido</h3>
                    <p className="text-gray-600">Verifique os itens antes de prosseguir</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain rounded"
                                />
                              ) : (
                                <span className="text-lg">🍽️</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{formatPrice(item.price)} cada</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{item.quantity}x</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">{formatPrice(cartTotal)}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxa de entrega</span>
                          <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                          <span className="text-primary" style={{ color: 'var(--primary-color)' }}>
                            {formatPrice(finalTotal)}
                          </span>
                    </div>
                  </div>
                </div>
              </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setShowCheckout(false)
                        setShowCart(true)
                      }}
                      className="text-primary hover:underline"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      Editar carrinho
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 2: Dados do Cliente */}
              {checkoutStep === 'customer' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Seus dados</h3>
                    <p className="text-gray-600">Precisamos de algumas informações para o pedido</p>
                  </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      value={checkoutData.name}
                      onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={checkoutData.phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                      placeholder="(XX) XXXXX-XXXX"
                      required
                    />
                  </div>

                  <div className="md:col-span-2" />
                </div>

                {/* Tipo de Entrega */}
                  {restaurant?.deliveryEnabled && (
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Como você quer receber?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setCheckoutData({...checkoutData, deliveryType: 'delivery'})}
                          className={`p-4 rounded-xl border-2 transition-all ${
                          checkoutData.deliveryType === 'delivery'
                              ? 'text-primary'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={checkoutData.deliveryType === 'delivery' ? {
                          borderColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primary,
                          backgroundColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryVeryLight + '40', // 25% de opacidade
                          color: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryDark
                        } : {}}
                      >
                          <div className="text-2xl mb-2">🚚</div>
                          <div className="font-medium">Entrega</div>
                          <div className="text-sm text-gray-600">
                            Taxa: {formatPrice(restaurant.deliveryFee)}
                          </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutData({...checkoutData, deliveryType: 'pickup'})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          checkoutData.deliveryType === 'pickup'
                              ? 'text-primary'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={checkoutData.deliveryType === 'pickup' ? {
                          borderColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primary,
                          backgroundColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryVeryLight + '40', // 25% de opacidade
                          color: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryDark
                        } : {}}
                      >
                          <div className="text-2xl mb-2">🏪</div>
                          <div className="font-medium">Retirada</div>
                          <div className="text-sm text-gray-600">Sem taxa</div>
                      </button>
                    </div>
                    </div>
                  )}
                  </div>
                )}

              {/* Etapa 3: Endereço */}
              {checkoutStep === 'address' && checkoutData.deliveryType === 'delivery' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Endereço de entrega</h3>
                    <p className="text-gray-600">Onde você quer receber seu pedido?</p>
                  </div>

                  {/* Endereços salvos */}
                  {savedAddresses.length > 0 && (
                  <div>
                      <h4 className="font-medium text-gray-900 mb-3">Endereços salvos</h4>
                      <div className="space-y-3">
                        {savedAddresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              checkoutData.selectedAddressId === address.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setCheckoutData({...checkoutData, selectedAddressId: address.id})}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="font-medium text-gray-900">{address.name}</h5>
                                  {address.isDefault && (
                                    <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                                      Padrão
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {address.street}, {address.number}
                                  {address.complement && ` - ${address.complement}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.neighborhood}, {address.city}
                                </p>
                                {address.reference && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Ref: {address.reference}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingAddress(address)
                                    setShowAddressForm(true)
                                  }}
                                  className="text-primary hover:bg-primary/10 p-1 rounded"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteAddress(address.id)
                                  }}
                                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botão adicionar endereço */}
                  <button
                    onClick={() => {
                      setEditingAddress(null)
                      setShowAddressForm(true)
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <div className="text-2xl mb-2">📍</div>
                    <div className="font-medium text-gray-900">Adicionar novo endereço</div>
                    <div className="text-sm text-gray-600">Cadastre um novo local de entrega</div>
                  </button>
                </div>
              )}

              {/* Etapa 4: Pagamento */}
              {checkoutStep === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Forma de pagamento</h3>
                    <p className="text-gray-600">Como você vai pagar?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setCheckoutData({...checkoutData, paymentMethod: 'money'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        checkoutData.paymentMethod === 'money'
                          ? 'text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={checkoutData.paymentMethod === 'money' ? {
                        borderColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primary,
                        backgroundColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryVeryLight + '40',
                        color: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryDark
                      } : {}}
                    >
                      <div className="text-2xl mb-2">💵</div>
                      <div className="font-medium">Dinheiro</div>
                      <div className="text-sm text-gray-600">Pagamento na entrega</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutData({...checkoutData, paymentMethod: 'card'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        checkoutData.paymentMethod === 'card'
                          ? 'text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={checkoutData.paymentMethod === 'card' ? {
                        borderColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primary,
                        backgroundColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryVeryLight + '40',
                        color: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryDark
                      } : {}}
                    >
                      <div className="text-2xl mb-2">💳</div>
                      <div className="font-medium">Cartão</div>
                      <div className="text-sm text-gray-600">Débito ou crédito</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutData({...checkoutData, paymentMethod: 'pix'})}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        checkoutData.paymentMethod === 'pix'
                          ? 'text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={checkoutData.paymentMethod === 'pix' ? {
                        borderColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primary,
                        backgroundColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryVeryLight + '40',
                        color: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primaryDark
                      } : {}}
                    >
                      <div className="text-2xl mb-2">📱</div>
                      <div className="font-medium">PIX</div>
                      <div className="text-sm text-gray-600">Pagamento instantâneo</div>
                    </button>
                  </div>

                  {checkoutData.paymentMethod === 'money' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precisa de troco? (opcional)
                    </label>
                      <input
                        type="number"
                        value={checkoutData.changeFor || ''}
                        onChange={(e) => setCheckoutData({...checkoutData, changeFor: parseFloat(e.target.value) || undefined})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                        placeholder="R$ 0,00"
                        step="0.01"
                        min={finalTotal}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Total do pedido: {formatPrice(finalTotal)}
                      </p>
                  </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações (opcional)
                  </label>
                  <textarea
                    value={checkoutData.observations}
                    onChange={(e) => setCheckoutData({...checkoutData, observations: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                    placeholder="Alguma observação sobre o pedido?"
                      rows={3}
                  />
                </div>
              </div>
              )}

              {/* Etapa 5: Confirmação */}
              {checkoutStep === 'confirmation' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tudo pronto!</h3>
                    <p className="text-gray-600">Revise os dados e finalize seu pedido</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">👤 Cliente</h4>
                      <p className="text-sm text-gray-600">{checkoutData.name}</p>
                      <p className="text-sm text-gray-600">{checkoutData.phone}</p>
                    </div>

                    {checkoutData.deliveryType === 'delivery' && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">🚚 Entrega</h4>
                        {getSelectedAddress() && (
                          <div className="text-sm text-gray-600">
                            <p>{getSelectedAddress()?.street}, {getSelectedAddress()?.number}</p>
                            <p>{getSelectedAddress()?.neighborhood}, {getSelectedAddress()?.city}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">💳 Pagamento</h4>
                      <p className="text-sm text-gray-600">
                        {checkoutData.paymentMethod === 'money' ? 'Dinheiro' :
                         checkoutData.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                        {checkoutData.changeFor && ` - Troco para ${formatPrice(checkoutData.changeFor)}`}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">📋 Pedido</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="text-gray-600">{formatPrice(cartTotal)}</span>
                        </div>
                        {deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Taxa de entrega</span>
                            <span className="text-gray-600">{formatPrice(deliveryFee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Total</span>
                          <span>{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navegação */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={checkoutStep === 'review' ? () => setShowCheckout(false) : prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {checkoutStep === 'review' ? 'Cancelar' : 'Voltar'}
                </button>

                {checkoutStep === 'confirmation' ? (
                <button
                  onClick={handleCheckout}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                    <span>📱</span>
                    <span>Enviar para WhatsApp</span>
                </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className="px-8 py-3 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    style={{
                      backgroundColor: generateColorPalette(restaurant?.themeConfig?.primaryColor || '#DC2626').primary
                    }}
                  >
                    Continuar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Endereço */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101] p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
              </h2>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data: Omit<SavedAddress, 'id'> = {
                  name: formData.get('name') as string,
                  street: formData.get('street') as string,
                  number: formData.get('number') as string,
                  complement: formData.get('complement') as string,
                  neighborhood: formData.get('neighborhood') as string,
                  city: formData.get('city') as string,
                  zipCode: formData.get('zipCode') as string,
                  reference: formData.get('reference') as string,
                  isDefault: (formData.get('isDefault') as string) === 'on',
                }
                if (editingAddress) {
                  updateAddress(editingAddress.id, data)
                } else {
                  saveAddress(data)
                }
              }} 
              className="p-5 space-y-4 overflow-y-auto"
            >
              {/* Campos do formulário de endereço aqui */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Endereço *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingAddress?.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                  placeholder="Ex: Casa, Trabalho"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rua *
                  </label>
                  <input
                    type="text"
                    name="street"
                    defaultValue={editingAddress?.street}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                    placeholder="Nome da rua"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    name="number"
                    defaultValue={editingAddress?.number}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              {/* ... (outros campos do formulário) ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  defaultValue={editingAddress?.complement}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                  placeholder="Apto, bloco, casa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro *
                  </label>
                  {restaurant?.deliveryZones && restaurant.deliveryZones.length > 0 ? (
                    <select
                      name="neighborhood"
                      defaultValue={editingAddress?.neighborhood || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2 bg-white"
                      required
                    >
                      <option value="" disabled>Selecione um bairro</option>
                      {restaurant.deliveryZones.map(zone => (
                        <option key={zone.name} value={zone.name}>
                          {zone.name} - {formatPrice(zone.price)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="neighborhood"
                      defaultValue={editingAddress?.neighborhood}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                      placeholder="Bairro"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={editingAddress?.city}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                    placeholder="Cidade"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  name="zipCode"
                  defaultValue={editingAddress?.zipCode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ponto de referência
                </label>
                <input
                  type="text"
                  name="reference"
                  defaultValue={editingAddress?.reference}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-primary focus:ring-primary/20 focus:ring-2"
                  placeholder="Próximo ao..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  defaultChecked={editingAddress?.isDefault}
                  className="w-4 h-4 text-primary border-gray-300 rounded-md focus:ring-primary"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Definir como endereço padrão
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  {editingAddress ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 