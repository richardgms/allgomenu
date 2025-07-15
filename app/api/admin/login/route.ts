import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateMethod, handleApiError } from '@/lib/api-utils';
import { validateEmail } from '@/lib/utils';
import { generateJWT } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

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

    // Buscar usuário no banco
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
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isPasswordValid = profile.password ? await bcrypt.compare(password, profile.password) : false;
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!profile.restaurant?.isActive) {
      return NextResponse.json(
        { error: 'Restaurante desativado' },
        { status: 403 }
      );
    }

    // Gerar token JWT
    const token = generateJWT({
      userId: profile.id,
      email: profile.email!,
      role: profile.role,
      restaurantId: profile.restaurantId!,
    });

    // Atualizar último login
    await db.profile.update({
      where: { id: profile.id },
      data: { lastLogin: new Date() }
    });

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: profile.id,
          email: profile.email!,
          name: (profile.fullName ?? profile.email!) as string,
          role: profile.role,
          restaurantId: profile.restaurantId
        },
        restaurant: {
          id: profile.restaurant!.id,
          slug: profile.restaurant!.slug,
          name: profile.restaurant!.name
        },
        token
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
} 