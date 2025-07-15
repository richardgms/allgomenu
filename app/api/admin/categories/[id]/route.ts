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

    // Buscar categoria
    const category = await db.category.findFirst({
      where: {
        id: params.id,
        restaurantId: auth.user!.restaurantId
      },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
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
    const { name, description, order, isActive } = body;

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe e pertence ao restaurante
    const existingCategory = await db.category.findFirst({
      where: {
        id: params.id,
        restaurantId: auth.user!.restaurantId
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar categoria
    const category = await db.category.update({
      where: { id: params.id },
      data: {
        name,
        description,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
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

    // Verificar se a categoria existe e pertence ao restaurante
    const category = await db.category.findFirst({
      where: {
        id: params.id,
        restaurantId: auth.user!.restaurantId
      },
      include: {
        products: true
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há produtos na categoria
    if (category.products.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir categoria com produtos' },
        { status: 400 }
      );
    }

    // Excluir categoria
    await db.category.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
} 