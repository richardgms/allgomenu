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
import { ImageUpload } from '@/components/ImageUpload'
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
  Upload
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  order: number
  active: boolean
  productsCount: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  active: boolean
  featured: boolean
  variations?: Array<{
    name: string
    price: number
  }>
}

export default function MenuManagementPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Product | Category | null>(null)

  // Mock data
  const categories: Category[] = [
    {
      id: '1',
      name: 'Pizzas',
      description: 'Pizzas tradicionais e especiais',
      order: 1,
      active: true,
      productsCount: 12
    },
    {
      id: '2',
      name: 'Hambúrguers',
      description: 'Hambúrguers artesanais',
      order: 2,
      active: true,
      productsCount: 8
    },
    {
      id: '3',
      name: 'Bebidas',
      description: 'Refrigerantes, sucos e águas',
      order: 3,
      active: true,
      productsCount: 15
    }
  ]

  const products: Product[] = [
    {
      id: '1',
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela, manjericão e azeite',
      price: 35.90,
      image: '/placeholder-pizza.jpg',
      category: 'Pizzas',
      active: true,
      featured: true,
      variations: [
        { name: 'Pequena', price: 25.90 },
        { name: 'Média', price: 35.90 },
        { name: 'Grande', price: 45.90 }
      ]
    },
    {
      id: '2',
      name: 'Hambúrguer Clássico',
      description: 'Pão brioche, hambúrguer 180g, queijo, alface, tomate',
      price: 28.90,
      image: '/placeholder-burger.jpg',
      category: 'Hambúrguers',
      active: true,
      featured: false
    },
    {
      id: '3',
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante gelado',
      price: 5.90,
      image: '/placeholder-drink.jpg',
      category: 'Bebidas',
      active: true,
      featured: false
    }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEditProduct = (product: Product) => {
    setEditingItem(product)
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingItem(category)
    setIsDialogOpen(true)
  }

  const toggleProductStatus = (productId: string) => {
    // Handle toggle product active status
    console.log('Toggle product status:', productId)
  }

  const toggleCategoryStatus = (categoryId: string) => {
    // Handle toggle category active status
    console.log('Toggle category status:', categoryId)
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
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
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
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Produto</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do novo produto
                      </DialogDescription>
                    </DialogHeader>
                    <ProductForm />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {product.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Destaque
                      </Badge>
                    )}
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </Badge>
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
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleProductStatus(product.id)}>
                          {product.active ? (
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
                        <DropdownMenuItem className="text-red-600">
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
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <span className="font-bold text-lg text-green-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.variations && (
                        <span className="text-xs text-gray-500">
                          {product.variations.length} variações
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Categoria</DialogTitle>
                      <DialogDescription>
                        Crie uma nova categoria para organizar seus produtos
                      </DialogDescription>
                    </DialogHeader>
                    <CategoryForm />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <div className="space-y-4">
            {categories.map((category) => (
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
                          <Badge variant={category.active ? 'default' : 'secondary'}>
                            {category.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={category.active}
                        onCheckedChange={() => toggleCategoryStatus(category.id)}
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
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    active: true,
    featured: false
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Pizza Margherita"
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
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0,00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pizzas">Pizzas</SelectItem>
                <SelectItem value="hamburguers">Hambúrguers</SelectItem>
                <SelectItem value="bebidas">Bebidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Imagem do Produto</Label>
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Produto ativo</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
            <Label htmlFor="featured">Produto em destaque</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar Produto</Button>
      </div>
    </div>
  )
}

function CategoryForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  })

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="categoryName">Nome da Categoria</Label>
          <Input
            id="categoryName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Pizzas"
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
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label htmlFor="categoryActive">Categoria ativa</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar Categoria</Button>
      </div>
    </div>
  )
}