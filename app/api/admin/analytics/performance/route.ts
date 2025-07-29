import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subDays, startOfDay, endOfDay, getHours } from 'date-fns'

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
        status: true,
        createdAt: true,
        updatedAt: true,
        deliveryType: true
      }
    })

    // Calcular métricas de performance
    const totalOrders = orders.length
    const deliveredOrders = orders.filter(order => order.status === 'DELIVERED')
    const cancelledOrders = orders.filter(order => order.status === 'CANCELLED')

    // Simular tempos de preparo e entrega (em uma implementação real, estes dados viriam do tracking)
    const averagePreparationTime = 25 // minutos (simulado)
    const averageDeliveryTime = 35 // minutos (simulado)

    // Calcular precisão dos pedidos (não cancelados / total)
    const orderAccuracy = totalOrders > 0 ? ((totalOrders - cancelledOrders.length) / totalOrders) * 100 : 100

    // Simular satisfação do cliente
    const customerSatisfaction = 4.2 // de 5 (simulado)

    // Analisar horários de pico
    const hourCounts = new Map<number, number>()
    
    // Inicializar todas as horas
    for (let hour = 0; hour < 24; hour++) {
      hourCounts.set(hour, 0)
    }

    // Contar pedidos por hora
    orders.forEach(order => {
      const hour = getHours(order.createdAt)
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    })

    // Converter para array de horários de pico
    const peakHours = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({
        hour,
        orderCount: count,
        label: `${hour.toString().padStart(2, '0')}:00`
      }))
      .sort((a, b) => b.orderCount - a.orderCount)

    const analytics = {
      averagePreparationTime,
      averageDeliveryTime,
      orderAccuracy: Math.round(orderAccuracy * 100) / 100,
      customerSatisfaction,
      peakHours: peakHours.slice(0, 10), // Top 10 horários
      totalOrders,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      deliveryRate: totalOrders > 0 ? Math.round((deliveredOrders.length / totalOrders) * 100 * 100) / 100 : 0
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Erro ao buscar métricas de performance:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}