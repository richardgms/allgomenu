import { PrismaClient } from '@prisma/client';
import { supabaseAdmin } from '../lib/supabase-server';

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

  // Supabase Auth será usado para criar usuários admin, então não criamos admin aqui

  // Criar categorias
  const pizzasCategory = await prisma.category.create({
    data: {
      name: 'Pizzas',
      description: 'Nossas deliciosas pizzas tradicionais',
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

  // Criar produtos - Pizzas
  await prisma.product.createMany({
    data: [
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
        name: 'Pizza Portuguesa',
        description: 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitonas e orégano',
        price: 42.00,
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
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
        name: 'Pizza Quatro Queijos',
        description: 'Molho de tomate, mussarela, catupiry, parmesão, gorgonzola',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
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
      }
    ]
  });

  // Criar produtos - Bebidas
  await prisma.product.createMany({
    data: [
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
      }
    ]
  });

  // Criar produtos - Sobremesas
  await prisma.product.createMany({
    data: [
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
      }
    ]
  });

  // Criar usuário admin no Supabase Auth
  const adminEmail = 'admin@pizzariaexemplo.com';
  const adminPassword = '123456';

  try {
    // Verificar se o usuário já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers.users.find(u => u.email === adminEmail);

    if (!userExists) {
      // Criar usuário no Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });

      if (authError) {
        console.error('Erro ao criar usuário no Supabase Auth:', authError);
      } else if (authUser.user) {
        // Criar perfil do usuário na nossa tabela
        await prisma.profile.upsert({
          where: { id: authUser.user.id },
          update: {},
          create: {
            id: authUser.user.id,
            email: adminEmail,
            fullName: 'Admin Pizzaria',
            role: 'ADMIN',
            restaurantId: restaurant.id
          }
        });

        console.log('Usuário admin criado no Supabase Auth com sucesso!');
      }
    } else {
      // Usuário já existe, apenas garantir que o perfil existe
      await prisma.profile.upsert({
        where: { id: userExists.id },
        update: {},
        create: {
          id: userExists.id,
          email: adminEmail,
          fullName: 'Admin Pizzaria',
          role: 'ADMIN',
          restaurantId: restaurant.id
        }
      });
      console.log('Usuário admin já existe, perfil sincronizado.');
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
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