'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Restaurant {
  id: string
  name: string
  slug: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  restaurant: Restaurant | null
  token: string | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    restaurant: null,
    token: null,
    loading: true
  })
  const router = useRouter()

  // Carregar dados de autenticação do localStorage
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const token = localStorage.getItem('auth-token')
        const userStr = localStorage.getItem('auth-user')
        const restaurantStr = localStorage.getItem('auth-restaurant')

        if (token && userStr && restaurantStr) {
          const user = JSON.parse(userStr)
          const restaurant = JSON.parse(restaurantStr)
          
          setAuthState({
            isAuthenticated: true,
            user,
            restaurant,
            token,
            loading: false
          })
        } else {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error)
        logout()
      }
    }

    loadAuthData()
  }, [])

  // Função de login
  const login = (token: string, user: User, restaurant: Restaurant) => {
    localStorage.setItem('auth-token', token)
    localStorage.setItem('auth-user', JSON.stringify(user))
    localStorage.setItem('auth-restaurant', JSON.stringify(restaurant))
    
    setAuthState({
      isAuthenticated: true,
      user,
      restaurant,
      token,
      loading: false
    })
  }

  // Função de logout
  const logout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-user')
    localStorage.removeItem('auth-restaurant')
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      restaurant: null,
      token: null,
      loading: false
    })
    
    router.push('/login')
  }

  // Verificar se tem acesso ao restaurante específico
  const hasAccessToRestaurant = (slug: string): boolean => {
    return authState.isAuthenticated && authState.restaurant?.slug === slug
  }

  // Função para fazer requisições autenticadas
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!authState.token) {
      throw new Error('Não autenticado')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${authState.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 401) {
      logout()
      throw new Error('Sessão expirada')
    }

    return response
  }

  return {
    ...authState,
    login,
    logout,
    hasAccessToRestaurant,
    authenticatedFetch
  }
}