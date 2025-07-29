'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  className?: string
  aspectRatio?: 'square' | 'banner' | 'auto'
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload de Imagem',
  className = '',
  aspectRatio = 'auto'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar preview com o valor quando ele mudar externamente
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('Arquivo selecionado:', file.name, 'Tamanho:', file.size, 'Tipo:', file.type)
    
    setUploading(true)

    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData()
      formData.append('file', file)

      console.log('Enviando arquivo para upload...')

      // Fazer upload para o servidor
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      console.log('Resposta do servidor:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na resposta:', errorData)
        throw new Error(errorData.error || 'Erro no upload da imagem')
      }

      const result = await response.json()
      console.log('Upload bem-sucedido:', result)
      
      // Atualizar preview e valor
      setPreview(result.url)
      onChange(result.url)
      
    } catch (error) {
      console.error('Erro no upload:', error)
      alert(error instanceof Error ? error.message : 'Erro no upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    console.log('Botão clicado!')
    console.log('fileInputRef.current:', fileInputRef.current)
    
    if (fileInputRef.current) {
      console.log('Abrindo seletor de arquivo...')
      fileInputRef.current.click()
    } else {
      console.error('fileInputRef.current é null!')
    }
  }

  const aspectClasses = {
    square: 'aspect-square',
    banner: 'aspect-[3/1]',
    auto: 'aspect-auto'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <Label>{label}</Label>}
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        {preview ? (
          <div className="space-y-4">
            <div className={`relative inline-block ${aspectClasses[aspectRatio]}`}>
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Alterar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <ImageIcon className="mx-auto h-12 w-12" />
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Enviando...' : 'Selecionar Imagem'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF até 5MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}