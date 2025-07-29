// Tipos compartilhados para o sistema de restaurante

export interface Restaurant {
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

export interface OperationalStatus {
  isOpen: boolean
  isAcceptingOrders: boolean
  nextOpenTime?: string
  closesAt?: string
  currentStatus: string
  statusMessage?: string
}

export interface DeliveryZone {
  name: string
  fee: number
  radius?: number
  minimumOrder?: number
}

export interface DeliveryConfig {
  isDeliveryEnabled: boolean
  estimatedTime: number
  zones: DeliveryZone[]
  minimumOrderByZone: Record<string, number>
}

export interface PaymentMethods {
  cash: boolean
  pix: boolean
  debitCard: boolean
  creditCard: boolean
}

export interface RestaurantStatus {
  restaurant: Restaurant
  operationalStatus: OperationalStatus
  deliveryConfig: DeliveryConfig
  paymentMethods: PaymentMethods
}

export interface ProcessedProduct {
  id: string
  name: string
  description: string | null
  price: number
  promotionalPrice: number | null
  imageUrl: string | null
  isFeatured: boolean
  isActive: boolean
  isAvailable: boolean
  order: number
  options: any
  category: string
  hasPromotion: boolean
  discountPercentage?: number
  effectivePrice: number
}

export interface ProcessedCategory {
  id: string
  name: string
  description: string | null
  order: number
  isActive: boolean
  productCount: number
  availableCount: number
  featuredCount: number
  products: ProcessedProduct[]
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
  observation?: string
}