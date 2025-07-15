import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadResponse } from '@/types';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// Garantir que o diretório de uploads existe
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadImageLocal(
  file: Buffer,
  originalName: string,
  folder: string = 'allgomenu'
): Promise<UploadResponse> {
  try {
    await ensureUploadDir();
    
    // Gerar nome único para o arquivo
    const extension = originalName.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${extension}`;
    const filePath = join(UPLOAD_DIR, fileName);
    
    // Salvar arquivo
    await fs.writeFile(filePath, file);
    
    // Retornar URL pública
    const publicUrl = `/uploads/${fileName}`;
    
    return {
      url: publicUrl,
      publicId: fileName,
      width: 800, // Valores padrão
      height: 600,
    };
  } catch (error) {
    console.error('Erro ao fazer upload local:', error);
    throw new Error('Falha no upload da imagem');
  }
}

export async function deleteImageLocal(publicId: string): Promise<void> {
  try {
    const filePath = join(UPLOAD_DIR, publicId);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Erro ao deletar imagem local:', error);
    // Não lançar erro se arquivo não existe
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
    };
  }

  return { valid: true };
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    if (url.startsWith('/uploads/')) {
      return url.replace('/uploads/', '');
    }
    return null;
  } catch (error) {
    console.error('Erro ao extrair publicId da URL:', error);
    return null;
  }
} 