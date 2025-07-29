import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const restaurant = url.searchParams.get('restaurant')
  
  if (!restaurant) {
    return new Response('Restaurant parameter required', { status: 400 })
  }
  
  // WebSocket upgrade não é suportado diretamente no Next.js API Routes
  // Esta implementação seria para um servidor WebSocket separado
  return new Response('WebSocket upgrade not supported in this context', { status: 400 })
}