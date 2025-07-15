'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { CartItem } from '@/types'
import TruncatedText from '@/components/TruncatedText'

interface Restaurant {
  id: string
  name: string
  description: string
  phone: string
  whatsapp: string
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
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isFeatured: boolean
  isActive: boolean
  options: any
}

interface Category {
  id: string
  name: string
  products: Product[]
}

export default function Home() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showCart, setShowCart] = useState(false)
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'dinheiro',
    deliveryType: 'delivery'
  })

  useEffect(() => {
    fetchRestaurant()
    fetchMenu()
  }, [])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch('/api/restaurant/pizzaria-exemplo')
      const data = await response.json()
      
      if (data.success) {
        setRestaurant(data.data)
        // Aplicar tema personalizado
        if (data.data.themeConfig) {
          const root = document.documentElement
          root.style.setProperty('--primary-color', data.data.themeConfig.primaryColor)
          root.style.setProperty('--secondary-color', data.data.themeConfig.secondaryColor)
        }
      } else {
        setError(data.error || 'Restaurante não encontrado')
      }
    } catch (err) {
      setError('Erro ao carregar restaurante')
    }
  }

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/restaurant/pizzaria-exemplo/menu')
      const data = await response.json()
      
      if (data.success) {
        setMenu(data.data)
        if (data.data.length > 0) {
          setSelectedCategory(data.data[0].id)
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

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl
        }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ))
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const deliveryFee = restaurant?.deliveryFee || 0
  const finalTotal = parseFloat(cartTotal.toString()) + parseFloat(deliveryFee.toString())

  const canFinishOrder = () => {
    return cart.length > 0 && 
           cartTotal >= (restaurant?.minimumOrder || 0) && 
           customerData.name && 
           customerData.phone && 
           customerData.address
  }

  const formatWhatsAppMessage = () => {
    const items = cart.map(item => 
      `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n')
    
    const message = `🍴 *Novo Pedido - ${restaurant?.name}*

👤 *Cliente:* ${customerData.name}
📱 *Telefone:* ${customerData.phone}
📍 *Endereço:* ${customerData.address}

🛍️ *Pedido:*
${items}

💰 *Subtotal:* ${formatPrice(cartTotal)}
🚚 *Taxa de entrega:* ${formatPrice(deliveryFee)}
💳 *Total:* ${formatPrice(finalTotal)}
💳 *Pagamento:* ${customerData.paymentMethod}
🚚 *Entrega:* ${customerData.deliveryType}

---
⏰ Pedido realizado em: ${new Date().toLocaleString('pt-BR')}`

    return encodeURIComponent(message)
  }

  const handleFinishOrder = () => {
    if (!canFinishOrder()) return
    
    const whatsappMessage = formatWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${restaurant?.whatsapp}?text=${whatsappMessage}`
    
    window.open(whatsappUrl, '_blank')
    
    // Limpar carrinho após enviar
    setCart([])
    setShowCart(false)
    setCustomerData({
      name: '',
      phone: '',
      address: '',
      paymentMethod: 'dinheiro',
      deliveryType: 'delivery'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'Restaurante não encontrado'}
          </div>
          <a href="/admin/login" className="text-blue-600 hover:text-blue-800">
            Acessar painel administrativo
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Restaurante */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-gray-600 mt-2">{restaurant.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <span className="mr-1">📍</span>
                    {restaurant.address}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">🕐</span>
                    {restaurant.deliveryTime} min
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">🚚</span>
                    {formatPrice(restaurant.deliveryFee)}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">📋</span>
                    Mínimo: {formatPrice(restaurant.minimumOrder)}
                  </span>
                </div>
              </div>
              
              {/* Botão do Carrinho */}
              {cart.length > 0 && (
                <button
                  onClick={() => setShowCart(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors relative"
                >
                  <span className="flex items-center">
                    🛒 Ver Carrinho
                    <span className="ml-2 bg-red-800 text-white rounded-full px-2 py-1 text-xs">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  </span>
                </button>
              )}
            </div>
            
            {!restaurant.isCurrentlyOpen && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold">
                  ⏰ Restaurante fechado no momento
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categorias */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {menu.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Produtos */}
        <div className="grid gap-4">
          {menu
            .find(cat => cat.id === selectedCategory)
            ?.products.filter(product => product.isActive)
            .map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {product.name}
                          {product.isFeatured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Destaque
                            </span>
                          )}
                        </h3>
                        <TruncatedText 
                          text={product.description} 
                          maxLength={80} 
                          className="text-gray-600 text-sm"
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!restaurant.isCurrentlyOpen}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Produtos em Destaque */}
        {menu.some(cat => cat.products.some(p => p.isFeatured && p.isActive)) && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Produtos em Destaque</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu
                .flatMap(cat => cat.products)
                .filter(product => product.isFeatured && product.isActive)
                .map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <TruncatedText 
                      text={product.description} 
                      maxLength={60} 
                      className="text-gray-600 text-sm mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!restaurant.isCurrentlyOpen}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal do Carrinho */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Seu Pedido</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Itens do Carrinho */}
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Dados do Cliente */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Dados para Entrega</h3>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="tel"
                  placeholder="Seu telefone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <textarea
                  placeholder="Endereço completo"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
                <select
                  value={customerData.paymentMethod}
                  onChange={(e) => setCustomerData({...customerData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                </select>
              </div>

              {/* Resumo do Pedido */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Validação de Pedido Mínimo */}
              {cartTotal < restaurant.minimumOrder && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <p className="text-yellow-800 text-sm">
                    Pedido mínimo: {formatPrice(restaurant.minimumOrder)}
                    <br />
                    Adicione mais {formatPrice(restaurant.minimumOrder - cartTotal)} para continuar
                  </p>
                </div>
              )}

              {/* Botão Finalizar */}
              <button
                onClick={handleFinishOrder}
                disabled={!canFinishOrder()}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
              >
                {canFinishOrder() ? 'Finalizar Pedido' : 'Preencha todos os dados'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link para Admin */}
      <div className="fixed bottom-4 right-4">
        <a
          href="/admin/login"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          Área Admin
        </a>
      </div>
    </div>
  )
} 