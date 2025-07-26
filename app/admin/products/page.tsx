'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, fetchWithAuth, handleAuthError } from '@/lib/api-client';
import ImageUpload from '@/components/ImageUpload';
import TruncatedText from '@/components/TruncatedText';
import AdminLayout from '@/components/AdminLayout';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  options?: any;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; productId: string; productName: string }>({
    show: false,
    productId: '',
    productName: ''
  });
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true,
    order: 0,
    options: null
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetchWithAuth('/api/admin/products'),
          fetchWithAuth('/api/admin/categories')
        ]);

        handleAuthError(productsResponse);
        handleAuthError(categoriesResponse);

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (productsData.success) {
          setProducts(productsData.data);
        } else {
          console.error('Erro ao buscar produtos:', productsData.error);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        } else {
          console.error('Erro ao buscar categorias:', categoriesData.error);
        }

      } catch (error) {
        console.error('Erro ao carregar dados da página:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // Implementar toast notification
    console.log(`${type}: ${message}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl,
          isFeatured: formData.isFeatured,
          isActive: formData.isActive,
          order: formData.order,
          options: formData.options
        }),
      });

      handleAuthError(response);
      const data = await response.json();

      if (data.success) {
        showToast(
          editingProduct 
            ? 'Produto atualizado com sucesso!' 
            : 'Produto criado com sucesso!'
        );
        setShowForm(false);
        resetForm();
        
        // Recarregar produtos
        const productsResponse = await fetchWithAuth('/api/admin/products');
        const productsData = await productsResponse.json();
        if (productsData.success) {
          setProducts(productsData.data);
        }
      } else {
        showToast(data.error || 'Erro ao salvar produto', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      showToast('Erro ao salvar produto', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      order: product.order,
      options: product.options
    });
    setShowForm(true);
  };

  const handleDeleteConfirm = (productId: string, productName: string) => {
    setDeleteConfirm({ show: true, productId, productName });
  };

  const handleDelete = async () => {
    try {
      const response = await fetchWithAuth(`/api/admin/products/${deleteConfirm.productId}`, {
        method: 'DELETE',
      });

      handleAuthError(response);
      const data = await response.json();

      if (data.success) {
        showToast('Produto deletado com sucesso!');
        setProducts(products.filter(p => p.id !== deleteConfirm.productId));
      } else {
        showToast(data.error || 'Erro ao deletar produto', 'error');
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      showToast('Erro ao deletar produto', 'error');
    } finally {
      setDeleteConfirm({ show: false, productId: '', productName: '' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      imageUrl: '',
      isFeatured: false,
      isActive: true,
      order: 0,
      options: null
    });
    setEditingProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Produtos" description="Gerencie o cardápio do seu restaurante">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Produtos</h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600">Gerencie o cardápio do seu restaurante</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                resetForm();
                setShowForm(true);
              }}
              className="w-full sm:w-auto px-4 py-2 btn-primary rounded-md transition-colors select-none"
            >
              Novo Produto
            </button>
          </div>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja deletar o produto "<strong>{deleteConfirm.productName}</strong>"? 
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirm({ show: false, productId: '', productName: '' })}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors select-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors select-none"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-base"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-base"
                    rows={3}
                    disabled={formLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-base"
                      required
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-base"
                      required
                      disabled={formLoading}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.filter(cat => cat.isActive).map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem do Produto
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        imageInputMethod === 'upload'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Fazer Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        imageInputMethod === 'url'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Usar URL
                    </button>
                  </div>

                  {imageInputMethod === 'upload' ? (
                    <ImageUpload
                      currentImage={formData.imageUrl}
                      onImageChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL da Imagem
                      </label>
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-base"
                        placeholder="https://exemplo.com/imagem.jpg"
                        disabled={formLoading}
                      />
                      {formData.imageUrl && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Pré-visualização:</p>
                          <img 
                            src={formData.imageUrl} 
                            alt="Pré-visualização da imagem" 
                            className="mt-1 w-32 h-32 object-cover rounded-md border border-gray-200" 
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordem
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-base"
                      disabled={formLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="mr-2"
                      disabled={formLoading}
                    />
                    Produto em destaque
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                      disabled={formLoading}
                    />
                    Produto ativo
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors select-none"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 btn-primary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none"
                  >
                    {formLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingProduct ? 'Atualizando...' : 'Criando...'}
                      </div>
                    ) : (
                      editingProduct ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

                {/* Lista de Produtos */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center mr-2 sm:mr-3 border border-gray-200">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                            {product.isFeatured && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Destaque
                              </span>
                            )}
                          </div>
                          <div className="sm:hidden text-xs text-gray-500">
                            {product.category.name} • {formatPrice(product.price)}
                          </div>
                          <TruncatedText text={product.description} maxLength={40} className="text-xs sm:text-sm text-gray-500 hidden sm:block" />
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category.name}</div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-theme-light text-theme-dark'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors select-none"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(product.id, product.name)}
                          className="text-red-600 hover:text-red-900 transition-colors select-none"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado</p>
            <button
              onClick={() => {
                setEditingProduct(null);
                resetForm();
                setShowForm(true);
              }}
              className="mt-4 px-4 py-2 btn-primary rounded-md transition-colors select-none"
            >
              Criar Primeiro Produto
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 