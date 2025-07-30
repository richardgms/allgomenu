import { db } from '@/lib/db';
import { RestaurantThemeProvider } from '@/components/theme/RestaurantThemeProvider';
import { unstable_cache } from 'next/cache';

const getRestaurantBySlug = unstable_cache(
  async (slug: string) => {
    try {
      console.log(`[getRestaurantBySlug] Searching for slug: ${slug}`)
      const restaurant = await db.restaurant.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          themeConfig: true,
          isActive: true
        }
      });
      
      console.log(`[getRestaurantBySlug] Found restaurant:`, !!restaurant, restaurant?.name)
      return restaurant;
    } catch (error) {
      console.error(`[getRestaurantBySlug] Error for slug ${slug}:`, error)
      // Erro ao buscar restaurante
      return null;
    }
  },
  ['restaurant-by-slug'],
  {
    revalidate: 60, // Cache por 1 minuto
    tags: ['restaurant']
  }
);

export default async function PublicLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  params: { slug: string };
}) {
  // Cache para evitar consultas desnecessárias
  const restaurant = await getRestaurantBySlug(params.slug);
  
  // Filtrar slugs inválidos como favicon.ico, robots.txt, etc.
  if (params.slug.includes('.') || params.slug.startsWith('_')) {
    return <div>{children}</div>
  }

  console.log(`[Layout ${params.slug}] Restaurant data:`, { 
    exists: !!restaurant, 
    isActive: restaurant?.isActive,
    hasThemeConfig: !!restaurant?.themeConfig,
    themeConfig: restaurant?.themeConfig
  });
  
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

  return (
    <RestaurantThemeProvider 
      restaurantSlug={params.slug}
      initialThemeConfig={restaurant.themeConfig}
      suppressHydrationWarning
    >
      {children}
    </RestaurantThemeProvider>
  );
} 