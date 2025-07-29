'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShoppingBag, Clock, AlertCircle } from 'lucide-react'
import { RestaurantStatus } from '@/types/restaurant'

interface PublicHeaderProps {
  restaurantStatus: RestaurantStatus | null
  cartItemCount: number
  onCartClick: () => void
  loading?: boolean
}

export function PublicHeader({ 
  restaurantStatus, 
  cartItemCount, 
  onCartClick, 
  loading = false 
}: PublicHeaderProps) {
  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </header>
    )
  }

  if (!restaurantStatus) return null

  const { restaurant, operationalStatus, deliveryConfig } = restaurantStatus
  const isOpen = operationalStatus.isOpen && operationalStatus.isAcceptingOrders

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo e Info do Restaurante */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage 
                src={restaurant.themeConfig?.logo} 
                alt={restaurant.name} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {restaurant.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="grid gap-1 min-w-0 flex-1">
              <h1 className="text-lg font-semibold leading-none truncate">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={isOpen ? "default" : "destructive"}
                  className="text-xs"
                >
                  <div className="mr-1 h-2 w-2 rounded-full bg-current" />
                  {operationalStatus.currentStatus === 'open' ? 'Aberto' : 'Fechado'}
                </Badge>
                
                {isOpen && (
                  <>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      <Clock className="mr-1 h-3 w-3 inline" />
                      {deliveryConfig.estimatedTime}min
                    </span>
                    {operationalStatus.closesAt && (
                      <span className="text-xs text-muted-foreground hidden md:inline">
                        Fecha às {operationalStatus.closesAt}
                      </span>
                    )}
                  </>
                )}
                
                {!isOpen && operationalStatus.nextOpenTime && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Abre às {operationalStatus.nextOpenTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botão do Carrinho */}
          <div className="flex-shrink-0">
            <Button 
              onClick={onCartClick} 
              className="relative gap-2" 
              size="default"
              disabled={!isOpen}
              variant={isOpen ? "default" : "secondary"}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartItemCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  variant="destructive"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Alert de Status Especial */}
      {operationalStatus.statusMessage && !isOpen && (
        <Alert className="rounded-none border-x-0 border-t-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {operationalStatus.statusMessage}
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}