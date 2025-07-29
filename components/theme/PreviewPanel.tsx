'use client'

/**
 * Preview Panel - Preview em tempo real do tema
 * Mostra elementos críticos com medidor de contraste AA/AAA
 */

import React, { useState, useMemo } from 'react'
import { buildThemeTokens, type ThemeInput } from '@/lib/color/theme-builder'
import { calculateContrast, batchContrastTest } from '@/lib/color/contrast'

interface PreviewPanelProps {
  primaryColor: string
  secondaryColor: string
  onThemeChange?: (theme: ReturnType<typeof buildThemeTokens>) => void
}

export default function PreviewPanel({ 
  primaryColor, 
  secondaryColor,
  onThemeChange 
}: PreviewPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Gerar tema em tempo real
  const theme = useMemo(() => {
    if (!primaryColor || !secondaryColor) return null
    
    setIsGenerating(true)
    const result = buildThemeTokens({
      primaryHex: primaryColor,
      secondaryHex: secondaryColor
    })
    setIsGenerating(false)
    
    // Notificar mudança
    if (onThemeChange) {
      onThemeChange(result)
    }
    
    return result
  }, [primaryColor, secondaryColor, onThemeChange])

  // Testes de contraste críticos
  const contrastTests = useMemo(() => {
    if (!theme) return []
    
    return batchContrastTest([
      {
        name: 'Botão Primário',
        fg: theme.tokens.button.primary.text,
        bg: theme.tokens.button.primary.bg
      },
      {
        name: 'Botão Secundário',
        fg: theme.tokens.button.secondary.text,
        bg: theme.tokens.button.secondary.bg
      },
      {
        name: 'Badge Success',
        fg: theme.tokens.badge.success.text,
        bg: theme.tokens.badge.success.bg
      },
      {
        name: 'Badge Warning',
        fg: theme.tokens.badge.warning.text,
        bg: theme.tokens.badge.warning.bg
      },
      {
        name: 'Chip Informativo',
        fg: theme.tokens.chip.text,
        bg: theme.tokens.chip.bg
      },
      {
        name: 'Sidebar Item Ativo',
        fg: theme.tokens.text.body,
        bg: theme.tokens.sidebar.itemActiveBg
      }
    ])
  }, [theme])

  if (!primaryColor || !secondaryColor) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-center">
          Selecione as cores primária e secundária para ver o preview
        </p>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Gerando preview...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!theme) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">❌ Erro ao gerar tema</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Avisos e ajustes */}
      {(theme.validation.adjustments.length > 0 || theme.validation.warnings.length > 0) && (
        <div className="space-y-3">
          {theme.validation.adjustments.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium text-sm mb-1">
                ✨ Ajustes automáticos aplicados:
              </p>
              <ul className="text-blue-700 text-xs space-y-1">
                {theme.validation.adjustments.map((adj, i) => (
                  <li key={i}>• {adj}</li>
                ))}
              </ul>
            </div>
          )}
          
          {theme.validation.warnings.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium text-sm mb-1">
                ⚠️ Atenção:
              </p>
              <ul className="text-yellow-700 text-xs space-y-1">
                {theme.validation.warnings.slice(0, 2).map((warn, i) => (
                  <li key={i}>• {warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preview dos elementos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Botões */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Botões</h4>
          <div className="space-y-2">
            <button 
              className="px-4 py-2 rounded-lg font-medium transition-colors w-full"
              style={{
                backgroundColor: theme.tokens.button.primary.bg,
                color: theme.tokens.button.primary.text
              }}
            >
              Botão Primário
            </button>
            <button 
              className="px-4 py-2 rounded-lg font-medium transition-colors w-full"
              style={{
                backgroundColor: theme.tokens.button.secondary.bg,
                color: theme.tokens.button.secondary.text
              }}
            >
              Botão Secundário
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Cards</h4>
          <div 
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.tokens.surface[1],
              borderColor: theme.tokens.neutral[200]
            }}
          >
            <h5 
              className="font-semibold mb-2"
              style={{ color: theme.tokens.text.strong }}
            >
              Card de Exemplo
            </h5>
            <p 
              className="text-sm"
              style={{ color: theme.tokens.text.muted }}
            >
              Este é um exemplo de card usando o tema selecionado.
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Badges</h4>
          <div className="flex flex-wrap gap-2">
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: theme.tokens.badge.success.bg,
                color: theme.tokens.badge.success.text
              }}
            >
              Sucesso
            </span>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: theme.tokens.badge.warning.bg,
                color: theme.tokens.badge.warning.text
              }}
            >
              Aviso
            </span>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: theme.tokens.badge.danger.bg,
                color: theme.tokens.badge.danger.text
              }}
            >
              Perigo
            </span>
          </div>
        </div>

        {/* Sidebar simulada */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Navegação</h4>
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: theme.tokens.sidebar.bg }}
          >
            <div 
              className="p-2 rounded text-sm relative"
              style={{
                backgroundColor: theme.tokens.sidebar.itemActiveBg,
                color: theme.tokens.sidebar.itemColor
              }}
            >
              <div 
                className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                style={{ backgroundColor: theme.tokens.sidebar.itemActiveIndicator }}
              ></div>
              <span className="ml-2">Item Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medidor de contraste */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Verificação de Contraste WCAG
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contrastTests.map((test, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">{test.name}</div>
                <div className="text-xs text-gray-600">
                  {test.result.ratio.toFixed(1)}:1
                </div>
              </div>
              <div className="text-right">
                {test.result.isAccessible ? (
                  <span className="text-green-600 text-xs font-medium">
                    ✅ {test.result.level}
                  </span>
                ) : (
                  <span className="text-red-600 text-xs font-medium">
                    ❌ FAIL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paleta gerada */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Paleta Gerada</h4>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(theme.tokens.primary).map(([key, color]) => (
            <div key={key} className="space-y-1">
              <div 
                className="w-full h-8 rounded border"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs text-gray-600 text-center">P{key}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}