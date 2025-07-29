# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de Desenvolvimento

### Comandos Essenciais
- `npm run dev` - Iniciar servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Iniciar servidor de produção
- `npm run lint` - Executar ESLint

### Comandos de Banco de Dados
- `npm run db:push` - Aplicar mudanças do schema no banco (usar em desenvolvimento)
- `npm run db:migrate` - Criar e aplicar migrações (usar para produção)
- `npm run db:studio` - Abrir Prisma Studio para gerenciamento do banco
- `npm run db:seed` - Popular banco com dados iniciais
- `npm run db:seed-examples` - Popular banco com dados de exemplo

### Comandos de Teste
- `./scripts/test-apis.sh` - Testar todas as APIs de analytics automaticamente
- Guia completo de testes: `docs/TESTES.md`
- Comandos úteis: `scripts/comandos-teste.md`

### Testando Mudanças no Banco
Sempre teste mudanças no banco executando:
1. `npm run db:push` (para desenvolvimento)
2. `npm run db:seed` (para popular dados de teste)
3. `npm run dev` (para verificar se as mudanças funcionam)

## Visão Geral da Arquitetura

### Sistema Multi-tenant de Restaurantes
Este é um sistema de delivery multi-tenant onde cada restaurante tem seu próprio subdomínio/slug:
- Páginas do cliente: `/[slug]` (ex: `/pizzaria-exemplo`)
- Dashboard admin: `/[slug]/admin` (ex: `/pizzaria-exemplo/admin`)
- Endpoints da API: `/api/restaurant/[slug]/*` (públicos) e `/api/admin/*` (protegidos)

### Stack Tecnológica Principal
- **Framework**: Next.js 14 com App Router
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: Sistema de autenticação baseado em JWT
- **Estado Global**: Zustand para gerenciamento de estado
- **Cache e Sincronização**: React Query (@tanstack/react-query) 
- **UI**: Tailwind CSS + componentes shadcn/ui + primitivos Radix UI
- **Drag & Drop**: @dnd-kit para funcionalidades interativas
- **Gráficos**: Recharts para visualização de dados
- **Upload de Arquivos**: Suporta Cloudinary e Supabase Storage
- **Integração WhatsApp**: Mensagens automáticas de pedidos

### Padrões Arquiteturais Principais

#### Estrutura do Schema do Banco
- **Restaurant**: Entidade principal com roteamento baseado em slug, config de tema e configurações operacionais
- **Category/Product**: Estrutura hierárquica de menu com preços e opções
- **Order/OrderItem**: Gerenciamento completo de pedidos com integração WhatsApp
- **Profile**: Autenticação de usuários vinculada a restaurantes (não exposta via API atualmente)

#### Estrutura de Roteamento
```
app/
├── page.tsx                    # Página inicial
├── [slug]/
│   ├── page.tsx               # Página do restaurante para clientes
│   ├── layout.tsx             # Layout específico do restaurante com temas
│   └── admin/
│       ├── layout.tsx         # Layout admin com sidebar/header
│       ├── dashboard/         # Dashboard principal
│       ├── menu/             # Gerenciamento de menu
│       ├── orders/           # Gerenciamento de pedidos
│       ├── analytics/        # Analytics e relatórios
│       ├── customization/    # Tema e marca
│       └── settings/         # Configurações do restaurante
└── api/
    ├── restaurant/[slug]/    # APIs públicas (menu, pedidos)
    ├── admin/analytics/      # APIs de analytics para dashboard
    │   ├── overview/         # Métricas gerais (receita, pedidos, clientes)
    │   ├── sales/           # Dados de vendas por período
    │   ├── products/        # Analytics de produtos mais vendidos
    │   ├── customers/       # Análise de clientes (novos vs recorrentes)
    │   └── performance/     # Métricas de performance e horários de pico
    └── orders/whatsapp/      # Processamento de pedidos WhatsApp
```

#### Sistema de Temas
A aplicação usa um sistema de cores sofisticado:
- Propriedades CSS customizadas para temas dinâmicos (`--cor-primaria-*`, `--cor-secundaria-*`)
- Paletas de cores específicas por restaurante armazenadas no campo JSON `themeConfig`
- Processamento avançado de cores em `lib/color/` para gerar escalas de cores e garantir contraste
- Injeção de temas acontece no nível do layout do restaurante

#### Fluxo de Autenticação
- Tokens JWT armazenados no localStorage (frontend)
- Header `Authorization: Bearer <token>` para requisições da API
- Helper `getAuthUser()` para rotas protegidas em `lib/auth-supabase.ts`
- Validação de acesso ao restaurante garante que usuários só acessem seu próprio restaurante

#### Gerenciamento de Estado
A aplicação usa uma arquitetura moderna de estado com:
- **Zustand Stores**: Estados globais tipados em `stores/`
  - `useRestaurantStore`: Estado do restaurante e configurações
  - `useOrderStore`: Pedidos, filtros e status
  - `useMenuStore`: Menu, categorias e produtos  
  - `useAnalyticsStore`: Dados de analytics e métricas
- **React Query**: Cache inteligente e sincronização de dados
  - Configurado em `lib/providers.tsx` com DevTools
  - Hooks customizados em `hooks/useAnalytics.ts`
  - Cache de 5min, retry automático, background refetch

