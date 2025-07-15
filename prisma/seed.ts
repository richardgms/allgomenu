import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar restaurante de exemplo (usando upsert para evitar duplicação)
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'pizzaria-exemplo' },
    update: {}, // Não atualiza se já existir
    create: {
      slug: 'pizzaria-exemplo',
      name: 'Pizzaria Exemplo',
      description: 'A melhor pizzaria da cidade com sabores únicos e ingredientes frescos',
      phone: '(11) 99999-9999',
      whatsapp: '5511999999999',
      email: 'contato@pizzariaexemplo.com',
      address: 'Rua das Pizzas, 123 - Centro - São Paulo/SP',
      deliveryFee: 5.00,
      minimumOrder: 25.00,
      deliveryTime: 45,
      deliveryRadius: 10,
      isActive: true,
      isOpen: true,
      openingHours: {
        monday: { open: '18:00', close: '23:00', closed: false },
        tuesday: { open: '18:00', close: '23:00', closed: false },
        wednesday: { open: '18:00', close: '23:00', closed: false },
        thursday: { open: '18:00', close: '23:00', closed: false },
        friday: { open: '18:00', close: '23:00', closed: false },
        saturday: { open: '18:00', close: '23:00', closed: false },
        sunday: { open: '18:00', close: '23:00', closed: false },
      },
      themeConfig: {
        primaryColor: '#DC2626',
        secondaryColor: '#059669',
        logo: '',
        font: 'Inter'
      }
    }
  });

  // Criar usuário admin com senha hash
  const adminEmail = 'admin@pizzariaexemplo.com';
  const adminPassword = '123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.profile.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      fullName: 'Admin Pizzaria',
      role: 'ADMIN',
      restaurantId: restaurant.id
    },
    create: {
      id: `admin_${Date.now()}`, // ID único para não conflitar
      email: adminEmail,
      password: hashedPassword,
      fullName: 'Admin Pizzaria',
      role: 'ADMIN',
      restaurantId: restaurant.id
    }
  });

  // Criar categorias
  const pizzasCategory = await prisma.category.upsert({
    where: { 
      name_restaurantId: {
        name: 'Pizzas',
        restaurantId: restaurant.id
      }
    },
    update: {},
    create: {
      name: 'Pizzas',
      description: 'Nossas deliciosas pizzas tradicionais',
      order: 1,
      restaurantId: restaurant.id
    }
  });

  const bebidasCategory = await prisma.category.upsert({
    where: { 
      name_restaurantId: {
        name: 'Bebidas',
        restaurantId: restaurant.id
      }
    },
    update: {},
    create: {
      name: 'Bebidas',
      description: 'Refrigerantes, sucos e bebidas geladas',
      order: 2,
      restaurantId: restaurant.id
    }
  });

  const sobremesasCategory = await prisma.category.upsert({
    where: { 
      name_restaurantId: {
        name: 'Sobremesas',
        restaurantId: restaurant.id
      }
    },
    update: {},
    create: {
      name: 'Sobremesas',
      description: 'Doces e sobremesas especiais',
      order: 3,
      restaurantId: restaurant.id
    }
  });

  const aperitivosCategory = await prisma.category.upsert({
    where: { 
      name_restaurantId: {
        name: 'Aperitivos',
        restaurantId: restaurant.id
      }
    },
    update: {},
    create: {
      name: 'Aperitivos',
      description: 'Entradas e petiscos',
      order: 4,
      restaurantId: restaurant.id
    }
  });

  // Criar produtos - Pizzas
  const pizzaProducts = [
    {
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
      price: 35.00,
      imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400',
      isFeatured: true,
      categoryId: pizzasCategory.id,
      restaurantId: restaurant.id,
      order: 1,
      options: {
        sizes: [
          { name: 'Pequena', price: 0 },
          { name: 'Média', price: 5.00 },
          { name: 'Grande', price: 10.00 }
        ],
        extras: [
          { name: 'Queijo extra', price: 3.00 },
          { name: 'Azeitonas', price: 2.00 },
          { name: 'Orégano', price: 0.50 }
        ]
      }
    },
    {
      name: 'Pizza Calabresa',
      description: 'Molho de tomate, mussarela, calabresa, cebola e orégano',
      price: 38.00,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      isFeatured: true,
      categoryId: pizzasCategory.id,
      restaurantId: restaurant.id,
      order: 2,
      options: {
        sizes: [
          { name: 'Pequena', price: 0 },
          { name: 'Média', price: 5.00 },
          { name: 'Grande', price: 10.00 }
        ],
        extras: [
          { name: 'Queijo extra', price: 3.00 },
          { name: 'Cebola extra', price: 1.50 },
          { name: 'Pimentão', price: 2.00 }
        ]
      }
    },
    {
      name: 'Pizza Quatro Queijos',
      description: 'Molho de tomate, mussarela, catupiry, parmesão, gorgonzola',
      price: 45.00,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      categoryId: pizzasCategory.id,
      restaurantId: restaurant.id,
      order: 3,
      options: {
        sizes: [
          { name: 'Pequena', price: 0 },
          { name: 'Média', price: 5.00 },
          { name: 'Grande', price: 10.00 }
        ]
      }
    },
    {
      name: 'Pizza Portuguesa',
      description: 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitonas e orégano',
      price: 42.00,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      categoryId: pizzasCategory.id,
      restaurantId: restaurant.id,
      order: 4,
      options: {
        sizes: [
          { name: 'Pequena', price: 0 },
          { name: 'Média', price: 5.00 },
          { name: 'Grande', price: 10.00 }
        ]
      }
    },
    {
      name: 'Pizza Frango com Catupiry',
      description: 'Molho de tomate, mussarela, frango desfiado, catupiry e orégano',
      price: 40.00,
      imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400',
      categoryId: pizzasCategory.id,
      restaurantId: restaurant.id,
      order: 5,
      options: {
        sizes: [
          { name: 'Pequena', price: 0 },
          { name: 'Média', price: 5.00 },
          { name: 'Grande', price: 10.00 }
        ]
      }
    },
    {
      name: 'Pizza Pepperoni',
      description: 'Molho de tomate, mussarela, pepperoni e orégano',
      price: 43.00,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
      categoryId: pizzasCategory.id,
      restaurantId: restaurant.id,
      order: 6,
      options: {
        sizes: [
          { name: 'Pequena', price: 0 },
          { name: 'Média', price: 5.00 },
          { name: 'Grande', price: 10.00 }
        ]
      }
    }
  ];

  for (const product of pizzaProducts) {
    await prisma.product.upsert({
      where: {
        name_restaurantId: {
          name: product.name,
          restaurantId: restaurant.id
        }
      },
      update: {},
      create: product
    });
  }

  // Criar produtos - Bebidas
  const bebidaProducts = [
    {
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante Coca-Cola gelado',
      price: 5.00,
      imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
      categoryId: bebidasCategory.id,
      restaurantId: restaurant.id,
      order: 1
    },
    {
      name: 'Guaraná Antarctica 350ml',
      description: 'Refrigerante Guaraná Antarctica gelado',
      price: 4.50,
      imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400',
      categoryId: bebidasCategory.id,
      restaurantId: restaurant.id,
      order: 2
    },
    {
      name: 'Suco de Laranja 500ml',
      description: 'Suco natural de laranja',
      price: 8.00,
      imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
      categoryId: bebidasCategory.id,
      restaurantId: restaurant.id,
      order: 3
    },
    {
      name: 'Água 500ml',
      description: 'Água mineral sem gás',
      price: 3.00,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      categoryId: bebidasCategory.id,
      restaurantId: restaurant.id,
      order: 4
    },
    {
      name: 'Cerveja Heineken 350ml',
      description: 'Cerveja Heineken gelada',
      price: 8.00,
      imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
      categoryId: bebidasCategory.id,
      restaurantId: restaurant.id,
      order: 5
    }
  ];

  for (const product of bebidaProducts) {
    await prisma.product.upsert({
      where: {
        name_restaurantId: {
          name: product.name,
          restaurantId: restaurant.id
        }
      },
      update: {},
      create: product
    });
  }

  // Criar produtos - Sobremesas
  const sobremesaProducts = [
    {
      name: 'Pudim de Leite',
      description: 'Pudim cremoso de leite condensado com calda de caramelo',
      price: 12.00,
      imageUrl: 'https://images.unsplash.com/photo-1587132117616-9e4c5d6b6f3e?w=400',
      categoryId: sobremesasCategory.id,
      restaurantId: restaurant.id,
      order: 1
    },
    {
      name: 'Brigadeiro Gourmet',
      description: 'Brigadeiro cremoso coberto com granulado belga',
      price: 8.00,
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
      categoryId: sobremesasCategory.id,
      restaurantId: restaurant.id,
      order: 2
    },
    {
      name: 'Sorvete 2 Bolas',
      description: 'Duas bolas de sorvete à sua escolha',
      price: 10.00,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
      categoryId: sobremesasCategory.id,
      restaurantId: restaurant.id,
      order: 3,
      options: {
        flavors: [
          { name: 'Chocolate', price: 0 },
          { name: 'Morango', price: 0 },
          { name: 'Baunilha', price: 0 },
          { name: 'Coco', price: 0 }
        ]
      }
    },
    {
      name: 'Tiramisu',
      description: 'Sobremesa italiana com café, mascarpone e cacau',
      price: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      categoryId: sobremesasCategory.id,
      restaurantId: restaurant.id,
      order: 4
    }
  ];

  for (const product of sobremesaProducts) {
    await prisma.product.upsert({
      where: {
        name_restaurantId: {
          name: product.name,
          restaurantId: restaurant.id
        }
      },
      update: {},
      create: product
    });
  }

  // Criar produtos - Aperitivos
  const aperitivoProducts = [
    {
      name: 'Bruschetta',
      description: 'Pão italiano com tomate, manjericão e azeite',
      price: 18.00,
      imageUrl: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400',
      categoryId: aperitivosCategory.id,
      restaurantId: restaurant.id,
      order: 1
    },
    {
      name: 'Antipasto Misto',
      description: 'Seleção de queijos, embutidos, azeitonas e pães',
      price: 28.00,
      imageUrl: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=400',
      categoryId: aperitivosCategory.id,
      restaurantId: restaurant.id,
      order: 2
    },
    {
      name: 'Batata Frita',
      description: 'Porção de batata frita crocante',
      price: 15.00,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
      categoryId: aperitivosCategory.id,
      restaurantId: restaurant.id,
      order: 3
    },
    {
      name: 'Anéis de Cebola',
      description: 'Anéis de cebola empanados e fritos',
      price: 16.00,
      imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
      categoryId: aperitivosCategory.id,
      restaurantId: restaurant.id,
      order: 4
    }
  ];

  for (const product of aperitivoProducts) {
    await prisma.product.upsert({
      where: {
        name_restaurantId: {
          name: product.name,
          restaurantId: restaurant.id
        }
      },
      update: {},
      create: product
    });
  }

  console.log('Seed concluído com sucesso!');
  console.log('Restaurante criado:', restaurant.slug);
  console.log('Login admin: admin@pizzariaexemplo.com');
  console.log('Senha: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 