import { create } from 'zustand'
import { Category, Product } from '@prisma/client'

type CategoryWithProducts = Category & {
  products: Product[]
}

interface MenuStore {
  categories: CategoryWithProducts[]
  products: Product[]
  selectedCategory: Category | null
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCategories: (categories: CategoryWithProducts[]) => void
  addCategory: (category: Category) => void
  updateCategory: (categoryId: string, updates: Partial<Category>) => void
  removeCategory: (categoryId: string) => void
  reorderCategories: (categoryIds: string[]) => void
  
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (productId: string, updates: Partial<Product>) => void
  removeProduct: (productId: string) => void
  
  setSelectedCategory: (category: Category | null) => void
  setSelectedProduct: (product: Product | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Product actions
  toggleProductAvailability: (productId: string) => void
  toggleProductActive: (productId: string) => void
  toggleProductFeatured: (productId: string) => void
  updateProductImage: (productId: string, imageUrl: string) => void
  
  // Category actions
  toggleCategoryActive: (categoryId: string) => void
  
  // Computed getters
  getProductsByCategory: (categoryId: string) => Product[]
  getActiveCategories: () => CategoryWithProducts[]
  getActiveProducts: () => Product[]
  getFeaturedProducts: () => Product[]
  getAvailableProducts: () => Product[]
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  categories: [],
  products: [],
  selectedCategory: null,
  selectedProduct: null,
  isLoading: false,
  error: null,
  
  setCategories: (categories) => set({ categories, error: null }),
  
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, { ...category, products: [] }]
  })),
  
  updateCategory: (categoryId, updates) => set((state) => ({
    categories: state.categories.map(category => 
      category.id === categoryId ? { ...category, ...updates } : category
    ),
    selectedCategory: state.selectedCategory?.id === categoryId 
      ? { ...state.selectedCategory, ...updates } 
      : state.selectedCategory
  })),
  
  removeCategory: (categoryId) => set((state) => ({
    categories: state.categories.filter(category => category.id !== categoryId),
    selectedCategory: state.selectedCategory?.id === categoryId ? null : state.selectedCategory
  })),
  
  reorderCategories: (categoryIds) => set((state) => {
    const orderedCategories = categoryIds.map((id, index) => {
      const category = state.categories.find(cat => cat.id === id)
      return category ? { ...category, order: index } : null
    }).filter(Boolean) as CategoryWithProducts[]
    
    return { categories: orderedCategories }
  }),
  
  setProducts: (products) => set({ products, error: null }),
  
  addProduct: (product) => set((state) => ({
    products: [...state.products, product],
    categories: state.categories.map(category => 
      category.id === product.categoryId 
        ? { ...category, products: [...category.products, product] }
        : category
    )
  })),
  
  updateProduct: (productId, updates) => set((state) => ({
    products: state.products.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    ),
    categories: state.categories.map(category => ({
      ...category,
      products: category.products.map(product => 
        product.id === productId ? { ...product, ...updates } : product
      )
    })),
    selectedProduct: state.selectedProduct?.id === productId 
      ? { ...state.selectedProduct, ...updates } 
      : state.selectedProduct
  })),
  
  removeProduct: (productId) => set((state) => ({
    products: state.products.filter(product => product.id !== productId),
    categories: state.categories.map(category => ({
      ...category,
      products: category.products.filter(product => product.id !== productId)
    })),
    selectedProduct: state.selectedProduct?.id === productId ? null : state.selectedProduct
  })),
  
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  clearError: () => set({ error: null }),
  
  toggleProductAvailability: (productId) => set((state) => ({
    products: state.products.map(product => 
      product.id === productId 
        ? { ...product, isAvailable: !product.isAvailable }
        : product
    ),
    categories: state.categories.map(category => ({
      ...category,
      products: category.products.map(product => 
        product.id === productId 
          ? { ...product, isAvailable: !product.isAvailable }
          : product
      )
    }))
  })),
  
  toggleProductActive: (productId) => set((state) => ({
    products: state.products.map(product => 
      product.id === productId 
        ? { ...product, isActive: !product.isActive }
        : product
    ),
    categories: state.categories.map(category => ({
      ...category,
      products: category.products.map(product => 
        product.id === productId 
          ? { ...product, isActive: !product.isActive }
          : product
      )
    }))
  })),
  
  toggleProductFeatured: (productId) => set((state) => ({
    products: state.products.map(product => 
      product.id === productId 
        ? { ...product, isFeatured: !product.isFeatured }
        : product
    ),
    categories: state.categories.map(category => ({
      ...category,
      products: category.products.map(product => 
        product.id === productId 
          ? { ...product, isFeatured: !product.isFeatured }
          : product
      )
    }))
  })),
  
  updateProductImage: (productId, imageUrl) => set((state) => ({
    products: state.products.map(product => 
      product.id === productId 
        ? { ...product, imageUrl }
        : product
    ),
    categories: state.categories.map(category => ({
      ...category,
      products: category.products.map(product => 
        product.id === productId 
          ? { ...product, imageUrl }
          : product
      )
    }))
  })),
  
  toggleCategoryActive: (categoryId) => set((state) => ({
    categories: state.categories.map(category => 
      category.id === categoryId 
        ? { ...category, isActive: !category.isActive }
        : category
    ),
    selectedCategory: state.selectedCategory?.id === categoryId 
      ? { ...state.selectedCategory, isActive: !state.selectedCategory.isActive }
      : state.selectedCategory
  })),
  
  getProductsByCategory: (categoryId) => {
    const { products } = get()
    return products.filter(product => product.categoryId === categoryId)
  },
  
  getActiveCategories: () => {
    const { categories } = get()
    return categories.filter(category => category.isActive)
  },
  
  getActiveProducts: () => {
    const { products } = get()
    return products.filter(product => product.isActive)
  },
  
  getFeaturedProducts: () => {
    const { products } = get()
    return products.filter(product => product.isFeatured && product.isActive)
  },
  
  getAvailableProducts: () => {
    const { products } = get()
    return products.filter(product => product.isAvailable && product.isActive)
  }
}))