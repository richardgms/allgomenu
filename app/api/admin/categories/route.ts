import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'

interface CreateCategoryData {
  name: string
  description?: string
  order?: number
  isActive?: boolean
  restaurantId: string
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

// GET - Listar categorias do restaurante
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const restaurant = searchParams.get('restaurant')

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant parameter is required' },
        { status: 400 }
      )
    }

    // Verificar se o restaurante existe
    const restaurantExists = await db.restaurant.findUnique({
      where: { slug: restaurant },
      select: { id: true }
    })

    if (!restaurantExists) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const categories = await db.category.findMany({
      where: {
        restaurantId: restaurantExists.id
      },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
      productsCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return NextResponse.json(formattedCategories)

  } catch (error) {
    console.error('Error fetching categories:', error)
    return handleApiError(error)
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateCategoryData

    if (!body.name || !body.restaurantId) {
      return NextResponse.json(
        { error: 'Name and restaurantId are required' },
        { status: 400 }
      )
    }

    // Verificar se o restaurante existe
    const restaurantExists = await db.restaurant.findUnique({
      where: { id: body.restaurantId },
      select: { id: true }
    })

    if (!restaurantExists) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Verificar se já existe categoria com mesmo nome no restaurante
    const existingCategory = await db.category.findFirst({
      where: {
        name: body.name,
        restaurantId: body.restaurantId
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    // Se não foi fornecida ordem, usar próxima disponível
    let order = body.order
    if (order === undefined) {
      const lastCategory = await db.category.findFirst({
        where: { restaurantId: body.restaurantId },
        orderBy: { order: 'desc' }
      })
      order = (lastCategory?.order || 0) + 1
    }

    const category = await db.category.create({
      data: {
        name: body.name,
        description: body.description,
        order,
        isActive: body.isActive ?? true,
        restaurantId: body.restaurantId
      },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    const formattedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
      productsCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }

    return NextResponse.json(formattedCategory, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    return handleApiError(error)
  }
}

// PUT - Atualizar categoria
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as UpdateCategoryData

    if (!body.id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Verificar se a categoria existe
    const existingCategory = await db.category.findUnique({
      where: { id: body.id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Se está mudando o nome, verificar duplicatas
    if (body.name && body.name !== existingCategory.name) {
      const duplicateCategory = await db.category.findFirst({
        where: {
          name: body.name,
          restaurantId: existingCategory.restaurantId,
          id: { not: body.id }
        }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updatedCategory = await db.category.update({
      where: { id: body.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: body.isActive })
      },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    const formattedCategory = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      order: updatedCategory.order,
      isActive: updatedCategory.isActive,
      productsCount: updatedCategory._count.products,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt
    }

    return NextResponse.json(formattedCategory)

  } catch (error) {
    console.error('Error updating category:', error)
    return handleApiError(error)
  }
}

// DELETE - Deletar categoria
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('id')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Verificar se a categoria existe e se tem produtos
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products. Move products to another category first.' },
        { status: 409 }
      )
    }

    await db.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })

  } catch (error) {
    console.error('Error deleting category:', error)
    return handleApiError(error)
  }
}