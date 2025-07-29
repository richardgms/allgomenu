'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Save, Plus, Edit, Trash2, Shield, Eye, EyeOff, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'employee'
  isActive: boolean
  lastLogin?: string
  permissions: {
    dashboard: boolean
    menu: boolean
    orders: boolean
    analytics: boolean
    settings: boolean
    customers: boolean
    finance: boolean
  }
  avatar?: string
}

const roleLabels = {
  owner: 'Proprietário',
  admin: 'Administrador',
  manager: 'Gerente',
  employee: 'Funcionário'
}

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  manager: 'bg-green-100 text-green-800',
  employee: 'bg-gray-100 text-gray-800'
}

const permissionLabels = {
  dashboard: 'Dashboard e métricas',
  menu: 'Gestão do cardápio',
  orders: 'Gerenciamento de pedidos',
  analytics: 'Relatórios e analytics',
  settings: 'Configurações do sistema',
  customers: 'Dados dos clientes',
  finance: 'Informações financeiras'
}

export default function UsersPage({ params }: { params: { slug: string } }) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@restaurante.com',
      role: 'owner',
      isActive: true,
      lastLogin: '2024-01-15 14:30',
      permissions: {
        dashboard: true,
        menu: true,
        orders: true,
        analytics: true,
        settings: true,
        customers: true,
        finance: true
      },
      avatar: 'https://github.com/shadcn.png'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@restaurante.com',
      role: 'admin',
      isActive: true,
      lastLogin: '2024-01-15 12:15',
      permissions: {
        dashboard: true,
        menu: true,
        orders: true,
        analytics: true,
        settings: false,
        customers: true,
        finance: false
      }
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      email: 'carlos@restaurante.com',
      role: 'manager',
      isActive: true,
      lastLogin: '2024-01-14 18:45',
      permissions: {
        dashboard: true,
        menu: true,
        orders: true,
        analytics: false,
        settings: false,
        customers: false,
        finance: false
      }
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana@restaurante.com',
      role: 'employee',
      isActive: false,
      lastLogin: '2024-01-10 16:20',
      permissions: {
        dashboard: false,
        menu: false,
        orders: true,
        analytics: false,
        settings: false,
        customers: false,
        finance: false
      }
    }
  ])

  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'employee',
    isActive: true,
    permissions: {
      dashboard: false,
      menu: false,
      orders: true,
      analytics: false,
      settings: false,
      customers: false,
      finance: false
    }
  })

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [tempPassword, setTempPassword] = useState('')

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setTempPassword(password)
  }

  const addUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as User['role'] || 'employee',
        isActive: newUser.isActive !== false,
        permissions: newUser.permissions || {
          dashboard: false,
          menu: false,
          orders: true,
          analytics: false,
          settings: false,
          customers: false,
          finance: false
        }
      }
      setUsers([...users, user])
      setNewUser({
        name: '',
        email: '',
        role: 'employee',
        isActive: true,
        permissions: {
          dashboard: false,
          menu: false,
          orders: true,
          analytics: false,
          settings: false,
          customers: false,
          finance: false
        }
      })
      setShowAddDialog(false)
      setTempPassword('')
    }
  }

  const updateUser = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ))
      setEditingUser(null)
      setShowEditDialog(false)
    }
  }

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
  }

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ))
  }

  const updatePermission = (permissions: User['permissions'], key: keyof User['permissions'], value: boolean) => {
    return { ...permissions, [key]: value }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRolePermissions = (role: User['role']): User['permissions'] => {
    const basePermissions = {
      dashboard: false,
      menu: false,
      orders: false,
      analytics: false,
      settings: false,
      customers: false,
      finance: false
    }

    switch (role) {
      case 'owner':
        return {
          dashboard: true,
          menu: true,
          orders: true,
          analytics: true,
          settings: true,
          customers: true,
          finance: true
        }
      case 'admin':
        return {
          dashboard: true,
          menu: true,
          orders: true,
          analytics: true,
          settings: false,
          customers: true,
          finance: false
        }
      case 'manager':
        return {
          dashboard: true,
          menu: true,
          orders: true,
          analytics: false,
          settings: false,
          customers: false,
          finance: false
        }
      case 'employee':
        return {
          dashboard: false,
          menu: false,
          orders: true,
          analytics: false,
          settings: false,
          customers: false,
          finance: false
        }
      default:
        return basePermissions
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
          <h1 className="text-3xl font-bold text-gray-900">Usuários e Permissões</h1>
          <p className="text-gray-600">Gerencie o acesso de funcionários ao painel administrativo</p>
        </div>
        <Badge variant="secondary">{users.filter(u => u.isActive).length} usuários ativos</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-gray-600">Total de usuários</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
                    <p className="text-sm text-gray-600">Usuários ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Usuários por função</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Proprietários</span>
                      <span>{users.filter(u => u.role === 'owner').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admins</span>
                      <span>{users.filter(u => u.role === 'admin').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gerentes</span>
                      <span>{users.filter(u => u.role === 'manager').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Funcionários</span>
                      <span>{users.filter(u => u.role === 'employee').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuários do Sistema</CardTitle>
                  <CardDescription>
                    Gerencie usuários e suas permissões de acesso
                  </CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Crie uma nova conta de acesso ao painel administrativo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-name">Nome completo</Label>
                          <Input
                            id="user-name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Ex: João Silva"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-email">E-mail</Label>
                          <Input
                            id="user-email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="joao@restaurante.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Função</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => {
                            const role = value as User['role']
                            setNewUser({ 
                              ...newUser, 
                              role,
                              permissions: getRolePermissions(role)
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Funcionário</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="owner">Proprietário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Senha temporária</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={generatePassword}
                          >
                            Gerar
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            placeholder="Senha será gerada automaticamente"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          O usuário deverá alterar a senha no primeiro acesso
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label>Permissões de Acesso</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(permissionLabels).map(([key, label]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <Checkbox
                                id={`new-perm-${key}`}
                                checked={newUser.permissions?.[key as keyof User['permissions']]}
                                onCheckedChange={(checked) => {
                                  if (newUser.permissions) {
                                    setNewUser({
                                      ...newUser,
                                      permissions: updatePermission(
                                        newUser.permissions,
                                        key as keyof User['permissions'],
                                        checked as boolean
                                      )
                                    })
                                  }
                                }}
                              />
                              <Label htmlFor={`new-perm-${key}`} className="text-sm">
                                {label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={addUser}>Criar Usuário</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge className={roleColors[user.role]}>
                              {roleLabels[user.role]}
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                          
                          {user.lastLogin && (
                            <p className="text-xs text-gray-500 mb-3">
                              Último acesso: {user.lastLogin}
                            </p>
                          )}

                          {/* Permissions Summary */}
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(user.permissions)
                              .filter(([_, hasPermission]) => hasPermission)
                              .map(([permission]) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permissionLabels[permission as keyof User['permissions']]}
                                </Badge>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => toggleUserStatus(user.id)}
                        />
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user)
                                setShowEditDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generatePassword()}>
                              <Shield className="h-4 w-4 mr-2" />
                              Resetar Senha
                            </DropdownMenuItem>
                            {user.role !== 'owner' && (
                              <DropdownMenuItem 
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum usuário cadastrado</p>
                    <p className="text-sm">Adicione usuários para gerenciar o acesso</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modifique as informações e permissões do usuário
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Função</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => {
                    const role = value as User['role']
                    setEditingUser({ 
                      ...editingUser, 
                      role,
                      permissions: getRolePermissions(role)
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Funcionário</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="owner">Proprietário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Permissões de Acesso</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-perm-${key}`}
                        checked={editingUser.permissions[key as keyof User['permissions']]}
                        onCheckedChange={(checked) => {
                          setEditingUser({
                            ...editingUser,
                            permissions: updatePermission(
                              editingUser.permissions,
                              key as keyof User['permissions'],
                              checked as boolean
                            )
                          })
                        }}
                      />
                      <Label htmlFor={`edit-perm-${key}`} className="text-sm">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateUser}>Salvar Alterações</Button>
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
          Salvar Alterações
        </Button>
      </div>
    </div>
  )
}