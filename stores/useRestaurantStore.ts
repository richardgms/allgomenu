import { create } from 'zustand'
import { Restaurant } from '@prisma/client'

interface RestaurantStore {
  restaurant: Restaurant | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setRestaurant: (restaurant: Restaurant) => void
  updateRestaurant: (updates: Partial<Restaurant>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Status methods
  toggleRestaurantStatus: () => void
  updateOpeningHours: (hours: any) => void
  updateThemeConfig: (themeConfig: any) => void
}

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  restaurant: null,
  isLoading: false,
  error: null,
  
  setRestaurant: (restaurant) => set({ restaurant, error: null }),
  
  updateRestaurant: (updates) => set((state) => ({
    restaurant: state.restaurant ? { ...state.restaurant, ...updates } : null
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearError: () => set({ error: null }),
  
  toggleRestaurantStatus: () => set((state) => ({
    restaurant: state.restaurant ? {
      ...state.restaurant,
      isOpen: !state.restaurant.isOpen
    } : null
  })),
  
  updateOpeningHours: (openingHours) => set((state) => ({
    restaurant: state.restaurant ? {
      ...state.restaurant,
      openingHours
    } : null
  })),
  
  updateThemeConfig: (themeConfig) => set((state) => ({
    restaurant: state.restaurant ? {
      ...state.restaurant,
      themeConfig
    } : null
  }))
}))