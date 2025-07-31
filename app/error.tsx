'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para debugging
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-lg space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ocorreu um erro inesperado na aplicação
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-3">😔</h1>
            <h2 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground">
              Um erro inesperado aconteceu. Nossa equipe foi notificada e está trabalhando para resolver.
            </p>
          </div>

          {/* Detalhes do erro (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-muted/50 p-4 rounded-lg text-sm">
              <summary className="cursor-pointer font-medium mb-2">Detalhes do erro (desenvolvimento)</summary>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
            
            <Button asChild variant="default" className="gap-2">
              <a href="/">
                <Home className="h-4 w-4" />
                Voltar ao início
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}