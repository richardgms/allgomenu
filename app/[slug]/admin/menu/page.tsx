'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageUpload } from '@/components/ImageUpload'
import { useCategories, useProducts } from '@/hooks/useAdminApi'
import { formatPrice } from '@/lib/utils'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Filter,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react'

export default function MenuManagementPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // Use hooks das APIs
  const { 
    categories, 
    isLoading: categoriesLoading, 
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategories()

  const { 
    products, 
    isLoading: productsLoading, 
    error: productsError,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct
  } = useProducts()

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handlers para produtos
  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setIsProductDialogOpen(true)
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setIsProductDialogOpen(true)
  }

  const handleDuplicateProduct = async (product: any) => {
    try {
      await duplicateProduct.mutateAsync(product)
      alert('Produto duplicado com sucesso!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao duplicar produto')
    }
  }

  const handleToggleProductStatus = async (product: any) => {
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        isActive: !product.isActive
      })
      alert(`Produto ${product.isActive ? 'desativado' : 'ativado'} com sucesso!`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao alterar status do produto')
    }
  }

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`Tem certeza que deseja excluir "${product.name}"?`)) return
    
    try {
      await deleteProduct.mutateAsync(product.id)
      alert('Produto excluído com sucesso!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir produto')
    }
  }

  // Handlers para categorias
  const handleEditCategory = (category: any) => {
    setEditingCategory(category)
    setIsCategoryDialogOpen(true)
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setIsCategoryDialogOpen(true)
  }

  const handleToggleCategoryStatus = async (category: any) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        isActive: !category.isActive
      })
      alert(`Categoria ${category.isActive ? 'desativada' : 'ativada'} com sucesso!`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao alterar status da categoria')
    }
  }

  const handleDeleteCategory = async (category: any) => {
    if (!confirm(`Tem certeza que deseja excluir "${category.name}"?`)) return
    
    try {
      await deleteCategory.mutateAsync(category.id)
      alert('Categoria excluída com sucesso!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir categoria')
    }
  }

  if (categoriesError || productsError) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {categoriesError?.message || productsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão do Cardápio</h1>
          <p className="text-gray-600">
            Gerencie categorias, produtos e organize seu menu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* Products Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productsLoading ? (
              // Loading skeletons
              [...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Nenhum produto encontrado.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {product.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Destaque
                        </Badge>
                      )}
                      {product.hasPromotion && (
                        <Badge variant="destructive" className="text-xs">
                          -{product.discountPercentage}%
                        </Badge>
                      )}
                      <Badge variant={product.isActive ? 'default' : 'secondary'} className="text-xs">
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {!product.isAvailable && (
                        <Badge variant="outline" className="text-xs">
                          Esgotado
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleProductStatus(product)}>
                            {product.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                        <div className="text-right">
                          <span className="font-bold text-lg text-green-600">
                            {formatPrice(product.effectivePrice)}
                          </span>
                          {product.hasPromotion && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{product.category?.name}</Badge>
                        {product.options && Object.keys(product.options).length > 0 && (
                          <span className="text-xs text-gray-500">
                            Tem opções
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Categories Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar categorias..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <div className="space-y-4">
            {categoriesLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Skeleton className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-10" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhuma categoria encontrada.</p>
              </div>
            ) : (
              categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{category.name}</h3>
                            <Badge variant="outline">
                              {category.productsCount} produtos
                            </Badge>
                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                              {category.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={() => handleToggleCategoryStatus(category)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar produto */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'Atualize as informações do produto' 
                : 'Preencha as informações do novo produto'
              }
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            product={editingProduct} 
            categories={categories}
            onSuccess={() => setIsProductDialogOpen(false)}
            onCancel={() => setIsProductDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para criar/editar categoria */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Atualize as informações da categoria' 
                : 'Crie uma nova categoria para organizar seus produtos'
              }
            </DialogDescription>
          </DialogHeader>
          <CategoryForm 
            category={editingCategory}
            onSuccess={() => setIsCategoryDialogOpen(false)}
            onCancel={() => setIsCategoryDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProductFormProps {
  product?: any
  categories: any[]
  onSuccess: () => void
  onCancel: () => void
}

function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const { createProduct, updateProduct } = useProducts()
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    promotionalPrice: product?.promotionalPrice?.toString() || '',
    categoryId: product?.categoryId || '',
    imageUrl: product?.imageUrl || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isAvailable: product?.isAvailable ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('Preencha os campos obrigatórios')
      return
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        promotionalPrice: formData.promotionalPrice && formData.promotionalPrice.trim() !== '' ? parseFloat(formData.promotionalPrice) : undefined,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || undefined,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isAvailable: formData.isAvailable
      }
      
      // Debug: Log dos dados do formulário
      console.log('Dados do formulário:', JSON.stringify(productData, null, 2))

      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...productData })
        alert('Produto atualizado com sucesso!')
      } else {
        await createProduct.mutateAsync(productData)
        alert('Produto criado com sucesso!')
      }
      
      onSuccess()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar produto')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Pizza Margherita"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva os ingredientes e características do produto"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Preço *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="promotionalPrice">Preço Promocional</Label>
            <Input
              id="promotionalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.promotionalPrice}
              onChange={(e) => setFormData({ ...formData, promotionalPrice: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Imagem do Produto</Label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="active">Produto ativo</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
            />
            <Label htmlFor="featured">Produto em destaque</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="available"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            />
            <Label htmlFor="available">Disponível</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={createProduct.isPending || updateProduct.isPending}
        >
          {createProduct.isPending || updateProduct.isPending 
            ? 'Salvando...' 
            : product ? 'Atualizar Produto' : 'Criar Produto'
          }
        </Button>
      </div>
    </form>
  )
}

interface CategoryFormProps {
  category?: any
  onSuccess: () => void
  onCancel: () => void
}

function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { createCategory, updateCategory } = useCategories()
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      alert('Nome da categoria é obrigatório')
      return
    }

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        isActive: formData.isActive
      }

      if (category) {
        await updateCategory.mutateAsync({ id: category.id, ...categoryData })
        alert('Categoria atualizada com sucesso!')
      } else {
        await createCategory.mutateAsync(categoryData)
        alert('Categoria criada com sucesso!')
      }
      
      onSuccess()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar categoria')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="categoryName">Nome da Categoria *</Label>
          <Input
            id="categoryName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Pizzas"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoryDescription">Descrição</Label>
          <Textarea
            id="categoryDescription"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o tipo de produtos desta categoria"
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="categoryActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="categoryActive">Categoria ativa</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={createCategory.isPending || updateCategory.isPending}
        >
          {createCategory.isPending || updateCategory.isPending 
            ? 'Salvando...' 
            : category ? 'Atualizar Categoria' : 'Criar Categoria'
          }
        </Button>
      </div>
    </form>
  )
}