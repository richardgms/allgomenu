'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

// Tipos
interface Category {
  id: string
  name: string
  description: string | null
  order: number
  isActive: boolean
  productsCount: number
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  promotionalPrice: number | null
  imageUrl: string | null
  categoryId: string
  category: {
    id: string
    name: string
  }
  isActive: boolean
  isFeatured: boolean
  isAvailable: boolean
  options: any
  order: number
  hasPromotion: boolean
  discountPercentage?: number
  effectivePrice: number
  createdAt: string
  updatedAt: string
}

interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  logo: string
  bannerImage: string
  restaurantName: string
  description: string
  category: string
}

interface CreateCategoryData {
  name: string
  description?: string
  order?: number
  isActive?: boolean
}

interface CreateProductData {
  name: string
  description?: string
  price: number
  promotionalPrice?: number
  imageUrl?: string
  categoryId: string
  isActive?: boolean
  isFeatured?: boolean
  isAvailable?: boolean
  options?: any
  order?: number
}

// Hook para gerenciar categorias
export function useCategories() {
  const params = useParams() as { slug: string }
  const queryClient = useQueryClient()

  // Query para listar categorias
  const {
    data: categories = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-categories', params.slug],
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch(`/api/admin/categories?restaurant=${params.slug}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch categories')
      }
      return response.json()
    },
    enabled: !!params.slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutation para criar categoria
  const createCategory = useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      // Buscar ID do restaurante
      const restaurantResponse = await fetch(`/api/restaurant/${params.slug}/status`)
      if (!restaurantResponse.ok) throw new Error('Restaurant not found')
      const restaurantStatus = await restaurantResponse.json()
      
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          restaurantId: restaurantStatus.restaurant.id
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create category')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', params.slug] })
    }
  })

  // Mutation para atualizar categoria
  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateCategoryData>) => {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update category')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', params.slug] })
    }
  })

  // Mutation para deletar categoria
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', params.slug] })
    }
  })

  return {
    categories,
    isLoading,
    error,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory
  }
}

// Hook para gerenciar produtos
export function useProducts(categoryId?: string) {
  const params = useParams() as { slug: string }
  const queryClient = useQueryClient()

  // Query para listar produtos
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-products', params.slug, categoryId],
    queryFn: async (): Promise<Product[]> => {
      const queryParams = new URLSearchParams({ restaurant: params.slug })
      if (categoryId) queryParams.append('categoryId', categoryId)
      
      const response = await fetch(`/api/admin/products?${queryParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch products')
      }
      return response.json()
    },
    enabled: !!params.slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutation para criar produto
  const createProduct = useMutation({
    mutationFn: async (data: CreateProductData) => {
      // Buscar ID do restaurante
      const restaurantResponse = await fetch(`/api/restaurant/${params.slug}/status`)
      if (!restaurantResponse.ok) throw new Error('Restaurant not found')
      const restaurantStatus = await restaurantResponse.json()
      
      const requestData = {
        ...data,
        restaurantId: restaurantStatus.restaurant.id
      }
      
      // Debug: Log dos dados sendo enviados
      console.log('Dados sendo enviados para a API:', JSON.stringify(requestData, null, 2))
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Erro da API:', error)
        throw new Error(error.error || 'Failed to create product')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['admin-categories', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', params.slug] })
    }
  })

  // Mutation para atualizar produto
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateProductData>) => {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['admin-categories', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', params.slug] })
    }
  })

  // Mutation para deletar produto
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete product')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['admin-categories', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-menu', params.slug] })
    }
  })

  // Mutation para duplicar produto
  const duplicateProduct = useMutation({
    mutationFn: async (product: Product) => {
      const duplicatedData = {
        name: `${product.name} (Cópia)`,
        description: product.description || undefined,
        price: product.price,
        promotionalPrice: product.promotionalPrice || undefined,
        imageUrl: product.imageUrl || undefined,
        categoryId: product.categoryId,
        isActive: product.isActive,
        isFeatured: false, // Duplicatas não são featured por padrão
        isAvailable: product.isAvailable,
        options: product.options
      }
      
      return createProduct.mutateAsync(duplicatedData)
    }
  })

  return {
    products,
    isLoading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct
  }
}

// Hook para gerenciar tema
export function useTheme() {
  const params = useParams() as { slug: string }
  const queryClient = useQueryClient()

  // Query para buscar configurações de tema
  const {
    data: themeSettings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-theme', params.slug],
    queryFn: async (): Promise<ThemeSettings> => {
      const response = await fetch(`/api/admin/restaurant/theme?restaurant=${params.slug}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch theme settings')
      }
      return response.json()
    },
    enabled: !!params.slug,
    staleTime: 10 * 60 * 1000, // 10 minutos
  })

  // Mutation para atualizar tema
  const updateTheme = useMutation({
    mutationFn: async (data: Partial<ThemeSettings>) => {
      const response = await fetch(`/api/admin/restaurant/theme?restaurant=${params.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update theme')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-theme', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-status', params.slug] })
    }
  })

  // Mutation para resetar tema
  const resetTheme = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/restaurant/theme?restaurant=${params.slug}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reset theme')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-theme', params.slug] })
      queryClient.invalidateQueries({ queryKey: ['restaurant-status', params.slug] })
    }
  })

  return {
    themeSettings,
    isLoading,
    error,
    refetch,
    updateTheme,
    resetTheme
  }
}

// Hook utilitário para obter dados básicos do restaurante
export function useRestaurantInfo() {
  const params = useParams() as { slug: string }

  return useQuery({
    queryKey: ['restaurant-info', params.slug],
    queryFn: async () => {
      const response = await fetch(`/api/restaurant/${params.slug}/status`)
      if (!response.ok) throw new Error('Failed to fetch restaurant info')
      const data = await response.json()
      return data.restaurant
    },
    enabled: !!params.slug,
    staleTime: 5 * 60 * 1000,
  })
}