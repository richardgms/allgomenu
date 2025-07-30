import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestCache, createCacheKey } from '@/lib/request-cache'

interface OperatingHour {
  open: string
  close: string
  closed: boolean
  intervals?: { start: string; end: string }[]
}

interface OperatingHours {
  sunday: OperatingHour
  monday: OperatingHour
  tuesday: OperatingHour
  wednesday: OperatingHour
  thursday: OperatingHour
  friday: OperatingHour
  saturday: OperatingHour
}

interface DeliveryZone {
  name: string
  fee: number
  radius?: number
  minimumOrder?: number
}

interface RestaurantStatus {
  restaurant: {
    id: string
    name: string
    description: string | null
    slug: string
    phone: string | null
    whatsapp: string | null
    themeConfig: any
    deliveryTime: number | null
    minimumOrder: number
    deliveryFee: number
  }
  operationalStatus: {
    isOpen: boolean
    isAcceptingOrders: boolean
    nextOpenTime?: string
    closesAt?: string
    currentStatus: string
    statusMessage?: string
  }
  deliveryConfig: {
    isDeliveryEnabled: boolean
    estimatedTime: number
    zones: DeliveryZone[]
    minimumOrderByZone: Record<string, number>
  }
  paymentMethods: {
    cash: boolean
    pix: boolean
    debitCard: boolean
    creditCard: boolean
  }
}

function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function getCurrentDayKey(): keyof OperatingHours {
  const days: (keyof OperatingHours)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ]
  return days[new Date().getDay()]
}

function getOperationalStatus(openingHours: OperatingHours | null, isActive: boolean, isOpen: boolean) {
  if (!isActive) {
    return {
      isOpen: false,
      isAcceptingOrders: false,
      currentStatus: 'inactive',
      statusMessage: 'Restaurante temporariamente inativo'
    }
  }

  if (!openingHours) {
    return {
      isOpen: isOpen,
      isAcceptingOrders: isOpen,
      currentStatus: isOpen ? 'open' : 'closed',
      statusMessage: isOpen ? 'Aberto' : 'Fechado'
    }
  }

  const now = new Date()
  const currentDay = getCurrentDayKey()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  
  const todayHours = openingHours[currentDay]
  
  if (todayHours.closed) {
    // Encontrar próximo dia aberto
    let nextDay = currentDay
    let daysChecked = 0
    const dayKeys = Object.keys(openingHours) as (keyof OperatingHours)[]
    
    while (daysChecked < 7) {
      const nextDayIndex = (dayKeys.indexOf(nextDay) + 1) % 7
      nextDay = dayKeys[nextDayIndex]
      daysChecked++
      
      if (!openingHours[nextDay].closed) {
        const nextOpenTime = openingHours[nextDay].open
        return {
          isOpen: false,
          isAcceptingOrders: false,
          nextOpenTime,
          currentStatus: 'closed',
          statusMessage: `Fechado hoje. Abre ${daysChecked === 1 ? 'amanhã' : `em ${daysChecked} dias`} às ${nextOpenTime}`
        }
      }
    }
    
    return {
      isOpen: false,
      isAcceptingOrders: false,
      currentStatus: 'closed',
      statusMessage: 'Fechado temporariamente'
    }
  }

  const openTime = timeStringToMinutes(todayHours.open)
  const closeTime = timeStringToMinutes(todayHours.close)
  
  // Verificar se está no horário de funcionamento
  const isInOperatingHours = currentTime >= openTime && currentTime < closeTime
  
  // Verificar intervalos (pausas) se existirem
  let isInBreakInterval = false
  if (todayHours.intervals && todayHours.intervals.length > 0) {
    for (const interval of todayHours.intervals) {
      const startTime = timeStringToMinutes(interval.start)
      const endTime = timeStringToMinutes(interval.end)
      if (currentTime >= startTime && currentTime < endTime) {
        isInBreakInterval = true
        break
      }
    }
  }

  const actuallyOpen = isInOperatingHours && !isInBreakInterval && isOpen

  let statusMessage = ''
  let nextOpenTime: string | undefined
  let closesAt: string | undefined

  if (actuallyOpen) {
    closesAt = todayHours.close
    statusMessage = `Aberto até às ${closesAt}`
  } else if (isInBreakInterval) {
    // Encontrar quando termina o intervalo
    const currentInterval = todayHours.intervals?.find(interval => {
      const startTime = timeStringToMinutes(interval.start)
      const endTime = timeStringToMinutes(interval.end)
      return currentTime >= startTime && currentTime < endTime
    })
    if (currentInterval) {
      nextOpenTime = currentInterval.end
      statusMessage = `Intervalo. Volta às ${nextOpenTime}`
    }
  } else if (currentTime < openTime) {
    nextOpenTime = todayHours.open
    statusMessage = `Fechado. Abre às ${nextOpenTime}`
  } else {
    // Depois do horário de funcionamento - verificar próximo dia
    let nextDay = currentDay
    let daysChecked = 0
    const dayKeys = Object.keys(openingHours) as (keyof OperatingHours)[]
    
    do {
      const nextDayIndex = (dayKeys.indexOf(nextDay) + 1) % 7
      nextDay = dayKeys[nextDayIndex]
      daysChecked++
    } while (openingHours[nextDay].closed && daysChecked < 7)
    
    if (daysChecked < 7) {
      nextOpenTime = openingHours[nextDay].open
      statusMessage = `Fechado. Abre ${daysChecked === 1 ? 'amanhã' : `em ${daysChecked} dias`} às ${nextOpenTime}`
    } else {
      statusMessage = 'Fechado temporariamente'
    }
  }

  return {
    isOpen: actuallyOpen,
    isAcceptingOrders: actuallyOpen,
    nextOpenTime,
    closesAt,
    currentStatus: actuallyOpen ? 'open' : 'closed',
    statusMessage
  }
}

