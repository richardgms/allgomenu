import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Seed file executado');
  console.log('ℹ️  Os dados da WJ Tapiocaria & Café já foram inseridos via script específico');
  console.log('');
  console.log('🌐 URLs do sistema:');
  console.log('Página Principal: http://localhost:3000 → WJ Tapiocaria & Café');
  console.log('Admin: http://localhost:3000/admin');
  console.log('Tapiocaria: http://localhost:3000/wj-tapiocaria-cafe');
  console.log('');
  console.log('👤 Credenciais de acesso:');
  console.log('Email: admin@wjtapiocaria.com');
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