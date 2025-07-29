import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get('restaurant')
    const daysBack = parseInt(searchParams.get('days') || '30')
    
    if (!restaurantSlug) {
      return NextResponse.json(
        { error: 'Slug do restaurante é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar restaurante
    const restaurant = await db.restaurant.findUnique({
      where: { slug: restaurantSlug }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }

    const endDate = new Date()
    const startDate = subDays(endDate, daysBack)

    // Buscar pedidos no período
    const orders = await db.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        customerName: true
      }
    })

    // Gerar array de todos os dias no período
    const allDays = eachDayOfInterval({ start: startDate, end: endDate })

    // Agrupar vendas por dia
    const salesByDay = new Map<string, { revenue: number; orders: number; customers: Set<string> }>()

    // Inicializar todos os dias com valores zero
    allDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd')
      salesByDay.set(dateKey, {
        revenue: 0,
        orders: 0,
        customers: new Set()
      })
    })

    // Processar pedidos
    orders.forEach(order => {
      const dateKey = format(order.createdAt, 'yyyy-MM-dd')
      const dayData = salesByDay.get(dateKey)
      
      if (dayData) {
        dayData.revenue += order.total instanceof Decimal ? Number(order.total) : order.total
        dayData.orders += 1
        dayData.customers.add(order.customerName)
      }
    })

    // Converter para array de dados de vendas
    const salesData = Array.from(salesByDay.entries()).map(([date, data]) => ({
      date: format(new Date(date), 'dd/MM', { locale: ptBR }),
      fullDate: date,
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
      customers: data.customers.size
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

    return NextResponse.json(salesData)

  } catch (error) {
    console.error('Erro ao buscar dados de vendas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}