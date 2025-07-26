'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'dark'
  text?: string
  className?: string
  variant?: 'spinner' | 'dots' | 'pulse'
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  text,
  className = '',
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-[#0E202C] border-t-transparent',
    secondary: 'border-[#2A3F4F] border-t-transparent',
    white: 'border-white border-t-transparent',
    dark: 'border-[#0E202C] border-t-transparent'
  }

  const textColorClasses = {
    primary: 'text-[#0E202C]',
    secondary: 'text-[#2A3F4F]',
    white: 'text-white',
    dark: 'text-[#0E202C]'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} rounded-full animate-pulse`}
                style={{
                  backgroundColor: color === 'primary' ? '#0E202C' : 
                                 color === 'secondary' ? '#2A3F4F' : 
                                 color === 'white' ? 'white' : '#0E202C',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <div 
            className={`${sizeClasses[size]} rounded-full animate-pulse`}
            style={{
              backgroundColor: color === 'primary' ? '#0E202C' : 
                             color === 'secondary' ? '#2A3F4F' : 
                             color === 'white' ? 'white' : '#0E202C'
            }}
          />
        )
      
      default:
        return (
          <div className={`
            animate-spin rounded-full border-4 
            ${sizeClasses[size]} 
            ${colorClasses[color]}
          `}></div>
        )
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`text-sm font-medium ${textColorClasses[color]} font-nunito tracking-wide`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Componente de loading de página completa inspirado na página admin
interface PageLoadingProps {
  text?: string
  showLogo?: boolean
}

export function PageLoading({ text = 'Carregando...', showLogo = true }: PageLoadingProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F4F0', fontFamily: 'Nunito, Inter, sans-serif' }}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          {showLogo && (
            <div className="mb-8">
              <div className="mx-auto mb-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white to-[#F8F4F0] shadow-xl flex items-center justify-center border-4 border-[#0E202C] overflow-hidden">
                      <img
                        src="/logo.png"
                        alt="AllGo Menu Logo"
                        className="w-24 h-24 object-cover scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-[#0E202C] font-bold text-center leading-tight">
                        <div className="text-base">ALL</div>
                        <div className="text-2xl">GO</div>
                        <div className="text-base">WEB</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-bold text-[#0E202C] font-nunito tracking-tight">
                      AllGo Menu
                    </h1>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#0E202C] to-transparent mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-2xl border border-[#E8D5C0] p-8 shadow-xl">
            <LoadingSpinner 
              size="lg" 
              color="primary" 
              text={text}
              variant="spinner"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de loading minimalista simples
interface SimpleLoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SimpleLoading({ text = 'Carregando...', size = 'md' }: SimpleLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`
        animate-spin rounded-full border-4 border-[#0E202C] border-t-transparent
        ${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'}
      `}></div>
      {text && (
        <p className="text-sm font-medium text-[#0E202C] font-nunito tracking-wide">
          {text}
        </p>
      )}
    </div>
  )
} 