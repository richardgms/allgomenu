'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { CartItem } from '@/types'

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
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isFeatured: boolean
  options: any
}

interface Category {
  id: string
  name: string
  products: Product[]
}

export default function RestaurantPage() {
  const { slug } = useParams()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menu, setMenu] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchRestaurant()
    fetchMenu()
  }, [slug])

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurant/${slug}`)
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
      const response = await fetch(`/api/restaurant/${slug}/menu`)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
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
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Voltar ao início
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600 mt-2">{restaurant.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>📍 {restaurant.address}</span>
              <span>🕐 {restaurant.deliveryTime} min</span>
              <span>🚚 {formatPrice(restaurant.deliveryFee)}</span>
              <span>📋 Mínimo: {formatPrice(restaurant.minimumOrder)}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2">
            {/* Categorias */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {menu.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
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
                ?.products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex gap-4">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {product.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={!restaurant.isCurrentlyOpen}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Carrinho */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Seu Pedido
              </h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Seu carrinho está vazio
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          +
                        </button>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Taxa de entrega</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  <button
                    disabled={!restaurant.isCurrentlyOpen || cartTotal < restaurant.minimumOrder}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-6 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cartTotal < restaurant.minimumOrder
                      ? `Mínimo: ${formatPrice(restaurant.minimumOrder)}`
                      : 'Finalizar Pedido'
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 