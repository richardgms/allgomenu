'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchWithAuth, handleAuthError, logout, isAuthenticated } from '@/lib/api-client'
import { isRestaurantOpen, generateSixColorPalette } from '@/lib/utils'
import StatCard from '@/components/StatCard'
import QuickAction from '@/components/QuickAction'
import StatusBadge from '@/components/StatusBadge'
import AdminLayout from '@/components/AdminLayout'

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
    colorPalette?: {
      primary: string[];
      secondary: string[];
      primaryLight: string;
      primaryBase: string;
      primaryDark: string;
      secondaryLight: string;
      secondaryBase: string;
      secondaryDark: string;
    };
  };
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


  const handleLogout = () => {
    logout()
  }

  const isCurrentlyOpen = restaurant?.isOpen && isRestaurantOpen(restaurant.openingHours);

  if (loading) {
    return (
      <AdminLayout title="Dashboard" description="Carregando...">
        <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
          <div className="text-center admin-surface p-8 rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-base border-t-transparent mx-auto mb-4"></div>
            <p className="admin-text-primary font-medium">Carregando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Erro" description="Algo deu errado">
        <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="admin-surface rounded-3xl shadow-2xl p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold admin-text-primary mb-2">Erro!</h1>
              <p className="admin-text-secondary mb-6">{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard" description="Visão geral do seu restaurante">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold admin-text-primary mb-2 sm:mb-3">
            Bem-vindo de volta
          </h2>
          <p className="admin-text-secondary text-base sm:text-lg leading-relaxed">
            Aqui está um resumo do seu restaurante hoje
          </p>
        </div>

        {/* Estatísticas Minimalistas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatCard 
            title="Pedidos hoje"
            value="12"
            trend={{ direction: 'up', text: '+20% vs ontem' }}
          />
          <StatCard 
            title="Faturamento"
            value="R$ 1.240"
            trend={{ direction: 'up', text: '+15% vs ontem' }}
          />
          <StatCard 
            title="Produtos ativos"
            value="45"
            subtitle="8 categorias"
          />
        </div>

        {/* Ações Rápidas Minimalistas */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-bold admin-text-primary mb-4 sm:mb-6">
            Ações rápidas
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <QuickAction
              title="Pedidos"
              description="Gerenciar pedidos recebidos"
              href="/admin/pedidos"
              badge="3 pendentes"
            />
            <QuickAction
              title="Produtos"
              description="Gerenciar cardápio"
              href="/admin/products"
              badge="45 ativos"
            />
            <QuickAction
              title="Categorias"
              description="Organizar cardápio"
              href="/admin/categories"
              badge="8 categorias"
            />
          </div>
        </div>

        {/* Informação sobre pedidos */}
        <div className="admin-card p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="text-center">
            <div className="text-primary-base text-2xl sm:text-3xl mb-3 sm:mb-4">📋</div>
            <h4 className="font-bold admin-text-primary mb-2 sm:mb-3 text-base sm:text-lg">
              Como funciona o sistema de pedidos?
            </h4>
            <p className="text-sm admin-text-secondary max-w-md mx-auto leading-relaxed">
              Clientes fazem pedidos no site público e são redirecionados para o WhatsApp. 
              Você pode acompanhar os pedidos na seção dedicada.
            </p>
            <Link 
              href="/admin/pedidos"
              className="inline-flex items-center mt-4 sm:mt-6 text-sm font-semibold admin-btn-primary px-3 sm:px-4 py-2 rounded-lg"
            >
              Ir para pedidos
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 