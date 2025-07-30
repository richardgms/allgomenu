/**
 * Filtro de console para reduzir ruído em desenvolvimento
 * Remove warnings desnecessários e mensagens de bibliotecas externas
 */

// Lista de mensagens que devem ser filtradas (parciais)
const FILTERED_MESSAGES = [
  'Download the React DevTools',
  'Warning: Extra attributes from the server',
  'cz-shortcut-listen',
  'Unchecked runtime.lastError',
  'The message port closed before a response was received',
  'Extensão carregada',
  'content.js:1',
  'main-app.js'
]

// Lista de warnings que devem ser filtradas
const FILTERED_WARNINGS = [
  'Extra attributes from the server',
  'cz-shortcut-listen'
]

// Função para verificar se uma mensagem deve ser filtrada
const shouldFilterMessage = (message: string): boolean => {
  if (typeof message !== 'string') {
    const stringMessage = String(message)
    return FILTERED_MESSAGES.some(filtered => stringMessage.includes(filtered))
  }
  return FILTERED_MESSAGES.some(filtered => message.includes(filtered))
}

// Função para verificar se um warning deve ser filtrado
const shouldFilterWarning = (message: string): boolean => {
  if (typeof message !== 'string') {
    const stringMessage = String(message)
    return FILTERED_WARNINGS.some(filtered => stringMessage.includes(filtered))
  }
  return FILTERED_WARNINGS.some(filtered => message.includes(filtered))
}

// Aplicar filtros apenas em desenvolvimento
export const setupConsoleFilters = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return
  }

  // Filtrar console.log
  const originalLog = console.log
  console.log = (...args: any[]) => {
    const message = args.map(arg => String(arg)).join(' ')
    if (!shouldFilterMessage(message)) {
      originalLog(...args)
    }
  }

  // Filtrar console.warn
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = args.map(arg => String(arg)).join(' ')
    if (!shouldFilterWarning(message)) {
      originalWarn(...args)
    }
  }

  // Filtrar console.error para runtime errors específicos
  const originalError = console.error
  console.error = (...args: any[]) => {
    const message = args.map(arg => String(arg)).join(' ')
    if (!shouldFilterMessage(message)) {
      originalError(...args)
    }
  }

  // Log apenas uma vez quando os filtros forem aplicados
  setTimeout(() => {
    originalLog('🧹 Console filters applied - noisy messages will be hidden')
  }, 100)
}

// Aplicar automaticamente se estiver no browser
setupConsoleFilters()