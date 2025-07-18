import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Corrigindo produtos com "Côco" para "Coco"...');

  // Buscar todos os produtos que contêm "Côco" no nome
  const productsWithCoco = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Côco' } },
        { description: { contains: 'Côco' } }
      ]
    }
  });

  console.log(`📋 Encontrados ${productsWithCoco.length} produtos com "Côco":`);

  for (const product of productsWithCoco) {
    console.log(`- ${product.name}`);
  }

  // Atualizar produtos que contêm "Côco" no nome
  console.log('🔄 Atualizando produtos...');

  // Atualizar cada produto individualmente para substituir "Côco" por "Coco"
  for (const product of productsWithCoco) {
    const newName = product.name.replace(/Côco/g, 'Coco');
    const newDescription = product.description?.replace(/Côco/g, 'Coco') || product.description;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        name: newName,
        description: newDescription
      }
    });

    console.log(`✅ Atualizado: "${product.name}" → "${newName}"`);
  }

  // Verificar se há opções de produtos com "Côco"
  const productsWithOptions = await prisma.product.findMany({
    where: {
      options: {
        not: undefined
      }
    }
  });

  for (const product of productsWithOptions) {
    if (product.options && typeof product.options === 'object') {
      let needsUpdate = false;
      const updatedOptions = JSON.parse(JSON.stringify(product.options));

      // Verificar em flavors
      if (updatedOptions.flavors && Array.isArray(updatedOptions.flavors)) {
        updatedOptions.flavors = updatedOptions.flavors.map((flavor: any) => {
          if (flavor.name && flavor.name.includes('Côco')) {
            flavor.name = flavor.name.replace(/Côco/g, 'Coco');
            needsUpdate = true;
          }
          return flavor;
        });
      }

      // Verificar em extras
      if (updatedOptions.extras && Array.isArray(updatedOptions.extras)) {
        updatedOptions.extras = updatedOptions.extras.map((extra: any) => {
          if (extra.name && extra.name.includes('Côco')) {
            extra.name = extra.name.replace(/Côco/g, 'Coco');
            needsUpdate = true;
          }
          return extra;
        });
      }

      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            options: updatedOptions
          }
        });
        console.log(`✅ Atualizado opções do produto: "${product.name}"`);
      }
    }
  }

  console.log('🎉 Correção concluída!');
  console.log('');
  console.log('📊 Resumo:');
  console.log(`- ${productsWithCoco.length} produtos atualizados`);
  console.log('- Todos os "Côco" foram alterados para "Coco"');
}

main()
  .catch((e) => {
    console.error('Erro na correção:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 