import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-utils';
import { getAuthUser } from '@/lib/auth-supabase';

export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const auth = await getAuthUser(request);
    if (!auth.success) {
      return auth.response!;
    }

    // Retornar dados do usuário
    return NextResponse.json({
      success: true,
      user: auth.user
    });

  } catch (error) {
    return handleApiError(error);
  }
} 