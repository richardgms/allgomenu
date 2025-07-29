'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Upload, 
  HardDrive, 
  Calendar, 
  Clock, 
  Database, 
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface BackupFile {
  id: string
  name: string
  date: string
  size: string
  type: 'full' | 'incremental' | 'manual'
  status: 'completed' | 'in_progress' | 'failed'
  progress?: number
}

interface ExportTask {
  id: string
  type: string
  format: string
  date: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
}

export default function BackupPage({ params }: { params: { slug: string } }) {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState('daily')
  const [backupTime, setBackupTime] = useState('02:00')
  const [retentionDays, setRetentionDays] = useState(30)
  const [includeImages, setIncludeImages] = useState(true)
  const [includeLogs, setIncludeLogs] = useState(false)
  const [encryptBackups, setEncryptBackups] = useState(true)
  
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [lastBackupStatus, setLastBackupStatus] = useState<'success' | 'failed' | null>('success')

  const [backups] = useState<BackupFile[]>([
    {
      id: '1',
      name: 'backup_completo_2024-01-15_02-00.zip',
      date: '2024-01-15 02:00:15',
      size: '245 MB',
      type: 'full',
      status: 'completed'
    },
    {
      id: '2',
      name: 'backup_incremental_2024-01-14_02-00.zip',
      date: '2024-01-14 02:00:10',
      size: '28 MB',
      type: 'incremental',
      status: 'completed'
    },
    {
      id: '3',
      name: 'backup_manual_2024-01-13_15-30.zip',
      date: '2024-01-13 15:30:22',
      size: '189 MB',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '4',
      name: 'backup_completo_2024-01-12_02-00.zip',
      date: '2024-01-12 02:00:08',
      size: '0 MB',
      type: 'full',
      status: 'failed'
    }
  ])

  const [exportTasks] = useState<ExportTask[]>([
    {
      id: '1',
      type: 'Pedidos',
      format: 'CSV',
      date: '2024-01-15 14:30',
      status: 'completed',
      downloadUrl: '/exports/orders_2024-01-15.csv'
    },
    {
      id: '2',
      type: 'Produtos',
      format: 'JSON',
      date: '2024-01-15 13:15',
      status: 'processing'
    },
    {
      id: '3',
      type: 'Clientes',
      format: 'Excel',
      date: '2024-01-14 16:45',
      status: 'completed',
      downloadUrl: '/exports/customers_2024-01-14.xlsx'
    }
  ])

  const startManualBackup = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)
    
    // Simular progresso do backup
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setBackupProgress(i)
    }
    
    setIsBackingUp(false)
    setLastBackupStatus('success')
    setBackupProgress(0)
  }

  const downloadBackup = (backupId: string) => {
    // Simular download
    const backup = backups.find(b => b.id === backupId)
    if (backup) {
      alert(`Iniciando download de ${backup.name}`)
    }
  }

  const deleteBackup = (backupId: string) => {
    if (confirm('Tem certeza que deseja excluir este backup?')) {
      alert(`Backup ${backupId} excluído`)
    }
  }

  const exportData = (type: string, format: string) => {
    alert(`Iniciando exportação de ${type} em formato ${format}`)
  }

  const getBackupTypeBadge = (type: BackupFile['type']) => {
    switch (type) {
      case 'full':
        return <Badge className="bg-blue-100 text-blue-800">Completo</Badge>
      case 'incremental':
        return <Badge className="bg-green-100 text-green-800">Incremental</Badge>
      case 'manual':
        return <Badge className="bg-purple-100 text-purple-800">Manual</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>
      case 'in_progress':
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>
      default:
        return <Badge variant="secondary">Desconhecido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Backup e Exportação</h1>
          <p className="text-gray-600">Gerencie backups automáticos e exporte dados do sistema</p>
        </div>
        <div className="flex items-center gap-2">
          {lastBackupStatus === 'success' && (
            <Badge className="bg-green-100 text-green-800">
              Último backup: sucesso
            </Badge>
          )}
          {lastBackupStatus === 'failed' && (
            <Badge className="bg-red-100 text-red-800">
              Último backup: falhou
            </Badge>
          )}
        </div>
      </div>

      {/* Backup Progress */}
      {isBackingUp && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertTitle>Backup em Andamento</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <Progress value={backupProgress} className="w-full" />
              <p>Progresso: {backupProgress}%</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Backup Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Automatic Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Backup Automático
              </CardTitle>
              <CardDescription>
                Configure backups automáticos dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Backup automático</Label>
                  <p className="text-sm text-gray-500">Executar backups de forma automática</p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={autoBackupEnabled}
                  onCheckedChange={setAutoBackupEnabled}
                />
              </div>

              {autoBackupEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequência</Label>
                      <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Input
                        type="time"
                        value={backupTime}
                        onChange={(e) => setBackupTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Retenção (dias)</Label>
                    <Select value={retentionDays.toString()} onValueChange={(value) => setRetentionDays(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Opções de Backup</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="include-images">Incluir imagens</Label>
                          <p className="text-sm text-gray-500">Backup das imagens de produtos</p>
                        </div>
                        <Switch
                          id="include-images"
                          checked={includeImages}
                          onCheckedChange={setIncludeImages}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="include-logs">Incluir logs</Label>
                          <p className="text-sm text-gray-500">Backup dos logs do sistema</p>
                        </div>
                        <Switch
                          id="include-logs"
                          checked={includeLogs}
                          onCheckedChange={setIncludeLogs}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="encrypt-backups">Criptografar backups</Label>
                          <p className="text-sm text-gray-500">Proteger backups com senha</p>
                        </div>
                        <Switch
                          id="encrypt-backups"
                          checked={encryptBackups}
                          onCheckedChange={setEncryptBackups}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Manual Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup Manual
              </CardTitle>
              <CardDescription>
                Execute um backup imediato dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h4 className="font-semibold text-blue-900">Backup Completo</h4>
                  <p className="text-sm text-blue-700">Incluir todos os dados do restaurante</p>
                </div>
                <Button
                  onClick={startManualBackup}
                  disabled={isBackingUp}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isBackingUp ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isBackingUp ? 'Executando...' : 'Fazer Backup'}
                </Button>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Backup Seguro</AlertTitle>
                <AlertDescription>
                  Todos os backups são criptografados e armazenados com segurança. 
                  O processo pode levar alguns minutos dependendo do tamanho dos dados.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exportação de Dados
              </CardTitle>
              <CardDescription>
                Exporte dados específicos em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Pedidos</h4>
                    <p className="text-sm text-gray-500">Histórico completo de pedidos</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportData('Pedidos', 'CSV')}>
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData('Pedidos', 'Excel')}>
                      Excel
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Produtos</h4>
                    <p className="text-sm text-gray-500">Cardápio e informações dos produtos</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportData('Produtos', 'JSON')}>
                      JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData('Produtos', 'CSV')}>
                      CSV
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Clientes</h4>
                    <p className="text-sm text-gray-500">Dados dos clientes (anonimizados)</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportData('Clientes', 'CSV')}>
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData('Clientes', 'Excel')}>
                      Excel
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Analytics</h4>
                    <p className="text-sm text-gray-500">Relatórios e métricas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportData('Analytics', 'PDF')}>
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData('Analytics', 'CSV')}>
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={startManualBackup} disabled={isBackingUp}>
                <Download className="h-4 w-4 mr-2" />
                Backup Agora
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Restaurar Backup
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Backup
              </Button>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usado</span>
                  <span>1.2 GB de 5 GB</span>
                </div>
                <Progress value={24} className="w-full" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Backups</span>
                  <span>850 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Imagens</span>
                  <span>280 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Dados</span>
                  <span>70 MB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Último Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Sucesso</span>
                </div>
                <p className="text-sm text-gray-600">15/01/2024 às 02:00</p>
                <p className="text-sm text-gray-500">Tamanho: 245 MB</p>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>
            Lista de todos os backups realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{getBackupTypeBadge(backup.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      {getStatusBadge(backup.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {backup.status === 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadBackup(backup.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert('Visualizar detalhes do backup')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBackup(backup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas de Exportação</CardTitle>
          <CardDescription>
            Status das exportações de dados em andamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <h4 className="font-semibold text-sm">{task.type} ({task.format})</h4>
                    <p className="text-xs text-gray-500">{task.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  {task.status === 'completed' && task.downloadUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
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