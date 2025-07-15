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
    const { 
      name, 
      description, 
      price, 
      categoryId, 
      imageUrl, 
      isFeatured, 
      isActive, 
      order, 
      options 
    } = body;

    // Validar dados obrigatórios
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Nome, preço e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a categoria pertence ao restaurante
    const category = await db.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: auth.user!.restaurantId
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 400 }
      );
    }

    // Criar produto
    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        imageUrl,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        options,
        restaurantId: auth.user!.restaurantId
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
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