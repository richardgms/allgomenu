'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Settings, LogOut, Power, PowerOff, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { OrderNotifications } from '@/components/orders/OrderNotifications'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/use-mobile'

interface AdminHeaderProps {
  slug: string
  onMenuToggle?: () => void
}

export const AdminHeader = React.memo(function AdminHeader({ slug, onMenuToggle }: AdminHeaderProps) {
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true)
  // Removido mock notification - usando componente real
  const router = useRouter()
  const { user, restaurant, logout } = useAuth()
  const isMobile = useIsMobile()

  const handleLogout = () => {
    logout()
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onMenuToggle) {
      onMenuToggle()
    }
  }

  // Não renderizar durante SSR para evitar hydration mismatch
  if (isMobile === undefined) {
    return null
  }

  const toggleRestaurantStatus = () => {
    setIsRestaurantOpen(!isRestaurantOpen)
    // Here you would call an API to update the restaurant status
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumb and Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMenuToggle}
            className="lg:hidden p-2 touch-manipulation hover:bg-gray-100 active:bg-gray-200"
            type="button"
            aria-label="Abrir menu"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb - oculto em mobile */}
          <div className="hidden lg:flex items-center gap-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${slug}/admin/dashboard`}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Visão Geral</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Mobile title */}
          <div className="lg:hidden">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notificações de pedidos */}
          <OrderNotifications restaurantSlug={slug} />
          
          {/* Restaurant Status Toggle - simplificado em mobile */}
          <div className="flex items-center gap-2 lg:gap-3">
            {!isMobile && (
              <div className="flex items-center gap-2">
                {isRestaurantOpen ? (
                  <Power className="h-4 w-4 text-green-600" />
                ) : (
                  <PowerOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {isRestaurantOpen ? 'Aberto' : 'Fechado'}
                </span>
              </div>
            )}
            <Switch
              checked={isRestaurantOpen}
              onCheckedChange={toggleRestaurantStatus}
            />
            {!isMobile && (
              <Badge variant={isRestaurantOpen ? 'default' : 'secondary'}>
                {isRestaurantOpen ? 'Online' : 'Offline'}
              </Badge>
            )}
          </div>


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600">{restaurant?.name}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
})