import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-utils';
import { isRestaurantOpen } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Buscar restaurante
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        phone: true,
        whatsapp: true,
        address: true,
        deliveryFee: true,
        minimumOrder: true,
        deliveryTime: true,
        isActive: true,
        isOpen: true,
        openingHours: true,
        themeConfig: true
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    if (!restaurant.isActive) {
      return NextResponse.json(
        { error: 'Restaurante não está ativo' },
        { status: 404 }
      );
    }

    // Verificar se está aberto baseado no horário
    const isCurrentlyOpen = restaurant.isOpen && isRestaurantOpen(restaurant.openingHours);

    return NextResponse.json({
      success: true,
      data: {
        ...restaurant,
        isCurrentlyOpen
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
} 