'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, CheckCircle, User, MapPin, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  observation?: string
}

interface SavedAddress {
  id: string
  name: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  zipCode: string
  reference?: string
  isDefault?: boolean
}

interface CheckoutData {
  name: string
  phone: string
  deliveryType: 'delivery' | 'pickup'
  selectedAddressId?: string
  newAddress?: Omit<SavedAddress, 'id'>
  observations: string
  paymentMethod: 'money' | 'card' | 'pix'
  changeFor?: number
}

type CheckoutStep = 'customer' | 'address' | 'payment' | 'confirmation'

interface CheckoutFlowProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: CheckoutStep
  onStepChange: (step: CheckoutStep) => void
  checkoutData: CheckoutData
  onDataChange: (data: Partial<CheckoutData>) => void
  cart: CartItem[]
  deliveryFee: number
  savedAddresses?: SavedAddress[]
  onConfirmOrder: () => void
}

const CHECKOUT_STEPS: Record<CheckoutStep, { label: string; progress: number; icon: React.ReactNode }> = {
  customer: { label: 'Seus Dados', progress: 25, icon: <User className="h-4 w-4" /> },
  address: { label: 'Endereço', progress: 50, icon: <MapPin className="h-4 w-4" /> },
  payment: { label: 'Pagamento', progress: 75, icon: <CreditCard className="h-4 w-4" /> },
  confirmation: { label: 'Confirmação', progress: 100, icon: <CheckCircle className="h-4 w-4" /> }
}

