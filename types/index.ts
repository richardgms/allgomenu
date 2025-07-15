// Types para o domínio do negócio
export interface RestaurantTheme {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  font: string;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface ProductOption {
  name: string;
  price: number;
}

export interface ProductOptions {
  sizes?: ProductOption[];
  extras?: ProductOption[];
  flavors?: ProductOption[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedOptions?: {
    size?: string;
    extras?: string[];
    flavor?: string;
  };
  observations?: string;
}

export interface OrderData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  reference?: string;
  observations?: string;
  paymentMethod: 'CASH' | 'PIX' | 'DEBIT_CARD' | 'CREDIT_CARD';
  deliveryType: 'DELIVERY' | 'PICKUP';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface WhatsAppMessage {
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderItems: string;
  totalAmount: string;
  paymentMethod: string;
  deliveryType: string;
  timestamp: string;
}

// Types para APIs
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types para autenticação
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  restaurantId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

// Types para uploads
export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

// Types para forms
export interface RestaurantForm {
  name: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  deliveryTime?: number;
  deliveryRadius?: number;
  openingHours?: OpeningHours;
  themeConfig?: RestaurantTheme;
}

export interface CategoryForm {
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface ProductForm {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  order?: number;
  options?: ProductOptions;
} 