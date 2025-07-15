import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-server'
import { db } from './db'

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

    // Verificar token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        )
      }
    }

    // Buscar dados do usuário no nosso banco (tabela Profile)
    const profile = await db.profile.findUnique({
      where: { id: user.id },
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
        email: user.email!,
        name: profile.fullName || user.email!,
        role: profile.role,
        restaurantId: profile.restaurantId,
        restaurant: profile.restaurant ? {
          id: profile.restaurant.id,
          name: profile.restaurant.name,
          slug: profile.restaurant.slug
        } : null
      }
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

// Função para login (criar sessão Supabase)
export async function loginWithSupabase(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Função para logout
export async function logoutWithSupabase(accessToken: string) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken)
  
  if (error) {
    throw new Error(error.message)
  }
} 