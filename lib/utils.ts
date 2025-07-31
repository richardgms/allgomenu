import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export function generateOrderCode(): string {
  // Gera um código único para o pedido no formato PED + timestamp + random
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `PED${timestamp}${random}`
}

export function isRestaurantOpen(openingHours: unknown): boolean {
  try {
    if (!openingHours) return false

    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase() // 'mon', 'tue', etc.
    const currentTime = now.toTimeString().substring(0, 5) // 'HH:MM'
  
  // Mapear dias da semana
  const dayMap: { [key: string]: string } = {
    sun: 'sunday',
    mon: 'monday', 
    tue: 'tuesday',
    wed: 'wednesday',
    thu: 'thursday',
    fri: 'friday',
    sat: 'saturday'
  }

  const dayKey = dayMap[currentDay]
  if (!dayKey || !openingHours[dayKey]) return false

  const daySchedule = openingHours[dayKey]
  if (daySchedule.closed) return false

  // Verificar se está no horário de funcionamento principal
  if (daySchedule.open && daySchedule.close) {
    if (currentTime >= daySchedule.open && currentTime <= daySchedule.close) {
      // Verificar se não está em um intervalo fechado
      if (daySchedule.intervals && Array.isArray(daySchedule.intervals)) {
        for (const interval of daySchedule.intervals) {
          if (currentTime >= interval.start && currentTime <= interval.end) {
            return false // Está em um intervalo fechado
          }
        }
      }
      return true
    }
  }

  return false
  } catch (error) {
    console.error('Erro ao verificar horário do restaurante:', error);
    return false; // Retorna fechado em caso de erro
  }
}
