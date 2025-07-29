import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantSlug = searchParams.get('restaurant')
    const daysBack = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '20')
    
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

    // Buscar itens de pedidos no período com informações do produto
    const orderItems = await db.orderItem.findMany({
      where: {
        order: {
          restaurantId: restaurant.id,
          createdAt: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
          }
        }
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Agrupar dados por produto
    const productMap = new Map<string, {
      id: string
      name: string
      category: string
      totalSold: number
      revenue: number
      imageUrl?: string
    }>()

    orderItems.forEach(item => {
      const productId = item.product.id
      const revenue = item.totalPrice instanceof Decimal ? Number(item.totalPrice) : item.totalPrice
      
      if (productMap.has(productId)) {
        const existing = productMap.get(productId)!
        existing.totalSold += item.quantity
        existing.revenue += revenue
      } else {
        productMap.set(productId, {
          id: productId,
          name: item.product.name,
          category: item.product.category.name,
          totalSold: item.quantity,
          revenue: revenue,
          imageUrl: item.product.imageUrl || undefined
        })
      }
    })

    // Converter para array e ordenar por receita
    const productAnalytics = Array.from(productMap.values())
      .map(product => ({
        ...product,
        revenue: Math.round(product.revenue * 100) / 100,
        averageOrderValue: Math.round((product.revenue / product.totalSold) * 100) / 100
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return NextResponse.json(productAnalytics)

  } catch (error) {
    console.error('Erro ao buscar analytics de produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}