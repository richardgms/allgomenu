import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-utils';
import { getAuthUser } from '@/lib/auth-supabase';

export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    // Buscar categorias do restaurante
    const categories = await db.category.findMany({
      where: {
        restaurantId: auth.user!.restaurantId
      },
      include: {
        _count: {
          select: { products: true }
        },
        products: {
          where: { isActive: true },
          select: { id: true, name: true, price: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    const body = await request.json();
    const { name, description, order } = body;

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Criar categoria
    const category = await db.category.create({
      data: {
        name,
        description,
        order: order || 0,
        restaurantId: auth.user!.restaurantId
      }
    });

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    return handleApiError(error);
  }
} 