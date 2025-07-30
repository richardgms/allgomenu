import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configurar logging baseado no ambiente
const getLogConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, apenas logs de erro
    return ['error'];
  }
  
  if (process.env.PRISMA_DEBUG === 'true') {
    // Debug completo apenas quando explicitamente habilitado
    return ['query', 'info', 'warn', 'error'];
  }
  
  // Em desenvolvimento, apenas warnings e erros por padrão
  return ['warn', 'error'];
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: getLogConfig(),
    // Otimizações de conexão
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configurações para melhor performance
    transactionOptions: {
      maxWait: 5000, // 5 segundos máximo de espera
      timeout: 10000, // 10 segundos timeout
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db; 