export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  options?: any;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
  products?: Product[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  options?: any;
}

export interface CategoryFormData {
  name: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Restaurant {
  id: string;
  slug: string;
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
  isActive: boolean;
  isOpen: boolean;
  openingHours?: any;
  themeConfig?: any;
  whatsappTemplate?: string;
  createdAt: string;
  updatedAt: string;
} 