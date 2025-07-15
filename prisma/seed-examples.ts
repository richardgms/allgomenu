import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('🌱 Iniciando seed com dados de exemplo...');

  // Limpar dados existentes
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.restaurant.deleteMany({});

  // Criar restaurante
  const restaurant = await prisma.restaurant.create({
    data: {
      slug: 'pizzaria-exemplo',
      name: 'Pizzaria Exemplo',
      description: 'A melhor pizzaria da cidade! Massas artesanais, ingredientes frescos e sabores únicos.',
      phone: '(11) 99999-9999',
      whatsapp: '5511999999999',
      email: 'contato@pizzariaexemplo.com',
      address: 'Rua das Pizzas, 123 - Centro, São Paulo - SP',
      deliveryFee: 5.00,
      minimumOrder: 25.00,
      deliveryTime: 45,
      deliveryRadius: 8.0,
      isActive: true,
      isOpen: true,
      openingHours: {
        monday: { open: '18:00', close: '23:00', closed: false },
        tuesday: { open: '18:00', close: '23:00', closed: false },
        wednesday: { open: '18:00', close: '23:00', closed: false },
        thursday: { open: '18:00', close: '23:00', closed: false },
        friday: { open: '18:00', close: '00:00', closed: false },
        saturday: { open: '18:00', close: '00:00', closed: false },
        sunday: { open: '18:00', close: '23:00', closed: false }
      },
      themeConfig: {
        primaryColor: '#DC2626',
        secondaryColor: '#059669'
      },
      whatsappTemplate: '🍕 *Novo Pedido - {{restaurantName}}*\n\n👤 *Cliente:* {{customerName}}\n📱 *Telefone:* {{customerPhone}}\n📍 *Endereço:* {{deliveryAddress}}\n\n🛍️ *Pedido:*\n{{orderItems}}\n\n💰 *Total:* R$ {{totalAmount}}\n💳 *Pagamento:* {{paymentMethod}}\n🚚 *Entrega:* {{deliveryType}}\n\n---\n⏰ Pedido realizado em: {{timestamp}}'
    }
  });

  // Criar categorias
  const pizzasCategory = await prisma.category.create({
    data: {
      name: 'Pizzas',
      description: 'Nossas deliciosas pizzas artesanais',
      order: 1,
      restaurantId: restaurant.id
    }
  });

  const bebidasCategory = await prisma.category.create({
    data: {
      name: 'Bebidas',
      description: 'Refrigerantes, sucos e bebidas geladas',
      order: 2,
      restaurantId: restaurant.id
    }
  });

  const sobremesasCategory = await prisma.category.create({
    data: {
      name: 'Sobremesas',
      description: 'Doces e sobremesas especiais',
      order: 3,
      restaurantId: restaurant.id
    }
  });

  const aperitivosCategory = await prisma.category.create({
    data: {
      name: 'Aperitivos',
      description: 'Entradas e petiscos para compartilhar',
      order: 4,
      restaurantId: restaurant.id
    }
  });

  // Criar produtos - Pizzas
  const pizzas = [
    {
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela, manjericão fresco e azeite extra virgem',
      price: 42.00,
      imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
      isFeatured: true,
      categoryId: pizzasCategory.id,
      order: 1,
      options: {
        sizes: [
          { name: 'Pequena (25cm)', price: 0 },
          { name: 'Média (30cm)', price: 8.00 },
          { name: 'Grande (35cm)', price: 15.00 }
        ],
        extras: [
          { name: 'Queijo extra', price: 5.00 },
          { name: 'Azeitonas', price: 3.00 },
          { name: 'Orégano', price: 1.00 },
          { name: 'Parmesão', price: 4.00 }
        ]
      }
    },
    {
      name: 'Pizza Calabresa',
      description: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
      price: 45.00,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      isFeatured: true,
      categoryId: pizzasCategory.id,
      order: 2,
      options: {
        sizes: [
          { name: 'Pequena (25cm)', price: 0 },
          { name: 'Média (30cm)', price: 8.00 },
          { name: 'Grande (35cm)', price: 15.00 }
        ],
        extras: [
          { name: 'Queijo extra', price: 5.00 },
          { name: 'Cebola extra', price: 2.00 },
          { name: 'Pimentão', price: 3.00 }
        ]
      }
    },
    {
      name: 'Pizza Quatro Queijos',
      description: 'Molho branco, mussarela, gorgonzola, parmesão e provolone',
      price: 48.00,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: pizzasCategory.id,
      order: 3,
      options: {
        sizes: [
          { name: 'Pequena (25cm)', price: 0 },
          { name: 'Média (30cm)', price: 8.00 },
          { name: 'Grande (35cm)', price: 15.00 }
        ]
      }
    },
    {
      name: 'Pizza Portuguesa',
      description: 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitonas e ervilha',
      price: 52.00,
      imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: pizzasCategory.id,
      order: 4
    },
    {
      name: 'Pizza Frango com Catupiry',
      description: 'Molho de tomate, mussarela, frango desfiado e catupiry',
      price: 46.00,
      imageUrl: 'https://images.unsplash.com/photo-1594007654729-04d280862d96?w=400&h=300&fit=crop',
      isFeatured: true,
      categoryId: pizzasCategory.id,
      order: 5
    },
    {
      name: 'Pizza Pepperoni',
      description: 'Molho de tomate, mussarela e pepperoni italiano',
      price: 50.00,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
      isFeatured: false,
      categoryId: pizzasCategory.id,
      order: 6
    }
  ];

  for (const pizza of pizzas) {
    await prisma.product.create({
      data: {
        ...pizza,
        restaurantId: restaurant.id
      }
    });
  }

  // Criar produtos - Bebidas
  const bebidas = [
    {
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante Coca-Cola gelado',
      price: 6.00,
      imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop',
      categoryId: bebidasCategory.id,
      order: 1
    },
    {
      name: 'Guaraná Antarctica 350ml',
      description: 'Refrigerante Guaraná Antarctica gelado',
      price: 5.50,
      imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop',
      categoryId: bebidasCategory.id,
      order: 2
    },
    {
      name: 'Suco de Laranja 500ml',
      description: 'Suco natural de laranja',
      price: 10.00,
      imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop',
      categoryId: bebidasCategory.id,
      order: 3
    },
    {
      name: 'Água 500ml',
      description: 'Água mineral sem gás',
      price: 4.00,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
      categoryId: bebidasCategory.id,
      order: 4
    },
    {
      name: 'Cerveja Heineken 350ml',
      description: 'Cerveja Heineken gelada',
      price: 8.00,
      imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop',
      categoryId: bebidasCategory.id,
      order: 5
    }
  ];

  for (const bebida of bebidas) {
    await prisma.product.create({
      data: {
        ...bebida,
        restaurantId: restaurant.id
      }
    });
  }

  // Criar produtos - Sobremesas
  const sobremesas = [
    {
      name: 'Pudim de Leite',
      description: 'Pudim cremoso de leite condensado com calda de caramelo',
      price: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1587132117616-9e4c5d6b6f3e?w=400&h=300&fit=crop',
      categoryId: sobremesasCategory.id,
      order: 1
    },
    {
      name: 'Brigadeiro Gourmet',
      description: 'Brigadeiro cremoso coberto com granulado belga',
      price: 12.00,
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
      categoryId: sobremesasCategory.id,
      order: 2
    },
    {
      name: 'Sorvete 2 Bolas',
      description: 'Duas bolas de sorvete à sua escolha',
      price: 14.00,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
      categoryId: sobremesasCategory.id,
      order: 3,
      options: {
        flavors: [
          { name: 'Chocolate', price: 0 },
          { name: 'Morango', price: 0 },
          { name: 'Baunilha', price: 0 },
          { name: 'Coco', price: 0 },
          { name: 'Pistache', price: 2.00 }
        ]
      }
    },
    {
      name: 'Tiramisu',
      description: 'Clássica sobremesa italiana com café e mascarpone',
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
      categoryId: sobremesasCategory.id,
      order: 4
    }
  ];

  for (const sobremesa of sobremesas) {
    await prisma.product.create({
      data: {
        ...sobremesa,
        restaurantId: restaurant.id
      }
    });
  }

  // Criar produtos - Aperitivos
  const aperitivos = [
    {
      name: 'Bruschetta',
      description: 'Pão italiano com tomate, manjericão e azeite',
      price: 22.00,
      imageUrl: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop',
      categoryId: aperitivosCategory.id,
      order: 1
    },
    {
      name: 'Antipasto Italiano',
      description: 'Seleção de frios, queijos e azeitonas',
      price: 35.00,
      imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop',
      categoryId: aperitivosCategory.id,
      order: 2
    },
    {
      name: 'Batata Frita',
      description: 'Batata frita crocante com tempero especial',
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
      categoryId: aperitivosCategory.id,
      order: 3
    },
    {
      name: 'Anéis de Cebola',
      description: 'Anéis de cebola empanados e fritos',
      price: 20.00,
      imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop',
      categoryId: aperitivosCategory.id,
      order: 4
    }
  ];

  for (const aperitivo of aperitivos) {
    await prisma.product.create({
      data: {
        ...aperitivo,
        restaurantId: restaurant.id
      }
    });
  }

  // Criar usuário admin no Supabase Auth
  const adminEmail = 'admin@pizzariaexemplo.com';
  const adminPassword = '123456';

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authError) {
      console.log('Usuário admin já existe ou erro:', authError.message);
    } else {
      console.log('✅ Usuário admin criado no Supabase Auth');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Criar ou atualizar perfil do usuário
    await prisma.profile.upsert({
      where: { id: authData?.user?.id || 'existing-user-id' },
      update: {
        email: adminEmail,
        fullName: 'Administrador',
        role: 'ADMIN',
        password: hashedPassword,
        restaurantId: restaurant.id
      },
      create: {
        id: authData?.user?.id || 'existing-user-id',
        email: adminEmail,
        fullName: 'Administrador',
        role: 'ADMIN',
        password: hashedPassword,
        restaurantId: restaurant.id
      }
    });

    console.log('✅ Perfil do administrador criado/atualizado');

  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📊 Dados criados:');
  console.log(`- 1 restaurante: ${restaurant.name}`);
  console.log(`- 4 categorias: Pizzas, Bebidas, Sobremesas, Aperitivos`);
  console.log(`- ${pizzas.length} pizzas`);
  console.log(`- ${bebidas.length} bebidas`);
  console.log(`- ${sobremesas.length} sobremesas`);
  console.log(`- ${aperitivos.length} aperitivos`);
  console.log('');
  console.log('🔐 Credenciais de acesso:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Senha: ${adminPassword}`);
  console.log('');
  console.log('🌐 URLs:');
  console.log(`Admin: http://localhost:3000/admin`);
  console.log(`Restaurante: http://localhost:3000/${restaurant.slug}`);
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 