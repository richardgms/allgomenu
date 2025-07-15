import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateMethod, handleApiError } from '@/lib/api-utils';
import { validateEmail } from '@/lib/utils';
import { loginWithSupabase } from '@/lib/auth-supabase';

export async function POST(request: NextRequest) {
  try {
    // Validar método
    const methodValidation = validateMethod(request, ['POST']);
    if (methodValidation) return methodValidation;

    const body = await request.json();
    const { email, password } = body;

    // Validar dados de entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Fazer login com Supabase
    const { user, session } = await loginWithSupabase(email, password);

    if (!user || !session) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Buscar perfil do usuário no nosso banco
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
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil de usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!profile.restaurant?.isActive) {
      return NextResponse.json(
        { error: 'Restaurante desativado' },
        { status: 403 }
      );
    }

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: profile.id,
          email: user.email,
          name: profile.fullName || user.email,
          role: profile.role,
          restaurantId: profile.restaurantId
        },
        restaurant: {
          id: profile.restaurant.id,
          slug: profile.restaurant.slug,
          name: profile.restaurant.name
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        }
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
} 