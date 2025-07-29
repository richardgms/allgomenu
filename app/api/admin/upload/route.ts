import { NextRequest, NextResponse } from 'next/server'
import { uploadImageSupabase } from '@/lib/upload-supabase'
import { uploadImageLocal } from '@/lib/upload-local'
import { validateImageFile } from '@/lib/upload-local'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      )
    }

    // Validar o arquivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Verificar se o Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      console.log('Usando Supabase Storage para upload')
      
      try {
        // Usar Supabase Storage
        const uploadResult = await uploadImageSupabase(
          buffer,
          file.name,
          'allgomenu',
          'uploads'
        )

        return NextResponse.json({
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height
        })
      } catch (supabaseError) {
        console.error('Erro no upload do Supabase:', supabaseError)
        
        // Fallback para upload local se Supabase falhar
        console.log('Fazendo fallback para upload local')
        const localResult = await uploadImageLocal(
          buffer,
          file.name,
          'allgomenu'
        )

        return NextResponse.json({
          url: localResult.url,
          publicId: localResult.publicId,
          width: localResult.width,
          height: localResult.height
        })
      }
    } else {
      console.log('Supabase não configurado, usando upload local')
      
      // Usar upload local
      const uploadResult = await uploadImageLocal(
        buffer,
        file.name,
        'allgomenu'
      )

      return NextResponse.json({
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height
      })
    }

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 