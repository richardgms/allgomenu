import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('Testando conectividade com Supabase...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Variáveis de ambiente do Supabase não configuradas',
        supabaseUrl: !!supabaseUrl,
        supabaseServiceKey: !!supabaseServiceKey
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Testar listagem de buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        error: 'Erro ao listar buckets',
        details: bucketsError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase estabelecida',
      buckets: buckets?.map(b => b.name) || [],
      totalBuckets: buckets?.length || 0
    })

  } catch (error) {
    console.error('Erro no teste do Supabase:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 