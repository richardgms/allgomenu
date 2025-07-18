import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-utils';
import { getAuthUser, validateRestaurantAccess } from '@/lib/auth-supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    // Validar acesso ao restaurante
    const hasAccess = await validateRestaurantAccess(auth.user!.id, params.slug);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Acesso negado a este restaurante' },
        { status: 403 }
      );
    }

    // Buscar dados do restaurante
    const restaurant = await db.restaurant.findUnique({
      where: { slug: params.slug },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            products: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    // Validar acesso ao restaurante
    const hasAccess = await validateRestaurantAccess(auth.user!.id, params.slug);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Acesso negado a este restaurante' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      phone,
      whatsapp,
      address,
      deliveryFee,
      minimumOrder,
      deliveryTime,
      deliveryRadius,
      deliveryEnabled,
      deliveryZones,
      isOpen,
      openingHours,
      themeConfig,
      whatsappTemplate
    } = body;

    // Atualizar restaurante
    const restaurant = await db.restaurant.update({
      where: { slug: params.slug },
      data: {
        name,
        description,
        phone,
        whatsapp,
        address,
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : undefined,
        minimumOrder: minimumOrder ? parseFloat(minimumOrder) : undefined,
        deliveryTime: deliveryTime ? parseInt(deliveryTime) : undefined,
        deliveryRadius: deliveryRadius ? parseFloat(deliveryRadius) : undefined,
        deliveryEnabled: deliveryEnabled !== undefined ? deliveryEnabled : true,
        deliveryZones,
        isOpen,
        openingHours,
        themeConfig,
        whatsappTemplate
      }
    });

    return NextResponse.json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    // Validar acesso ao restaurante
    const hasAccess = await validateRestaurantAccess(auth.user!.id, params.slug);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Acesso negado a este restaurante' },
        { status: 403 }
      );
    }

    // Desativar restaurante (soft delete)
    await db.restaurant.update({
      where: { slug: params.slug },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Restaurante desativado com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
} 