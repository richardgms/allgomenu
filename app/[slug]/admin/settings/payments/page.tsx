'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Save, Plus, Edit, Trash2, DollarSign, Percent, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PaymentMethod {
  id: string
  name: string
  type: 'credit' | 'debit' | 'pix' | 'cash' | 'voucher' | 'other'
  isActive: boolean
  acceptedCards?: string[]
  fee?: number
  description?: string
  instructions?: string
}

const paymentTypes = [
  { value: 'credit', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'debit', label: 'Cartão de Débito', icon: '💳' },
  { value: 'pix', label: 'PIX', icon: '🔄' },
  { value: 'cash', label: 'Dinheiro', icon: '💵' },
  { value: 'voucher', label: 'Vale Alimentação', icon: '🎫' },
  { value: 'other', label: 'Outro', icon: '🔧' }
]

const creditCardBrands = [
  'Visa', 'Mastercard', 'American Express', 'Elo', 'Hipercard', 'Diners Club'
]

export default function PaymentMethodsPage({ params }: { params: { slug: string } }) {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      name: 'PIX',
      type: 'pix',
      isActive: true,
      description: 'Pagamento instantâneo via PIX',
      instructions: 'Escaneie o QR Code ou copie a chave PIX para efetuar o pagamento.'
    },
    {
      id: '2',
      name: 'Cartão de Crédito',
      type: 'credit',
      isActive: true,
      acceptedCards: ['Visa', 'Mastercard', 'Elo'],
      fee: 3.5,
      description: 'Aceito nas principais bandeiras'
    },
    {
      id: '3',
      name: 'Dinheiro',
      type: 'cash',
      isActive: true,
      description: 'Pagamento em espécie na entrega',
      instructions: 'Tenha o valor exato ou informe se precisa de troco para agilizar a entrega.'
    },
    {
      id: '4',
      name: 'Vale Refeição',
      type: 'voucher',
      isActive: false,
      acceptedCards: ['Sodexo', 'Ticket'],
      fee: 2.0,
      description: 'Vale refeição/alimentação'
    }
  ])

  const [newMethod, setNewMethod] = useState<Partial<PaymentMethod>>({
    name: '',
    type: 'other',
    isActive: true,
    acceptedCards: [],
    fee: 0,
    description: '',
    instructions: ''
  })

  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const [pixKey, setPixKey] = useState('pix@restaurante.com')
  const [pixKeyType, setPixKeyType] = useState('email')
  const [changeSupported, setChangeSupported] = useState(true)
  const [maxChangeAmount, setMaxChangeAmount] = useState(100)

  const addMethod = () => {
    if (newMethod.name && newMethod.type) {
      const method: PaymentMethod = {
        id: Date.now().toString(),
        name: newMethod.name,
        type: newMethod.type as PaymentMethod['type'],
        isActive: newMethod.isActive !== false,
        acceptedCards: newMethod.acceptedCards || [],
        fee: newMethod.fee || 0,
        description: newMethod.description || '',
        instructions: newMethod.instructions || ''
      }
      setMethods([...methods, method])
      setNewMethod({
        name: '',
        type: 'other',
        isActive: true,
        acceptedCards: [],
        fee: 0,
        description: '',
        instructions: ''
      })
      setShowAddDialog(false)
    }
  }

  const updateMethod = () => {
    if (editingMethod) {
      setMethods(methods.map(method => 
        method.id === editingMethod.id ? editingMethod : method
      ))
      setEditingMethod(null)
      setShowEditDialog(false)
    }
  }

  const deleteMethod = (id: string) => {
    setMethods(methods.filter(method => method.id !== id))
  }

  const toggleMethodStatus = (id: string) => {
    setMethods(methods.map(method =>
      method.id === id ? { ...method, isActive: !method.isActive } : method
    ))
  }

  const getTypeIcon = (type: string) => {
    return paymentTypes.find(t => t.value === type)?.icon || '🔧'
  }

  const getTypeLabel = (type: string) => {
    return paymentTypes.find(t => t.value === type)?.label || type
  }

  const handleCardSelection = (brand: string, checked: boolean, methodCards: string[]) => {
    if (checked) {
      return [...methodCards, brand]
    } else {
      return methodCards.filter(card => card !== brand)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${params.slug}/admin/settings`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Métodos de Pagamento</h1>
          <p className="text-gray-600">Configure as formas de pagamento aceitas pelo seu restaurante</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* PIX Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔄 Configuração PIX
              </CardTitle>
              <CardDescription>
                Configure sua chave PIX para recebimentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pix-type">Tipo da chave</Label>
                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                    <SelectItem value="random">Chave aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix-key">Chave PIX</Label>
                <Input
                  id="pix-key"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="Digite sua chave PIX"
                />
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <Check className="h-4 w-4" />
                  <span>PIX configurado e ativo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💵 Configuração Dinheiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="change-supported">Aceita troco</Label>
                <Switch
                  id="change-supported"
                  checked={changeSupported}
                  onCheckedChange={setChangeSupported}
                />
              </div>

              {changeSupported && (
                <div className="space-y-2">
                  <Label htmlFor="max-change">Troco máximo (R$)</Label>
                  <Input
                    id="max-change"
                    type="number"
                    value={maxChangeAmount}
                    onChange={(e) => setMaxChangeAmount(Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Valor máximo que você consegue dar de troco
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <CardDescription>
                    Gerencie todas as formas de pagamento aceitas
                  </CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Método
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Método de Pagamento</DialogTitle>
                      <DialogDescription>
                        Configure um novo método de pagamento
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="method-name">Nome do método</Label>
                          <Input
                            id="method-name"
                            value={newMethod.name}
                            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                            placeholder="Ex: Cartão de Débito"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={newMethod.type}
                            onValueChange={(value) => setNewMethod({ ...newMethod, type: value as PaymentMethod['type'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Taxa (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newMethod.fee}
                          onChange={(e) => setNewMethod({ ...newMethod, fee: Number(e.target.value) })}
                          placeholder="0.0"
                        />
                      </div>

                      {(newMethod.type === 'credit' || newMethod.type === 'debit' || newMethod.type === 'voucher') && (
                        <div className="space-y-2">
                          <Label>Bandeiras aceitas</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {creditCardBrands.map((brand) => (
                              <div key={brand} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`new-${brand}`}
                                  checked={newMethod.acceptedCards?.includes(brand)}
                                  onCheckedChange={(checked) => {
                                    const updatedCards = handleCardSelection(brand, checked as boolean, newMethod.acceptedCards || [])
                                    setNewMethod({ ...newMethod, acceptedCards: updatedCards })
                                  }}
                                />
                                <Label htmlFor={`new-${brand}`}>{brand}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="method-description">Descrição</Label>
                        <Input
                          id="method-description"
                          value={newMethod.description}
                          onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                          placeholder="Breve descrição do método"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="method-instructions">Instruções</Label>
                        <Textarea
                          id="method-instructions"
                          value={newMethod.instructions}
                          onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
                          placeholder="Instruções para o cliente sobre como usar este método..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addMethod}>Adicionar Método</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {methods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{getTypeIcon(method.type)}</span>
                          <h3 className="font-semibold">{method.name}</h3>
                          <Badge variant={method.isActive ? "default" : "secondary"}>
                            {method.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          {method.fee && method.fee > 0 && (
                            <Badge variant="outline">
                              <Percent className="h-3 w-3 mr-1" />
                              {method.fee}%
                            </Badge>
                          )}
                        </div>
                        
                        {method.description && (
                          <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                        )}

                        {method.acceptedCards && method.acceptedCards.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {method.acceptedCards.map((card) => (
                              <Badge key={card} variant="outline" className="text-xs">
                                {card}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {method.instructions && (
                          <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                            {method.instructions}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={() => toggleMethodStatus(method.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMethod(method)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {methods.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum método de pagamento configurado</p>
                    <p className="text-sm">Adicione formas de pagamento para começar a vender</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Method Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Método de Pagamento</DialogTitle>
            <DialogDescription>
              Modifique as configurações do método de pagamento
            </DialogDescription>
          </DialogHeader>
          {editingMethod && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do método</Label>
                  <Input
                    value={editingMethod.name}
                    onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingMethod.fee}
                    onChange={(e) => setEditingMethod({ ...editingMethod, fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              {(editingMethod.type === 'credit' || editingMethod.type === 'debit' || editingMethod.type === 'voucher') && (
                <div className="space-y-2">
                  <Label>Bandeiras aceitas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {creditCardBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${brand}`}
                          checked={editingMethod.acceptedCards?.includes(brand)}
                          onCheckedChange={(checked) => {
                            const updatedCards = handleCardSelection(brand, checked as boolean, editingMethod.acceptedCards || [])
                            setEditingMethod({ ...editingMethod, acceptedCards: updatedCards })
                          }}
                        />
                        <Label htmlFor={`edit-${brand}`}>{brand}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={editingMethod.description}
                  onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Instruções</Label>
                <Textarea
                  value={editingMethod.instructions}
                  onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateMethod}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/${params.slug}/admin/settings`}>
            Cancelar
          </Link>
        </Button>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}