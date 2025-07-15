import { NextRequest, NextResponse } from 'next/server';

export function handleApiError(error: unknown): NextResponse {
  console.error('Erro na API:', error);
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  );
}

export function validateMethod(request: NextRequest, allowedMethods: string[]): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: 'Método não permitido' },
      { status: 405 }
    );
  }
  return null;
} 