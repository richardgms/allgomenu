'use client'

import { formatPrice } from '@/lib/utils'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isFeatured: boolean
  options: any
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  isRestaurantOpen: boolean
}

export default function ProductCard({ product, onAddToCart, isRestaurantOpen }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await onAddToCart(product)
      // Pequena animação de feedback
      setTimeout(() => setIsLoading(false), 500)
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 select-none">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-white flex items-center justify-center p-4">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-gray-500 text-sm font-medium">Sem imagem</p>
            </div>
          </div>
        )}
        
        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
              <span className="mr-1">⭐</span>
              Destaque
            </div>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full font-bold text-lg shadow-lg">
            {formatPrice(product.price)}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isRestaurantOpen || isLoading}
          className={`
            w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 
            shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            select-none
            ${isRestaurantOpen 
              ? 'bg-primary text-white hover:bg-primary-dark' 
              : 'bg-gray-300 text-gray-500'
            }
          `}
          style={isRestaurantOpen ? { backgroundColor: 'var(--primary-color)' } : {}}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Adicionando...
            </div>
          ) : !isRestaurantOpen ? (
            'Restaurante Fechado'
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">🛒</span>
              Adicionar ao Carrinho
            </div>
          )}
        </button>
      </div>
    </div>
  )
} 