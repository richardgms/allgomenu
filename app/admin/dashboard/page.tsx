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
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login');
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

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card do Restaurante */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Restaurante
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {restaurant?.name}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card do Usuário */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Usuário
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.role}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Ações */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Status
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Online
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Links de navegação */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    href={`/${restaurant?.slug}`}
                    target="_blank"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h4 className="font-medium text-gray-900">Ver Restaurante</h4>
                    <p className="text-sm text-gray-500">Visualizar página pública</p>
                  </Link>
                  <Link
                    href="/admin/products"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 block"
                  >
                    <h4 className="font-medium text-gray-900">Produtos</h4>
                    <p className="text-sm text-gray-500">Gerenciar cardápio</p>
                  </Link>
                  <Link
                    href="/admin/categories"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 block"
                  >
                    <h4 className="font-medium text-gray-900">Categorias</h4>
                    <p className="text-sm text-gray-500">Organizar cardápio</p>
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 block"
                  >
                    <h4 className="font-medium text-gray-900">Configurações</h4>
                    <p className="text-sm text-gray-500">Configurar restaurante</p>
                  </Link>
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-gray-900">Pedidos</h4>
                    <p className="text-sm text-gray-500">Visualizar pedidos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 