'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchWithAuth, handleAuthError, logout, isAuthenticated } from '@/lib/api-client'

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  themeConfig?: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    font: string;
  };
}

// Função para converter hex para RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin');
      return;
    }
    
    const checkAuth = async () => {
      try {
        const response = await fetchWithAuth('/api/admin/me')
        handleAuthError(response)

        if (!response.ok) {
          throw new Error('Erro ao carregar dados do usuário')
        }

        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          setRestaurant(data.user.restaurant)
        } else {
          logout()
        }
      } catch (err) {
        console.error('Erro na autenticação:', err)
        setError('Erro ao verificar autenticação. Redirecionando para o login.')
        setTimeout(logout, 2000)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Aplicar tema dinamicamente
  useEffect(() => {
    if (restaurant?.themeConfig) {
      const { primaryColor, secondaryColor, font } = restaurant.themeConfig;
      
      // Aplicar cores principais
      document.documentElement.style.setProperty('--primary-color', primaryColor || '#DC2626');
      document.documentElement.style.setProperty('--secondary-color', secondaryColor || '#059669');
      document.documentElement.style.setProperty('--font-family', font || 'Inter');
      
      // Gerar variações das cores para hover e outros estados
      const primaryRgb = hexToRgb(primaryColor || '#DC2626');
      const secondaryRgb = hexToRgb(secondaryColor || '#059669');
      
      if (primaryRgb) {
        document.documentElement.style.setProperty('--primary-dark', `rgb(${Math.max(primaryRgb.r - 30, 0)}, ${Math.max(primaryRgb.g - 30, 0)}, ${Math.max(primaryRgb.b - 30, 0)})`);
        document.documentElement.style.setProperty('--primary-light', `rgb(${Math.min(primaryRgb.r + 30, 255)}, ${Math.min(primaryRgb.g + 30, 255)}, ${Math.min(primaryRgb.b + 30, 255)})`);
      }
      
      if (secondaryRgb) {
        document.documentElement.style.setProperty('--secondary-dark', `rgb(${Math.max(secondaryRgb.r - 30, 0)}, ${Math.max(secondaryRgb.g - 30, 0)}, ${Math.max(secondaryRgb.b - 30, 0)})`);
        document.documentElement.style.setProperty('--secondary-light', `rgb(${Math.min(secondaryRgb.r + 30, 255)}, ${Math.min(secondaryRgb.g + 30, 255)}, ${Math.min(secondaryRgb.b + 30, 255)})`);
      }
      
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
  }, [restaurant])

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro!</h1>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ fontFamily: 'var(--font-family, Inter)' }}>
      {/* Header Responsivo Melhorado */}
      <header className="bg-white shadow-lg border-b-2" style={{ borderColor: 'var(--primary-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Seção Esquerda */}
            <div className="flex items-center space-x-3">
              {restaurant?.themeConfig?.logo ? (
                <img
                  src={restaurant.themeConfig.logo}
                  alt={restaurant.name}
                  className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-lg md:rounded-xl shadow-md"
                />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-md"
                     style={{ backgroundColor: 'var(--primary-color)' }}>
                  {restaurant?.name?.charAt(0) || 'R'}
                </div>
              )}
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">
                  {restaurant?.name || 'Dashboard'}
                </h1>
                <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Painel de Administração</p>
              </div>
            </div>
            
            {/* Seção Direita */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {user && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || user.email}
                  </p>
                  {user.role && user.role.toLowerCase() !== 'admin' && (
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-5 md:py-2 rounded-lg md:rounded-xl font-medium transition-colors shadow-md text-sm md:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3" />
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-8 md:py-12" style={{ 
        background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)` 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
              Bem-vindo ao seu Dashboard
            </h2>
            <p className="text-sm md:text-xl opacity-90 mb-6 md:mb-8">
              Gerencie seu restaurante de forma fácil e eficiente
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/20">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Restaurante</h3>
                <p className="text-white/90 text-sm md:text-lg">{restaurant?.name}</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/20">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Status do Sistema</h3>
                <p className="text-white/90 text-sm md:text-lg">Online e Funcionando</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        {/* Ações Rápidas - Mobile Optimized */}
        <div className="mb-6 md:mb-12">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              Ações Rápidas
            </h3>
            <p className="text-base md:text-xl text-gray-600">
              Acesse rapidamente as principais funcionalidades
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            <Link
              href={`/${restaurant?.slug}`}
              target="_blank"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-8 text-center">
                <div className="text-2xl md:text-4xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">🌐</div>
                <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Ver Restaurante</h4>
                <p className="text-xs md:text-base text-gray-600 hidden md:block">Visualizar página pública do seu restaurante</p>
              </div>
            </Link>

            <Link
              href="/admin/products"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-8 text-center">
                <div className="text-2xl md:text-4xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">🍽️</div>
                <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Produtos</h4>
                <p className="text-xs md:text-base text-gray-600 hidden md:block">Gerenciar cardápio e produtos</p>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-8 text-center">
                <div className="text-2xl md:text-4xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">📂</div>
                <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Categorias</h4>
                <p className="text-xs md:text-base text-gray-600 hidden md:block">Organizar categorias do cardápio</p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-8 text-center">
                <div className="text-2xl md:text-4xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">⚙️</div>
                <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Configurações</h4>
                <p className="text-xs md:text-base text-gray-600 hidden md:block">Configurar restaurante e personalização</p>
              </div>
            </Link>

            <div className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden opacity-75">
              <div className="p-4 md:p-8 text-center">
                <div className="text-2xl md:text-4xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">📊</div>
                <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Relatórios</h4>
                <p className="text-xs md:text-base text-gray-600 hidden md:block">Visualizar estatísticas e relatórios</p>
                <span className="inline-block bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs mt-1 md:mt-2">
                  Em breve
                </span>
              </div>
            </div>

            <div className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden opacity-75">
              <div className="p-4 md:p-8 text-center">
                <div className="text-2xl md:text-4xl mb-2 md:mb-4 group-hover:scale-110 transition-transform">📱</div>
                <h4 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Notificações</h4>
                <p className="text-xs md:text-base text-gray-600 hidden md:block">Gerenciar notificações e alertas</p>
                <span className="inline-block bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs mt-1 md:mt-2">
                  Em breve
                </span>
              </div>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  )
} 