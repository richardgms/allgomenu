import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-utils';
import { verifyJWT } from '@/lib/jwt';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar token JWT
    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar dados do usuário no banco
    const profile = await db.profile.findUnique({
      where: { id: decoded.userId },
      include: {
        restaurant: true
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

    // Retornar dados do usuário
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        name: profile.fullName,
        role: profile.role,
        restaurantId: profile.restaurantId,
        restaurant: profile.restaurant
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
} 