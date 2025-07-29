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
    const previousStartDate = subDays(startDate, daysBack)

    // Buscar pedidos no período atual
    const currentOrders = await db.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        total: true,
        deliveryAddress: true,
        createdAt: true
      }
    })

    // Buscar pedidos do período anterior
    const previousOrders = await db.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startOfDay(previousStartDate),
          lte: endOfDay(subDays(endDate, daysBack))
        }
      },
      select: {
        customerName: true,
        customerPhone: true
      }
    })

    // Analisar clientes
    const currentCustomers = new Set<string>()
    const previousCustomers = new Set<string>()
    const customerOrderData = new Map<string, { orders: number; total: number }>()
    const locationCounts = new Map<string, number>()

    // Processar pedidos atuais
    currentOrders.forEach(order => {
      const customerKey = `${order.customerName}-${order.customerPhone}`
      currentCustomers.add(customerKey)
      
      // Dados de pedidos por cliente
      if (customerOrderData.has(customerKey)) {
        const existing = customerOrderData.get(customerKey)!
        existing.orders += 1
        existing.total += order.total instanceof Decimal ? Number(order.total) : order.total
      } else {
        customerOrderData.set(customerKey, {
          orders: 1,
          total: order.total instanceof Decimal ? Number(order.total) : order.total
        })
      }

      // Extrair localização básica do endereço (primeiras palavras)
      const location = order.deliveryAddress.split(',')[0].trim().split(' ').slice(0, 2).join(' ')
      locationCounts.set(location, (locationCounts.get(location) || 0) + 1)
    })

    // Processar pedidos anteriores
    previousOrders.forEach(order => {
      const customerKey = `${order.customerName}-${order.customerPhone}`
      previousCustomers.add(customerKey)
    })

    // Calcular novos vs retornantes
    const returningCustomers = Array.from(currentCustomers).filter(customer => 
      previousCustomers.has(customer)
    ).length
    
    const newCustomers = currentCustomers.size - returningCustomers

    // Calcular valor médio por pedido
    const totalRevenue = Array.from(customerOrderData.values()).reduce((sum, data) => sum + data.total, 0)
    const totalOrders = currentOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Top localizações
    const topLocations = Array.from(locationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }))

    const analytics = {
      newCustomers,
      returningCustomers,
      totalCustomers: currentCustomers.size,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topLocations
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Erro ao buscar analytics de clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}