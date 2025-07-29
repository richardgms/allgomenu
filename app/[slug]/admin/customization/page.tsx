'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ImageUpload'
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
  Tablet
} from 'lucide-react'

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
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
  const [settings, setSettings] = useState<ThemeSettings>({
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    logo: '',
    bannerImage: '',
    restaurantName: 'Meu Restaurante',
    description: 'Deliciosas refeições preparadas com carinho',
    category: 'geral'
  })

  const [hasChanges, setHasChanges] = useState(false)

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

  const handleSave = () => {
    // Here you would save the settings to the backend
    console.log('Saving settings:', settings)
    setHasChanges(false)
  }

  const handleReset = () => {
    // Reset to default or last saved settings
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personalização</h1>
          <p className="text-gray-600">
            Customize a aparência do seu restaurante
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary">Alterações não salvas</Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reverter
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
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
                    <div key={key} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => applyPreset(key)}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{preset.name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondaryColor }} />
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: preset.backgroundColor }} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{preset.description}</p>
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
                    Ajuste as cores principais do seu tema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Cor Primária</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded border"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Cor Secundária</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded border"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded border"
                        />
                        <Input
                          value={settings.backgroundColor}
                          onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="textColor">Cor do Texto</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={settings.textColor}
                          onChange={(e) => updateSetting('textColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded border"
                        />
                        <Input
                          value={settings.textColor}
                          onChange={(e) => updateSetting('textColor', e.target.value)}
                          className="flex-1"
                        />
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
                    <p className="text-sm text-gray-500">
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
                    <p className="text-sm text-gray-500">
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
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Fonte</Label>
                    <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter (Moderna)</SelectItem>
                        <SelectItem value="Poppins">Poppins (Amigável)</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display (Elegante)</SelectItem>
                        <SelectItem value="Roboto">Roboto (Clássica)</SelectItem>
                        <SelectItem value="Open Sans">Open Sans (Limpa)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visualizar
              </CardTitle>
              <CardDescription>
                Veja como ficará seu site com as configurações atuais
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
              <div className={`border rounded-lg overflow-hidden ${
                previewMode === 'desktop' ? 'w-full h-96' :
                previewMode === 'tablet' ? 'w-3/4 h-80 mx-auto' :
                'w-1/2 h-96 mx-auto'
              }`}>
                <div 
                  className="w-full h-full"
                  style={{ 
                    backgroundColor: settings.backgroundColor,
                    color: settings.textColor,
                    fontFamily: settings.fontFamily
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
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-sm font-bold" style={{ color: settings.primaryColor }}>
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
                    <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${settings.bannerImage})` }} />
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
                      className="w-full py-2 px-4 rounded-lg text-white font-medium"
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