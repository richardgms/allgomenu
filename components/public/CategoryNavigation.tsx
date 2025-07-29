'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ProcessedCategory } from '@/types/restaurant'
import { cn } from '@/lib/utils'

interface CategoryNavigationProps {
  categories: ProcessedCategory[]
  activeSection: string
  onNavigate: (categoryId: string) => void
  loading?: boolean
}

export function CategoryNavigation({ 
  categories, 
  activeSection, 
  onNavigate,
  loading = false
}: CategoryNavigationProps) {
  if (loading) {
    return (
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto py-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return null // O estado vazio será tratado pelo componente pai
  }

  return (
    <nav 
      className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      role="navigation"
      aria-label="Navegação do menu por categorias"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 py-4" role="tablist">
              {categories.map((category) => {
                const isActive = activeSection === `category-${category.id}`
                
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onNavigate(`category-${category.id}`)}
                    className={cn(
                      "flex items-center gap-2 text-sm px-4 py-2 flex-shrink-0 transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-sm"
                    )}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`category-${category.id}`}
                    tabIndex={isActive ? 0 : -1}
                  >
                    <span className="truncate font-medium">{category.name}</span>
                    <Badge 
                      variant={isActive ? "secondary" : "outline"}
                      className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center flex-shrink-0"
                      aria-label={`${category.availableCount} produtos disponíveis`}
                    >
                      {category.availableCount}
                    </Badge>
                  </Button>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </nav>
  )
}