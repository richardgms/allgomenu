'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  MapPin,
  CreditCard,
  Bell,
  Package,
  Users,
  Shield,
  Database,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react'

interface SettingItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  status?: 'active' | 'inactive' | 'pending'
  badge?: string
}

const settingsCategories = [
  {
    title: 'Operacionais',
    description: 'Configurações básicas do funcionamento',
    items: [
      {
        title: 'Horários de Funcionamento',
        description: 'Configure os dias e horários de atendimento',
        icon: Clock,
        href: '/settings/hours',
        status: 'active' as const,
        badge: 'Configurado'
      },
      {
        title: 'Área de Entrega',
        description: 'Defina zonas de entrega, taxas e tempo estimado',
        icon: MapPin,
        href: '/settings/delivery',
        status: 'pending' as const,
        badge: 'Pendente'
      },
      {
        title: 'Métodos de Pagamento',
        description: 'Configure formas de pagamento aceitas',
        icon: CreditCard,
        href: '/settings/payments',
        status: 'active' as const,
        badge: '3 ativos'
      }
    ]
  },
  {
    title: 'Comunicação',
    description: 'Notificações e integrações',
    items: [
      {
        title: 'Notificações',
        description: 'Configure alertas de pedidos e sistema',
        icon: Bell,
        href: '/settings/notifications',
        status: 'active' as const
      },
      {
        title: 'Integrações',
        description: 'WhatsApp, delivery apps e outras integrações',
        icon: Package,
        href: '/settings/integrations',
        status: 'inactive' as const,
        badge: 'WhatsApp pendente'
      }
    ]
  },
  {
    title: 'Administração',
    description: 'Usuários e segurança',
    items: [
      {
        title: 'Usuários e Permissões',
        description: 'Gerencie acesso de funcionários',
        icon: Users,
        href: '/settings/users',
        status: 'active' as const,
        badge: '2 usuários'
      },
      {
        title: 'Segurança',
        description: 'Configurações de segurança e backup',
        icon: Shield,
        href: '/settings/security',
        status: 'active' as const
      },
      {
        title: 'Backup e Dados',
        description: 'Backup automático e exportação de dados',
        icon: Database,
        href: '/settings/backup',
        status: 'pending' as const,
        badge: 'Não configurado'
      }
    ]
  }
]

interface SettingsPageProps {
  params: { slug: string }
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">
            Gerencie todas as configurações do seu restaurante
          </p>
        </div>
        <Button variant="outline">
          <SettingsIcon className="h-4 w-4 mr-2" />
          Configurações Avançadas
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Configurações mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href={`/${params.slug}/admin/settings/hours`}>
                <Clock className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Horários</div>
                  <div className="text-sm text-gray-500">Aberto agora</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href={`/${params.slug}/admin/settings/delivery`}>
                <MapPin className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Entrega</div>
                  <div className="text-sm text-gray-500">3 zonas ativas</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href={`/${params.slug}/admin/settings/payments`}>
                <CreditCard className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Pagamentos</div>
                  <div className="text-sm text-gray-500">PIX, Cartão</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <Link href={`/${params.slug}/admin/settings/notifications`}>
                <Bell className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Notificações</div>
                  <div className="text-sm text-gray-500">Todas ativas</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Categories */}
      <div className="space-y-6">
        {settingsCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.title} href={`/${params.slug}/admin${item.href}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Icon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.status && (
                            <div className={`w-3 h-3 rounded-full ${
                              item.status === 'active' ? 'bg-green-500' :
                              item.status === 'pending' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                          )}
                          {item.badge && (
                            <Badge variant="secondary" className={getStatusColor(item.status)}>
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Informações sobre o funcionamento do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">Sistema Online</p>
                <p className="text-sm text-gray-600">Todos os serviços funcionando</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium">Banco de Dados</p>
                <p className="text-sm text-gray-600">Conexão estável</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="font-medium">Backup</p>
                <p className="text-sm text-gray-600">Último: há 2 dias</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Precisa de Ajuda?</CardTitle>
          <CardDescription>
            Nossa equipe está pronta para ajudar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button>Contatar Suporte</Button>
            <Button variant="outline">Documentação</Button>
            <Button variant="outline">Tutoriais</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}