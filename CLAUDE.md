# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de Desenvolvimento

### Desenvolvimento Principal
```bash
npm run dev          # Iniciar servidor de desenvolvimento no localhost:3000
npm run build        # Build para produção
npm run start        # Executar build de produção
npm run lint         # Executar ESLint
```

### Gerenciamento do Banco de Dados
```bash
npm run db:push      # Aplicar mudanças do schema no banco
npm run db:migrate   # Criar e executar migrações do banco
npm run db:studio    # Abrir Prisma Studio (interface gráfica do banco)
npm run db:seed      # Popular banco com dados de exemplo
npm run db:seed-examples  # Popular com restaurantes de exemplo
```

### Comandos de Teste
Atualmente nenhum framework de teste está configurado. Ao adicionar testes, atualize esta seção com os comandos apropriados.

## Visão Geral da Arquitetura

### Stack Tecnológica
- **Framework**: Next.js 14 com App Router
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: Autenticação baseada em JWT para usuários admin
- **Estilização**: Tailwind CSS
- **Upload de Imagens**: Integração com Cloudinary
- **Integração WhatsApp**: Geração automatizada de mensagens

### Arquitetura Multi-tenant
Sistema de delivery multi-tenant onde cada restaurante possui:
- URLs baseadas em slug único (`/[slug]` para páginas do cliente, `/[slug]/admin` para admin)
- Dados isolados (categorias, produtos, pedidos) por restaurante
- Autenticação de admin separada por restaurante

### Pontos Chave do Schema do Banco
- **Restaurant**: Entidade central com roteamento por slug, configuração de tema e configurações de entrega
- **Profile**: Usuários admin vinculados a restaurantes com autenticação JWT
- **Category/Product**: Estrutura hierárquica de menu com opções baseadas em JSON (tamanhos, extras)
- **Order/OrderItem**: Gerenciamento completo de pedidos com integração WhatsApp
- **Audit Logging**: Sistema de auditoria integrado para mudanças de dados

### Estrutura da API
```
/api/restaurant/[slug]/     # APIs públicas do restaurante
  - menu/                   # Obter itens do menu e categorias
  - featured/               # Obter produtos em destaque
  - route.ts               # Obter informações do restaurante

/api/admin/                 # APIs admin protegidas
  - login/                  # Autenticação JWT
  - me/                     # Obter usuário admin atual
  - categories/             # CRUD para categorias
  - products/               # CRUD para produtos
  - restaurant/[slug]/      # Gerenciamento de restaurante
  - upload/                 # Manipulação de upload de imagens

/api/orders/                # Gerenciamento de pedidos
  - whatsapp/               # Gerar mensagens de pedido WhatsApp
```

### Padrões de Estrutura de Arquivos
- `app/[slug]/page.tsx` - Páginas de restaurante voltadas para o cliente
- `app/admin/*/page.tsx` - Páginas do painel administrativo (rotas admin globais)
- `lib/` - Utilitários compartilhados (banco de dados, autenticação, integrações)
- `types/` - Definições de tipos TypeScript
- `components/` - Componentes React reutilizáveis

### Pontos de Integração Principais
- **Cloudinary**: Uploads de imagens para logos de restaurantes e imagens de produtos
- **WhatsApp**: Geração automatizada de mensagens de pedido com templates customizáveis
- **Supabase**: Provedor alternativo de banco de dados (configurado mas não primário)

### Fluxo de Autenticação
1. Usuários admin se autenticam via `/api/admin/login` com email/senha
2. Tokens JWT armazenados no localStorage no cliente
3. Rotas protegidas validadas via middleware
4. Cada restaurante tem acesso admin isolado

### Variáveis de Ambiente Necessárias
```env
DATABASE_URL=             # String de conexão PostgreSQL
JWT_SECRET=              # Chave secreta para tokens JWT
CLOUDINARY_CLOUD_NAME=   # Configuração do Cloudinary
CLOUDINARY_API_KEY=      
CLOUDINARY_API_SECRET=   
NEXTAUTH_URL=            # URL da aplicação para NextAuth
NEXTAUTH_SECRET=         # Segredo do NextAuth
```

### Notas de Desenvolvimento
- Use `lib/db.ts` para todas as operações de banco de dados (cliente Prisma)
- Siga os padrões existentes da API nas rotas `/api/`
- Dados do restaurante são delimitados pelo parâmetro slug em rotas dinâmicas
- Todos os valores monetários usam tipo Decimal no banco de dados
- Colunas JSON armazenam dados complexos (configuração de tema, opções de produtos, horários de funcionamento)
- Códigos de pedidos são identificadores únicos auto-gerados
- Templates de mensagem WhatsApp são customizáveis por restaurante

### Padrões Comuns de Desenvolvimento
- Queries Prisma devem incluir tratamento adequado de erros
- Use tipos TypeScript do diretório `types/`
- Siga padrões de componentes existentes para consistência de UI
- Rotas da API retornam respostas JSON padronizadas
- Uploads de imagens passam pela integração Cloudinary em `lib/cloudinary.ts`