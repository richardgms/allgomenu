import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adicionando produtos da Tapiocaria...');

  // Buscar ou criar restaurante da tapiocaria
  let restaurant = await prisma.restaurant.findUnique({
    where: { slug: 'wj-tapiocaria-cafe' }
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        slug: 'wj-tapiocaria-cafe',
        name: 'WJ Tapiocaria & Café',
        description: 'As melhores tapiocas da cidade! Sabores únicos e ingredientes frescos.',
        phone: '(11) 99999-8888',
        whatsapp: '5511999998888',
        email: 'contato@wjtapiocaria.com',
        address: 'Rua das Tapiocas, 456 - Centro, São Paulo - SP',
        deliveryFee: 3.00,
        minimumOrder: 15.00,
        deliveryTime: 30,
        deliveryRadius: 5.0,
        isActive: true,
        isOpen: true,
        openingHours: {
          monday: { open: '08:00', close: '22:00', closed: false },
          tuesday: { open: '08:00', close: '22:00', closed: false },
          wednesday: { open: '08:00', close: '22:00', closed: false },
          thursday: { open: '08:00', close: '22:00', closed: false },
          friday: { open: '08:00', close: '23:00', closed: false },
          saturday: { open: '08:00', close: '23:00', closed: false },
          sunday: { open: '08:00', close: '21:00', closed: false }
        },
        themeConfig: {
          primaryColor: '#059669',
          secondaryColor: '#DC2626'
        },
        whatsappTemplate: '🥥 *Novo Pedido - {{restaurantName}}*\n\n👤 *Cliente:* {{customerName}}\n📱 *Telefone:* {{customerPhone}}\n📍 *Endereço:* {{deliveryAddress}}\n\n🛍️ *Pedido:*\n{{orderItems}}\n\n💰 *Total:* R$ {{totalAmount}}\n💳 *Pagamento:* {{paymentMethod}}\n🚚 *Entrega:* {{deliveryType}}\n\n---\n⏰ Pedido realizado em: {{timestamp}}'
      }
    });
    console.log('✅ Restaurante WJ Tapiocaria & Café criado');
  }

  // Criar categorias
  const categories = [
    {
      name: 'Tapiocas Doces',
      description: 'Tapiocas doces e sobremesas',
      order: 1
    },
    {
      name: 'Tapiocas Salgadas',
      description: 'Tapiocas salgadas e pratos principais',
      order: 2
    },
    {
      name: 'Bebidas',
      description: 'Cafés, sucos e bebidas geladas',
      order: 3
    }
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: {
        name_restaurantId: {
          name: categoryData.name,
          restaurantId: restaurant.id
        }
      },
      update: {},
      create: {
        ...categoryData,
        restaurantId: restaurant.id
      }
    });
  }

  console.log('✅ Categorias criadas/atualizadas');

  // Buscar categorias
  const docesCategory = await prisma.category.findFirst({
    where: { name: 'Tapiocas Doces', restaurantId: restaurant.id }
  });

  const salgadasCategory = await prisma.category.findFirst({
    where: { name: 'Tapiocas Salgadas', restaurantId: restaurant.id }
  });

  const bebidasCategory = await prisma.category.findFirst({
    where: { name: 'Bebidas', restaurantId: restaurant.id }
  });

  if (!docesCategory || !salgadasCategory || !bebidasCategory) {
    throw new Error('Categorias não encontradas');
  }

  // Produtos da tapiocaria
  const tapiocaProducts = [
    // Tapiocas Doces
    {
      name: 'Tapioca de Nutella com Banana',
      description: 'Tapioca de Nutella coberta com banana fresca',
      price: 20.00,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      isFeatured: true,
      categoryId: docesCategory.id,
      order: 1
    },
    {
      name: 'Tapioca de Chocolate com Morango',
      description: 'Tapioca de chocolate com morangos frescos',
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: docesCategory.id,
      order: 2
    },
    {
      name: 'Tapioca de Coco com Leite Condensado',
      description: 'Tapioca de coco ralado com leite condensado',
      price: 16.00,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: docesCategory.id,
      order: 3
    },

    // Tapiocas Salgadas
    {
      name: 'Tapioca de Carne de Sol',
      description: 'Tapioca de carne de sol com queijo coalho',
      price: 12.00,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      isFeatured: true,
      categoryId: salgadasCategory.id,
      order: 1
    },
    {
      name: 'Tapioca de Bacon, Coco e Queijo',
      description: 'Tapioca de bacon, coco ralado e queijo coalho',
      price: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      isFeatured: true,
      categoryId: salgadasCategory.id,
      order: 2
    },
    {
      name: 'Tapioca de Frango com Catupiry',
      description: 'Tapioca de frango desfiado com catupiry',
      price: 13.00,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: salgadasCategory.id,
      order: 3
    },
    {
      name: 'Tapioca de Calabresa',
      description: 'Tapioca de calabresa com cebola caramelizada',
      price: 11.00,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: salgadasCategory.id,
      order: 4
    },

    // Bebidas
    {
      name: 'Café Expresso',
      description: 'Café expresso tradicional',
      price: 4.00,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: bebidasCategory.id,
      order: 1
    },
    {
      name: 'Cappuccino',
      description: 'Cappuccino cremoso com espuma de leite',
      price: 8.00,
      imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: bebidasCategory.id,
      order: 2
    },
    {
      name: 'Suco de Laranja Natural',
      description: 'Suco de laranja natural 300ml',
      price: 6.00,
      imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: bebidasCategory.id,
      order: 3
    }
  ];

  // Adicionar produtos
  for (const productData of tapiocaProducts) {
    await prisma.product.upsert({
      where: {
        name_restaurantId: {
          name: productData.name,
          restaurantId: restaurant.id
        }
      },
      update: {
        price: productData.price,
        description: productData.description,
        isFeatured: productData.isFeatured,
        order: productData.order
      },
      create: {
        ...productData,
        restaurantId: restaurant.id
      }
    });
  }

  console.log('✅ Produtos da tapiocaria adicionados/atualizados');
  console.log('');
  console.log('📊 Resumo:');
  console.log(`- Restaurante: ${restaurant.name}`);
  console.log(`- 3 categorias criadas`);
  console.log(`- ${tapiocaProducts.length} produtos adicionados`);
  console.log('');
  console.log('🌐 URLs:');
  console.log(`Restaurante: http://localhost:3000/${restaurant.slug}`);
  console.log(`Admin: http://localhost:3000/admin`);
}

main()
  .catch((e) => {
    console.error('Erro ao adicionar produtos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 