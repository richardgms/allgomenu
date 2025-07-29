import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Executando o script de seed...');

  const restaurantSlug = 'wj-tapiocaria-cafe';
  const adminEmail = 'admin@wjtapiocaria.com';
  const adminPassword = '123456';

  // 1. Verificar e criar o restaurante
  let restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    console.log(` Restaurante "${restaurantSlug}" não encontrado. Criando...`);
    restaurant = await prisma.restaurant.create({
      data: {
        slug: restaurantSlug,
        name: 'WJ Tapiocaria & Café',
        description: 'As melhores tapiocas da região, feitas com ingredientes frescos e muito carinho.',
        address: 'Rua das Tapiocas, 123, Bairro Saboroso',
        phone: '11999998888',
        whatsapp: '5511999998888',
        deliveryFee: 5.0,
        minimumOrder: 15.0,
        deliveryTime: 45,
        isActive: true,
        isOpen: true,
        themeConfig: {
          primaryColor: "#E53E3E",
          secondaryColor: "#F6E05E",
          logo: "https://example.com/logo.png"
        },
        openingHours: {
          "monday": { "open": "08:00", "close": "22:00" },
          "tuesday": { "open": "08:00", "close": "22:00" },
          "wednesday": { "open": "08:00", "close": "22:00" },
          "thursday": { "open": "08:00", "close": "22:00" },
          "friday": { "open": "08:00", "close": "23:00" },
          "saturday": { "open": "09:00", "close": "23:00" },
          "sunday": { "open": "09:00", "close": "20:00" }
        }
      },
    });
    console.log(` Restaurante criado com o ID: ${restaurant.id}`);
  } else {
    console.log(` Restaurante "${restaurantSlug}" já existe.`);
  }

  // 2. Criar usuário admin para WJ Tapiocaria
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const existingProfile = await prisma.profile.findUnique({
    where: { email: adminEmail }
  });

  if (!existingProfile) {
    console.log(` Criando usuário admin para WJ Tapiocaria...`);
    await prisma.profile.create({
      data: {
        id: `wj-admin-${Date.now()}`,
        email: adminEmail,
        password: hashedPassword,
        fullName: 'Administrador WJ Tapiocaria',
        role: 'ADMIN',
        restaurantId: restaurant.id,
        isActive: true
      }
    });
    console.log(` Usuário admin criado: ${adminEmail}`);
  } else {
    console.log(` Usuário admin já existe: ${adminEmail}`);
  }

  // ---- Início: Novo restaurante e usuário para Delícias da Karine ----

  const karineRestaurantSlug = 'delicias-da-karine';
  const karineAdminEmail = 'deliciasdakarine@admin.com';
  const karineAdminPassword = '123456';

  // 1. Verificar e criar o restaurante Delícias da Karine
  let karineRestaurant = await prisma.restaurant.findUnique({
    where: { slug: karineRestaurantSlug },
  });

  if (!karineRestaurant) {
    console.log(`\n Restaurante "${karineRestaurantSlug}" não encontrado. Criando...`);
    karineRestaurant = await prisma.restaurant.create({
      data: {
        slug: karineRestaurantSlug,
        name: 'Delícias da Karine',
        description: 'Os melhores bolos e doces da cidade, feitos com amor.',
        address: 'Rua dos Doces, 456, Bairro Confeitaria',
        phone: '11988887777',
        whatsapp: '5511988887777',
        deliveryFee: 7.0,
        minimumOrder: 20.0,
        deliveryTime: 60,
        isActive: true,
        isOpen: true,
        themeConfig: {
          primaryColor: "#D53F8C", // Rosa
          secondaryColor: "#FBBF24", // Amarelo
          logo: ""
        },
        openingHours: {
          "tuesday": { "open": "10:00", "close": "19:00" },
          "wednesday": { "open": "10:00", "close": "19:00" },
          "thursday": { "open": "10:00", "close": "19:00" },
          "friday": { "open": "10:00", "close": "20:00" },
          "saturday": { "open": "10:00", "close": "20:00" },
        }
      },
    });
    console.log(` Restaurante criado com o ID: ${karineRestaurant.id}`);
  } else {
    console.log(`\n Restaurante "${karineRestaurantSlug}" já existe.`);
  }

  // 3. Criar usuário admin para Delícias da Karine
  const karineHashedPassword = await bcrypt.hash(karineAdminPassword, 10);
  const existingKarineProfile = await prisma.profile.findUnique({
    where: { email: karineAdminEmail }
  });

  if (!existingKarineProfile) {
    console.log(` Criando usuário admin para Delícias da Karine...`);
    await prisma.profile.create({
      data: {
        id: `karine-admin-${Date.now()}`,
        email: karineAdminEmail,
        password: karineHashedPassword,
        fullName: 'Administrador Delícias da Karine',
        role: 'ADMIN',
        restaurantId: karineRestaurant.id,
        isActive: true
      }
    });
    console.log(` Usuário admin criado: ${karineAdminEmail}`);
  } else {
    console.log(` Usuário admin já existe: ${karineAdminEmail}`);
  }

  // ---- Fim: Novo restaurante e usuário ----
  
  console.log('✅ Seed finalizado com sucesso!');
  console.log('');
  console.log('🌐 URLs do sistema:');
  console.log(`Página Principal: http://localhost:3000`);
  console.log(`Admin: http://localhost:3000/admin`);
  console.log(`Tapiocaria: http://localhost:3000/${restaurantSlug}`);
  console.log(`Delícias da Karine: http://localhost:3000/${karineRestaurantSlug}`);
  console.log('');
  console.log('👤 Credenciais de acesso:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Senha: ${adminPassword}`);
  console.log(`\nEmail Karine: ${karineAdminEmail}`);
  console.log(`Senha Karine: ${karineAdminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 