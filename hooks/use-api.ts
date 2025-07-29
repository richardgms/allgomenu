'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  status?: number
  code?: string
}

// Estado para operações de API
export interface ApiState<T = any> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

// Hook principal para operações de API
export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const { logout } = useAuth()

  // Função para fazer requisições autenticadas
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('auth_token')
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      logout()
    }

    return response
  }, [logout])

  // Função para executar chamadas de API
  const execute = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetchWithAuth(url, options)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: ApiError = {
          message: errorData.error || errorData.message || `Erro ${response.status}`,
          status: response.status
        }
        
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error: error.message }
      }

      const data = await response.json()
      
      setState({
        data: data.success ? data.data : data,
        loading: false,
        error: null
      })

      return data
    } catch (err) {
      const error: ApiError = {
        message: err instanceof Error ? err.message : 'Erro de conexão'
      }
      
      setState(prev => ({ ...prev, loading: false, error }))
      return { success: false, error: error.message }
    }
  }, [fetchWithAuth])

  // Função para resetar o estado
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
    fetchWithAuth
  }
}

// Hook específico para GET requests
export function useGet<T = any>(url?: string) {
  const api = useApi<T>()

  const get = useCallback(async (customUrl?: string): Promise<ApiResponse<T>> => {
    const targetUrl = customUrl || url
    if (!targetUrl) {
      throw new Error('URL é obrigatória')
    }
    return api.execute(targetUrl, { method: 'GET' })
  }, [api, url])

  return {
    ...api,
    get
  }
}

// Hook específico para POST requests
export function usePost<T = any>(url?: string) {
  const api = useApi<T>()

  const post = useCallback(async (
    data: any, 
    customUrl?: string
  ): Promise<ApiResponse<T>> => {
    const targetUrl = customUrl || url
    if (!targetUrl) {
      throw new Error('URL é obrigatória')
    }
    
    const body = data instanceof FormData ? data : JSON.stringify(data)
    
    return api.execute(targetUrl, {
      method: 'POST',
      body
    })
  }, [api, url])

  return {
    ...api,
    post
  }
}

// Hook específico para PUT requests
export function usePut<T = any>(url?: string) {
  const api = useApi<T>()

  const put = useCallback(async (
    data: any, 
    customUrl?: string
  ): Promise<ApiResponse<T>> => {
    const targetUrl = customUrl || url
    if (!targetUrl) {
      throw new Error('URL é obrigatória')
    }
    
    const body = data instanceof FormData ? data : JSON.stringify(data)
    
    return api.execute(targetUrl, {
      method: 'PUT',
      body
    })
  }, [api, url])

  return {
    ...api,
    put
  }
}

// Hook específico para DELETE requests
export function useDelete<T = any>(url?: string) {
  const api = useApi<T>()

  const deleteRequest = useCallback(async (customUrl?: string): Promise<ApiResponse<T>> => {
    const targetUrl = customUrl || url
    if (!targetUrl) {
      throw new Error('URL é obrigatória')
    }
    return api.execute(targetUrl, { method: 'DELETE' })
  }, [api, url])

  return {
    ...api,
    delete: deleteRequest
  }
}

// Hook para múltiplas operações CRUD
export function useCrud<T = any>(baseUrl: string) {
  const getApi = useGet<T[]>()
  const postApi = usePost<T>()
  const putApi = usePut<T>()
  const deleteApi = useDelete<T>()

  const getAll = useCallback(() => {
    return getApi.get(baseUrl)
  }, [getApi, baseUrl])

  const getById = useCallback((id: string) => {
    return getApi.get(`${baseUrl}/${id}`)
  }, [getApi, baseUrl])

  const create = useCallback((data: Partial<T>) => {
    return postApi.post(data, baseUrl)
  }, [postApi, baseUrl])

  const update = useCallback((id: string, data: Partial<T>) => {
    return putApi.put(data, `${baseUrl}/${id}`)
  }, [putApi, baseUrl])

  const remove = useCallback((id: string) => {
    return deleteApi.delete(`${baseUrl}/${id}`)
  }, [deleteApi, baseUrl])

  return {
    // Estados consolidados
    loading: getApi.loading || postApi.loading || putApi.loading || deleteApi.loading,
    error: getApi.error || postApi.error || putApi.error || deleteApi.error,
    data: getApi.data,
    
    // Operações CRUD
    getAll,
    getById,
    create,
    update,
    remove,
    
    // Reset individual de cada operação
    resetGet: getApi.reset,
    resetPost: postApi.reset,
    resetPut: putApi.reset,
    resetDelete: deleteApi.reset,
    
    // APIs individuais para casos específicos
    getApi,
    postApi,
    putApi,
    deleteApi
  }
}

// Hook para upload de arquivos
export function useUpload() {
  const api = useApi<{ url: string }>()

  const upload = useCallback(async (
    file: File, 
    url: string = '/api/admin/upload'
  ): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.execute(url, {
      method: 'POST',
      body: formData
    })
  }, [api])

  return {
    ...api,
    upload
  }
}

// Hook para busca com debounce
export function useSearch<T = any>(url: string, delay: number = 300) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const api = useGet<T[]>()

  // Debounce da query
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)

    return () => clearTimeout(timer)
  })

  // Executar busca quando query mudar
  useState(() => {
    if (debouncedQuery.trim()) {
      api.get(`${url}?q=${encodeURIComponent(debouncedQuery)}`)
    } else {
      api.reset()
    }
  })

  return {
    ...api,
    query,
    setQuery,
    search: api.get
  }
}

// Hook para paginação
export function usePagination<T = any>(url: string, initialPage: number = 1, pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const api = useGet<{
    items: T[]
    pagination: {
      page: number
      pageSize: number
      totalPages: number
      totalItems: number
    }
  }>()

  const loadPage = useCallback(async (page: number) => {
    const response = await api.get(`${url}?page=${page}&pageSize=${pageSize}`)
    
    if (response.success && response.data) {
      setCurrentPage(response.data.pagination.page)
      setTotalPages(response.data.pagination.totalPages)
      setTotalItems(response.data.pagination.totalItems)
    }
    
    return response
  }, [api, url, pageSize])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1)
    }
  }, [currentPage, totalPages, loadPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      loadPage(currentPage - 1)
    }
  }, [currentPage, loadPage])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadPage(page)
    }
  }, [totalPages, loadPage])

  return {
    ...api,
    currentPage,
    totalPages,
    totalItems,
    items: api.data?.items || [],
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    loadPage,
    nextPage,
    prevPage,
    goToPage
  }
}