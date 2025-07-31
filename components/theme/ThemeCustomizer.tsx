'use client'

import { useState, useEffect, useCallback } from 'react'
import { PaletteConfig, DEFAULT_PALETTE_CONFIG, generatePalette } from '@/lib/theme/palette-generator'
import { getPresets, ThemePreset } from '@/lib/theme/theme-presets'
import { injectTheme } from '@/lib/theme/theme-injector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Palette, Save, RotateCcw, Zap } from 'lucide-react'

export interface ThemeCustomizerProps {
  restaurantSlug: string
  initialConfig?: Partial<PaletteConfig>
  onSave?: (config: PaletteConfig) => Promise<void>
  onPreview?: (config: PaletteConfig) => void
  className?: string
}

export function ThemeCustomizer({
  restaurantSlug,
  initialConfig,
  onSave,
  onPreview,
  className = ''
}: ThemeCustomizerProps) {
  const [config, setConfig] = useState<PaletteConfig>({
    ...DEFAULT_PALETTE_CONFIG,
    ...initialConfig
  })
  const [presets] = useState<ThemePreset[]>(getPresets())
  const [selectedPreset, setSelectedPreset] = useState<string>('custom')
  const [isPreviewActive, setIsPreviewActive] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update config when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      setConfig(prev => ({ ...prev, ...initialConfig }))
    }
  }, [initialConfig])

  // Color picker handler
  const handleColorChange = useCallback((type: 'primary' | 'secondary', color: string) => {
    setConfig(prev => ({ ...prev, [type]: color }))
    setSelectedPreset('custom')
  }, [])

  // Control change handlers
  const handleLightnessChange = useCallback((key: keyof PaletteConfig['lightness'], value: number) => {
    setConfig(prev => ({
      ...prev,
      lightness: { ...prev.lightness, [key]: value }
    }))
    setSelectedPreset('custom')
  }, [])

  const handleSaturationChange = useCallback((key: keyof PaletteConfig['saturation'], value: number) => {
    setConfig(prev => ({
      ...prev,
      saturation: { ...prev.saturation, [key]: value }
    }))
    setSelectedPreset('custom')
  }, [])

  const handleContrastChange = useCallback((key: keyof PaletteConfig['contrast'], value: string) => {
    setConfig(prev => ({
      ...prev,
      contrast: { ...prev.contrast, [key]: value }
    }))
    setSelectedPreset('custom')
  }, [])

  // Preset selection
  const handlePresetSelect = useCallback((presetId: string) => {
    if (presetId === 'custom') {
      setSelectedPreset('custom')
      return
    }

    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      setConfig(preset.config)
      setSelectedPreset(presetId)
    }
  }, [presets])

  // Preview theme
  const handlePreview = useCallback(() => {
    try {
      const tokens = generatePalette(config)
      injectTheme(tokens, {
        restaurantSlug: `${restaurantSlug}-preview`,
        priority: 'high'
      })
      setIsPreviewActive(true)
      onPreview?.(config)
    } catch (error) {
      console.error('Preview error:', error)
    }
  }, [config, restaurantSlug, onPreview])

  // Reset theme
  const handleReset = useCallback(() => {
    setConfig(DEFAULT_PALETTE_CONFIG)
    setSelectedPreset('classic-blue')
    setIsPreviewActive(false)
  }, [])

  // Save theme
  const handleSave = useCallback(async () => {
    if (!onSave) return

    try {
      setIsSaving(true)
      await onSave(config)
      setIsPreviewActive(false)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [config, onSave])

  return (
    <div className={`theme-customizer ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalização de Cores
          </CardTitle>
          <CardDescription>
            Personalize as cores do seu restaurante com controle total sobre a paleta e estilos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="colors">Cores</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            {/* Presets Tab */}
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presets.map((preset) => (
                  <Card 
                    key={preset.id}
                    className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary-300 ${
                      selectedPreset === preset.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{preset.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {preset.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {preset.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: preset.preview.primary }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: preset.preview.secondary }}
                        />
                        <div className="text-xs text-muted-foreground ml-2">
                          {preset.tags.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="primary-color"
                      type="color"
                      value={config.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{config.primary.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">Cor principal do tema</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="secondary-color"
                      type="color"
                      value={config.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{config.secondary.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">Cor de destaque</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Color Preview */}
              <div className="space-y-3">
                <Label>Preview das Cores</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <Button 
                        className="w-full mb-2"
                        style={{ 
                          backgroundColor: config.primary,
                          color: 'white'
                        }}
                      >
                        Botão Primário
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        style={{ 
                          borderColor: config.primary,
                          color: config.primary
                        }}
                      >
                        Botão Outline
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <Button 
                        className="w-full mb-2"
                        style={{ 
                          backgroundColor: config.secondary,
                          color: 'white'
                        }}
                      >
                        Botão Secundário
                      </Button>
                      <div 
                        className="w-full h-8 rounded border-2 flex items-center justify-center text-xs"
                        style={{ 
                          borderColor: config.secondary,
                          backgroundColor: `${config.secondary}15`
                        }}
                      >
                        Card com borda
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div 
                        className="w-full h-16 rounded mb-2 flex items-center justify-center text-white text-sm"
                        style={{ 
                          background: `linear-gradient(135deg, ${config.primary} 0%, ${config.secondary} 100%)`
                        }}
                      >
                        Gradiente
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              {/* Lightness Controls */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Controle de Luminosidade</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="lightness-light">Tons Claros</Label>
                      <span className="text-sm text-muted-foreground">{config.lightness.light.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="lightness-light"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={[config.lightness.light]}
                      onValueChange={([value]) => handleLightnessChange('light', value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="lightness-medium">Tons Médios</Label>
                      <span className="text-sm text-muted-foreground">{config.lightness.medium.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="lightness-medium"
                      min={0.3}
                      max={0.7}
                      step={0.05}
                      value={[config.lightness.medium]}
                      onValueChange={([value]) => handleLightnessChange('medium', value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="lightness-dark">Tons Escuros</Label>
                      <span className="text-sm text-muted-foreground">{config.lightness.dark.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="lightness-dark"
                      min={0.1}
                      max={0.5}
                      step={0.05}
                      value={[config.lightness.dark]}
                      onValueChange={([value]) => handleLightnessChange('dark', value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Saturation Controls */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Controle de Saturação</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="saturation-boost">Intensidade</Label>
                      <span className="text-sm text-muted-foreground">{config.saturation.boost.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="saturation-boost"
                      min={0.8}
                      max={1.2}
                      step={0.05}
                      value={[config.saturation.boost]}
                      onValueChange={([value]) => handleSaturationChange('boost', value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="saturation-muted">Tons Suaves</Label>
                      <span className="text-sm text-muted-foreground">{config.saturation.muted.toFixed(2)}</span>
                    </div>
                    <Slider
                      id="saturation-muted"
                      min={0.2}
                      max={0.8}
                      step={0.05}
                      value={[config.saturation.muted]}
                      onValueChange={([value]) => handleSaturationChange('muted', value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contrast Controls */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Controle de Contraste</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contrast-text">Contraste de Texto</Label>
                    <Select 
                      value={config.contrast.text} 
                      onValueChange={(value) => handleContrastChange('text', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto (WCAG AA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contrast-backgrounds">Fundos</Label>
                    <Select 
                      value={config.contrast.backgrounds} 
                      onValueChange={(value) => handleContrastChange('backgrounds', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subtle">Suave</SelectItem>
                        <SelectItem value="bold">Marcante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t">
            <Button 
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {isPreviewActive ? 'Pré-visualizando' : 'Visualizar'}
            </Button>

            <Button 
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </Button>

            {onSave && (
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 ml-auto"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Salvando...' : 'Salvar Tema'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}