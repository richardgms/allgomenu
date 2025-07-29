'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isFeatured: boolean
  options: any
  promotionalPrice?: number
  isAvailable?: boolean
}

interface Category {
  id: string
  name: string
  products: Product[]
}

interface CategoryNavigationProps {
  categories: Category[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
  children: React.ReactNode
}

export function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  children 
}: CategoryNavigationProps) {
  if (!categories.length) {
    return null
  }

  return (
    <section className="py-8 border-b">
      <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Nosso Cardápio</h2>
          <p className="text-muted-foreground mt-2">
            Explore todas as categorias dos nossos produtos
          </p>
        </div>

        <Tabs value={selectedCategory} onValueChange={onCategorySelect} className="w-full">
          <div className="flex justify-center mb-8">
            <ScrollArea className="w-full max-w-4xl">
              <TabsList className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    {category.name}
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {category.products.length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          {children}
        </Tabs>
      </div>
    </section>
  )
}