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
    document.documentElement.style.setProperty('--primary-color', primaryColor || '#DC2626');
    document.documentElement.style.setProperty('--secondary-color', secondaryColor || '#059669');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ fontFamily: 'var(--font-family, Inter)' }}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                 style={{ backgroundColor: 'var(--primary-color)' }}>
              {restaurant?.themeConfig?.logo ? (
                <img
                  src={restaurant.themeConfig.logo}
                  alt="Logo"
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <span className="text-3xl font-bold text-white">A</span>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Go Menu</h1>
            <p className="text-gray-600 text-lg">Painel Administrativo</p>
          </div>

          {/* Card de Login */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-gray-600 text-center">
                Entre com suas credenciais para acessar o painel
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Esqueceu sua senha? Entre em contato com o administrador.
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2024 All Go Menu. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 