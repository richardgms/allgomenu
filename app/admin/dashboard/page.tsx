'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchWithAuth, handleAuthError, logout, isAuthenticated } from '@/lib/api-client'
import { isRestaurantOpen } from '@/lib/utils'

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
  isOpen: boolean;
  openingHours?: any;
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

  const isCurrentlyOpen = restaurant?.isOpen && isRestaurantOpen(restaurant.openingHours);

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
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse ${isCurrentlyOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Status do Restaurante</h3>
                <p className="text-white/90 text-sm md:text-lg">
                  {isCurrentlyOpen ? 'Aberto e Recebendo Pedidos' : 'Fechado no Momento'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        {/* Estatísticas do Dashboard */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Hoje</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-green-600">+20% vs ontem</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faturamento Hoje</p>
                  <p className="text-3xl font-bold text-gray-900">R$ 1.240</p>
                  <p className="text-sm text-green-600">+15% vs ontem</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                  <p className="text-3xl font-bold text-gray-900">45</p>
                  <p className="text-sm text-gray-500">8 categorias</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-orange-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c.232.232.232.608 0 .84l-1.8 1.8a.6.6 0 01-.84 0L18 18.5M5 14.5l1.402 1.402c.232.232.232.608 0 .84l-1.8 1.8a.6.6 0 01-.84 0L3 18.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-amber-600">Requer atenção</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-amber-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Link
              href="/admin/pedidos"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">Pedidos</h4>
                <p className="text-xs md:text-sm text-gray-600">Gerenciar pedidos recebidos</p>
                <span className="inline-block mt-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                  3 pendentes
                </span>
              </div>
            </Link>

            <Link
              href="/admin/products"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-orange-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c.232.232.232.608 0 .84l-1.8 1.8a.6.6 0 01-.84 0L18 18.5M5 14.5l1.402 1.402c.232.232.232.608 0 .84l-1.8 1.8a.6.6 0 01-.84 0L3 18.5" />
                  </svg>
                </div>
                <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">Produtos</h4>
                <p className="text-xs md:text-sm text-gray-600">Gerenciar cardápio</p>
                <span className="inline-block mt-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  45 ativos
                </span>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v3.776" />
                  </svg>
                </div>
                <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">Categorias</h4>
                <p className="text-xs md:text-sm text-gray-600">Organizar cardápio</p>
                <span className="inline-block mt-2 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                  8 categorias
                </span>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 md:p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">Configurações</h4>
                <p className="text-xs md:text-sm text-gray-600">Personalizar sistema</p>
              </div>
            </Link>
          </div>

          {/* Botão Ver Site */}
          <div className="mt-6 text-center">
            <Link
              href={`/${restaurant?.slug}`}
              target="_blank"
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Visualizar Site Público
            </Link>
          </div>
        </div>

        {/* Últimos Pedidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Últimos Pedidos</h3>
              <p className="text-sm text-gray-600">Acompanhe os pedidos mais recentes</p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver todos
            </Link>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Pedido Exemplo 1 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">João Silva</p>
                    <p className="text-sm text-gray-600">2x Pizza Margherita + 1x Coca-Cola</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">R$ 75,00</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendente
                  </span>
                </div>
              </div>

              {/* Pedido Exemplo 2 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">#2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Maria Santos</p>
                    <p className="text-sm text-gray-600">1x Hambúrguer Especial + 1x Batata Frita</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">R$ 37,00</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Preparando
                  </span>
                </div>
              </div>

              {/* Estado vazio */}
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">Novos pedidos aparecerão aqui automaticamente</p>
                <p className="text-xs mt-1">Os dados acima são apenas exemplos para demonstração</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dicas e Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Como receber pedidos?</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Seus clientes fazem pedidos no site público e são redirecionados para o WhatsApp. 
                  Em breve, teremos integração automática com sistema de pedidos.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Dicas de Segurança</h4>
                <p className="text-sm text-green-800 leading-relaxed">
                  Mantenha suas configurações sempre atualizadas. Verifique regularmente o status 
                  do seu restaurante e teste o funcionamento do sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 