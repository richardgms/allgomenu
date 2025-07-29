import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subDays, startOfDay, endOfDay } from 'date-fns'
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

    // Buscar dados dos pedidos no período
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
        status: true,
        customerName: true
      }
    })

    // Buscar dados do período anterior para comparação
    const previousStartDate = subDays(startDate, daysBack)
    const previousOrders = await db.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startOfDay(previousStartDate),
          lte: endOfDay(subDays(endDate, daysBack))
        }
      },
      select: {
        id: true,
        total: true
      }
    })

    // Calcular métricas atuais    
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.total instanceof Decimal ? Number(order.total) : order.total)
    }, 0)
    
    const totalOrders = orders.length
    const uniqueCustomers = new Set(orders.map(order => order.customerName)).size
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calcular métricas do período anterior
    const previousRevenue = previousOrders.reduce((sum, order) => {
      return sum + (order.total instanceof Decimal ? Number(order.total) : order.total)
    }, 0)
    
    const previousOrderCount = previousOrders.length

    // Calcular mudanças percentuais
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0
    
    const ordersChange = previousOrderCount > 0 
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 
      : 0

    // Buscar total de produtos
    const totalProducts = await db.product.count({
      where: {
        restaurantId: restaurant.id,
        isActive: true
      }
    })

    // Calcular taxa de conversão (pedidos entregues vs total)
    const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length
    const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0

    const analytics = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts,
      totalCustomers: uniqueCustomers,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
      ordersChange: Math.round(ordersChange * 100) / 100
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Erro ao buscar analytics:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}