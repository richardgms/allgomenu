'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [restaurant, setRestaurant] = useState<any>(null)
  const router = useRouter()

  // Carregar dados do restaurante para aplicar tema
  useEffect(() => {
    const loadRestaurantTheme = async () => {
      try {
        // Tentar carregar tema do restaurante padrão (wj-tapiocaria-cafe)
        const response = await fetch('/api/restaurant/wj-tapiocaria-cafe')
        const data = await response.json()
        
        if (data.success && data.data.themeConfig) {
          setRestaurant(data.data)
          applyTheme(data.data.themeConfig)
        }
      } catch (err) {
        console.log('Não foi possível carregar o tema do restaurante')
      }
    }

    loadRestaurantTheme()
  }, [])

  const applyTheme = (themeConfig: any) => {
    const { primaryColor, secondaryColor, font } = themeConfig;
    
    // Aplicar cores principais
    document.documentElement.style.setProperty('--primary-color', primaryColor || '#0E202C');
    document.documentElement.style.setProperty('--secondary-color', secondaryColor || '#F0E3D2');
    document.documentElement.style.setProperty('--font-family', font || 'Inter');
    
    // Aplicar fonte
    if (font && font !== 'Inter') {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700;800;900&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Aplicar fonte ao body
      document.body.style.fontFamily = font;
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Fazer login com nossa API JWT
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        return
      }

      if (data.success && data.data.token) {
        // Salvar token no localStorage para uso nas requisições
        localStorage.setItem('auth_token', data.data.token)
        
        // Salvar dados do usuário
        localStorage.setItem('user_data', JSON.stringify(data.data.user))
        localStorage.setItem('restaurant_data', JSON.stringify(data.data.restaurant))
        
        // Redirecionar para o dashboard
        router.push('/admin/dashboard')
      }

    } catch (err) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F4F0', fontFamily: 'Nunito, Inter, sans-serif' }}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          {/* Logo/Brand Minimalista */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <a 
                    href="https://instagram.com/allgoweb" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block hover:scale-105 transition-transform duration-300"
                  >
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white to-[#F8F4F0] shadow-xl flex items-center justify-center border-4 border-[#0E202C] overflow-hidden hover:shadow-2xl transition-all duration-500">
                      <img
                        src="/logo.png"
                        alt="AllGo Menu Logo"
                        className="w-24 h-24 object-cover scale-110"
                        onError={(e) => {
                          // Fallback para texto se a imagem não carregar
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
                  </a>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold text-[#0E202C] font-nunito tracking-tight">
                    AllGo Menu
                  </h1>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#0E202C] to-transparent mx-auto"></div>
                  <p className="text-lg text-[#2A3F4F] font-medium leading-relaxed max-w-xs">
                    Transforme seu cardápio em experiência digital
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Login Minimalista */}
          <div className="bg-white rounded-2xl border border-[#E8D5C0] p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-[#0E202C] text-center mb-2 font-nunito">
                Bem-vindo de volta!
              </h2>
              <p className="text-[#4A5A6A] text-center text-sm font-nunito">
                Faça login para acessar seu painel administrativo
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-[#0E202C] mb-2">
                  Endereço de email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E8D5C0] rounded-xl focus:outline-none focus:border-[#0E202C] focus:ring-2 focus:ring-[#0E202C] focus:ring-opacity-20 transition-all duration-200 bg-white hover:border-[#D4C4B0] text-sm"
                  placeholder="Digite seu email aqui..."
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-[#0E202C] mb-2">
                  Senha de acesso
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E8D5C0] rounded-xl focus:outline-none focus:border-[#0E202C] focus:ring-2 focus:ring-[#0E202C] focus:ring-opacity-20 transition-all duration-200 bg-white hover:border-[#D4C4B0] text-sm"
                  placeholder="Digite sua senha..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#0A1A24] focus:outline-none focus:ring-2 focus:ring-[#0E202C] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#1A2F3A' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Acessando...
                  </div>
                ) : (
                  'Acessar Painel'
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-[#2A3F4F]">
                Precisa de ajuda? Entre em contato com nosso suporte
              </p>
            </div>
          </div>
          
          {/* Footer Minimalista */}
          <div className="text-center mt-8">
            <p className="text-xs text-[#2A3F4F]">
              © 2024 AllGo Menu
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 