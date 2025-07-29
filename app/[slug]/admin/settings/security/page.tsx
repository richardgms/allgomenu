'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Shield, 
  Save, 
  Eye, 
  EyeOff, 
  Lock, 
  Key, 
  AlertTriangle, 
  Clock, 
  Smartphone, 
  Mail,
  History,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface SecurityLog {
  id: string
  action: string
  user: string
  timestamp: string
  ip: string
  status: 'success' | 'failed' | 'blocked'
  details: string
}

interface LoginAttempt {
  ip: string
  attempts: number
  lastAttempt: string
  isBlocked: boolean
}

export default function SecurityPage({ params }: { params: { slug: string } }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordExpiry, setPasswordExpiry] = useState(90)
  const [sessionTimeout, setSessionTimeout] = useState(120)
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false)
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5)
  const [lockoutDuration, setLockoutDuration] = useState(30)
  const [requireStrongPasswords, setRequireStrongPasswords] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [auditLogEnabled, setAuditLogEnabled] = useState(true)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [whitelistedIPs, setWhitelistedIPs] = useState(['192.168.1.1', '203.0.113.1'])
  const [newIP, setNewIP] = useState('')

  const [securityLogs] = useState<SecurityLog[]>([
    {
      id: '1',
      action: 'Login bem-sucedido',
      user: 'João Silva',
      timestamp: '2024-01-15 14:30:15',
      ip: '192.168.1.100',
      status: 'success',
      details: 'Login via dashboard admin'
    },
    {
      id: '2',
      action: 'Tentativa de login falhada',
      user: 'Desconhecido',
      timestamp: '2024-01-15 13:45:22',
      ip: '185.220.101.5',
      status: 'failed',
      details: 'Senha incorreta - usuário admin@restaurante.com'
    },
    {
      id: '3',
      action: 'IP bloqueado',
      user: 'Sistema',
      timestamp: '2024-01-15 13:47:30',
      ip: '185.220.101.5',
      status: 'blocked',
      details: 'Muitas tentativas de login falhadas'
    },
    {
      id: '4',
      action: 'Alteração de configurações',
      user: 'Maria Santos',
      timestamp: '2024-01-15 12:15:10',
      ip: '192.168.1.105',
      status: 'success',
      details: 'Configurações de notificação alteradas'
    }
  ])

  const [blockedAttempts] = useState<LoginAttempt[]>([
    {
      ip: '185.220.101.5',
      attempts: 8,
      lastAttempt: '2024-01-15 13:47:30',
      isBlocked: true
    },
    {
      ip: '198.51.100.42',
      attempts: 3,
      lastAttempt: '2024-01-15 11:22:15',
      isBlocked: false
    }
  ])

  const generateBackupCodes = () => {
    // Simular geração de códigos de backup
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )
    alert(`Códigos de backup gerados:\n${codes.join('\n')}\n\nGuarde estes códigos em local seguro!`)
  }

  const addIP = () => {
    if (newIP && !whitelistedIPs.includes(newIP)) {
      setWhitelistedIPs([...whitelistedIPs, newIP])
      setNewIP('')
    }
  }

  const removeIP = (ip: string) => {
    setWhitelistedIPs(whitelistedIPs.filter(item => item !== ip))
  }

  const getStatusBadge = (status: SecurityLog['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falha</Badge>
      case 'blocked':
        return <Badge className="bg-orange-100 text-orange-800">Bloqueado</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const getStatusIcon = (status: SecurityLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'blocked':
        return <Shield className="h-4 w-4 text-orange-600" />
      default:
        return null
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
          <h1 className="text-3xl font-bold text-gray-900">Segurança</h1>
          <p className="text-gray-600">Configure a segurança da conta e monitore atividades suspeitas</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
            2FA {twoFactorEnabled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Security Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Password Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança da Senha
              </CardTitle>
              <CardDescription>
                Configure políticas de senha e autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="strong-passwords">Exigir senhas fortes</Label>
                  <p className="text-sm text-gray-500">Mínimo 8 caracteres, maiúsculas, números e símbolos</p>
                </div>
                <Switch
                  id="strong-passwords"
                  checked={requireStrongPasswords}
                  onCheckedChange={setRequireStrongPasswords}
                />
              </div>

              <div className="space-y-2">
                <Label>Expiração de senha (dias)</Label>
                <Select value={passwordExpiry.toString()} onValueChange={(value) => setPasswordExpiry(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="180">180 dias</SelectItem>
                    <SelectItem value="0">Nunca expira</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Alterar Senha</h4>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <div className="flex gap-2">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <div className="flex gap-2">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">
                    Alterar Senha
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Autenticação de Dois Fatores (2FA)
              </CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Ativar 2FA</Label>
                  <p className="text-sm text-gray-500">Use um app autenticador como Google Authenticator</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              {twoFactorEnabled && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-semibold">2FA Ativado</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={generateBackupCodes}>
                      <Key className="h-4 w-4 mr-2" />
                      Gerar Códigos de Backup
                    </Button>
                    <p className="text-sm text-blue-700">
                      Códigos de backup permitem acesso caso perca seu dispositivo
                    </p>
                  </div>
                </div>
              )}

              {!twoFactorEnabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Recomendado</AlertTitle>
                  <AlertDescription>
                    Ative a autenticação de dois fatores para maior segurança da sua conta.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Gerenciamento de Sessão
              </CardTitle>
              <CardDescription>
                Configure timeouts e políticas de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Timeout da sessão (minutos)</Label>
                <Select value={sessionTimeout.toString()} onValueChange={(value) => setSessionTimeout(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Máximo de tentativas de login</Label>
                <Select value={maxLoginAttempts.toString()} onValueChange={(value) => setMaxLoginAttempts(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 tentativas</SelectItem>
                    <SelectItem value="5">5 tentativas</SelectItem>
                    <SelectItem value="10">10 tentativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duração do bloqueio (minutos)</Label>
                <Select value={lockoutDuration.toString()} onValueChange={(value) => setLockoutDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IP Whitelist & Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* IP Whitelist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Lista de IPs Permitidos
              </CardTitle>
              <CardDescription>
                Controle quais IPs podem acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ip-whitelist">Ativar lista branca</Label>
                <Switch
                  id="ip-whitelist"
                  checked={ipWhitelistEnabled}
                  onCheckedChange={setIpWhitelistEnabled}
                />
              </div>

              {ipWhitelistEnabled && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                      placeholder="192.168.1.1"
                    />
                    <Button onClick={addIP} size="sm">
                      +
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {whitelistedIPs.map((ip) => (
                      <div key={ip} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <span className="font-mono">{ip}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeIP(ip)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">E-mail de alertas</Label>
                  <p className="text-sm text-gray-500">Receber alertas por e-mail</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit-log">Log de auditoria</Label>
                  <p className="text-sm text-gray-500">Registrar todas as ações</p>
                </div>
                <Switch
                  id="audit-log"
                  checked={auditLogEnabled}
                  onCheckedChange={setAuditLogEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Tentativas Bloqueadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockedAttempts.map((attempt, index) => (
                  <div key={index} className="text-sm p-3 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs">{attempt.ip}</span>
                      <Badge variant={attempt.isBlocked ? "destructive" : "secondary"}>
                        {attempt.isBlocked ? 'Bloqueado' : 'Monitorado'}
                      </Badge>
                    </div>
                    <div className="text-gray-500 text-xs">
                      <p>{attempt.attempts} tentativas</p>
                      <p>Última: {attempt.lastAttempt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Security Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Log de Segurança
              </CardTitle>
              <CardDescription>
                Histórico de atividades e eventos de segurança
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(log.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{log.action}</h4>
                    {getStatusBadge(log.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Usuário: {log.user}</span>
                    <span>IP: {log.ip}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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