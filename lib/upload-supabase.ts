import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { UploadResponse } from '@/types'

// Cliente admin (service role) – não persiste sessão
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/** Verifica se o bucket existe; se não existir, cria como público */
async function ensureBucketExists(bucket: string) {
  try {
    console.log(`Verificando bucket: ${bucket}`)
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      console.error('Falha ao listar buckets:', listError)
      throw new Error(`Falha ao acessar Storage: ${listError.message}`)
    }

    console.log('Buckets disponíveis:', buckets?.map(b => b.name))
    
    const exists = buckets?.some(b => b.name === bucket)
    if (!exists) {
      console.log(`Bucket "${bucket}" não existe, criando...`)
      
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10 * 1024 * 1024 // 10 MB
      })
      
      if (createError) {
        console.error('Erro ao criar bucket:', createError)
        throw new Error(`Bucket "${bucket}" não pôde ser criado: ${createError.message}`)
      }
      
      console.log(`Bucket "${bucket}" criado com sucesso`)
    } else {
      console.log(`Bucket "${bucket}" já existe`)
    }
  } catch (error) {
    console.error('Erro em ensureBucketExists:', error)
    throw error
  }
}

/**
 * Faz upload de uma imagem para o Supabase Storage e retorna a URL pública.
 * @param buffer Buffer com os bytes da imagem
 * @param originalName Nome original do arquivo (usado para extensão)
 * @param folder Subpasta opcional dentro do bucket
 * @param bucket Nome do bucket (padrão: uploads)
 */
export async function uploadImageSupabase(
  buffer: Buffer,
  originalName: string,
  folder: string = 'allgomenu',
  bucket: string = 'uploads'
): Promise<UploadResponse> {
  try {
    console.log(`Iniciando upload para Supabase: ${originalName}`)
    console.log(`Bucket: ${bucket}, Folder: ${folder}`)
    
    // Garantir que o bucket existe
    await ensureBucketExists(bucket)

    const ext = originalName.split('.').pop() || 'jpg'
    const filePath = `${folder}/${uuidv4()}.${ext}`
    
    console.log(`Caminho do arquivo: ${filePath}`)
    console.log(`Tamanho do buffer: ${buffer.length} bytes`)

    const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
      upsert: false,
      cacheControl: '3600',
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
    })

    if (error) {
      console.error('Erro no upload do Supabase:', error)
      throw new Error(`Erro no upload: ${error.message}`)
    }

    console.log('Upload realizado com sucesso, gerando URL pública...')

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    if (!data || !data.publicUrl) {
      throw new Error('Não foi possível gerar URL pública')
    }

    console.log(`URL pública gerada: ${data.publicUrl}`)

    return {
      url: data.publicUrl,
      publicId: filePath,
      width: 0,
      height: 0
    }
  } catch (error) {
    console.error('Erro em uploadImageSupabase:', error)
    throw error
  }
}

/**
 * Deleta imagem do Supabase Storage usando o publicId retornado no upload.
 */
export async function deleteImageSupabase(publicId: string, bucket: string = 'uploads'): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([publicId])
    if (error) {
      console.error('Erro ao deletar imagem do Supabase:', error)
      throw new Error(`Erro ao deletar imagem: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro em deleteImageSupabase:', error)
    throw error
  }
} 