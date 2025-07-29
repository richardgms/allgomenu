'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ShoppingBag } from 'lucide-react'

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
    colorPalette?: {
      primaryLight: string
      primaryBase: string
      primaryDark: string
      secondaryLight: string
      secondaryBase: string
      secondaryDark: string
    }
  }
  deliveryEnabled: boolean
  whatsapp: string
  deliveryZones?: {
    name: string;
    price: number;
    radius: number;
  }[];
  whatsappTemplate?: string;
}

interface PublicHeaderProps {
  restaurant: Restaurant
  cartItemCount: number
  onCartClick: () => void
}

export function PublicHeader({ restaurant, cartItemCount, onCartClick }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo e Info do Restaurante */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={restaurant.themeConfig?.logo} alt={restaurant.name} />
            <AvatarFallback>{restaurant.name?.charAt(0)?.toUpperCase() || 'R'}</AvatarFallback>
          </Avatar>
          
          <div className="grid gap-1 min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate">{restaurant.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={restaurant.isCurrentlyOpen ? "default" : "destructive"} className="text-xs">
                {restaurant.isCurrentlyOpen ? '● Aberto' : '● Fechado'}
              </Badge>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {restaurant.deliveryTime}min
              </span>
            </div>
          </div>
        </div>

        {/* Botão do Carrinho */}
        <div className="flex-shrink-0">
          <Button 
            onClick={onCartClick} 
            className="relative gap-2" 
            size="default"
            style={{ 
              backgroundColor: 'var(--primary-color, hsl(var(--primary)))',
              color: 'white'
            }}
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
  )
}