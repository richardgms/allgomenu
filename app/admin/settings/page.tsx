'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth-supabase';
import { fetchWithAuth, handleAuthError } from '@/lib/api-client';
import ImageUpload from '@/components/ImageUpload';

interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  deliveryTime?: number;
  deliveryRadius?: number;
  isActive: boolean;
  isOpen: boolean;
  openingHours?: any;
  themeConfig?: any;
  whatsappTemplate?: string;
}

interface TabProps {
  id: string;
  label: string;
  icon: string;
}

const tabs: TabProps[] = [
  { id: 'basic', label: 'Informações Básicas', icon: '🏪' },
  { id: 'delivery', label: 'Entrega', icon: '🚚' },
  { id: 'zones', label: 'Zonas de Entrega', icon: '🗺️' },
  { id: 'hours', label: 'Horários', icon: '⏰' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
  { id: 'theme', label: 'Personalização', icon: '🎨' },
  { id: 'status', label: 'Status', icon: '🔄' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Informações Básicas
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    
    // Entrega
    deliveryFee: '',
    minimumOrder: '',
    deliveryTime: '',
    deliveryRadius: '',
    deliveryEnabled: true,
    deliveryZones: [],
    
    // Status
    isOpen: false,
    
    // Horários
    openingHours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '22:00', closed: false },
      sunday: { open: '08:00', close: '22:00', closed: false },
    },
    
    // WhatsApp
    whatsappTemplate: '',
    
    // Tema
    themeConfig: {
      primaryColor: '#DC2626',
      secondaryColor: '#059669',
      logo: '',
      font: 'Inter'
    }
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/me');
      handleAuthError(response);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        if (data.user.restaurant) {
          const rest = data.user.restaurant;
          setRestaurant(rest);
          setFormData({
            name: rest.name || '',
            description: rest.description || '',
            phone: rest.phone || '',
            whatsapp: rest.whatsapp || '',
            email: rest.email || '',
            address: rest.address || '',
            deliveryFee: rest.deliveryFee?.toString() || '',
            minimumOrder: rest.minimumOrder?.toString() || '',
            deliveryTime: rest.deliveryTime?.toString() || '',
            deliveryRadius: rest.deliveryRadius?.toString() || '',
            deliveryEnabled: rest.deliveryEnabled !== undefined ? rest.deliveryEnabled : true,
            deliveryZones: rest.deliveryZones || [],
            isOpen: rest.isOpen || false,
            openingHours: rest.openingHours || {
              monday: { open: '08:00', close: '22:00', closed: false },
              tuesday: { open: '08:00', close: '22:00', closed: false },
              wednesday: { open: '08:00', close: '22:00', closed: false },
              thursday: { open: '08:00', close: '22:00', closed: false },
              friday: { open: '08:00', close: '22:00', closed: false },
              saturday: { open: '08:00', close: '22:00', closed: false },
              sunday: { open: '08:00', close: '22:00', closed: false },
            },
            whatsappTemplate: rest.whatsappTemplate || '🍴 *Novo Pedido - {{restaurantName}}*\n\n👤 *Cliente:* {{customerName}}\n📱 *Telefone:* {{customerPhone}}\n📍 *Endereço:* {{deliveryAddress}}\n\n🛍️ *Pedido:*\n{{orderItems}}\n\n💰 *Total:* R$ {{totalAmount}}\n💳 *Pagamento:* {{paymentMethod}}\n🚚 *Entrega:* {{deliveryType}}\n\n---\n⏰ Pedido realizado em: {{timestamp}}',
            themeConfig: rest.themeConfig || {
              primaryColor: '#DC2626',
              secondaryColor: '#059669',
              logo: '',
              font: 'Inter'
            }
          });
        }
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetchWithAuth(`/api/admin/restaurant/${restaurant.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          email: formData.email,
          address: formData.address,
          deliveryFee: formData.deliveryFee,
          minimumOrder: formData.minimumOrder,
          deliveryTime: formData.deliveryTime,
          deliveryRadius: formData.deliveryRadius,
          deliveryEnabled: formData.deliveryEnabled,
          deliveryZones: formData.deliveryZones,
          isOpen: formData.isOpen,
          openingHours: formData.openingHours,
          themeConfig: formData.themeConfig,
          whatsappTemplate: formData.whatsappTemplate,
        }),
      });

      handleAuthError(response);
      const data = await response.json();

      if (data.success) {
        setSuccess('Configurações salvas com sucesso!');
        // Atualizar os dados do restaurante
        await fetchUserData();
      } else {
        setError(data.error || 'Erro ao salvar configurações');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
              <p className="mt-1 text-sm text-gray-600">
                Configure e personalize seu restaurante
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">✕</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6">
            {activeTab === 'basic' && (
              <BasicInfoSection formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'delivery' && (
              <DeliverySection formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'zones' && (
              <ZonesSection formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'hours' && (
              <HoursSection formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'whatsapp' && (
              <WhatsAppSection formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'theme' && (
              <ThemeSection formData={formData} setFormData={setFormData} />
            )}
            {activeTab === 'status' && (
              <StatusSection formData={formData} setFormData={setFormData} />
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Componente para Informações Básicas
function BasicInfoSection({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure as informações principais do seu restaurante
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Restaurante *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="5511999999999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Conte sobre seu restaurante..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Endereço
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Endereço completo do restaurante"
        />
      </div>
    </div>
  );
}

// Componente para Configurações de Entrega
function DeliverySection({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Entrega</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure as opções de entrega do seu restaurante
        </p>
      </div>

      {/* Toggle de Entrega Habilitada */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              Entrega {formData.deliveryEnabled ? 'Habilitada' : 'Desabilitada'}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {formData.deliveryEnabled 
                ? 'Seu restaurante está fazendo entregas' 
                : 'Seu restaurante está funcionando apenas para retirada'
              }
            </p>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.deliveryEnabled}
                onChange={(e) => setFormData({ ...formData, deliveryEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Configurações de Entrega - só aparece se entrega estiver habilitada */}
      {formData.deliveryEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Entrega (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pedido Mínimo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.minimumOrder}
              onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo de Entrega (minutos)
            </label>
            <input
              type="number"
              value={formData.deliveryTime}
              onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raio de Entrega (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.deliveryRadius}
              onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5.0"
            />
          </div>
        </div>
      )}

      {!formData.deliveryEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Apenas Retirada:</strong> Com a entrega desabilitada, seus clientes só poderão fazer pedidos para retirada no local.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para Zonas de Entrega
function ZonesSection({ formData, setFormData }: any) {
  const [newZone, setNewZone] = useState({ name: '', radius: '', price: '' });

  const zones = formData.deliveryZones || [];

  const addZone = () => {
    if (newZone.name && newZone.radius && newZone.price) {
      const zone = {
        name: newZone.name,
        radius: parseFloat(newZone.radius),
        price: parseFloat(newZone.price),
      };
      setFormData({
        ...formData,
        deliveryZones: [...zones, zone]
      });
      setNewZone({ name: '', radius: '', price: '' });
    }
  };

  const removeZone = (index: number) => {
    const newZones = zones.filter((_: any, i: number) => i !== index);
    setFormData({
      ...formData,
      deliveryZones: newZones
    });
  };

  const updateZone = (index: number, field: string, value: string) => {
    const newZones = [...zones];
    newZones[index] = { ...newZones[index], [field]: value };
    setFormData({
      ...formData,
      deliveryZones: newZones
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Zonas de Entrega</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure as zonas de entrega onde seu restaurante opera. Cada zona pode ter um preço de entrega diferente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nova Zona de Entrega
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome da Zona (ex: Centro, Zona Sul)"
            />
            <input
              type="number"
              step="0.1"
              value={newZone.radius}
              onChange={(e) => setNewZone({ ...newZone, radius: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Raio máximo (km)"
            />
            <input
              type="number"
              step="0.01"
              value={newZone.price}
              onChange={(e) => setNewZone({ ...newZone, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Taxa de entrega (R$)"
            />
            <button
              type="button"
              onClick={addZone}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Adicionar Zona
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Zonas Configuradas</h4>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            {zones.length === 0 ? (
              <p className="text-sm text-gray-600">Nenhuma zona de entrega configurada.</p>
            ) : (
              zones.map((zone: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-md bg-white mb-2 shadow-sm">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                    <div className="text-xs text-gray-500">
                      Raio: {zone.radius} km • Taxa: R$ {zone.price.toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeZone(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para Horários de Funcionamento
function HoursSection({ formData, setFormData }: any) {
  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  const updateHours = (day: string, field: string, value: any) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          ...formData.openingHours[day],
          [field]: value
        }
      }
    });
  };

  const addInterval = (day: string) => {
    const currentIntervals = formData.openingHours[day]?.intervals || [];
    updateHours(day, 'intervals', [...currentIntervals, { start: '14:00', end: '18:00' }]);
  };

  const removeInterval = (day: string, index: number) => {
    const currentIntervals = formData.openingHours[day]?.intervals || [];
    const newIntervals = currentIntervals.filter((_: any, i: number) => i !== index);
    updateHours(day, 'intervals', newIntervals);
  };

  const updateInterval = (day: string, index: number, field: string, value: string) => {
    const currentIntervals = formData.openingHours[day]?.intervals || [];
    const newIntervals = [...currentIntervals];
    newIntervals[index] = { ...newIntervals[index], [field]: value };
    updateHours(day, 'intervals', newIntervals);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Horários de Funcionamento</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure os horários de funcionamento para cada dia da semana. Você pode adicionar intervalos (ex: almoço) quando o restaurante fica fechado.
        </p>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.key} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-32">
                  <span className="text-sm font-medium text-gray-700">{day.label}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!formData.openingHours[day.key]?.closed}
                    onChange={(e) => updateHours(day.key, 'closed', !e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Aberto</span>
                </div>
              </div>
            </div>

            {!formData.openingHours[day.key]?.closed && (
              <div className="space-y-3">
                {/* Horário principal */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Abertura:</span>
                    <input
                      type="time"
                      value={formData.openingHours[day.key]?.open || '08:00'}
                      onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Fechamento:</span>
                    <input
                      type="time"
                      value={formData.openingHours[day.key]?.close || '22:00'}
                      onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Intervalos */}
                {formData.openingHours[day.key]?.intervals?.map((interval: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 bg-white p-3 rounded border border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Intervalo {index + 1}:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">de</span>
                      <input
                        type="time"
                        value={interval.start}
                        onChange={(e) => updateInterval(day.key, index, 'start', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">até</span>
                      <input
                        type="time"
                        value={interval.end}
                        onChange={(e) => updateInterval(day.key, index, 'end', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInterval(day.key, index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remover
                    </button>
                  </div>
                ))}

                {/* Botão para adicionar intervalo */}
                <button
                  type="button"
                  onClick={() => addInterval(day.key)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>+</span>
                  <span>Adicionar intervalo</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para Configurações do WhatsApp
function WhatsAppSection({ formData, setFormData }: any) {
  const templateVariables = [
    '{{restaurantName}}',
    '{{customerName}}',
    '{{customerPhone}}',
    '{{deliveryAddress}}',
    '{{orderItems}}',
    '{{totalAmount}}',
    '{{paymentMethod}}',
    '{{deliveryType}}',
    '{{timestamp}}'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do WhatsApp</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure o template de mensagem que será enviado para o WhatsApp
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template de Mensagem
        </label>
        <textarea
          value={formData.whatsappTemplate}
          onChange={(e) => setFormData({ ...formData, whatsappTemplate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={12}
          placeholder="Digite o template da mensagem..."
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Variáveis Disponíveis</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {templateVariables.map((variable) => (
            <button
              key={variable}
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = formData.whatsappTemplate;
                  const newText = text.substring(0, start) + variable + text.substring(end);
                  setFormData({ ...formData, whatsappTemplate: newText });
                  
                  // Reposicionar cursor
                  setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + variable.length, start + variable.length);
                  }, 0);
                }
              }}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              {variable}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Preview da Mensagem</h4>
        <div className="text-sm text-blue-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
          {formData.whatsappTemplate
            .replace('{{restaurantName}}', 'Meu Restaurante')
            .replace('{{customerName}}', 'João Silva')
            .replace('{{customerPhone}}', '(11) 99999-9999')
            .replace('{{deliveryAddress}}', 'Rua das Flores, 123')
            .replace('{{orderItems}}', '• 1x Pizza Margherita - R$ 35,00\n• 1x Coca-Cola - R$ 5,00')
            .replace('{{totalAmount}}', '45,00')
            .replace('{{paymentMethod}}', 'PIX')
            .replace('{{deliveryType}}', 'Entrega')
            .replace('{{timestamp}}', new Date().toLocaleString('pt-BR'))
          }
        </div>
      </div>
    </div>
  );
}

// Componente para Personalização Visual
function ThemeSection({ formData, setFormData }: any) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor', value: string) => {
    setFormData({
      ...formData,
      themeConfig: {
        ...formData.themeConfig,
        [colorType]: value
      }
    });
  };

  const handleFontChange = (value: string) => {
    setFormData({
      ...formData,
      themeConfig: {
        ...formData.themeConfig,
        font: value
      }
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetchWithAuth('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();
      
      if (data.success) {
        setFormData({
          ...formData,
          themeConfig: {
            ...formData.themeConfig,
            logo: data.data.url
          }
        });
      } else {
        setUploadError(data.error || 'Erro ao fazer upload');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      setUploadError('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setFormData({
      ...formData,
      themeConfig: {
        ...formData.themeConfig,
        logo: ''
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personalização Visual</h3>
        <p className="text-sm text-gray-600 mb-6">
          Personalize a aparência do seu restaurante
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cor Primária */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor Primária
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
              style={{ backgroundColor: formData.themeConfig.primaryColor }}
              onClick={() => document.getElementById('primary-color-picker')?.click()}
            />
            <input
              id="primary-color-picker"
              type="color"
              value={formData.themeConfig.primaryColor}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={formData.themeConfig.primaryColor}
              onChange={(e) => handleColorChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#DC2626"
            />
          </div>
        </div>

        {/* Cor Secundária */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cor Secundária
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
              style={{ backgroundColor: formData.themeConfig.secondaryColor }}
              onClick={() => document.getElementById('secondary-color-picker')?.click()}
            />
            <input
              id="secondary-color-picker"
              type="color"
              value={formData.themeConfig.secondaryColor}
              onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
              className="sr-only"
            />
            <input
              type="text"
              value={formData.themeConfig.secondaryColor}
              onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#059669"
            />
          </div>
        </div>

        {/* Fonte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fonte
          </label>
          <select
            value={formData.themeConfig.font}
            onChange={(e) => handleFontChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Poppins">Poppins</option>
            <option value="Lato">Lato</option>
          </select>
        </div>
      </div>

      {/* Logo do Restaurante */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo do Restaurante
        </label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {formData.themeConfig.logo ? (
            <div className="space-y-4">
              <img
                src={formData.themeConfig.logo}
                alt="Logo do restaurante"
                className="mx-auto max-h-32 max-w-full object-contain rounded-lg"
              />
              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Enviando...' : 'Alterar Logo'}
                </button>
                <button
                  type="button"
                  onClick={removeLogo}
                  disabled={uploading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Remover Logo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Enviando...' : 'Selecionar Logo'}
                </button>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF até 2MB
              </p>
            </div>
          )}
        </div>

        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {uploadError && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">Fazendo upload da imagem...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview das Cores */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preview das Cores</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              style={{ backgroundColor: formData.themeConfig.primaryColor }}
              className="px-4 py-2 text-white rounded-md font-medium"
            >
              Botão Primário
            </button>
            <button
              type="button"
              style={{ backgroundColor: formData.themeConfig.secondaryColor }}
              className="px-4 py-2 text-white rounded-md font-medium"
            >
              Botão Secundário
            </button>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Visualize como as cores aparecerão nos botões do seu site</p>
            <p className="text-xs text-blue-600">
              💡 <strong>Dica:</strong> Se a cor primária for muito clara (como #F0E3D1), ela será usada como fundo da página 
              e a cor secundária será aplicada nos botões para melhor contraste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para Status do Restaurante
function StatusSection({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Restaurante</h3>
        <p className="text-sm text-gray-600 mb-6">
          Controle o status de funcionamento do seu restaurante
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              Restaurante {formData.isOpen ? 'Aberto' : 'Fechado'}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {formData.isOpen 
                ? 'Seu restaurante está recebendo pedidos' 
                : 'Seu restaurante não está recebendo pedidos'
              }
            </p>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dica</h4>
        <p className="text-sm text-blue-800">
          Você pode alternar o status do restaurante a qualquer momento. Quando fechado, 
          os clientes verão uma mensagem informando que o restaurante não está recebendo pedidos.
        </p>
      </div>
    </div>
  );
} 