'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  growth?: number
  progress?: number
  icon?: React.ReactNode
  loading?: boolean
  variant?: 'default' | 'revenue' | 'orders' | 'customers'
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  growth, 
  progress, 
  icon, 
  loading = false,
  variant = 'default',
  className = ''
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[120px] mb-2" />
          <Skeleton className="h-3 w-[80px]" />
        </CardContent>
      </Card>
    )
  }

  const getVariantColor = () => {
    switch (variant) {
      case 'revenue':
        return 'text-green-600 dark:text-green-400'
      case 'orders':
        return 'text-blue-600 dark:text-blue-400'
      case 'customers':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case 'revenue':
        return 'bg-green-50 dark:bg-green-950/20'
      case 'orders':
        return 'bg-blue-50 dark:bg-blue-950/20'
      case 'customers':
        return 'bg-purple-50 dark:bg-purple-950/20'
      default:
        return ''
    }
  }

  return (
    <Card className={`${className} ${getBackgroundColor()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={getVariantColor()}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {subtitle && <span>{subtitle}</span>}
          {growth !== undefined && (
            <Badge 
              variant={growth >= 0 ? "default" : "destructive"}
              className="h-5 px-1 text-xs"
            >
              {growth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(Math.round(growth * 100) / 100)}%
            </Badge>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <Progress 
              value={progress} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progress)}% de progresso
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}