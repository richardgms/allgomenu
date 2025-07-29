'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Settings,
  Palette,
  MapPin,
  Users,
  BarChart3,
  Clock,
  Package,
  CreditCard,
  Bell,
  Store,
  X
} from 'lucide-react'

interface AdminSidebarProps {
  slug: string
  isOpen?: boolean
  onClose?: () => void
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    description: 'Visão geral e métricas'
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    description: 'Relatórios e estatísticas'
  },
  {
    title: 'Cardápio',
    icon: UtensilsCrossed,
    href: '/menu',
    description: 'Gestão de produtos e categorias'
  },
  {
    title: 'Pedidos',
    icon: ShoppingBag,
    href: '/orders',
    description: 'Acompanhar pedidos em tempo real'
  },
  {
    title: 'Personalização',
    icon: Palette,
    href: '/customization',
    description: 'Temas e aparência'
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/settings',
    description: 'Configurações gerais'
  }
]

const settingsItems = [
  {
    title: 'Horários',
    icon: Clock,
    href: '/settings/hours',
    description: 'Horários de funcionamento'
  },
  {
    title: 'Entrega',
    icon: MapPin,
    href: '/settings/delivery',
    description: 'Zona de entrega e taxas'
  },
  {
    title: 'Pagamentos',
    icon: CreditCard,
    href: '/settings/payments',
    description: 'Métodos de pagamento'
  },
  {
    title: 'Notificações',
    icon: Bell,
    href: '/settings/notifications',
    description: 'Configurar alertas'
  },
  {
    title: 'Integrações',
    icon: Package,
    href: '/settings/integrations',
    description: 'WhatsApp e outras integrações'
  }
]

export const AdminSidebar = React.memo(function AdminSidebar({ slug, isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  // Fechar sidebar quando mudar de rota em mobile (somente quando rota mudar de fato)
  useEffect(() => {
    if (isMobile && isOpen && onClose) {
      onClose()
    }
  }, [pathname]) // Removido outras dependências para evitar fechamento indesejado

  const isActive = (href: string) => {
    const fullPath = `/${slug}/admin${href}`
    return pathname === fullPath || pathname.startsWith(fullPath + '/')
  }

  const handleItemClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  const sidebarContent = (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full",
      isMobile ? "w-80" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href={`/${slug}`} className="flex items-center gap-2">
          <Store className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">AllGoMenu</h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Principal
            </h2>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link key={item.href} href={`/${slug}/admin${item.href}`} onClick={handleItemClick}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-auto p-3",
                        active && "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <Separator />

          {/* Settings Navigation */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Configurações
            </h2>
            <nav className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link key={item.href} href={`/${slug}/admin${item.href}`} onClick={handleItemClick}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-auto p-3",
                        active && "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link href={`/${slug}`} target="_blank">
          <Button variant="outline" className="w-full justify-start gap-3">
            <Store className="h-4 w-4" />
            Ver Site Público
          </Button>
        </Link>
      </div>
    </div>
  )

  // Não renderizar durante SSR para evitar hydration mismatch
  if (isMobile === undefined) {
    return null
  }

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={onClose}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="relative h-full">
            {sidebarContent}
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white shadow-sm border border-gray-200"
              onClick={onClose}
              type="button"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </>
    )
  }

  // Desktop sidebar
  return sidebarContent
})