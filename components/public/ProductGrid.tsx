'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product, quantity: number, observation?: string) => void
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, observation?: string) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

  const currentPrice = product.promotionalPrice || product.price
  const totalPrice = currentPrice * quantity

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer transition-all hover:shadow-md">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={product.imageUrl || '/placeholder-food.jpg'}
              alt={product.name}
              className="h-40 w-full object-cover transition-transform group-hover:scale-105"
            />
            {product.promotionalPrice && (
              <Badge className="absolute top-2 left-2" variant="destructive">
                Promoção
              </Badge>
            )}
            {product.isAvailable === false && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Indisponível</Badge>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {product.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              {product.promotionalPrice ? (
                <div className="space-y-1">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.promotionalPrice)}
                  </span>
                  <br />
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
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <img
              src={product.imageUrl || '/placeholder-food.jpg'}
              alt={product.name}
              className="h-48 w-full object-cover rounded-lg"
            />
            {product.promotionalPrice && (
              <Badge className="absolute top-2 left-2" variant="destructive">
                Promoção
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatPrice(currentPrice)}
            </span>
            {product.promotionalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
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

        <DialogFooter>
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="lg"
            disabled={product.isAvailable === false}
          >
            {product.isAvailable === false 
              ? 'Produto Indisponível' 
              : `Adicionar ao Carrinho - ${formatPrice(totalPrice)}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}