#### Sistema de Analytics
Dashboard completo com dados reais:
- **APIs RESTful**: 5 endpoints especializados em `/api/admin/analytics/`
- **Visualizações**: Gráficos responsivos com Recharts
- **Filtros Dinâmicos**: Períodos de 7d, 30d, 90d, 1y
- **Métricas Avançadas**: Receita, pedidos, clientes, performance
- **Estados de Loading**: Spinners e skeleton loading
- **Error Handling**: Mensagens apropriadas para cada cenário

## Detalhes Importantes de Implementação

### Relacionamentos do Banco de Dados
- Todas as entidades principais (Category, Product, Order) são vinculadas ao Restaurant via chaves estrangeiras
- Exclusões em cascata são usadas apropriadamente (Restaurant → Categories → Products)
- OrderItems usam RESTRICT em Product para prevenir exclusões acidentais

### Integração WhatsApp
- Mensagens de pedido são geradas usando templates customizáveis em `lib/whatsapp.ts`
- Variáveis do template: `{{restaurantName}}`, `{{customerName}}`, `{{orderItems}}`, etc.
- Mensagens incluem opções do produto, quantidades, preços e detalhes do cliente
- URLs do WhatsApp são geradas com codificação adequada para compatibilidade mobile

### Estratégia de Upload de Arquivos
- Suporte duplo para Cloudinary e Supabase Storage
- URLs de imagem armazenadas como strings no banco (Product.imageUrl)
- Otimização de imagem do Next.js configurada para domínios Cloudinary em `next.config.js`

### Padrões de API
- APIs públicas: `/api/restaurant/[slug]/*` para recursos voltados ao cliente
- APIs protegidas: `/api/admin/*` com autenticação JWT
- Tratamento consistente de erros com códigos HTTP apropriados
- Validação de requisições usando schemas Zod (verificar types/index.ts)

### Componentes UI Customizados
- `components/ui/` contém componentes shadcn/ui
- `components/admin/` contém componentes específicos do admin (AdminSidebar, AdminHeader)
- `components/theme/` contém componentes de tema (ThemeProvider, PreviewPanel)
- Utilitários do sistema de cores em `lib/color/` para manipulação avançada de cores

## Diretrizes de Desenvolvimento

### Mudanças no Banco de Dados
1. Sempre atualize `prisma/schema.prisma`
2. Use `npm run db:push` em desenvolvimento
3. Use `npm run db:migrate` para deployments de produção
4. Teste mudanças com `npm run db:seed`

### Desenvolvimento de API
1. Siga o padrão existente: rotas públicas em `/api/restaurant/[slug]/`, rotas protegidas em `/api/admin/`
2. Use `getAuthUser()` para autenticação em rotas protegidas
3. Valide acesso ao restaurante para endpoints admin
4. Retorne respostas de erro consistentes com códigos de status apropriados

### Desenvolvimento de Componentes
1. Use componentes shadcn/ui existentes quando possível
2. Siga o sistema de cores estabelecido com propriedades CSS customizadas
3. Garanta design responsivo (abordagem mobile-first)
4. Use interfaces TypeScript de `types/index.ts`

### Padrões de Estilização
1. Tailwind CSS com integração do sistema de cores customizado
2. Propriedades CSS customizadas para variáveis de tema
3. Utilitários responsivos para compatibilidade mobile
4. Tokens de design shadcn/ui para consistência

## Tarefas Comuns

### Adicionando Novos Recursos ao Restaurante
1. Atualize o schema do banco se necessário (Prisma)
2. Crie rotas da API seguindo o padrão existente
3. Adicione componentes UI usando o sistema de design estabelecido
4. Teste com dados de restaurante existentes usando os arquivos seed

### Customização de Tema
1. Cores são gerenciadas através do campo JSON `themeConfig` no modelo Restaurant
2. Use utilitários em `lib/color/` para manipulação de cores
3. Propriedades CSS customizadas são injetadas via componente `ThemeInjector`
4. Visualize mudanças usando o componente `PreviewPanel` na customização

### Integração WhatsApp
1. Templates de pedido são armazenados em Restaurant.whatsappTemplate
2. Use `generateWhatsAppMessage()` para formatação consistente
3. Teste com `validateWhatsAppNumber()` e `formatWhatsAppNumber()`
4. URLs são geradas com codificação adequada para apps mobile

### Sistema de Analytics Avançado
1. **APIs**: Use endpoints em `/api/admin/analytics/` com parâmetros:
   - `restaurant`: slug do restaurante (obrigatório)
   - `days`: período em dias (7, 30, 90, 365)
   - `limit`: limite de resultados para products endpoint
2. **Hooks**: Use hooks em `hooks/useAnalytics.ts` para integração com React Query
3. **Stores**: Gerencie estado com stores em `stores/useAnalyticsStore.ts`
4. **Visualizações**: Dashboard completo em `/[slug]/admin/analytics`

### Gerenciamento de Estado Global
1. **Zustand Stores**: Estados tipados e performáticos
   ```typescript
   import { useRestaurantStore } from '@/stores'
   const { restaurant, updateRestaurant } = useRestaurantStore()
   ```
2. **React Query**: Cache automático e sincronização
   ```typescript
   import { useAnalyticsOverview } from '@/hooks/useAnalytics'
   const { data, isLoading, refetch } = useAnalyticsOverview(slug, days)
   ```
3. **Providers**: Configure em `lib/providers.tsx` para toda a aplicação