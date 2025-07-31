'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ImageUpload'
import { useTheme } from '@/hooks/useAdminApi'
import { useRestaurantTheme } from '@/components/theme/RestaurantThemeProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { 
  Palette, 
  Type, 
  Image, 
  Layout, 
  Eye, 
  Save, 
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle
} from 'lucide-react'

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  logo: string
  bannerImage: string
  restaurantName: string
  description: string
  category: string
}

const themePresets = {
  pizzaria: {
    name: 'Pizzaria',
    primaryColor: '#e74c3c',
    secondaryColor: '#f39c12',
    backgroundColor: '#fff8f0',
    textColor: '#2c3e50',
    description: 'Cores quentes que remetem ao forno e ingredientes frescos'
  },
  hamburgueria: {
    name: 'Hamburgueria',
    primaryColor: '#8b4513',
    secondaryColor: '#ff6b35',
    backgroundColor: '#faf7f2',
    textColor: '#333333',
    description: 'Tons terrosos e vibrantes, perfeitos para hambúrguers artesanais'
  },
  cafeteria: {
    name: 'Cafeteria',
    primaryColor: '#6f4e37',
    secondaryColor: '#d2b48c',
    backgroundColor: '#f5f5dc',
    textColor: '#4a4a4a',
    description: 'Paleta inspirada nos tons do café e ambiente aconchegante'
  },
  sorveteria: {
    name: 'Sorveteria',
    primaryColor: '#ff69b4',
    secondaryColor: '#87ceeb',
    backgroundColor: '#f0f8ff',
    textColor: '#2f4f4f',
    description: 'Cores frescas e divertidas que despertam o apetite por doces'
  },
  saudavel: {
    name: 'Comida Saudável',
    primaryColor: '#2ecc71',
    secondaryColor: '#f39c12',
    backgroundColor: '#f8fff8',
    textColor: '#27ae60',
    description: 'Verde natural e tons orgânicos para alimentação saudável'
  }
}

