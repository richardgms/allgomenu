'use client'

import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', variant: 'outline' as const }
      case 'confirmed':
        return { label: 'Confirmado', variant: 'default' as const }
      case 'preparing':
        return { label: 'Preparando', variant: 'secondary' as const }
      case 'ready':
        return { label: 'Pronto', variant: 'default' as const }
      case 'out_for_delivery':
        return { label: 'Em entrega', variant: 'default' as const }
      case 'delivered':
        return { label: 'Entregue', variant: 'outline' as const }
      case 'cancelled':
        return { label: 'Cancelado', variant: 'destructive' as const }
      default:
        return { label: status, variant: 'outline' as const }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

// Default export for backwards compatibility
export default StatusBadge