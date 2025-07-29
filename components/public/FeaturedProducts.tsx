'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
  onProductClick: (product: Product) => void
}

export function FeaturedProducts({ products, loading = false, onProductClick }: FeaturedProductsProps) {
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
              <Card key={product.id} className="group cursor-pointer transition-all hover:shadow-lg">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.imageUrl || '/placeholder-food.jpg'}
                    alt={product.name}
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {product.promotionalPrice && (
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
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {product.promotionalPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(product.promotionalPrice)}
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
                      onClick={() => onProductClick(product)}
                      disabled={!product.isAvailable}
                    >
                      {product.isAvailable !== false ? 'Adicionar' : 'Indisponível'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}