'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  MessageSquare, 
  Smartphone, 
  Globe, 
  Database, 
  Settings, 
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  QrCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  isEnabled: boolean
  lastSync?: string
  config?: Record<string, any>
}

export default function IntegrationsPage({ params }: { params: { slug: string } }) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Envio automático de pedidos e notificações via WhatsApp',
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      status: 'connected',
      isEnabled: true,
      lastSync: '2024-01-15 10:30',
      config: {
        phoneNumber: '+5511999999999',
        messageTemplate: 'Olá {{customerName}}! Seu pedido {{orderNumber}} foi confirmado. Total: R$ {{total}}. Tempo estimado: {{estimatedTime}} minutos.',
        autoSend: true
      }
    },
    {
      id: 'delivery-apps',
      name: 'Apps de Delivery',
      description: 'Integração com iFood, Uber Eats e outros apps',
      icon: <Smartphone className="h-6 w-6 text-orange-600" />,
      status: 'disconnected',
      isEnabled: false,
      config: {
        ifood: false,
        ubereats: false,
        rappi: false
      }
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Acompanhe o tráfego e conversões do seu site',
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      status: 'pending',
      isEnabled: true,
      config: {
        trackingId: 'GA-XXXXXXXXX'
      }
    },
    {
      id: 'payment-gateway',
      name: 'Gateway de Pagamento',
      description: 'Processar pagamentos online com segurança',
      icon: <Database className="h-6 w-6 text-purple-600" />,
      status: 'error',
      isEnabled: true,
      config: {
        provider: 'stripe',
        publicKey: 'pk_test_xxxxx',
        webhookUrl: 'https://api.restaurante.com/webhook/payments'
      }
    }
  ])

  const [whatsappSettings, setWhatsappSettings] = useState({
    phoneNumber: '+5511999999999',
    messageTemplate: 'Olá {{customerName}}! Seu pedido {{orderNumber}} foi confirmado.\n\nItens:\n{{orderItems}}\n\nTotal: R$ {{total}}\nTempo estimado: {{estimatedTime}} minutos\n\nObrigado pela preferência!',
    autoSend: true,
    sendToCustomer: true,
    sendConfirmation: true,
    sendStatusUpdates: true
  })

  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [testMessage, setTestMessage] = useState('')

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Desconectado</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Conectando...</Badge>
      default:
        return null
    }
  }

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id 
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ))
  }

  const connectIntegration = (id: string) => {
    if (id === 'whatsapp') {
      setShowWhatsAppDialog(true)
    } else {
      // Simular conexão
      setIntegrations(prev => prev.map(integration =>
        integration.id === id 
          ? { ...integration, status: 'pending' }
          : integration
      ))
      
      // Simular resultado após 2 segundos
      setTimeout(() => {
        setIntegrations(prev => prev.map(integration =>
          integration.id === id 
            ? { ...integration, status: 'connected', lastSync: new Date().toLocaleString('pt-BR') }
            : integration
        ))
      }, 2000)
    }
  }

  const disconnectIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id 
        ? { ...integration, status: 'disconnected', isEnabled: false }
        : integration
    ))
  }

  const sendTestWhatsApp = () => {
    setTestMessage('Mensagem de teste enviada via WhatsApp!')
    setTimeout(() => setTestMessage(''), 3000)
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(`https://${params.slug}.allgomenu.com/api/webhook/whatsapp`)
    setTestMessage('URL do webhook copiada!')
    setTimeout(() => setTestMessage(''), 3000)
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
          <h1 className="text-3xl font-bold text-gray-900">Integrações</h1>
          <p className="text-gray-600">Conecte seu restaurante com WhatsApp, delivery apps e outras ferramentas</p>
        </div>
      </div>

      {/* Test Message */}
      {testMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{testMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* WhatsApp Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                WhatsApp Business
              </CardTitle>
              <CardDescription>
                Configure mensagens automáticas de pedidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Status da conexão</Label>
                <Badge className="bg-green-100 text-green-800">Conectado</Badge>
              </div>

              <div className="space-y-2">
                <Label>Número do WhatsApp</Label>
                <div className="flex gap-2">
                  <Input
                    value={whatsappSettings.phoneNumber}
                    onChange={(e) => setWhatsappSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+55 11 99999-9999"
                  />
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-send">Envio automático</Label>
                  <Switch
                    id="auto-send"
                    checked={whatsappSettings.autoSend}
                    onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, autoSend: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="send-customer">Enviar para cliente</Label>
                  <Switch
                    id="send-customer"
                    checked={whatsappSettings.sendToCustomer}
                    onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, sendToCustomer: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="send-updates">Atualizações de status</Label>
                  <Switch
                    id="send-updates"
                    checked={whatsappSettings.sendStatusUpdates}
                    onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, sendStatusUpdates: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Template da mensagem</Label>
                <Textarea
                  value={whatsappSettings.messageTemplate}
                  onChange={(e) => setWhatsappSettings(prev => ({ ...prev, messageTemplate: e.target.value }))}
                  rows={6}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500">
                  Use: {{customerName}}, {{orderNumber}}, {{total}}, {{estimatedTime}}, {{orderItems}}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={sendTestWhatsApp}>
                  📱 Teste
                </Button>
                <Button variant="outline" onClick={copyWebhookUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Integrations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Integrações</CardTitle>
              <CardDescription>
                Gerencie todas as conexões e integrações externas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          {integration.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{integration.name}</h3>
                            {getStatusBadge(integration.status)}
                            {getStatusIcon(integration.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
                          
                          {integration.lastSync && (
                            <p className="text-xs text-gray-500">
                              Última sincronização: {integration.lastSync}
                            </p>
                          )}

                          {integration.status === 'error' && (
                            <Alert className="mt-3">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                Erro na conexão. Verifique as configurações e tente novamente.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={integration.isEnabled}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                        />
                        
                        {integration.status === 'disconnected' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => connectIntegration(integration.id)}
                          >
                            Conectar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectIntegration(integration.id)}
                          >
                            {integration.status === 'pending' ? 'Cancelar' : 'Desconectar'}
                          </Button>
                        )}

                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Integration specific details */}
                    {integration.id === 'whatsapp' && integration.status === 'connected' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Número:</span>
                            <span className="ml-2">{integration.config?.phoneNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Envio automático:</span>
                            <span className="ml-2">{integration.config?.autoSend ? 'Ativo' : 'Inativo'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {integration.id === 'delivery-apps' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex gap-2">
                          <Badge variant="outline">iFood: Inativo</Badge>
                          <Badge variant="outline">Uber Eats: Inativo</Badge>
                          <Badge variant="outline">Rappi: Inativo</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Integrations */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integrações Disponíveis</CardTitle>
              <CardDescription>
                Mais integrações que você pode adicionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-dashed rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Database className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="font-semibold mb-1">Sistema de Estoque</h4>
                  <p className="text-sm text-gray-600 mb-3">Controle automático de estoque</p>
                  <Button variant="outline" size="sm">
                    Em breve
                  </Button>
                </div>

                <div className="border border-dashed rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="font-semibold mb-1">Redes Sociais</h4>
                  <p className="text-sm text-gray-600 mb-3">Publique automaticamente</p>
                  <Button variant="outline" size="sm">
                    Em breve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp Setup Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar WhatsApp Business</DialogTitle>
            <DialogDescription>
              Siga os passos para conectar seu WhatsApp Business
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 mx-auto mb-4 rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Escaneie este QR Code com seu WhatsApp Business
              </p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Instruções</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Abra o WhatsApp Business no seu celular</li>
                  <li>Vá em Configurações → Dispositivos conectados</li>
                  <li>Toque em "Conectar um dispositivo"</li>
                  <li>Escaneie o QR Code acima</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowWhatsAppDialog(false)}>
              Conectado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href={`/${params.slug}/admin/settings`}>
            Voltar
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