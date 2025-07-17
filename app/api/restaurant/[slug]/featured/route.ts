import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Verificar se o restaurante existe e está ativo
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        isActive: true
      }
    });

    if (!restaurant || !restaurant.isActive) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    // Buscar produtos em destaque
    const featuredProducts = await db.product.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
        isFeatured: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        promotionalPrice: true,
        imageUrl: true,
        isFeatured: true,
        isAvailable: true,
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: featuredProducts
    });

  } catch (error) {
    return handleApiError(error);
  }
} 