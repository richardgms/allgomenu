import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-utils';
import { getAuthUser } from '@/lib/auth-supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    // Buscar produto
    const product = await db.product.findFirst({
      where: {
        id: params.id,
        restaurantId: auth.user!.restaurantId
      },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se o produto existe e pertence ao restaurante
    const existingProduct = await db.product.findFirst({
      where: {
        id: params.id,
        restaurantId: auth.user!.restaurantId
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
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

    // Atualizar produto
    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        imageUrl,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        options
      },
      include: {
        category: true
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    // Verificar se o produto existe e pertence ao restaurante
    const existingProduct = await db.product.findFirst({
      where: {
        id: params.id,
        restaurantId: auth.user!.restaurantId
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Deletar produto
    await db.product.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
} 