'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
  hasBreak: boolean
  breakStart?: string
  breakEnd?: string
}

interface WeekSchedule {
  [key: string]: DaySchedule
}

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira', short: 'SEG' },
  { key: 'tuesday', label: 'Terça-feira', short: 'TER' },
  { key: 'wednesday', label: 'Quarta-feira', short: 'QUA' },
  { key: 'thursday', label: 'Quinta-feira', short: 'QUI' },
  { key: 'friday', label: 'Sexta-feira', short: 'SEX' },
  { key: 'saturday', label: 'Sábado', short: 'SAB' },
  { key: 'sunday', label: 'Domingo', short: 'DOM' }
]

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return [
    { value: `${hour}:00`, label: `${hour}:00` },
    { value: `${hour}:30`, label: `${hour}:30` }
  ]
}).flat()

export default function OperatingHoursPage({ params }: { params: { slug: string } }) {
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { isOpen: true, openTime: '08:00', closeTime: '22:00', hasBreak: false },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '22:00', hasBreak: false },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '22:00', hasBreak: false },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '22:00', hasBreak: false },
    friday: { isOpen: true, openTime: '08:00', closeTime: '23:00', hasBreak: false },
    saturday: { isOpen: true, openTime: '08:00', closeTime: '23:00', hasBreak: false },
    sunday: { isOpen: true, openTime: '09:00', closeTime: '21:00', hasBreak: false }
  })

  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(true)
  const [specialMessage, setSpecialMessage] = useState('')

  const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates }
    }))
  }

  const copyToAllDays = (sourceDay: string) => {
    const sourceSchedule = schedule[sourceDay]
    const newSchedule = { ...schedule }
    
    Object.keys(newSchedule).forEach(day => {
      if (day !== sourceDay) {
        newSchedule[day] = { ...sourceSchedule }
      }
    })
    
    setSchedule(newSchedule)
  }

  const getCurrentStatus = () => {
    if (!isCurrentlyOpen) return { status: 'Fechado', color: 'bg-red-500' }
    
    const now = new Date()
    const currentDay = daysOfWeek[now.getDay() === 0 ? 6 : now.getDay() - 1].key
    const daySchedule = schedule[currentDay]
    
    if (!daySchedule.isOpen) {
      return { status: 'Fechado hoje', color: 'bg-yellow-500' }
    }
    
    return { status: 'Aberto', color: 'bg-green-500' }
  }

  const status = getCurrentStatus()

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
          <h1 className="text-3xl font-bold text-gray-900">Horários de Funcionamento</h1>
          <p className="text-gray-600">Configure os dias e horários de atendimento do seu restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.color}`} />
          <Badge variant="secondary">{status.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Status */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status Atual
              </CardTitle>
              <CardDescription>
                Controle manual do funcionamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="manual-toggle">Restaurante aberto</Label>
                <Switch
                  id="manual-toggle"
                  checked={isCurrentlyOpen}
                  onCheckedChange={setIsCurrentlyOpen}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label htmlFor="special-message">Mensagem especial</Label>
                <Input
                  id="special-message"
                  placeholder="Ex: Delivery até 23h hoje"
                  value={specialMessage}
                  onChange={(e) => setSpecialMessage(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Aparecerá no site para os clientes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const mondaySchedule = schedule.monday
                  copyToAllDays('monday')
                }}
              >
                Aplicar Segunda a todos os dias
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const allDays = { ...schedule }
                  Object.keys(allDays).forEach(day => {
                    allDays[day] = { isOpen: false, openTime: '08:00', closeTime: '22:00', hasBreak: false }
                  })
                  setSchedule(allDays)
                }}
              >
                Fechar todos os dias
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Semanal</CardTitle>
              <CardDescription>
                Defina os horários para cada dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {daysOfWeek.map((day) => {
                  const daySchedule = schedule[day.key]
                  
                  return (
                    <div key={day.key} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-12 justify-center">
                            {day.short}
                          </Badge>
                          <Label className="font-medium">{day.label}</Label>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={daySchedule.isOpen}
                            onCheckedChange={(checked) => 
                              updateDaySchedule(day.key, { isOpen: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToAllDays(day.key)}
                            disabled={!daySchedule.isOpen}
                          >
                            Copiar para todos
                          </Button>
                        </div>
                      </div>

                      {daySchedule.isOpen && (
                        <div className="ml-15 space-y-4 pl-4 border-l-2 border-gray-100">
                          {/* Main Hours */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Abertura</Label>
                              <Select
                                value={daySchedule.openTime}
                                onValueChange={(value) =>
                                  updateDaySchedule(day.key, { openTime: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Fechamento</Label>
                              <Select
                                value={daySchedule.closeTime}
                                onValueChange={(value) =>
                                  updateDaySchedule(day.key, { closeTime: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map((time) => (
                                    <SelectItem key={time.value} value={time.value}>
                                      {time.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Break Time */}
                          <div className="flex items-center justify-between">
                            <Label>Intervalo (pausa para almoço)</Label>
                            <Switch
                              checked={daySchedule.hasBreak}
                              onCheckedChange={(checked) =>
                                updateDaySchedule(day.key, { hasBreak: checked })
                              }
                            />
                          </div>

                          {daySchedule.hasBreak && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Início do intervalo</Label>
                                <Select
                                  value={daySchedule.breakStart || '12:00'}
                                  onValueChange={(value) =>
                                    updateDaySchedule(day.key, { breakStart: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeOptions.map((time) => (
                                      <SelectItem key={time.value} value={time.value}>
                                        {time.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Fim do intervalo</Label>
                                <Select
                                  value={daySchedule.breakEnd || '14:00'}
                                  onValueChange={(value) =>
                                    updateDaySchedule(day.key, { breakEnd: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeOptions.map((time) => (
                                      <SelectItem key={time.value} value={time.value}>
                                        {time.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <Separator />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar Padrão
        </Button>
        
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/${params.slug}/admin/settings`}>
              Cancelar
            </Link>
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  )
}