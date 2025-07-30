import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-utils';
import { requestCache, createCacheKey } from '@/lib/request-cache';

interface ProcessedProduct {
  id: string
  name: string
  description: string | null
  price: number
  promotionalPrice: number | null
  imageUrl: string | null
  isFeatured: boolean
  isActive: boolean
  isAvailable: boolean
  order: number
  options: any
  category: string
  hasPromotion: boolean
  discountPercentage?: number
  effectivePrice: number
}

interface ProcessedCategory {
  id: string
  name: string
  description: string | null
  order: number
  isActive: boolean
  productCount: number
  availableCount: number
  featuredCount: number
  products: ProcessedProduct[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Cache completo da consulta do menu para evitar múltiplas consultas
    const cacheKey = createCacheKey('restaurant-menu', slug)
    
    const { restaurant, categories } = await requestCache.deduplicate(
      cacheKey,
      async () => {
        // Verificar se o restaurante existe e está ativo
        const restaurant = await db.restaurant.findUnique({
          where: { slug },
          select: {
            id: true,
            isActive: true,
            isOpen: true
          }
        });

        if (!restaurant || !restaurant.isActive) {
          throw new Error('RESTAURANT_NOT_FOUND');
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
              orderBy: [
                { isFeatured: 'desc' },
                { order: 'asc' },
                { name: 'asc' }
              ]
            }
          },
          orderBy: {
            order: 'asc'
          }
        });

        return { restaurant, categories };
      },
      15000 // Cache por 15 segundos para menu
    );

    // Tratar erro específico de restaurante não encontrado
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    // Processar categorias e produtos com dados enriquecidos
    const processedCategories: ProcessedCategory[] = categories
      .map(category => {
        const processedProducts: ProcessedProduct[] = category.products.map(product => {
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
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            isAvailable: product.isAvailable,
            order: product.order,
            options: product.options,
            category: category.name,
            hasPromotion: hasPromotion || false,
            discountPercentage,
            effectivePrice: effectivePrice || product.price
          }
        })

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          order: category.order,
          isActive: category.isActive,
          productCount: processedProducts.length,
          availableCount: processedProducts.filter(p => p.isAvailable).length,
          featuredCount: processedProducts.filter(p => p.isFeatured).length,
          products: processedProducts
        }
      })
      .filter(category => category.productCount > 0) // Filtrar apenas categorias com produtos

    // Headers para cache - cache mais curto para dados dinâmicos
    const response = NextResponse.json(processedCategories)
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
    
    return response

  } catch (error) {
    console.error('Error fetching menu:', error);
    
    // Tratar erro específico de restaurante não encontrado
    if (error instanceof Error && error.message === 'RESTAURANT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }
    
    return handleApiError(error);
  }
} 