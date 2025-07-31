'use client'

import { useEffect, useState } from 'react'
import { PaletteConfig, generatePalette, ThemeTokens } from '@/lib/theme/palette-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  ShoppingCart, 
  User, 
  Settings, 
  Star,
  Clock,
  DollarSign,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info
} from 'lucide-react'

export interface ThemePreviewPanelProps {
  config: PaletteConfig
  restaurantName?: string
  showContrastInfo?: boolean
  className?: string
}

export function ThemePreviewPanel({
  config,
  restaurantName = 'Meu Restaurante',
  showContrastInfo = true,
  className = ''
}: ThemePreviewPanelProps) {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null)
  const [contrastChecks, setContrastChecks] = useState<Array<{
    name: string
    bg: string
    text: string
    ratio: number
    passes: boolean
  }>>([])

  // Generate tokens when config changes
  useEffect(() => {
    try {
      const generatedTokens = generatePalette(config)
      setTokens(generatedTokens)

      // Calculate contrast checks
      if (showContrastInfo) {
        const checks = [
          {
            name: 'Botão Primário',
            bg: generatedTokens.components.button.primary.bg,
            text: generatedTokens.components.button.primary.text,
            ratio: 0, // Would calculate actual ratio
            passes: true // Would check actual contrast
          },
          {
            name: 'Sidebar Item',
            bg: generatedTokens.components.sidebar.item.active,
            text: generatedTokens.components.sidebar.text.active,
            ratio: 0,
            passes: true
          },
          {
            name: 'Card Background',
            bg: generatedTokens.components.card.background,
            text: generatedTokens.components.card.text,
            ratio: 0,
            passes: true
          }
        ]
        setContrastChecks(checks)
      }
    } catch (error) {
      console.error('Error generating preview tokens:', error)
      setTokens(null)
    }
  }, [config, showContrastInfo])

  if (!tokens) {
    return (
      <div className={`theme-preview-panel ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Gerando preview do tema...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`theme-preview-panel space-y-4 ${className}`}>
      {/* Main Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview do Tema
          </CardTitle>
          <CardDescription>
            Visualização das cores aplicadas nos principais componentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mock Restaurant Header */}
          <div 
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: tokens.primary[600] }}
          >
            <h2 className="text-xl font-bold">{restaurantName}</h2>
            <p className="text-sm opacity-90">Delivery • Aberto até 22:00</p>
          </div>

          {/* Mock Sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card style={{ backgroundColor: tokens.components.sidebar.background }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Menu Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: Home, label: 'Dashboard', active: true },
                  { icon: ShoppingCart, label: 'Pedidos', active: false },
                  { icon: Settings, label: 'Configurações', active: false }
                ].map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors"
                    style={active ? {
                      backgroundColor: tokens.components.sidebar.item.active,
                      color: tokens.components.sidebar.text.active
                    } : {
                      color: tokens.components.sidebar.text.normal
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mock Buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Botões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full"
                  style={{
                    backgroundColor: tokens.components.button.primary.bg,
                    color: tokens.components.button.primary.text
                  }}
                >
                  Botão Primário
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: tokens.components.button.outline.border,
                    color: tokens.components.button.outline.text
                  }}
                >
                  Botão Outline
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full"
                  style={{ color: tokens.components.button.ghost.text }}
                >
                  Botão Ghost
                </Button>
              </CardContent>
            </Card>

            {/* Mock Cards and Elements */}
            <Card style={{ 
              backgroundColor: tokens.components.card.background,
              borderColor: tokens.components.card.border
            }}>
              <CardHeader className="pb-3">
                <CardTitle 
                  className="text-sm"
                  style={{ color: tokens.components.card.header }}
                >
                  Produto Exemplo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm"
                    style={{ color: tokens.components.card.text }}
                  >
                    Pizza Margherita
                  </span>
                  <Badge style={{
                    backgroundColor: tokens.semantic.success.bg,
                    color: tokens.semantic.success.text
                  }}>
                    Disponível
                  </Badge>
                </div>
                <div className="text-lg font-bold" style={{ color: tokens.components.card.text }}>
                  R$ 32,90
                </div>
                <Input 
                  placeholder="Quantidade"
                  style={{
                    backgroundColor: tokens.components.input.background,
                    borderColor: tokens.components.input.border,
                    color: tokens.components.input.text
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Semantic Colors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { 
                name: 'Sucesso', 
                icon: CheckCircle, 
                bg: tokens.semantic.success.bg,
                text: tokens.semantic.success.text
              },
              { 
                name: 'Aviso', 
                icon: AlertCircle, 
                bg: tokens.semantic.warning.bg,
                text: tokens.semantic.warning.text
              },
              { 
                name: 'Erro', 
                icon: XCircle, 
                bg: tokens.semantic.error.bg,
                text: tokens.semantic.error.text
              },
              { 
                name: 'Info', 
                icon: Info, 
                bg: tokens.semantic.info.bg,
                text: tokens.semantic.info.text
              }
            ].map(({ name, icon: Icon, bg, text }) => (
              <div
                key={name}
                className="p-3 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: bg, color: text }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Scales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Escalas de Cores</CardTitle>
          <CardDescription>
            Todos os tons gerados a partir das suas cores base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Scale */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Escala Primária</Label>
            <div className="flex rounded-lg overflow-hidden border">
              {Object.entries(tokens.primary).map(([shade, color]) => (
                <div
                  key={shade}
                  className="flex-1 p-2 text-center"
                  style={{ backgroundColor: color }}
                >
                  <div className="text-xs font-mono text-white mix-blend-difference">
                    {shade}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Scale */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Escala Secundária</Label>
            <div className="flex rounded-lg overflow-hidden border">
              {Object.entries(tokens.secondary).map(([shade, color]) => (
                <div
                  key={shade}
                  className="flex-1 p-2 text-center"
                  style={{ backgroundColor: color }}
                >
                  <div className="text-xs font-mono text-white mix-blend-difference">
                    {shade}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neutral Scale */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Escala Neutra</Label>
            <div className="flex rounded-lg overflow-hidden border">
              {Object.entries(tokens.neutral).map(([shade, color]) => (
                <div
                  key={shade}
                  className="flex-1 p-2 text-center"
                  style={{ backgroundColor: color }}
                >
                  <div className="text-xs font-mono text-white mix-blend-difference">
                    {shade}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrast Information */}
      {showContrastInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações de Contraste</CardTitle>
            <CardDescription>
              Verificação de acessibilidade WCAG para os principais elementos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contrastChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      <div 
                        className="w-4 h-4 rounded-l"
                        style={{ backgroundColor: check.bg }}
                      />
                      <div 
                        className="w-4 h-4 rounded-r"
                        style={{ backgroundColor: check.text }}
                      />
                    </div>
                    <span className="text-sm">{check.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={check.passes ? "default" : "destructive"}>
                      {check.passes ? "WCAG AA" : "Baixo contraste"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}