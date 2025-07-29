'use client'

import { forwardRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductGrid } from './ProductGrid'
import { ProcessedCategory, ProcessedProduct } from '@/types/restaurant'
import { useScrollSpySection } from '@/hooks/useScrollSpy'

interface CategorySectionProps {
  category: ProcessedCategory
  onAddToCart: (product: ProcessedProduct, quantity: number, observation?: string) => void
  loading?: boolean
  scrollSpy: any // Para o registro automático da seção
}

export const CategorySection = forwardRef<HTMLElement, CategorySectionProps>(
  ({ category, onAddToCart, loading = false, scrollSpy }, ref) => {
    const sectionId = `category-${category.id}`
    const sectionRef = useScrollSpySection(sectionId, scrollSpy)

    return (
      <section 
        ref={(el) => {
          // Combinar refs
          if (ref) {
            if (typeof ref === 'function') {
              ref(el)
            } else {
              ref.current = el
            }
          }
          sectionRef.current = el
        }}
        id={sectionId}
        className="scroll-mt-20" // Offset para a navegação fixa
        role="tabpanel"
        aria-labelledby={`tab-${category.id}`}
        tabIndex={-1}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header da Categoria */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Estatísticas da Categoria */}
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {category.productCount} produtos
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {category.availableCount} disponíveis
                  </Badge>
                </div>
                {category.featuredCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.featuredCount} em destaque
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />
            </div>

            {/* Grid de Produtos */}
            <div className="mb-12">
              <ProductGrid 
                products={category.products}
                onAddToCart={onAddToCart}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </section>
    )
  }
)

CategorySection.displayName = 'CategorySection'