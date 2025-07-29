'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, MapPin, Phone } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

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

interface HeroSectionProps {
  restaurant: Restaurant
}

export function HeroSection({ restaurant }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-12">
      <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-4xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {restaurant.themeConfig?.logo ? (
                <img 
                  src={restaurant.themeConfig.logo} 
                  alt={restaurant.name}
                  className="h-20 w-20 rounded-full object-cover mx-auto shadow-lg"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-2xl font-bold text-primary">
                    {restaurant.name?.charAt(0)?.toUpperCase() || 'R'}
                  </span>
                </div>
              )}
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold">
              {restaurant.name}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {restaurant.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{restaurant.deliveryTime} min</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Entrega disponível</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{restaurant.phone}</span>
              </div>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="text-base px-4 py-2">
                Pedido mínimo: {formatPrice(restaurant.minimumOrder || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}