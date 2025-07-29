import { v2 as cloudinary } from 'cloudinary';
import { UploadResponse } from '@/types';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: Buffer,
  folder: string = 'allgomenu',
  publicId?: string
): Promise<UploadResponse> {
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${file.toString('base64')}`,
      {
        folder: folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        width: 800,
        height: 600,
        crop: 'limit',
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    // Erro ao fazer upload da imagem
    throw new Error('Falha no upload da imagem');
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Erro ao deletar imagem
    throw new Error('Falha ao deletar imagem');
  }
}

export async function getImageInfo(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    // Erro ao obter informações da imagem
    throw new Error('Falha ao obter informações da imagem');
  }
}

export function generateImageUrl(
  publicId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  }
): string {
  if (!transformations) {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  return cloudinary.url(publicId, {
    secure: true,
    ...transformations,
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.',
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
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0];
    
    return publicId;
  } catch (error) {
    // Erro ao extrair publicId da URL
    return null;
  }
}

export default cloudinary; 