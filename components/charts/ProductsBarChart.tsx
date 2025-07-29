'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductAnalytics } from '@/stores/useAnalyticsStore'

interface ProductsBarChartProps {
  data: ProductAnalytics[]
  loading?: boolean
  title?: string
  height?: number
  dataKey?: 'sales' | 'revenue'
}

export function ProductsBarChart({ 
  data, 
  loading = false, 
  title = "Produtos Mais Vendidos",
  height = 300,
  dataKey = 'sales'
}: ProductsBarChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 rounded w-full" style={{height: `${height}px`}} />
        </CardContent>
      </Card>
    )
  }

  const formatValue = (value: number) => {
    if (dataKey === 'revenue') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }
    return value.toString()
  }

  const getLabel = () => {
    return dataKey === 'revenue' ? 'Receita' : 'Vendas'
  }

  // Truncar nomes muito longos
  const processedData = data.map(item => ({
    ...item,
    displayName: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart 
            data={processedData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="displayName" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              className="text-xs fill-muted-foreground"
            />
            <YAxis 
              tickFormatter={formatValue}
              className="text-xs fill-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                formatValue(value), 
                getLabel()
              ]}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload
                return item ? item.name : label
              }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))'
              }}
            />
            <Bar 
              dataKey={dataKey}
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}