export default function CustomizationPage() {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isApplyingPreview, setIsApplyingPreview] = useState(false)
  
  // Use o hook da API
  const {
    themeSettings,
    isLoading,
    error,
    updateTheme,
    resetTheme
  } = useTheme()

  // Hook para aplicar preview em tempo real
  const { applyTheme } = useRestaurantTheme()

  // Estado local para edição
  const [settings, setSettings] = useState<ThemeSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    // fontFamily removido - Poppins é padrão global
    logo: '',
    bannerImage: '',
    restaurantName: 'Meu Restaurante',
    description: 'Deliciosas refeições preparadas com carinho',
    category: 'geral'
  })

  const [hasChanges, setHasChanges] = useState(false)

  // Sincronizar com dados da API quando carregados
  useEffect(() => {
    if (themeSettings) {
      setSettings(themeSettings)
      setHasChanges(false)
    }
  }, [themeSettings])



  const updateSetting = (key: keyof ThemeSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const applyPreset = (presetKey: string) => {
    const preset = themePresets[presetKey as keyof typeof themePresets]
    if (preset) {
      setSettings(prev => ({
        ...prev,
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        backgroundColor: preset.backgroundColor,
        textColor: preset.textColor,
        category: presetKey
      }))
      setHasChanges(true)
    }
  }

  const handleSave = async () => {
    try {
      setIsApplyingPreview(true)
      
      // Aplicar preview primeiro
      await applyTheme({
        primaryHex: settings.primaryColor,
        secondaryHex: settings.secondaryColor,
        name: `Preview ${settings.restaurantName}`
      })
      
      // Salvar configurações
      await updateTheme.mutateAsync(settings)
      alert('✅ Configurações salvas com sucesso!')
      setHasChanges(false)
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Erro ao salvar configurações'}`)
    } finally {
      setIsApplyingPreview(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Tem certeza que deseja resetar para o tema padrão?')) return
    
    try {
      await resetTheme.mutateAsync()
      alert('✅ Tema resetado com sucesso!')
      setHasChanges(false)
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Erro ao resetar tema'}`)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar configurações: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🎨 Personalização</h1>
          <p className="text-muted-foreground">
            Customize a aparência do seu restaurante em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isApplyingPreview && (
            <Badge variant="outline" className="animate-pulse">
              <Eye className="h-3 w-3 mr-1" />
              Aplicando preview...
            </Badge>
          )}
          {hasChanges && (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Alterações não salvas
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={handleReset} 
            disabled={!hasChanges || resetTheme.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {resetTheme.isPending ? 'Resetando...' : 'Resetar'}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateTheme.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateTheme.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="preset" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preset">Presets</TabsTrigger>
              <TabsTrigger value="colors">Cores</TabsTrigger>
              <TabsTrigger value="branding">Marca</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Temas Predefinidos
                  </CardTitle>
                  <CardDescription>
                    Escolha um tema que combine com o seu tipo de restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(themePresets).map(([key, preset]) => (
                    <div 
                      key={key} 
                      className={`border rounded-lg p-4 hover:bg-accent cursor-pointer transition-all ${
                        settings.category === key ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => applyPreset(key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          {preset.name}
                          {settings.category === key && <CheckCircle className="h-4 w-4 text-primary" />}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: preset.primaryColor }} 
                            title="Cor Primária"
                          />
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: preset.secondaryColor }} 
                            title="Cor Secundária"
                          />
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: preset.backgroundColor }} 
                            title="Cor de Fundo"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Personalizar Cores
                  </CardTitle>
                  <CardDescription>
                    As mudanças são aplicadas em tempo real no preview e no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">🎯 Cor Primária</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded border cursor-pointer"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="flex-1 font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">🎨 Cor Secundária</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded border cursor-pointer"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="flex-1 font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção de cores extras (menos importante) */}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="backgroundColor">Fundo</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="backgroundColor"
                            type="color"
                            value={settings.backgroundColor}
                            onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                            className="w-12 h-8 p-1 rounded border"
                          />
                          <Input
                            value={settings.backgroundColor}
                            onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                            className="flex-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="textColor">Texto</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="textColor"
                            type="color"
                            value={settings.textColor}
                            onChange={(e) => updateSetting('textColor', e.target.value)}
                            className="w-12 h-8 p-1 rounded border"
                          />
                          <Input
                            value={settings.textColor}
                            onChange={(e) => updateSetting('textColor', e.target.value)}
                            className="flex-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Identidade Visual
                  </CardTitle>
                  <CardDescription>
                    Configure logo, nome e descrição do restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName">Nome do Restaurante</Label>
                    <Input
                      id="restaurantName"
                      value={settings.restaurantName}
                      onChange={(e) => updateSetting('restaurantName', e.target.value)}
                      placeholder="Nome do seu restaurante"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={settings.description}
                      onChange={(e) => updateSetting('description', e.target.value)}
                      placeholder="Breve descrição do seu restaurante"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Logo do Restaurante</Label>
                    <ImageUpload
                      value={settings.logo}
                      onChange={(url) => updateSetting('logo', url)}
                      aspectRatio="square"
                    />
                    <p className="text-sm text-muted-foreground">
                      Recomendamos uma imagem quadrada de pelo menos 200x200px
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Banner Principal</Label>
                    <ImageUpload
                      value={settings.bannerImage}
                      onChange={(url) => updateSetting('bannerImage', url)}
                      aspectRatio="banner"
                    />
                    <p className="text-sm text-muted-foreground">
                      Imagem para o cabeçalho, recomendamos 1200x400px
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Configurações de Layout
                  </CardTitle>
                  <CardDescription>
                    Personalize a tipografia e estrutura do site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Fonte Poppins aplicada globalmente - não é mais configurável */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel - COMPLETAMENTE REFORMULADO */}
        <div className="space-y-4">
          {/* Teste Visual REAL das Cores */}
          <Card>
            <CardHeader>
              <CardTitle>🎨 Teste Visual do Tema</CardTitle>
              <CardDescription>
                Cores aplicadas em tempo real - estas são as cores reais sendo usadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="p-4 rounded-lg text-center font-bold text-white shadow-sm border-2"
                  style={{ 
                    backgroundColor: settings.primaryColor,
                    borderColor: settings.primaryColor
                  }}
                >
                  Cor Primária
                  <div className="text-xs mt-1 opacity-90 font-mono">
                    {settings.primaryColor}
                  </div>
                </div>
                
                <div 
                  className="p-4 rounded-lg text-center font-bold text-white shadow-sm border-2"
                  style={{ 
                    backgroundColor: settings.secondaryColor,
                    borderColor: settings.secondaryColor
                  }}
                >
                  Cor Secundária
                  <div className="text-xs mt-1 opacity-90 font-mono">
                    {settings.secondaryColor}
                  </div>
                </div>
                
                <div 
                  className="p-4 rounded-lg text-center font-medium border-2"
                  style={{ 
                    backgroundColor: settings.backgroundColor,
                    color: settings.textColor,
                    borderColor: settings.primaryColor
                  }}
                >
                  Background
                  <div className="text-xs mt-1 opacity-70 font-mono">
                    {settings.backgroundColor}
                  </div>
                </div>
                
                <div 
                  className="p-4 rounded-lg text-center font-medium border"
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    color: settings.textColor,
                    borderColor: settings.secondaryColor
                  }}
                >
                  Card/Muted
                  <div className="text-xs mt-1 opacity-70">
                    Cor de texto: {settings.textColor}
                  </div>
                </div>
              </div>
              
              {/* Botões de teste */}
              <div className="flex gap-2 pt-2">
                <button 
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Botão Primário
                </button>
                <button 
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all"
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  Botão Secundário
                </button>
              </div>
            </CardContent>
          </Card>
          
          {/* Preview do Site */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview do Site
              </CardTitle>
              <CardDescription>
                Visualização em tempo real usando as cores definidas acima
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Device Selector */}
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>

              {/* Preview Container */}
              <div className={`border rounded-lg overflow-hidden shadow-inner ${
                previewMode === 'desktop' ? 'w-full h-96' :
                previewMode === 'tablet' ? 'w-3/4 h-80 mx-auto' :
                'w-1/2 h-96 mx-auto'
              }`}>
                <div 
                  className="w-full h-full"
                  style={{ 
                    backgroundColor: settings.backgroundColor,
                    color: settings.textColor,
                    fontFamily: 'Poppins' // Fonte fixa
                  }}
                >
                  {/* Header */}
                  <div 
                    className="p-4 border-b"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <div className="flex items-center gap-3">
                      {settings.logo ? (
                        <img src={settings.logo} alt="Logo" className="w-8 h-8 rounded" />
                      ) : (
                        <div 
                          className="w-8 h-8 bg-white rounded flex items-center justify-center text-sm font-bold"
                          style={{ color: settings.primaryColor }}
                        >
                          R
                        </div>
                      )}
                      <div>
                        <h2 className="font-bold text-white text-lg">{settings.restaurantName}</h2>
                        <p className="text-white/80 text-sm">{settings.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Banner */}
                  {settings.bannerImage && (
                    <div 
                      className="h-24 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${settings.bannerImage})` }} 
                    />
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: settings.secondaryColor }}
                      />
                      <h3 className="font-semibold">Cardápio</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">Pizza Margherita</h4>
                        <p className="text-sm opacity-70">Molho de tomate, mussarela e manjericão</p>
                        <span 
                          className="text-sm font-bold"
                          style={{ color: settings.primaryColor }}
                        >
                          R$ 35,90
                        </span>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">Hambúrguer Clássico</h4>
                        <p className="text-sm opacity-70">Pão brioche, hambúrguer 180g, queijo</p>
                        <span 
                          className="text-sm font-bold"
                          style={{ color: settings.primaryColor }}
                        >
                          R$ 28,90
                        </span>
                      </div>
                    </div>

                    <button 
                      className="w-full py-2 px-4 rounded-lg text-white font-medium shadow-sm hover:shadow-md transition-all"
                      style={{ backgroundColor: settings.secondaryColor }}
                    >
                      Fazer Pedido
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}