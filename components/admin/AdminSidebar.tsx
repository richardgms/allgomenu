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
  Headphones,
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
    <div 
      className={cn(
        "flex flex-col h-full border-r",
        isMobile ? "w-80" : "w-64"
      )}
      style={{ 
        backgroundColor: 'var(--card)', 
        borderColor: 'var(--border)' 
      }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href={`/${slug}`} className="flex items-center gap-3 group">
          <div 
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: 'var(--primary-color)',
              opacity: 0.1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.1'
            }}
          >
            <Store className="h-6 w-6" style={{ color: 'var(--primary-color)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-foreground truncate">AllGoMenu</h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Principal
            </h2>
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link key={item.href} href={`/${slug}/admin${item.href}`} onClick={handleItemClick}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: active 
                          ? 'var(--sidebar-item-active)' 
                          : 'var(--sidebar-item-inactive)',
                        color: active 
                          ? 'var(--sidebar-text-active)' 
                          : 'var(--sidebar-text-inactive)',
                        border: active 
                          ? '1px solid var(--sidebar-indicator)' 
                          : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover)'
                          e.currentTarget.style.color = 'var(--sidebar-text-hover)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-item-inactive)'
                          e.currentTarget.style.color = 'var(--sidebar-text-inactive)'
                        }
                      }}
                    >
                      <div 
                        className="p-1 rounded-md transition-colors flex-shrink-0"
                        style={{
                          backgroundColor: active 
                            ? 'var(--sidebar-indicator)' 
                            : 'var(--neutral-100)'
                        }}
                      >
                        <Icon 
                          className="h-4 w-4" 
                          style={{
                            color: active 
                              ? 'var(--sidebar-text-active)' 
                              : 'var(--sidebar-text-inactive)'
                          }}
                        />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
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
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Configurações
            </h2>
            <nav className="space-y-0.5">
              {settingsItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link key={item.href} href={`/${slug}/admin${item.href}`} onClick={handleItemClick}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-2.5 px-3 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: active 
                          ? 'var(--sidebar-item-active)' 
                          : 'var(--sidebar-item-inactive)',
                        color: active 
                          ? 'var(--sidebar-text-active)' 
                          : 'var(--sidebar-text-inactive)',
                        border: active 
                          ? '1px solid var(--sidebar-indicator)' 
                          : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover)'
                          e.currentTarget.style.color = 'var(--sidebar-text-hover)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-item-inactive)'
                          e.currentTarget.style.color = 'var(--sidebar-text-inactive)'
                        }
                      }}
                    >
                      <div 
                        className="p-0.5 rounded-md transition-colors flex-shrink-0"
                        style={{
                          backgroundColor: active 
                            ? 'var(--sidebar-indicator)' 
                            : 'var(--neutral-100)'
                        }}
                      >
                        <Icon 
                          className="h-3.5 w-3.5" 
                          style={{
                            color: active 
                              ? 'var(--sidebar-text-active)' 
                              : 'var(--sidebar-text-inactive)'
                          }}
                        />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                      </div>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </ScrollArea>

      {/* Botão de Suporte */}
      <div className="p-4">
        <Link href="https://wa.me/5583986005326?text=Ol%C3%A1%21%20Preciso%20de%20suporte%20com%20o%20AllGoMenu." target="_blank">
          <Button variant="outline" className="w-full justify-start gap-3 h-11 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200">
            <div className="p-1 bg-primary/10 rounded-md">
              <Headphones className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-sm">Suporte</span>
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/50">
        <Link href={`/${slug}`} target="_blank">
          <Button variant="outline" className="w-full justify-start gap-3 h-11 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200">
            <div className="p-1 bg-secondary/10 rounded-md">
              <Store className="h-4 w-4 text-secondary" />
            </div>
            <span className="font-medium text-sm">Ver Site Público</span>
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