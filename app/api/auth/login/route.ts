import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateJWT } from '@/lib/jwt'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const profile = await db.profile.findUnique({
      where: { email },
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
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    if (!profile.password) {
      return NextResponse.json(
        { error: 'Usuário não possui senha configurada' },
        { status: 401 }
      )
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, profile.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar se usuário está ativo
    if (!profile.isActive) {
      return NextResponse.json(
        { error: 'Usuário desativado' },
        { status: 401 }
      )
    }

    // Verificar se restaurante existe e está ativo
    if (!profile.restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 401 }
      )
    }

    if (!profile.restaurant.isActive) {
      return NextResponse.json(
        { error: 'Restaurante desativado' },
        { status: 401 }
      )
    }

    // Atualizar último login
    await db.profile.update({
      where: { id: profile.id },
      data: { lastLogin: new Date() }
    })

    // Gerar token JWT
    const token = generateJWT({
      userId: profile.id,
      email: profile.email!,
      role: profile.role,
      restaurantId: profile.restaurantId!
    })

    // Retornar dados de sucesso
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.fullName || profile.email,
        role: profile.role
      },
      restaurant: {
        id: profile.restaurant.id,
        name: profile.restaurant.name,
        slug: profile.restaurant.slug
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}