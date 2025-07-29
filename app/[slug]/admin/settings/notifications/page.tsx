'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Save, Volume2, VolumeX, Smartphone, Mail, MessageSquare, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface NotificationSettings {
  orders: {
    newOrder: boolean
    orderUpdate: boolean
    orderCancellation: boolean
    soundEnabled: boolean
    soundVolume: number
    soundType: string
  }
  system: {
    lowStock: boolean
    systemMaintenance: boolean
    securityAlerts: boolean
    backupStatus: boolean
  }
  marketing: {
    dailyReport: boolean
    weeklyReport: boolean
    monthlyReport: boolean
    promotionReminders: boolean
  }
  channels: {
    push: boolean
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}

const soundOptions = [
  { value: 'bell', label: 'Sino', preview: '🔔' },
  { value: 'chime', label: 'Carrilhão', preview: '🎵' },
  { value: 'notification', label: 'Notificação', preview: '📢' },
  { value: 'alert', label: 'Alerta', preview: '⚠️' },
  { value: 'custom', label: 'Personalizado', preview: '🎶' }
]

export default function NotificationSettingsPage({ params }: { params: { slug: string } }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    orders: {
      newOrder: true,
      orderUpdate: true,
      orderCancellation: true,
      soundEnabled: true,
      soundVolume: 80,
      soundType: 'bell'
    },
    system: {
      lowStock: true,
      systemMaintenance: true,
      securityAlerts: true,
      backupStatus: false
    },
    marketing: {
      dailyReport: true,
      weeklyReport: true,
      monthlyReport: false,
      promotionReminders: true
    },
    channels: {
      push: true,
      email: true,
      sms: false,
      whatsapp: true
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  })

  const [testNotification, setTestNotification] = useState('')
  const [email, setEmail] = useState('admin@restaurante.com')
  const [phone, setPhone] = useState('+55 11 99999-9999')

  const updateOrderSettings = (key: keyof NotificationSettings['orders'], value: boolean | number | string) => {
    setSettings(prev => ({
      ...prev,
      orders: { ...prev.orders, [key]: value }
    }))
  }

  const updateSystemSettings = (key: keyof NotificationSettings['system'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      system: { ...prev.system, [key]: value }
    }))
  }

  const updateMarketingSettings = (key: keyof NotificationSettings['marketing'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      marketing: { ...prev.marketing, [key]: value }
    }))
  }

  const updateChannelSettings = (key: keyof NotificationSettings['channels'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [key]: value }
    }))
  }

  const updateQuietHours = (key: keyof NotificationSettings['quietHours'], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }))
  }

  const playTestSound = () => {
    // Simular reprodução de som de teste
    setTestNotification('Som de teste reproduzido!')
    setTimeout(() => setTestNotification(''), 3000)
  }

  const sendTestNotification = () => {
    setTestNotification('Notificação de teste enviada!')
    setTimeout(() => setTestNotification(''), 3000)
  }

  const getActiveChannelsCount = () => {
    return Object.values(settings.channels).filter(Boolean).length
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
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600">Configure alertas de pedidos e notificações do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {getActiveChannelsCount()} canais ativos
          </Badge>
        </div>
      </div>

      {/* Test Notification */}
      {testNotification && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>{testNotification}</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sound Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Som das Notificações
              </CardTitle>
              <CardDescription>
                Configure os sons de alerta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">Som habilitado</Label>
                <Switch
                  id="sound-enabled"
                  checked={settings.orders.soundEnabled}
                  onCheckedChange={(checked) => updateOrderSettings('soundEnabled', checked)}
                />
              </div>

              {settings.orders.soundEnabled && (
                <>
                  <div className="space-y-3">
                    <Label>Volume: {settings.orders.soundVolume}%</Label>
                    <Slider
                      value={[settings.orders.soundVolume]}
                      onValueChange={(value) => updateOrderSettings('soundVolume', value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de som</Label>
                    <Select
                      value={settings.orders.soundType}
                      onValueChange={(value) => updateOrderSettings('soundType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {soundOptions.map((sound) => (
                          <SelectItem key={sound.value} value={sound.value}>
                            {sound.preview} {sound.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" className="w-full" onClick={playTestSound}>
                    🔊 Testar Som
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VolumeX className="h-5 w-5" />
                Horário Silencioso
              </CardTitle>
              <CardDescription>
                Desabilitar notificações em horários específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-hours">Ativar horário silencioso</Label>
                <Switch
                  id="quiet-hours"
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
                />
              </div>

              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={settings.quietHours.startTime}
                      onChange={(e) => updateQuietHours('startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim</Label>
                    <Input
                      type="time"
                      value={settings.quietHours.endTime}
                      onChange={(e) => updateQuietHours('endTime', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contatos para Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-email">E-mail</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-phone">Telefone/WhatsApp</Label>
                <Input
                  id="notification-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button variant="outline" className="w-full" onClick={sendTestNotification}>
                📱 Enviar Teste
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notification Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🛒 Notificações de Pedidos
              </CardTitle>
              <CardDescription>
                Alertas relacionados aos pedidos dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-order">Novo pedido</Label>
                    <p className="text-sm text-gray-500">Alertar quando um novo pedido for recebido</p>
                  </div>
                  <Switch
                    id="new-order"
                    checked={settings.orders.newOrder}
                    onCheckedChange={(checked) => updateOrderSettings('newOrder', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="order-update">Atualização de pedido</Label>
                    <p className="text-sm text-gray-500">Notificar sobre mudanças no status do pedido</p>
                  </div>
                  <Switch
                    id="order-update"
                    checked={settings.orders.orderUpdate}
                    onCheckedChange={(checked) => updateOrderSettings('orderUpdate', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="order-cancellation">Cancelamento de pedido</Label>
                    <p className="text-sm text-gray-500">Alertar sobre pedidos cancelados</p>
                  </div>
                  <Switch
                    id="order-cancellation"
                    checked={settings.orders.orderCancellation}
                    onCheckedChange={(checked) => updateOrderSettings('orderCancellation', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Notificações do Sistema
              </CardTitle>
              <CardDescription>
                Alertas sobre o funcionamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-stock">Estoque baixo</Label>
                    <p className="text-sm text-gray-500">Alertar quando produtos estiverem com estoque baixo</p>
                  </div>
                  <Switch
                    id="low-stock"
                    checked={settings.system.lowStock}
                    onCheckedChange={(checked) => updateSystemSettings('lowStock', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-maintenance">Manutenção do sistema</Label>
                    <p className="text-sm text-gray-500">Notificar sobre manutenções programadas</p>
                  </div>
                  <Switch
                    id="system-maintenance"
                    checked={settings.system.systemMaintenance}
                    onCheckedChange={(checked) => updateSystemSettings('systemMaintenance', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="security-alerts">Alertas de segurança</Label>
                    <p className="text-sm text-gray-500">Notificar sobre tentativas de acesso suspeitas</p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={settings.system.securityAlerts}
                    onCheckedChange={(checked) => updateSystemSettings('securityAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="backup-status">Status do backup</Label>
                    <p className="text-sm text-gray-500">Notificar sobre falhas no backup automático</p>
                  </div>
                  <Switch
                    id="backup-status"
                    checked={settings.system.backupStatus}
                    onCheckedChange={(checked) => updateSystemSettings('backupStatus', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Relatórios e Marketing
              </CardTitle>
              <CardDescription>
                Notificações sobre vendas e marketing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-report">Relatório diário</Label>
                    <p className="text-sm text-gray-500">Resumo das vendas do dia</p>
                  </div>
                  <Switch
                    id="daily-report"
                    checked={settings.marketing.dailyReport}
                    onCheckedChange={(checked) => updateMarketingSettings('dailyReport', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-report">Relatório semanal</Label>
                    <p className="text-sm text-gray-500">Resumo semanal de vendas e métricas</p>
                  </div>
                  <Switch
                    id="weekly-report"
                    checked={settings.marketing.weeklyReport}
                    onCheckedChange={(checked) => updateMarketingSettings('weeklyReport', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthly-report">Relatório mensal</Label>
                    <p className="text-sm text-gray-500">Análise completa mensal</p>
                  </div>
                  <Switch
                    id="monthly-report"
                    checked={settings.marketing.monthlyReport}
                    onCheckedChange={(checked) => updateMarketingSettings('monthlyReport', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotion-reminders">Lembretes de promoção</Label>
                    <p className="text-sm text-gray-500">Lembrar sobre promoções ativas ou para criar</p>
                  </div>
                  <Switch
                    id="promotion-reminders"
                    checked={settings.marketing.promotionReminders}
                    onCheckedChange={(checked) => updateMarketingSettings('promotionReminders', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 Canais de Entrega
              </CardTitle>
              <CardDescription>
                Escolha como receber as notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label htmlFor="push-notifications">Push (App)</Label>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.channels.push}
                    onCheckedChange={(checked) => updateChannelSettings('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="email-notifications">E-mail</Label>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.channels.email}
                    onCheckedChange={(checked) => updateChannelSettings('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label htmlFor="sms-notifications">SMS</Label>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={settings.channels.sms}
                    onCheckedChange={(checked) => updateChannelSettings('sms', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label htmlFor="whatsapp-notifications">WhatsApp</Label>
                  </div>
                  <Switch
                    id="whatsapp-notifications"
                    checked={settings.channels.whatsapp}
                    onCheckedChange={(checked) => updateChannelSettings('whatsapp', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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