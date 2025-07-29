'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, MapPin, Phone, Star, Truck, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { RestaurantStatus } from '@/types/restaurant'

interface HeroSectionProps {
  restaurantStatus: RestaurantStatus | null
  onScrollToMenu: () => void
  loading?: boolean
}

export function HeroSection({ restaurantStatus, onScrollToMenu, loading = false }: HeroSectionProps) {
  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-4xl shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              </div>
              <Skeleton className="h-10 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="text-center">
                <Skeleton className="h-10 w-48 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (!restaurantStatus) return null

  const { restaurant, operationalStatus, deliveryConfig } = restaurantStatus
  const isOpen = operationalStatus.isOpen && operationalStatus.isAcceptingOrders

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-4xl shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4">
              {restaurant.themeConfig?.logo ? (
                <img 
                  src={restaurant.themeConfig.logo} 
                  alt={restaurant.name}
                  className="h-20 w-20 rounded-full object-cover mx-auto shadow-lg ring-4 ring-primary/10"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto shadow-lg ring-4 ring-primary/10">
                  <span className="text-2xl font-bold text-primary">
                    {restaurant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {restaurant.name}
            </CardTitle>
            {restaurant.description && (
              <CardDescription className="text-lg mt-2 max-w-2xl mx-auto">
                {restaurant.description}
              </CardDescription>
            )}
            
            {/* Status Badge Prominente */}
            <div className="flex justify-center mt-4">
              <Badge 
                variant={isOpen ? "default" : "destructive"} 
                className="text-sm px-4 py-2"
              >
                <div className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse" />
                {isOpen ? 'Aceitando Pedidos' : operationalStatus.statusMessage || 'Fechado'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações Operacionais */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {isOpen ? (
                    <>Entrega: {deliveryConfig.estimatedTime} min</>
                  ) : operationalStatus.nextOpenTime ? (
                    <>Abre às {operationalStatus.nextOpenTime}</>
                  ) : (
                    'Horário não disponível'
                  )}
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>
                  {deliveryConfig.isDeliveryEnabled ? 'Entrega disponível' : 'Apenas retirada'}
                </span>
              </div>
              
              {restaurant.phone && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.phone}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Pedido Mínimo e Taxa */}
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                Pedido mínimo: {formatPrice(restaurant.minimumOrder)}
              </Badge>
              
              {deliveryConfig.isDeliveryEnabled && (
                <Badge variant="outline" className="text-base px-4 py-2">
                  Taxa de entrega: {formatPrice(restaurant.deliveryFee)}
                </Badge>
              )}
            </div>

            {/* Informações adicionais quando fechado */}
            {!isOpen && operationalStatus.closesAt && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {operationalStatus.currentStatus === 'open' 
                    ? `Fecha às ${operationalStatus.closesAt}` 
                    : operationalStatus.statusMessage
                  }
                </p>
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center pt-4">
              <Button 
                size="lg" 
                onClick={onScrollToMenu}
                disabled={!isOpen}
                className="px-8 py-3 text-lg"
                variant={isOpen ? "default" : "secondary"}
              >
                {isOpen ? 'Ver Cardápio' : 'Restaurante Fechado'}
              </Button>
              
              {!isOpen && operationalStatus.nextOpenTime && (
                <p className="text-xs text-muted-foreground mt-2">
                  Voltamos às {operationalStatus.nextOpenTime}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}