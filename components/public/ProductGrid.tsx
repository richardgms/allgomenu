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
import { Minus, Plus, Star, Heart, Clock } from 'lucide-react'
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
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
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
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
          <div className="relative overflow-hidden">
            <img
              src={product.imageUrl || '/placeholder-food.jpg'}
              alt={product.name}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Badges de status */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isFeatured && (
                <Badge className="flex items-center gap-1 shadow-lg" variant="default">
                  <Star className="h-3 w-3 fill-current" />
                  Destaque
                </Badge>
              )}
              {product.hasPromotion && product.discountPercentage && (
                <Badge className="shadow-lg" variant="destructive">
                  -{product.discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Overlay quando indisponível */}
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge className="text-base px-4 py-2" variant="secondary">
                  Indisponível
                </Badge>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg leading-tight line-clamp-2 flex-1">
                {product.name}
              </CardTitle>
              {product.isFeatured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0 mt-1" />
              )}
            </div>
            {product.description && (
              <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                {product.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(product.effectivePrice)}
                </span>
                {product.hasPromotion && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!product.isAvailable && (
                  <Badge variant="outline" className="text-xs">
                    Esgotado
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl leading-tight">
                {product.name}
              </DialogTitle>
              {product.description && (
                <DialogDescription className="mt-2 text-sm leading-relaxed">
                  {product.description}
                </DialogDescription>
              )}
            </div>
            {product.isFeatured && (
              <Star className="h-5 w-5 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative">
            <img
              src={product.imageUrl || '/placeholder-food.jpg'}
              alt={product.name}
              className="h-56 w-full object-cover rounded-lg"
            />
            
            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isFeatured && (
                <Badge className="flex items-center gap-1" variant="default">
                  <Star className="h-3 w-3 fill-current" />
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
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.effectivePrice)}
              </span>
              {product.hasPromotion && (
                <span className="text-lg text-muted-foreground line-through">
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