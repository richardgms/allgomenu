'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Minus, Plus, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ProcessedProduct } from '@/types/restaurant'

interface ProductGridProps {
  products: ProcessedProduct[]
  onAddToCart: (product: ProcessedProduct, quantity: number, observation?: string) => void
  loading?: boolean
}

interface ProductCardProps {
  product: ProcessedProduct
  onAddToCart: (product: ProcessedProduct, quantity: number, observation?: string) => void
}

export function ProductGrid({ products, onAddToCart, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-40 h-32 sm:h-40">
                    <Skeleton className="h-full w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="mx-auto max-w-md">
              <div className="rounded-full bg-muted/50 p-6 mx-auto w-fit mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground text-sm">
                Esta categoria não possui produtos disponíveis no momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [observation, setObservation] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleAddToCart = () => {
    onAddToCart(product, quantity, observation)
    setIsOpen(false)
    setQuantity(1)
    setObservation('')
  }

  const totalPrice = product.effectivePrice * quantity

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer transition-all hover:shadow-lg border-0 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Conteúdo do produto - Lado esquerdo */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Título e badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-2">
                        {product.name}
                      </CardTitle>
                    </div>
                    
                    {/* Badges de status */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.isFeatured && (
                        <Badge className="flex items-center gap-1 text-xs" variant="default">
                          Destaque
                        </Badge>
                      )}
                      {product.hasPromotion && product.discountPercentage && (
                        <Badge className="text-xs" variant="destructive">
                          -{product.discountPercentage}%
                        </Badge>
                      )}
                      {!product.isAvailable && (
                        <Badge variant="outline" className="text-xs">
                          Esgotado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                {product.description && (
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                    {product.description}
                  </CardDescription>
                )}
              </div>
              
              {/* Preço - Parte inferior */}
              <div className="mt-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      {formatPrice(product.effectivePrice)}
                    </span>
                    {product.hasPromotion && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Imagem do produto - Lado direito */}
            <div className="relative w-full sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-44 overflow-hidden">
              <img
                src={product.imageUrl || '/placeholder-food.jpg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Overlay quando indisponível */}
              {!product.isAvailable && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge className="text-sm px-3 py-1" variant="secondary">
                    Indisponível
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <DialogTitle className="text-lg leading-tight">
                {product.name}
              </DialogTitle>
              {product.description && (
                <DialogDescription className="mt-2 text-sm leading-relaxed">
                  {product.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <img
              src={product.imageUrl || '/placeholder-food.jpg'}
              alt={product.name}
              className="aspect-square w-full object-cover rounded-lg"
            />
            
            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {product.isFeatured && (
                <Badge className="flex items-center gap-1" variant="default">
                  Destaque
                </Badge>
              )}
              {product.hasPromotion && product.discountPercentage && (
                <Badge variant="destructive">
                  -{product.discountPercentage}% OFF
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.effectivePrice)}
              </span>
              {product.hasPromotion && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            {product.hasPromotion && product.discountPercentage && (
              <p className="text-sm text-green-600 font-medium">
                Você economiza {formatPrice(product.price - product.effectivePrice)} ({product.discountPercentage}%)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min="1"
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
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          {!product.isAvailable && (
            <div className="w-full text-center py-2 px-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground font-medium">
                Este produto está temporariamente indisponível
              </p>
            </div>
          )}
          
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="lg"
            disabled={!product.isAvailable}
          >
            {!product.isAvailable 
              ? 'Produto Indisponível' 
              : `Adicionar ao Carrinho - ${formatPrice(totalPrice)}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}