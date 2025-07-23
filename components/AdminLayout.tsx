'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  themeConfig?: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    font: string;
  };
  openingHours?: string;
  isOpen?: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
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

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      current: pathname === '/admin/dashboard' 
    },
    { 
      name: 'Pedidos', 
      href: '/admin/pedidos', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      current: pathname === '/admin/pedidos',
      badge: '0' // Será dinâmico futuramente
    },
    { 
      name: 'Cardápio', 
      href: '#', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      isDropdown: true,
      current: pathname.includes('/admin/products') || pathname.includes('/admin/categories'),
      submenu: [
        { 
          name: 'Produtos', 
          href: '/admin/products', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c.232.232.232.608 0 .84l-1.8 1.8a.6.6 0 01-.84 0L18 18.5M5 14.5l1.402 1.402c.232.232.232.608 0 .84l-1.8 1.8a.6.6 0 01-.84 0L3 18.5" />
            </svg>
          ),
          current: pathname === '/admin/products' 
        },
        { 
          name: 'Categorias', 
          href: '/admin/categories', 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v3.776" />
            </svg>
          ),
          current: pathname === '/admin/categories' 
        }
      ]
    },
    { 
      name: 'Relatórios', 
      href: '/admin/relatorios', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      ),
      current: pathname === '/admin/relatorios',
      disabled: true
    },
    { 
      name: 'Configurações', 
      href: '/admin/settings', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      current: pathname === '/admin/settings' 
    },
  ]

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
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
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {restaurant?.themeConfig?.logo ? (
              <img
                src={restaurant.themeConfig.logo}
                alt={restaurant.name}
                className="h-10 w-10 object-contain rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                   style={{ backgroundColor: 'var(--primary-color)' }}>
                {restaurant?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin</h1>
              <p className="text-xs text-gray-600">{restaurant?.name}</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-8 flex-1">
          <div className="px-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.isDropdown ? (
                  <div>
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === item.name ? null : item.name)}
                      className={`group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        item.current
                          ? 'text-white shadow-lg transform scale-[0.98]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      style={item.current ? { backgroundColor: 'var(--primary-color)' } : {}}
                    >
                      <div className="flex items-center">
                        <span className="mr-3 transition-transform group-hover:scale-110">{item.icon}</span>
                        {item.name}
                      </div>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen === item.name ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {dropdownOpen === item.name && item.submenu && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              subItem.current
                                ? 'text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            style={subItem.current ? { backgroundColor: 'var(--primary-color)' } : {}}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span className="mr-3">{subItem.icon}</span>
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.disabled ? '#' : item.href}
                    className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      item.disabled 
                        ? 'text-gray-400 cursor-not-allowed opacity-60'
                        : item.current
                          ? 'text-white shadow-lg transform scale-[0.98]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-[0.99]'
                    }`}
                    style={item.current && !item.disabled ? { backgroundColor: 'var(--primary-color)' } : {}}
                    onClick={item.disabled ? (e) => e.preventDefault() : () => setSidebarOpen(false)}
                  >
                    <div className="flex items-center">
                      <span className="mr-3 transition-transform group-hover:scale-110">{item.icon}</span>
                      {item.name}
                      {item.disabled && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                          Em breve
                        </span>
                      )}
                    </div>
                    {item.badge && !item.disabled && (
                      <span 
                        className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center"
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          {/* Status do Restaurante */}
          <div className="px-4 mt-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <div className={`w-2 h-2 rounded-full ${isRestaurantOpen(restaurant?.openingHours) && restaurant?.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </div>
              <p className="text-xs text-gray-600">
                {isRestaurantOpen(restaurant?.openingHours) && restaurant?.isOpen ? 'Aberto para pedidos' : 'Fechado no momento'}
              </p>
            </div>
          </div>
        </nav>

        {/* Seção do usuário no rodapé */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                 style={{ backgroundColor: 'var(--primary-color)' }}>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link
              href={`/${restaurant?.slug}`}
              target="_blank"
              className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Ver Site
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700 lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/${restaurant?.slug}`}
                target="_blank"
                className="text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors text-sm"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Ver Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 