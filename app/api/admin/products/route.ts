import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleApiError } from '@/lib/api-utils'

interface CreateProductData {
  name: string
  description?: string
  price: number
  promotionalPrice?: number
  imageUrl?: string
  categoryId: string
  restaurantId: string
  isActive?: boolean
  isFeatured?: boolean
  isAvailable?: boolean
  options?: any
  order?: number
}

interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

// GET - Listar produtos do restaurante
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const restaurant = searchParams.get('restaurant')
    const categoryId = searchParams.get('categoryId')

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant parameter is required' },
        { status: 400 }
      )
    }

    // Verificar se o restaurante existe
    const restaurantData = await db.restaurant.findUnique({
      where: { slug: restaurant },
      select: { id: true }
    })

    if (!restaurantData) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Construir filtros
    const whereClause: any = {
      category: {
        restaurantId: restaurantData.id
      }
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    const formattedProducts = products.map(product => {
      const hasPromotion = product.promotionalPrice && product.promotionalPrice < product.price
      const effectivePrice = hasPromotion ? product.promotionalPrice : product.price
      const discountPercentage = hasPromotion 
        ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
        : undefined

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        promotionalPrice: product.promotionalPrice,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        category: product.category,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isAvailable: product.isAvailable,
        options: product.options,
        order: product.order,
        hasPromotion: hasPromotion || false,
        discountPercentage,
        effectivePrice: effectivePrice || product.price,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    })

    return NextResponse.json(formattedProducts)

  } catch (error) {
    console.error('Error fetching products:', error)
    return handleApiError(error)
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateProductData
    
    // Debug: Log dos dados recebidos
    console.log('Dados recebidos na API:', JSON.stringify(body, null, 2))

    if (!body.name || !body.price || !body.categoryId || !body.restaurantId) {
      return NextResponse.json(
        { error: 'Name, price, categoryId and restaurantId are required' },
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

    // Verificar se a categoria existe e pertence ao restaurante
    const category = await db.category.findFirst({
      where: {
        id: body.categoryId,
        restaurantId: body.restaurantId
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or does not belong to this restaurant' },
        { status: 404 }
      )
    }

    // Verificar se já existe produto com mesmo nome na categoria
    const existingProduct = await db.product.findFirst({
      where: {
        name: body.name,
        categoryId: body.categoryId
      }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this name already exists in this category' },
        { status: 409 }
      )
    }

    // Se não foi fornecida ordem, usar próxima disponível
    let order = body.order
    if (order === undefined) {
      const lastProduct = await db.product.findFirst({
        where: { categoryId: body.categoryId },
        orderBy: { order: 'desc' }
      })
      order = (lastProduct?.order || 0) + 1
    }

    // Preparar dados para criação, removendo valores undefined
    const productData: any = {
      name: body.name,
      description: body.description,
      price: body.price,
      categoryId: body.categoryId,
      restaurantId: body.restaurantId,
      isActive: body.isActive ?? true,
      isFeatured: body.isFeatured ?? false,
      isAvailable: body.isAvailable ?? true,
      order
    }

    // Adicionar campos opcionais apenas se não forem undefined
    if (body.promotionalPrice !== undefined) {
      productData.promotionalPrice = body.promotionalPrice
    }
    if (body.imageUrl !== undefined) {
      productData.imageUrl = body.imageUrl
    }
    if (body.options !== undefined) {
      productData.options = body.options
    }

    // Debug: Log dos dados que serão enviados para o Prisma
    console.log('Dados para o Prisma:', JSON.stringify(productData, null, 2))
    
    const product = await db.product.create({
      data: productData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const hasPromotion = product.promotionalPrice && product.promotionalPrice < product.price
    const effectivePrice = hasPromotion ? product.promotionalPrice : product.price
    const discountPercentage = hasPromotion 
      ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
      : undefined

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      promotionalPrice: product.promotionalPrice,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      category: product.category,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable,
      options: product.options,
      order: product.order,
      hasPromotion: hasPromotion || false,
      discountPercentage,
      effectivePrice: effectivePrice || product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }

    return NextResponse.json(formattedProduct, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return handleApiError(error)
  }
}

// PUT - Atualizar produto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as UpdateProductData

    if (!body.id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verificar se o produto existe
    const existingProduct = await db.product.findUnique({
      where: { id: body.id },
      include: {
        category: {
          select: {
            restaurantId: true,
            id: true,
            name: true
          }
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Se está mudando categoria, verificar se a nova categoria existe
    if (body.categoryId && body.categoryId !== existingProduct.categoryId) {
      const newCategory = await db.category.findFirst({
        where: {
          id: body.categoryId,
          restaurantId: existingProduct.category.restaurantId
        }
      })

      if (!newCategory) {
        return NextResponse.json(
          { error: 'New category not found or does not belong to this restaurant' },
          { status: 404 }
        )
      }
    }

    // Se está mudando o nome, verificar duplicatas na categoria (atual ou nova)
    if (body.name && body.name !== existingProduct.name) {
      const categoryToCheck = body.categoryId || existingProduct.categoryId
      const duplicateProduct = await db.product.findFirst({
        where: {
          name: body.name,
          categoryId: categoryToCheck,
          id: { not: body.id }
        }
      })

      if (duplicateProduct) {
        return NextResponse.json(
          { error: 'Product with this name already exists in this category' },
          { status: 409 }
        )
      }
    }

    const updatedProduct = await db.product.update({
      where: { id: body.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.promotionalPrice !== undefined && { promotionalPrice: body.promotionalPrice }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
        ...(body.options !== undefined && { options: body.options }),
        ...(body.order !== undefined && { order: body.order })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const hasPromotion = updatedProduct.promotionalPrice && updatedProduct.promotionalPrice < updatedProduct.price
    const effectivePrice = hasPromotion ? updatedProduct.promotionalPrice : updatedProduct.price
    const discountPercentage = hasPromotion 
      ? Math.round(((updatedProduct.price - updatedProduct.promotionalPrice!) / updatedProduct.price) * 100)
      : undefined

    const formattedProduct = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      promotionalPrice: updatedProduct.promotionalPrice,
      imageUrl: updatedProduct.imageUrl,
      categoryId: updatedProduct.categoryId,
      category: updatedProduct.category,
      isActive: updatedProduct.isActive,
      isFeatured: updatedProduct.isFeatured,
      isAvailable: updatedProduct.isAvailable,
      options: updatedProduct.options,
      order: updatedProduct.order,
      hasPromotion: hasPromotion || false,
      discountPercentage,
      effectivePrice: effectivePrice || updatedProduct.price,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    }

    return NextResponse.json(formattedProduct)

  } catch (error) {
    console.error('Error updating product:', error)
    return handleApiError(error)
  }
}

// DELETE - Deletar produto
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verificar se o produto existe
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await db.product.delete({
      where: { id: productId }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })

  } catch (error) {
    console.error('Error deleting product:', error)
    return handleApiError(error)
  }
}