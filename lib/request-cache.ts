/**
 * Cache em memória para evitar requisições duplicadas simultâneas
 * Usado principalmente para APIs que podem ser chamadas múltiplas vezes
 * em um curto período de tempo
 */

interface CacheEntry<T> {
  promise: Promise<T>
  timestamp: number
  expiresAt: number
}

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 30000 // 30 segundos por padrão

  /**
   * Executa uma função apenas uma vez para a mesma chave, 
   * retornando o mesmo Promise para chamadas duplicadas
   */
  async deduplicate<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const now = Date.now()
    const existing = this.cache.get(key)

    // Se existe e não expirou, retorna o promise existente
    if (existing && now < existing.expiresAt) {
      return existing.promise
    }

    // Limpar entrada expirada se existir
    if (existing) {
      this.cache.delete(key)
    }

    // Criar nova entrada
    const promise = fn()
    const entry: CacheEntry<T> = {
      promise,
      timestamp: now,
      expiresAt: now + ttl
    }

    this.cache.set(key, entry)

    // Limpar cache após resolução/rejeição
    promise
      .finally(() => {
        // Remover após um pequeno delay para permitir que chamadas
        // muito próximas ainda utilizem o cache
        setTimeout(() => {
          const current = this.cache.get(key)
          if (current === entry) {
            this.cache.delete(key)
          }
        }, 1000)
      })

    return promise
  }

  /**
   * Limpa entradas expiradas do cache
   */
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    const now = Date.now()
    let active = 0
    let expired = 0

    for (const entry of this.cache.values()) {
      if (now < entry.expiresAt) {
        active++
      } else {
        expired++
      }
    }

    return {
      total: this.cache.size,
      active,
      expired
    }
  }
}

// Instância global do cache
export const requestCache = new RequestCache()

// Limpar cache expirado a cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestCache.cleanup()
  }, 5 * 60 * 1000)
}

// Helper para criar chaves de cache consistentes
export const createCacheKey = (...parts: (string | number | boolean | undefined | null)[]): string => {
  return parts
    .filter(part => part !== undefined && part !== null)
    .map(part => String(part))
    .join(':')
}

// Hook para facilitar o uso do cache em componentes React
export const useCachedRequest = <T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
) => {
  return requestCache.deduplicate(key, fn, ttl)
}