'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

// Tipos de ícones disponíveis
export type IconName = keyof typeof LucideIcons

interface IconProps {
  name: IconName
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'current'
}

const Icon = ({ 
  name, 
  size = 'md', 
  className,
  color = 'current'
}: IconProps) => {
  const IconComponent = LucideIcons[name] as React.ComponentType<{ className?: string }>
  
  if (!IconComponent) {
    console.warn(`Ícone "${name}" não encontrado`)
    return null
  }

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-500',
    current: 'text-current'
  }

  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

export default Icon

// Ícones específicos para o dashboard - Expandido e mais expressivo
export const DashboardIcons = {
  // Navegação principal
  orders: 'ShoppingBag',
  products: 'Package2',
  categories: 'Grid3X3',
  reports: 'TrendingUp',
  settings: 'Settings2',
  dashboard: 'LayoutDashboard',
  
  // Ações e status
  logout: 'LogOut',
  viewSite: 'ExternalLink',
  edit: 'Edit3',
  add: 'Plus',
  delete: 'Trash2',
  search: 'Search',
  filter: 'Filter',
  
  // Status e indicadores
  status: 'Circle',
  pending: 'Clock',
  active: 'CheckCircle2',
  inactive: 'XCircle',
  warning: 'AlertTriangle',
  
  // Métricas e dados
  revenue: 'DollarSign',
  customers: 'Users2',
  growth: 'TrendingUp',
  decline: 'TrendingDown',
  
  // Interface
  help: 'HelpCircle',
  info: 'Info',
  chevronRight: 'ChevronRight',
  chevronDown: 'ChevronDown',
  moreHorizontal: 'MoreHorizontal',
  menu: 'Menu',
  
  // Ações específicas
  whatsapp: 'MessageCircle',
  phone: 'Phone',
  email: 'Mail',
  image: 'Image',
  upload: 'Upload',
  download: 'Download'
} as const

// Componente específico para ícones do dashboard
interface DashboardIconProps {
  type: keyof typeof DashboardIcons
  size?: IconProps['size']
  className?: string
  color?: IconProps['color']
}

export function DashboardIcon({ type, ...props }: DashboardIconProps) {
  return (
    <Icon 
      name={DashboardIcons[type] as IconName} 
      {...props} 
    />
  )
} 