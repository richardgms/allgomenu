import { ThemeStyle } from '@/components/ThemeInjector';
import { db } from '@/lib/db';

async function getRestaurantBySlug(slug: string) {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        themeConfig: true,
        isActive: true
      }
    });
    
    return restaurant;
  } catch (error) {
    // Erro ao buscar restaurante
    return null;
  }
}

export default async function PublicLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  params: { slug: string };
}) {
  const restaurant = await getRestaurantBySlug(params.slug);
  
  // Verificar se o restaurante existe e está ativo
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurante não encontrado</h1>
          <p className="text-gray-600">O restaurante que você está procurando não existe.</p>
        </div>
      </div>
    );
  }

  if (!restaurant.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurante Inativo</h1>
          <p className="text-gray-600">Este restaurante está temporariamente indisponível.</p>
        </div>
      </div>
    );
  }

  const themeConfig = restaurant.themeConfig as any;
  const palette = themeConfig?.palette;

  return (
    <div suppressHydrationWarning>
      {palette && <ThemeStyle palette={palette} />}
      {children}
    </div>
  );
} 