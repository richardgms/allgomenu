'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Save, Plus, Trash2, Edit, DollarSign, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface DeliveryZone {
  id: string
  name: string
  radius: number
  fee: number
  minimumOrder: number
  estimatedTime: number
  isActive: boolean
  description?: string
}

export default function DeliverySettingsPage({ params }: { params: { slug: string } }) {
  const [deliveryEnabled, setDeliveryEnabled] = useState(true)
  const [pickupEnabled, setPickupEnabled] = useState(true)
  const [freeDeliveryMinimum, setFreeDeliveryMinimum] = useState(50)
  const [maxDeliveryDistance, setMaxDeliveryDistance] = useState(10)
  
  const [zones, setZones] = useState<DeliveryZone[]>([
    {
      id: '1',
      name: 'Zona Centro',
      radius: 3,
      fee: 5.00,
      minimumOrder: 25,
      estimatedTime: 30,
      isActive: true,
      description: 'Centro da cidade e bairros próximos'
    },
    {
      id: '2',
      name: 'Zona Expandida',
      radius: 7,
      fee: 8.00,
      minimumOrder: 35,
      estimatedTime: 45,
      isActive: true,
      description: 'Bairros mais distantes'
    },
    {
      id: '3',
      name: 'Zona Premium',
      radius: 15,
      fee: 12.00,
      minimumOrder: 50,
      estimatedTime: 60,
      isActive: false,
      description: 'Áreas mais distantes com taxa premium'
    }
  ])

  const [newZone, setNewZone] = useState<Partial<DeliveryZone>>({
    name: '',
    radius: 5,
    fee: 5,
    minimumOrder: 25,
    estimatedTime: 30,
    isActive: true,
    description: ''
  })

  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const addZone = () => {
    if (newZone.name) {
      const zone: DeliveryZone = {
        id: Date.now().toString(),
        name: newZone.name,
        radius: newZone.radius || 5,
        fee: newZone.fee || 5,
        minimumOrder: newZone.minimumOrder || 25,
        estimatedTime: newZone.estimatedTime || 30,
        isActive: newZone.isActive !== false,
        description: newZone.description || ''
      }
      setZones([...zones, zone])
      setNewZone({
        name: '',
        radius: 5,
        fee: 5,
        minimumOrder: 25,
        estimatedTime: 30,
        isActive: true,
        description: ''
      })
      setShowAddDialog(false)
    }
  }

  const updateZone = () => {
    if (editingZone) {
      setZones(zones.map(zone => 
        zone.id === editingZone.id ? editingZone : zone
      ))
      setEditingZone(null)
      setShowEditDialog(false)
    }
  }

  const deleteZone = (id: string) => {
    setZones(zones.filter(zone => zone.id !== id))
  }

  const toggleZoneStatus = (id: string) => {
    setZones(zones.map(zone =>
      zone.id === id ? { ...zone, isActive: !zone.isActive } : zone
    ))
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
          <h1 className="text-3xl font-bold text-gray-900">Zona de Entrega</h1>
          <p className="text-gray-600">Configure áreas de entrega, taxas e tempo estimado</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* General Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="delivery-enabled">Entrega ativa</Label>
                <Switch
                  id="delivery-enabled"
                  checked={deliveryEnabled}
                  onCheckedChange={setDeliveryEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="pickup-enabled">Retirada no local</Label>
                <Switch
                  id="pickup-enabled"
                  checked={pickupEnabled}
                  onCheckedChange={setPickupEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Entrega grátis acima de R$ {freeDeliveryMinimum}</Label>
                <Slider
                  value={[freeDeliveryMinimum]}
                  onValueChange={(value) => setFreeDeliveryMinimum(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>R$ 0</span>
                  <span>R$ 100</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Distância máxima: {maxDeliveryDistance} km</Label>
                <Slider
                  value={[maxDeliveryDistance]}
                  onValueChange={(value) => setMaxDeliveryDistance(value[0])}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>1 km</span>
                  <span>20 km</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Visualização do Mapa</CardTitle>
              <CardDescription>
                Área de cobertura das zonas de entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Mapa interativo</p>
                  <p className="text-xs">Visualização das zonas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Zones */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Zonas de Entrega</CardTitle>
                  <CardDescription>
                    Gerencie áreas de entrega com taxas e tempos específicos
                  </CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Zona
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Zona</DialogTitle>
                      <DialogDescription>
                        Configure uma nova área de entrega
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="zone-name">Nome da zona</Label>
                        <Input
                          id="zone-name"
                          value={newZone.name}
                          onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                          placeholder="Ex: Centro, Zona Sul..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Raio (km)</Label>
                          <Input
                            type="number"
                            value={newZone.radius}
                            onChange={(e) => setNewZone({ ...newZone, radius: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Taxa (R$)</Label>
                          <Input
                            type="number"
                            step="0.50"
                            value={newZone.fee}
                            onChange={(e) => setNewZone({ ...newZone, fee: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pedido mínimo (R$)</Label>
                          <Input
                            type="number"
                            value={newZone.minimumOrder}
                            onChange={(e) => setNewZone({ ...newZone, minimumOrder: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tempo estimado (min)</Label>
                          <Input
                            type="number"
                            value={newZone.estimatedTime}
                            onChange={(e) => setNewZone({ ...newZone, estimatedTime: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zone-description">Descrição</Label>
                        <Textarea
                          id="zone-description"
                          value={newZone.description}
                          onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                          placeholder="Descreva a área de cobertura..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addZone}>Adicionar Zona</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zones.map((zone) => (
                  <div key={zone.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{zone.name}</h3>
                          <Badge variant={zone.isActive ? "default" : "secondary"}>
                            {zone.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        
                        {zone.description && (
                          <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{zone.radius} km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>R$ {zone.fee.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">Min:</span>
                            <span>R$ {zone.minimumOrder}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{zone.estimatedTime} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={zone.isActive}
                          onCheckedChange={() => toggleZoneStatus(zone.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingZone(zone)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteZone(zone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {zones.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma zona de entrega configurada</p>
                    <p className="text-sm">Adicione sua primeira zona para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Zone Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Zona</DialogTitle>
            <DialogDescription>
              Modifique as configurações da zona de entrega
            </DialogDescription>
          </DialogHeader>
          {editingZone && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-zone-name">Nome da zona</Label>
                <Input
                  id="edit-zone-name"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Raio (km)</Label>
                  <Input
                    type="number"
                    value={editingZone.radius}
                    onChange={(e) => setEditingZone({ ...editingZone, radius: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa (R$)</Label>
                  <Input
                    type="number"
                    step="0.50"
                    value={editingZone.fee}
                    onChange={(e) => setEditingZone({ ...editingZone, fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pedido mínimo (R$)</Label>
                  <Input
                    type="number"
                    value={editingZone.minimumOrder}
                    onChange={(e) => setEditingZone({ ...editingZone, minimumOrder: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tempo estimado (min)</Label>
                  <Input
                    type="number"
                    value={editingZone.estimatedTime}
                    onChange={(e) => setEditingZone({ ...editingZone, estimatedTime: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-zone-description">Descrição</Label>
                <Textarea
                  id="edit-zone-description"
                  value={editingZone.description}
                  onChange={(e) => setEditingZone({ ...editingZone, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateZone}>Salvar Alterações</Button>
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