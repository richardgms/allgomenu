'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon,
  trend,
  trendLabel,
  className = ''
}: StatCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-gray-600'
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
  }

  const getTrendIcon = () => {
    if (!trend || trend === 0) return null
    return trend > 0 ? '↗' : '↘'
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend !== undefined && trendLabel && (
          <p className={`text-xs ${getTrendColor()} flex items-center gap-1`}>
            {getTrendIcon()}
            {Math.abs(trend)}% {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Default export for backwards compatibility
export default StatCard