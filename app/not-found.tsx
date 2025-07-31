import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-lg space-y-6">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A página que você está procurando não foi encontrada
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h1 className="text-6xl font-bold mb-3">404</h1>
            <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
            <p className="text-muted-foreground leading-relaxed">
              A página que você está tentando acessar não existe ou foi movida para outro endereço.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Algumas coisas que você pode fazer:
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Verificar se o endereço está digitado corretamente</li>
              <li>• Voltar à página inicial e navegar a partir de lá</li>
              <li>• Usar a busca para encontrar o que procura</li>
            </ul>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline" className="gap-2">
              <a href="javascript:history.back()">
                Voltar
              </a>
            </Button>
            
            <Button asChild variant="default" className="gap-2">
              <a href="/">
                <Home className="h-4 w-4" />
                Página inicial
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}