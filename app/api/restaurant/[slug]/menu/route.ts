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

    // Buscar categorias com produtos
    const categories = await db.category.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true
      },
      include: {
        products: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Filtrar apenas categorias que têm produtos
    const categoriesWithProducts = categories.filter(category => category.products.length > 0);

    return NextResponse.json(categoriesWithProducts);

  } catch (error) {
    return handleApiError(error);
  }
} 