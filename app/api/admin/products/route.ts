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

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Construir filtros
    const where: any = {};
    
    if (restaurantId) {
      where.restaurantId = restaurantId;
    } else {
      // Se não especificar restaurantId, usar o do usuário logado
      where.restaurantId = auth.user!.restaurantId;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar produtos
    const products = await db.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: products
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
    const { name, description, price, category, isAvailable, imageUrl } = body;

    // Validar dados obrigatórios
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Nome, preço e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar produto
    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        isAvailable: isAvailable ?? true,
        imageUrl,
        restaurantId: auth.user!.restaurantId
      }
    });

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    return handleApiError(error);
  }
} 