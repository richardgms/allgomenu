'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { fetchWithAuth, handleAuthError } from '@/lib/api-client'

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
  status: string;
  createdAt: string;
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('todos')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      // Por enquanto vamos simular dados, depois integraremos com a API real
      setLoading(false)
      setOrders([]) // Dados vazios por enquanto
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError('Erro ao carregar pedidos')
      setLoading(false)
    }
  }

  const filterOptions = [
    { value: 'todos', label: 'Todos os Pedidos', icon: '📋' },
    { value: 'pendente', label: 'Pendentes', icon: '⏳' },
    { value: 'preparando', label: 'Preparando', icon: '👨‍🍳' },
    { value: 'pronto', label: 'Pronto', icon: '✅' },
    { value: 'entregue', label: 'Entregue', icon: '📦' },
  ]

  const mockOrders: Order[] = [
    {
      id: '1',
      customerName: 'João Silva',
      customerPhone: '(11) 99999-9999',
      customerAddress: 'Rua das Flores, 123, São Paulo - SP',
      items: [
        { id: '1', name: 'Pizza Margherita', quantity: 2, price: 35.00 },
        { id: '2', name: 'Coca-Cola 350ml', quantity: 1, price: 5.00 },
      ],
      total: 75.00,
      paymentMethod: 'PIX',
      deliveryMethod: 'Entrega',
      status: 'pendente',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      customerName: 'Maria Santos',
      customerPhone: '(11) 88888-8888',
      customerAddress: 'Av. Paulista, 456, São Paulo - SP',
      items: [
        { id: '3', name: 'Hambúrguer Especial', quantity: 1, price: 25.00 },
        { id: '4', name: 'Batata Frita', quantity: 1, price: 12.00 },
      ],
      total: 37.00,
      paymentMethod: 'Cartão',
      deliveryMethod: 'Retirada',
      status: 'preparando',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      preparando: { color: 'bg-theme-light text-theme-dark', label: 'Preparando' },
      pronto: { color: 'bg-green-100 text-green-800', label: 'Pronto' },
      entregue: { color: 'bg-gray-100 text-gray-800', label: 'Entregue' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const filteredOrders = mockOrders.filter(order => 
    selectedFilter === 'todos' || order.status === selectedFilter
  )

  return (
    <AdminLayout 
      title="Gestão de Pedidos" 
      description="Gerencie todos os pedidos recebidos pelo seu restaurante"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros e Estatísticas */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedFilter === option.value
                    ? 'bg-primary-base text-white shadow-lg transform scale-95'
                    : 'admin-surface hover:admin-surface-hover admin-border'
                }`}
                style={selectedFilter === option.value ? { backgroundColor: 'var(--primary-color)' } : {}}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {option.value === 'todos' ? mockOrders.length : 
                     mockOrders.filter(o => o.status === option.value).length}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="admin-card rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b admin-border">
            <h3 className="text-lg font-semibold admin-text-primary">
              {selectedFilter === 'todos' ? 'Todos os Pedidos' : 
               filterOptions.find(f => f.value === selectedFilter)?.label}
            </h3>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium admin-text-primary mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="admin-text-secondary">
                {selectedFilter === 'todos' 
                  ? 'Ainda não há pedidos registrados no sistema.'
                  : `Não há pedidos com status "${filterOptions.find(f => f.value === selectedFilter)?.label}".`
                }
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center px-4 py-2 admin-bg-secondary rounded-lg text-sm admin-text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  Os pedidos aparecerão automaticamente quando recebidos via WhatsApp
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Pedido #{order.id}
                        </h4>
                        {getStatusBadge(order.status)}
                        <span className="text-sm text-gray-500">
                          {formatDate(order.createdAt)} às {formatTime(order.createdAt)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Cliente:</span> {order.customerName}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Telefone:</span> {order.customerPhone}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Endereço:</span> {order.customerAddress}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Pagamento:</span> {order.paymentMethod}
                          </p>
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Entrega:</span> {order.deliveryMethod}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            Total: R$ {order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Itens do Pedido:</h5>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>R$ {(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pendente' && (
                      <button className="px-4 py-2 btn-primary rounded-lg text-sm">
                        Aceitar Pedido
                      </button>
                    )}
                    {order.status === 'preparando' && (
                      <button className="px-4 py-2 btn-secondary rounded-lg text-sm">
                        Marcar como Pronto
                      </button>
                    )}
                    {order.status === 'pronto' && (
                      <button className="px-4 py-2 btn-primary rounded-lg text-sm">
                        Marcar como Entregue
                      </button>
                    )}
                    
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Entrar em Contato
                    </button>
                    
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Observação sobre integração futura */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Sistema de Pedidos em Desenvolvimento
              </h4>
              <p className="text-sm text-blue-700">
                Esta página está preparada para integração futura com sistema de pedidos automatizados. 
                Por enquanto, os pedidos são recebidos via WhatsApp conforme configurado no sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 