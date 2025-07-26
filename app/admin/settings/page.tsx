'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth-supabase';
import { fetchWithAuth, handleAuthError } from '@/lib/api-client';
import { generateSixColorPalette, getContrastRatio } from '@/lib/utils';
import { formatWhatsApp, formatPhone, validateWhatsApp, validatePhone, validateEmail } from '@/lib/formatters';
import AdminLayout from '@/components/AdminLayout';
import EditableField from '@/components/EditableField';
import SettingsCard from '@/components/SettingsCard';
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
  deliveryEnabled?: boolean;
  deliveryZones?: any[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    
    // Tema
    themeConfig: {
      primaryColor: '#DC2626',
      secondaryColor: '#059669',
      logo: '',
      font: 'Inter'
    },
    
    // WhatsApp
    whatsappTemplate: ''
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
            themeConfig: rest.themeConfig || {
              primaryColor: '#DC2626',
              secondaryColor: '#059669',
              logo: '',
              font: 'Inter'
            },
            whatsappTemplate: rest.whatsappTemplate || ''
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

  const updateField = async (field: string, value: any, nested?: string) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let updateData: any = {};
      
      if (nested) {
        updateData[nested] = {
          ...formData[nested as keyof typeof formData],
          [field]: value
        };
      } else {
        updateData[field] = value;
      }

      const response = await fetchWithAuth(`/api/admin/restaurant/${restaurant?.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      handleAuthError(response);
      const data = await response.json();

      if (data.success) {
        // Atualizar formData local
        if (nested) {
          setFormData(prev => ({
            ...prev,
            [nested]: {
              ...prev[nested as keyof typeof prev],
              [field]: value
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [field]: value
          }));
        }
        
        setSuccess('Alteração salva com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erro ao salvar alteração');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar alteração');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor', value: string) => {
    const updatedThemeConfig = {
      ...formData.themeConfig,
      [colorType]: value
    };
    
    // Gerar paleta de 6 cores automaticamente
    const primaryColor = colorType === 'primaryColor' ? value : updatedThemeConfig.primaryColor;
    const secondaryColor = colorType === 'secondaryColor' ? value : updatedThemeConfig.secondaryColor;
    
    if (primaryColor && secondaryColor) {
      const colorPalette = generateSixColorPalette(primaryColor, secondaryColor);
      updatedThemeConfig.colorPalette = colorPalette;
    }
    
    updateField(colorType, value, 'themeConfig');
  };

  if (loading) {
    return (
      <AdminLayout title="Configurações" description="Configure seu restaurante">
        <div className="min-h-screen admin-bg-secondary flex items-center justify-center">
          <div className="text-center admin-surface p-8 rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-base border-t-transparent mx-auto mb-4"></div>
            <p className="admin-text-primary font-medium">Carregando configurações...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações" description="Configure e personalize seu restaurante">
      <div className="min-h-screen admin-bg-secondary">
        {/* Header */}
        <div className="admin-bg-primary border-b admin-border px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold admin-text-inverse mb-2">
                  Configurações do Restaurante
                </h1>
                <p className="admin-text-inverse-muted">
                  Personalize e configure todos os aspectos do seu restaurante
                </p>
              </div>
              
              {restaurant && (
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span className="admin-text-inverse-muted text-sm">
                    {restaurant.isOpen ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Perfil do Restaurante */}
            <SettingsCard
              title="Perfil do Restaurante"
              description="Informações básicas que aparecerão no seu site"
              icon="🏪"
            >
              <EditableField
                label="Nome do Restaurante"
                value={formData.name}
                required
                placeholder="Nome do seu restaurante"
                onConfirm={(value) => updateField('name', value)}
                description="Este nome aparecerá no cabeçalho do seu site"
              />
              
              <EditableField
                label="Descrição"
                value={formData.description}
                type="textarea"
                placeholder="Conte sobre seu restaurante..."
                onConfirm={(value) => updateField('description', value)}
                maxLength={200}
                description="Uma breve descrição do seu restaurante"
              />
              
              <EditableField
                label="Endereço"
                value={formData.address}
                type="textarea"
                placeholder="Endereço completo do restaurante"
                onConfirm={(value) => updateField('address', value)}
                rows={2}
                description="Endereço que aparecerá para os clientes"
              />
            </SettingsCard>
            
            {/* Contatos */}
            <SettingsCard
              title="Informações de Contato"
              description="Como os clientes podem entrar em contato"
              icon="📞"
            >
              <EditableField
                label="Telefone"
                value={formData.phone}
                type="tel"
                formatter={formatPhone}
                validator={validatePhone}
                placeholder="(83) 98807-3784"
                onConfirm={(value) => updateField('phone', value)}
                description="Telefone de contato do restaurante"
              />
              
              <EditableField
                label="WhatsApp"
                value={formData.whatsapp}
                type="tel"
                formatter={formatWhatsApp}
                validator={validateWhatsApp}
                placeholder="+55 (83) 98807-3784"
                onConfirm={(value) => updateField('whatsapp', value)}
                required
                description="Número do WhatsApp para receber pedidos"
              />
              
              <EditableField
                label="Email"
                value={formData.email}
                type="email"
                validator={validateEmail}
                placeholder="contato@restaurante.com"
                onConfirm={(value) => updateField('email', value)}
                description="Email de contato do restaurante"
              />
            </SettingsCard>
            
            {/* Configurações de Entrega */}
            <SettingsCard
              title="Configurações de Entrega"
              description="Configure como funciona a entrega dos seus pedidos"
              icon="🚚"
              headerAction={
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.deliveryEnabled}
                    onChange={(e) => updateField('deliveryEnabled', e.target.checked)}
                    className="w-4 h-4 text-primary-base bg-white border-gray-300 rounded focus:ring-primary-base"
                  />
                  <span className="text-sm admin-text-secondary">
                    {formData.deliveryEnabled ? 'Entrega Ativa' : 'Apenas Retirada'}
                  </span>
                </label>
              }
            >
              {formData.deliveryEnabled && (
                <>
                  <EditableField
                    label="Taxa de Entrega"
                    value={formData.deliveryFee}
                    type="text"
                    placeholder="R$ 5,00"
                    onConfirm={(value) => updateField('deliveryFee', parseFloat(String(value).replace(/[^\d,]/g, '').replace(',', '.')) || 0)}
                    description="Taxa cobrada pela entrega"
                  />
                  
                  <EditableField
                    label="Pedido Mínimo"
                    value={formData.minimumOrder}
                    type="text"
                    placeholder="R$ 20,00"
                    onConfirm={(value) => updateField('minimumOrder', parseFloat(String(value).replace(/[^\d,]/g, '').replace(',', '.')) || 0)}
                    description="Valor mínimo para entrega"
                  />
                  
                  <EditableField
                    label="Tempo de Entrega"
                    value={formData.deliveryTime}
                    type="number"
                    placeholder="30"
                    onConfirm={(value) => updateField('deliveryTime', value)}
                    description="Tempo estimado em minutos"
                  />
                </>
              )}
              
              {!formData.deliveryEnabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="text-sm text-yellow-800">
                      <strong>Apenas Retirada:</strong> Clientes só poderão retirar pedidos no local.
                    </p>
                  </div>
                </div>
              )}
            </SettingsCard>
            
            {/* Status de Funcionamento */}
            <SettingsCard
              title="Status de Funcionamento"
              description="Controle se o restaurante está aceitando pedidos"
              icon="🔄"
              headerAction={
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOpen}
                    onChange={(e) => updateField('isOpen', e.target.checked)}
                    className="w-4 h-4 text-primary-base bg-white border-gray-300 rounded focus:ring-primary-base"
                  />
                  <span className="text-sm admin-text-secondary">
                    {formData.isOpen ? 'Aberto' : 'Fechado'}
                  </span>
                </label>
              }
            >
              <div className={`p-4 rounded-lg border-2 ${
                formData.isOpen 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    formData.isOpen ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}></div>
                  <div>
                    <p className={`font-medium ${
                      formData.isOpen ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Restaurante {formData.isOpen ? 'Aberto' : 'Fechado'}
                    </p>
                    <p className={`text-sm ${
                      formData.isOpen ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.isOpen 
                        ? 'Recebendo pedidos normalmente' 
                        : 'Não está recebendo pedidos'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>
            
            {/* Personalização Visual */}
            <div className="lg:col-span-2">
              <SettingsCard
                title="Personalização Visual"
                description="Customize as cores e aparência do seu restaurante"
                icon="🎨"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cor Primária */}
                  <div>
                    <label className="block text-sm font-medium admin-text-primary mb-3">
                      Cor Primária
                    </label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
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
                        className="admin-input flex-1"
                        placeholder="#DC2626"
                      />
                    </div>
                  </div>

                  {/* Cor Secundária */}
                  <div>
                    <label className="block text-sm font-medium admin-text-primary mb-3">
                      Cor Secundária
                    </label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
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
                        className="admin-input flex-1"
                        placeholder="#059669"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Preview da Paleta */}
                {formData.themeConfig.colorPalette && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium admin-text-primary mb-3">🎨 Paleta Gerada Automaticamente</h4>
                    <div className="grid grid-cols-6 gap-3">
                      {formData.themeConfig.colorPalette.primary.map((color: string, index: number) => (
                        <div key={`primary-${index}`} className="text-center">
                          <div 
                            className="w-full h-16 rounded-lg border border-gray-200 mb-2 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={`Primária ${index + 1}: ${color}`}
                          />
                          <div className="text-xs admin-text-muted font-mono">{color}</div>
                          <div className="text-xs admin-text-muted">
                            P{index + 1}
                          </div>
                        </div>
                      ))}
                      {formData.themeConfig.colorPalette.secondary.map((color: string, index: number) => (
                        <div key={`secondary-${index}`} className="text-center">
                          <div 
                            className="w-full h-16 rounded-lg border border-gray-200 mb-2 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={`Secundária ${index + 1}: ${color}`}
                          />
                          <div className="text-xs admin-text-muted font-mono">{color}</div>
                          <div className="text-xs admin-text-muted">
                            S{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Preview de Botões */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium admin-text-primary mb-3">Preview</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      style={{ backgroundColor: formData.themeConfig.primaryColor }}
                      className="px-4 py-2 text-white rounded-lg font-medium shadow-sm"
                    >
                      Botão Primário
                    </button>
                    <button
                      style={{ backgroundColor: formData.themeConfig.secondaryColor }}
                      className="px-4 py-2 text-white rounded-lg font-medium shadow-sm"
                    >
                      Botão Secundário
                    </button>
                  </div>
                </div>
              </SettingsCard>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}