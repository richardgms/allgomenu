'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProcessedCategory } from '@/types/restaurant'

interface CategoryNavigationProps {
  categories: ProcessedCategory[]
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
  loading?: boolean
  children: React.ReactNode
}

export function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  loading = false,
  children
}: CategoryNavigationProps) {
  if (loading) {
    return (
      <section className="py-8 border-b bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="flex justify-center mb-8">
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                Cardápio em Breve
              </h2>
              <p className="text-muted-foreground text-lg">
                Estamos preparando nosso cardápio. Volte em breve!
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 border-b bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Nosso Cardápio
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore todas as categorias dos nossos produtos
            </p>
          </div>

          <Tabs 
            value={selectedCategory} 
            onValueChange={onCategorySelect} 
            className="w-full"
          >
            <div className="flex justify-center mb-8">
              <TabsList 
                className="grid w-full max-w-4xl gap-2" 
                style={{
                  gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)`
                }}
              >
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex items-center gap-2 text-sm px-4 py-2"
                  >
                    <span className="truncate">{category.name}</span>
                    <Badge 
                      variant="secondary" 
                      className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center flex-shrink-0"
                    >
                      {category.availableCount}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Estatísticas das categorias */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {categories.map((category) => (
                  selectedCategory === category.id && (
                    <div key={category.id} className="flex gap-4">
                      <span>{category.productCount} produtos</span>
                      <span>{category.availableCount} disponíveis</span>
                      {category.featuredCount > 0 && (
                        <span>{category.featuredCount} em destaque</span>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>

            {children}
          </Tabs>
        </div>
      </div>
    </section>
  )
}