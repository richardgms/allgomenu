import { NextRequest, NextResponse } from 'next/server'
import { db } from './db'
import { verifyJWT } from './jwt'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  restaurantId: string
  restaurant?: {
    id: string
    name: string
    slug: string
  } | null
}

export async function getAuthUser(request: NextRequest): Promise<{
  success: boolean
  user?: AuthUser
  response?: NextResponse
}> {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Token de acesso necessário' },
          { status: 401 }
        )
      }
    }

    const token = authHeader.substring(7)

    // Primeiro, tentar verificar se é um token JWT emitido pelo sistema
    const decoded = verifyJWT(token)

    if (decoded) {
      // Buscar perfil pelo ID decodificado
      const profile = await db.profile.findUnique({
        where: { id: decoded.userId },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true
            }
          }
        }
      })

      if (!profile) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Perfil de usuário não encontrado' },
            { status: 404 }
          )
        }
      }

      if (!profile.restaurant?.isActive) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Restaurante desativado' },
            { status: 403 }
          )
        }
      }

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email!,
          name: profile.fullName || profile.email!,
          role: profile.role,
          restaurantId: profile.restaurantId!,
          restaurant: profile.restaurant ? {
            id: profile.restaurant.id,
            name: profile.restaurant.name,
            slug: profile.restaurant.slug
          } : null
        }
      }
    }

    // Se não for JWT válido, retornar erro de token inválido
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Erro na autenticação:', error)
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

export async function validateRestaurantAccess(
  userId: string,
  restaurantSlug: string
): Promise<boolean> {
  try {
    const profile = await db.profile.findUnique({
      where: { id: userId },
      include: { restaurant: true }
    })

    if (!profile || !profile.restaurant || profile.restaurant.slug !== restaurantSlug) {
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao validar acesso ao restaurante:', error)
    return false
  }
} 