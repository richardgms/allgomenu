'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Minus, Plus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

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

interface FeaturedProductsProps {
  products: Product[]
  loading?: boolean
  onAddToCart: (product: Product, quantity: number, observation?: string) => void
}

interface FeaturedProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, observation?: string) => void
}

export function FeaturedProducts({ products, loading = false, onAddToCart }: FeaturedProductsProps) {
  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
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
        </div>
      </section>
    )
  }

  if (!products.length) {
    return null
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Produtos em Destaque</h2>
            <p className="text-muted-foreground mt-2">
              Nossos pratos mais pedidos e favoritos dos clientes
            </p>
          </div>
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <FeaturedProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedProductCard({ product, onAddToCart }: FeaturedProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [observation, setObservation] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleAddToCart = () => {
    onAddToCart(product, quantity, observation)
    setIsOpen(false)
    setQuantity(1)
    setObservation('')
  }

  const effectivePrice = product.promotionalPrice || product.price
  const totalPrice = effectivePrice * quantity
  const hasPromotion = product.promotionalPrice && product.promotionalPrice < product.price
  const discountPercentage = hasPromotion 
    ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
    : undefined

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer transition-all hover:shadow-lg">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={product.imageUrl || '/placeholder-food.jpg'}
              alt={product.name}
              className="h-48 w-full object-cover transition-transform group-hover:scale-105"
            />
            {hasPromotion && (
              <Badge className="absolute top-2 left-2" variant="destructive">
                Promoção
              </Badge>
            )}
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Indisponível</Badge>
              </div>
            )}
          </div>
          
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="line-clamp-1 flex-1">{product.name}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {product.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {hasPromotion ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.promotionalPrice!)}
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
                disabled={!product.isAvailable}
              >
                {product.isAvailable !== false ? 'Adicionar' : 'Indisponível'}
              </Button>
            </div>
          </CardContent>
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
              <Badge className="flex items-center gap-1" variant="default">
                Destaque
              </Badge>
              {hasPromotion && discountPercentage && (
                <Badge variant="destructive">
                  -{discountPercentage}% OFF
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(effectivePrice)}
              </span>
              {hasPromotion && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            {hasPromotion && discountPercentage && (
              <p className="text-sm text-green-600 font-medium">
                Você economiza {formatPrice(product.price - effectivePrice)} ({discountPercentage}%)
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