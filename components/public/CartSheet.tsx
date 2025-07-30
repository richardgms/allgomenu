'use client'

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Minus, Plus, X, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  observation?: string
}

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
  deliveryFee?: number
  minimumOrder?: number
}

export function CartSheet({ 
  open, 
  onOpenChange, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  deliveryFee = 5.00,
  minimumOrder = 0
}: CartSheetProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const finalTotal = subtotal + deliveryFee
  const isMinimumOrderMet = subtotal >= minimumOrder

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Seu Carrinho
            {cart.length > 0 && (
              <Badge variant="secondary">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {cart.length === 0 
              ? 'Adicione produtos ao seu carrinho' 
              : 'Revise seus itens antes de finalizar o pedido'
            }
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 my-4">
          <div className="space-y-4 pr-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione produtos do cardápio para começar
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.imageUrl || '/placeholder-food.jpg'}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                      
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium leading-tight line-clamp-2">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem(item.id)}
                            className="h-6 w-6 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.observation && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            <strong>Obs:</strong> {item.observation}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <span className="font-semibold text-primary">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {cart.length > 0 && (
          <SheetFooter className="flex-col space-y-4">
            {/* Área do resumo com padding interno adequado */}
            <div className="space-y-3 px-2">
              {/* Linha Subtotal - Contêiner flexbox com justify-content: space-between */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
              </div>
              
              {/* Linha Taxa de entrega - Contêiner flexbox com justify-content: space-between */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de entrega</span>
                <span className="text-sm font-medium">{formatPrice(deliveryFee)}</span>
              </div>
              
              {/* Separador visual com espaçamento adequado */}
              <Separator className="my-3" />
              
              {/* Linha Total - Contêiner flexbox com destaque visual */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-base font-bold text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            
            {minimumOrder > 0 && !isMinimumOrderMet && (
              <div className="text-center">
                <Badge variant="destructive" className="text-xs">
                  Pedido mínimo: {formatPrice(minimumOrder)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Faltam {formatPrice(minimumOrder - subtotal)} para atingir o mínimo
                </p>
              </div>
            )}
            
            <Button 
              onClick={onCheckout} 
              size="lg" 
              className="w-full"
              disabled={!isMinimumOrderMet}
            >
              {isMinimumOrderMet 
                ? 'Finalizar Pedido' 
                : `Adicionar ${formatPrice(minimumOrder - subtotal)}`
              }
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}