export function CheckoutFlow({ 
  open, 
  onOpenChange, 
  step, 
  onStepChange, 
  checkoutData, 
  onDataChange,
  cart,
  deliveryFee,
  savedAddresses = [],
  onConfirmOrder
}: CheckoutFlowProps) {
  const currentStep = CHECKOUT_STEPS[step]
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal + deliveryFee

  const getNextStep = (currentStep: CheckoutStep): CheckoutStep | null => {
    const steps: CheckoutStep[] = ['customer', 'address', 'payment', 'confirmation']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
  }

  const getPreviousStep = (currentStep: CheckoutStep): CheckoutStep | null => {
    const steps: CheckoutStep[] = ['customer', 'address', 'payment', 'confirmation']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex > 0 ? steps[currentIndex - 1] : null
  }

  const isStepValid = (step: CheckoutStep): boolean => {
    switch (step) {
      case 'customer':
        return !!(checkoutData.name && checkoutData.phone && checkoutData.deliveryType)
      case 'address':
        return checkoutData.deliveryType === 'pickup' || 
               !!(checkoutData.selectedAddressId || 
                  (checkoutData.newAddress?.street && 
                   checkoutData.newAddress?.number && 
                   checkoutData.newAddress?.neighborhood &&
                   checkoutData.newAddress?.city))
      case 'payment':
        return !!checkoutData.paymentMethod
      case 'confirmation':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step === 'confirmation') {
      onConfirmOrder()
    } else {
      const nextStep = getNextStep(step)
      if (nextStep) {
        onStepChange(nextStep)
      }
    }
  }

  const handleBack = () => {
    const previousStep = getPreviousStep(step)
    if (previousStep) {
      onStepChange(previousStep)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStep.icon}
            Finalizar Pedido - {currentStep.label}
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <Progress value={currentStep.progress} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {Object.entries(CHECKOUT_STEPS).map(([stepKey, stepInfo]) => (
                  <span 
                    key={stepKey}
                    className={step === stepKey ? 'font-medium text-primary' : ''}
                  >
                    {stepInfo.label}
                  </span>
                ))}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {step === 'customer' && (
            <CustomerStep data={checkoutData} onChange={onDataChange} />
          )}
          {step === 'address' && (
            <AddressStep 
              data={checkoutData} 
              onChange={onDataChange} 
              savedAddresses={savedAddresses}
            />
          )}
          {step === 'payment' && (
            <PaymentStep data={checkoutData} onChange={onDataChange} />
          )}
          {step === 'confirmation' && (
            <ConfirmationStep 
              data={checkoutData} 
              cart={cart}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
            />
          )}
        </div>

        <DialogFooter className="flex-col space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm w-full">
            <span>Total do pedido:</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          
          <div className="flex gap-2 w-full">
            {step !== 'customer' && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="flex-1"
              disabled={!isStepValid(step)}
            >
              {step === 'confirmation' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Pedido
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componentes das etapas individuais
function CustomerStep({ data, onChange }: { data: CheckoutData; onChange: (data: Partial<CheckoutData>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Seus Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Digite seu nome completo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone/WhatsApp *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-3">
          <Label>Tipo de entrega *</Label>
          <RadioGroup
            value={data.deliveryType}
            onValueChange={(value) => onChange({ deliveryType: value as 'delivery' | 'pickup' })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery">Entrega no endereço</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Retirada no local</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}

function AddressStep({ 
  data, 
  onChange, 
  savedAddresses 
}: { 
  data: CheckoutData; 
  onChange: (data: Partial<CheckoutData>) => void;
  savedAddresses: SavedAddress[]
}) {
  if (data.deliveryType === 'pickup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Retirada no Local
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Você escolheu retirar o pedido no restaurante. Não é necessário informar endereço de entrega.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Endereço de Entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              value={data.newAddress?.street || ''}
              onChange={(e) => onChange({ 
                newAddress: { ...data.newAddress, street: e.target.value } as any
              })}
              placeholder="Nome da rua"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              value={data.newAddress?.number || ''}
              onChange={(e) => onChange({ 
                newAddress: { ...data.newAddress, number: e.target.value } as any
              })}
              placeholder="123"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            value={data.newAddress?.complement || ''}
            onChange={(e) => onChange({ 
              newAddress: { ...data.newAddress, complement: e.target.value } as any
            })}
            placeholder="Apto, bloco, etc"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              value={data.newAddress?.neighborhood || ''}
              onChange={(e) => onChange({ 
                newAddress: { ...data.newAddress, neighborhood: e.target.value } as any
              })}
              placeholder="Nome do bairro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={data.newAddress?.city || ''}
              onChange={(e) => onChange({ 
                newAddress: { ...data.newAddress, city: e.target.value } as any
              })}
              placeholder="Nome da cidade"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reference">Ponto de referência</Label>
          <Input
            id="reference"
            value={data.newAddress?.reference || ''}
            onChange={(e) => onChange({ 
              newAddress: { ...data.newAddress, reference: e.target.value } as any
            })}
            placeholder="Próximo a, em frente a..."
          />
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentStep({ data, onChange }: { data: CheckoutData; onChange: (data: Partial<CheckoutData>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={data.paymentMethod}
          onValueChange={(value) => onChange({ paymentMethod: value as 'money' | 'card' | 'pix' })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="money" id="money" />
            <Label htmlFor="money">Dinheiro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card">Cartão na entrega</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pix" id="pix" />
            <Label htmlFor="pix">PIX</Label>
          </div>
        </RadioGroup>
        
        {data.paymentMethod === 'money' && (
          <div className="space-y-2">
            <Label htmlFor="changeFor">Troco para quanto? (opcional)</Label>
            <Input
              id="changeFor"
              type="number"
              value={data.changeFor || ''}
              onChange={(e) => onChange({ changeFor: parseFloat(e.target.value) || undefined })}
              placeholder="Ex: 50.00"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="observations">Observações do pedido (opcional)</Label>
          <Textarea
            id="observations"
            value={data.observations}
            onChange={(e) => onChange({ observations: e.target.value })}
            placeholder="Alguma observação especial para o seu pedido..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ConfirmationStep({ 
  data, 
  cart, 
  subtotal, 
  deliveryFee, 
  total 
}: { 
  data: CheckoutData;
  cart: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  return (
    <div className="space-y-4">
      {/* Resumo do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <span className="font-medium">{item.quantity}x {item.name}</span>
                {item.observation && (
                  <p className="text-sm text-muted-foreground">Obs: {item.observation}</p>
                )}
              </div>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de entrega:</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Nome:</strong> {data.name}</div>
          <div><strong>Telefone:</strong> {data.phone}</div>
          <div><strong>Entrega:</strong> {data.deliveryType === 'delivery' ? 'Entrega no endereço' : 'Retirada no local'}</div>
          {data.deliveryType === 'delivery' && data.newAddress && (
            <div>
              <strong>Endereço:</strong> {data.newAddress.street}, {data.newAddress.number}
              {data.newAddress.complement && `, ${data.newAddress.complement}`}
              <br />
              {data.newAddress.neighborhood}, {data.newAddress.city}
              {data.newAddress.reference && (
                <><br /><em>Ref: {data.newAddress.reference}</em></>
              )}
            </div>
          )}
          <div><strong>Pagamento:</strong> {
            data.paymentMethod === 'money' ? 'Dinheiro' :
            data.paymentMethod === 'card' ? 'Cartão na entrega' : 'PIX'
          }</div>
          {data.paymentMethod === 'money' && data.changeFor && (
            <div><strong>Troco para:</strong> {formatPrice(data.changeFor)}</div>
          )}
          {data.observations && (
            <div><strong>Observações:</strong> {data.observations}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}