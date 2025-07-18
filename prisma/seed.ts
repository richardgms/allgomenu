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

  // 2. Verificar e criar o usuário administrador
  let adminUser = await prisma.profile.findUnique({
    where: {
      id: "admin_user_placeholder_id" 
    },
  });

  if (!adminUser) {
    console.log('  Usuário "admin" não encontrado. Criando...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    adminUser = await prisma.profile.create({
      data: {
        id: "admin_user_placeholder_id", 
        password: hashedPassword,
        fullName: 'Administrador',
        role: 'ADMIN',
        restaurantId: restaurant.id,
      },
    });
    console.log(`  Usuário "admin" criado com o ID: ${adminUser.id}`);
  } else {
    console.log('  Usuário "admin" já existe.');
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('🌐 URLs do sistema:');
  console.log(`Página Principal: http://localhost:3000`);
  console.log(`Admin: http://localhost:3000/admin`);
  console.log(`Tapiocaria: http://localhost:3000/${restaurantSlug}`);
  console.log('');
  console.log('👤 Credenciais de acesso:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Senha: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 