export async function GET(
  request: NextRequest, 
  { params }: { params: { slug: string } }
) {
  try {
    // Cache da consulta do restaurante para evitar hits desnecessários no DB
    const cacheKey = createCacheKey('restaurant-status', params.slug)
    
    const restaurant = await requestCache.deduplicate(
      cacheKey,
      async () => {
        return await db.restaurant.findUnique({
          where: { slug: params.slug },
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            phone: true,
            whatsapp: true,
            themeConfig: true,
            deliveryTime: true,
            minimumOrder: true,
            deliveryFee: true,
            deliveryEnabled: true,
            deliveryZones: true,
            isActive: true,
            isOpen: true,
            openingHours: true
          }
        })
      },
      10000 // Cache por 10 segundos para status do restaurante
    )

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' }, 
        { status: 404 }
      )
    }

    // Processar horários de funcionamento
    const openingHours = restaurant.openingHours as OperatingHours | null
    const operationalStatus = getOperationalStatus(
      openingHours, 
      restaurant.isActive, 
      restaurant.isOpen
    )

    // Processar zonas de entrega
    const deliveryZones = (restaurant.deliveryZones as unknown as DeliveryZone[]) || []
    const minimumOrderByZone = deliveryZones.reduce((acc, zone) => {
      acc[zone.name] = zone.minimumOrder || Number(restaurant.minimumOrder)
      return acc
    }, {} as Record<string, number>)

    // Preparar resposta
    const status: RestaurantStatus = {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        slug: restaurant.slug,
        phone: restaurant.phone,
        whatsapp: restaurant.whatsapp,
        themeConfig: restaurant.themeConfig,
        deliveryTime: restaurant.deliveryTime,
        minimumOrder: Number(restaurant.minimumOrder),
        deliveryFee: Number(restaurant.deliveryFee)
      },
      operationalStatus,
      deliveryConfig: {
        isDeliveryEnabled: restaurant.deliveryEnabled,
        estimatedTime: restaurant.deliveryTime || 30,
        zones: deliveryZones,
        minimumOrderByZone
      },
      paymentMethods: {
        cash: true, // Por padrão, assumindo que aceita dinheiro
        pix: true,  // Por padrão, assumindo que aceita PIX
        debitCard: true,
        creditCard: true
      }
    }

    // Headers para cache
    const response = NextResponse.json(status)
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    
    return response

  } catch (error) {
    console.error('Error fetching restaurant status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}