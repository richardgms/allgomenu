'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Truck, Phone, ChevronDown } from 'lucide-react'
import { RestaurantStatus } from '@/types/restaurant'
import { Skeleton } from '@/components/ui/skeleton'

interface HeroSectionProps {
  restaurantStatus: RestaurantStatus
  onScrollToMenu: () => void
  loading?: boolean
}

export function HeroSection({ restaurantStatus, onScrollToMenu, loading = false }: HeroSectionProps) {
  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-6 justify-center">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
  }

  const { restaurant, operationalStatus } = restaurantStatus
  const isOpen = operationalStatus.isOpen && operationalStatus.isAcceptingOrders

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              {/* Header Flexível */}
              <div className="flex flex-wrap items-center justify-center gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {restaurant.themeConfig?.logo ? (
                    <img 
                      src={restaurant.themeConfig.logo} 
                      alt={restaurant.name}
                      className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-primary/10"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shadow-lg ring-4 ring-primary/10">
                      <span className="text-2xl font-bold text-primary">
                        {restaurant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Nome e Descrição */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {restaurant.name}
                  </CardTitle>
                  {restaurant.description && (
                    <CardDescription className="text-lg mt-2 max-w-2xl">
                      {restaurant.description}
                    </CardDescription>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <Badge 
                    variant={isOpen ? "default" : "destructive"} 
                    className="text-sm px-4 py-2"
                  >
                    <div className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse" />
                    {isOpen ? 'Aceitando Pedidos' : operationalStatus.statusMessage || 'Fechado'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Informações Operacionais - Flexbox Dinâmico */}
              <div className="flex flex-wrap gap-4 justify-center">
                {/* Tempo de Entrega */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg flex-1 min-w-0 max-w-xs">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Entrega</p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.deliveryTime || 45} min
                    </p>
                  </div>
                </div>

                {/* Status da Entrega */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg flex-1 min-w-0 max-w-xs">
                  <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Entrega</p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.deliveryFee ? 'Disponível' : 'Indisponível'}
                    </p>
                  </div>
                </div>

                {/* Telefone */}
                {restaurant.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg flex-1 min-w-0 max-w-xs">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Contato</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {restaurant.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações Financeiras - Flexbox Responsivo */}
              <div className="flex flex-wrap gap-4 justify-center">
                {restaurant.minimumOrder && (
                  <div className="p-4 bg-muted/20 rounded-lg text-center flex-1 min-w-0 max-w-xs">
                    <p className="text-sm font-medium">Pedido mínimo</p>
                    <p className="text-lg font-bold text-primary">
                      R$ {restaurant.minimumOrder.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
                
                {restaurant.deliveryFee && (
                  <div className="p-4 bg-muted/20 rounded-lg text-center flex-1 min-w-0 max-w-xs">
                    <p className="text-sm font-medium">Taxa de entrega</p>
                    <p className="text-lg font-bold text-primary">
                      R$ {restaurant.deliveryFee.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
              </div>

              {/* Botão de Ação */}
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={onScrollToMenu}
                  size="lg"
                  className="gap-2"
                >
                  Ver Cardápio
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}