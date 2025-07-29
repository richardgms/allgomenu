'use client'

import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react'

// Tipos
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
  // Métodos de conveniência
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Provider
interface ToastProviderProps {
  children: ReactNode
  maxToasts?: number
  defaultDuration?: number
}

export function ToastProvider({ 
  children, 
  maxToasts = 5, 
  defaultDuration = 5000 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Gerar ID único
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Adicionar toast
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Limitar número máximo de toasts
      return updated.slice(0, maxToasts)
    })

    // Auto-remover após duração especificada
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [generateId, defaultDuration, maxToasts])

  // Remover toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Limpar todos os toasts
  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Métodos de conveniência
  const success = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'success' })
  }, [addToast])

  const error = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'error' })
  }, [addToast])

  const warning = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'warning' })
  }, [addToast])

  const info = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ ...options, message, type: 'info' })
  }, [addToast])

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Hook para usar toasts
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return context
}

// Componente de container dos toasts
function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

// Componente individual do toast
interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'border',
          icon: '✅',
          iconBg: 'text-white',
          text: 'text-white',
          title: 'text-white',
          style: {
            backgroundColor: 'var(--cor-sucesso)',
            borderColor: 'var(--cor-sucesso)',
            color: 'white'
          }
        }
      case 'error':
        return {
          bg: 'border',
          icon: '❌',
          iconBg: 'text-white',
          text: 'text-white',
          title: 'text-white',
          style: {
            backgroundColor: 'var(--cor-perigo)',
            borderColor: 'var(--cor-perigo)',
            color: 'white'
          }
        }
      case 'warning':
        return {
          bg: 'border',
          icon: '⚠️',
          iconBg: 'text-white',
          text: 'text-white',
          title: 'text-white',
          style: {
            backgroundColor: 'var(--cor-aviso)',
            borderColor: 'var(--cor-aviso)',
            color: 'white'
          }
        }
      case 'info':
        return {
          bg: 'border',
          icon: 'ℹ️',
          iconBg: 'text-white',
          text: 'text-white',
          title: 'text-white',
          style: {
            backgroundColor: 'var(--cor-secundaria-500)',
            borderColor: 'var(--cor-secundaria-500)',
            color: 'white'
          }
        }
      default:
        return {
          bg: 'border',
          icon: 'ℹ️',
          iconBg: 'text-white',
          text: 'text-white',
          title: 'text-white',
          style: {
            backgroundColor: 'var(--cor-neutra-700)',
            borderColor: 'var(--cor-neutra-700)',
            color: 'white'
          }
        }
    }
  }

  const styles = getToastStyles(toast.type)

  return (
    <div className={`
      border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out
      animate-slide-in-right pointer-events-auto hover:shadow-xl
    `} style={styles.style}>
      <div className="flex items-start">
        <div className={`${styles.iconBg} rounded-full p-1 mr-3 flex-shrink-0`}>
          <span className="text-sm">{styles.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={`${styles.title} font-medium text-sm mb-1`}>
              {toast.title}
            </h4>
          )}
          <p className={`${styles.text} text-sm line-clamp-2`}>
            {toast.message}
          </p>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`${styles.text} text-sm font-medium underline mt-2 hover:no-underline`}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => removeToast(toast.id)}
          className={`${styles.text} hover:opacity-75 ml-3 flex-shrink-0 text-lg leading-none`}
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Adicionar animações ao CSS
const toastAnimations = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`

// Inserir CSS de animações
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = toastAnimations
  document.head.appendChild(style)
}