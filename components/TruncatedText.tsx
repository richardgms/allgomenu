'use client';

import { useState } from 'react';

interface TruncatedTextProps {
  text: string | null | undefined;
  maxLength: number;
  className?: string;
}

export default function TruncatedText({ text, maxLength, className = '' }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return null;
  }

  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique se propague para outros elementos
    setIsExpanded(!isExpanded);
  };

  return (
    <span className={className}>
      {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      <button 
        onClick={toggleExpanded} 
        className="text-[var(--cor-primaria-500)] hover:text-[var(--cor-primaria-700)] ml-1 font-semibold focus:outline-none transition-colors duration-200"
      >
        {isExpanded ? 'ver menos' : 'ver mais'}
      </button>
    </span>
  );
} 

// components/charts/SalesLineChart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SalesData } from '@/stores/useAnalyticsStore'

interface SalesLineChartProps {
  data: SalesData[]
  loading?: boolean
  title?: string
  height?: number
}

export function SalesLineChart({ 
  data, 
  loading = false, 
  title = "Evolução de Vendas",
  height = 300 
}: SalesLineChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className={`h-[${height}px] w-full`} />
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs fill-muted-foreground"
            />
            <YAxis 
              tickFormatter={formatCurrency}
              className="text-xs fill-muted-foreground"
            />
            <Tooltip 
              labelFormatter={(label) => `Data: ${formatDate(label)}`}
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
