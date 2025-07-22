# AllGoMenu - Sistema de Delivery Personalizado

Um sistema completo de delivery com integração WhatsApp, desenvolvido com Next.js 14, TypeScript, Prisma e PostgreSQL.

## 🚀 Funcionalidades

- **Sistema Multi-tenant**: Múltiplos restaurantes em uma única plataforma
- **Dashboard Administrativo**: Gerenciamento completo do restaurante
- **Interface do Cliente**: Página personalizada para pedidos
- **Integração WhatsApp**: Pedidos enviados automaticamente
- **Personalização Visual**: Cores, logo e layout customizáveis
- **Responsivo**: Interface otimizada para mobile

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT
- **Upload de Imagens**: Cloudinary
- **Estilização**: Tailwind CSS

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- Conta no Cloudinary (opcional, para upload de imagens)

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd allgomenu
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/allgomenu"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# App
APP_NAME="AllGoMenu"
APP_URL="http://localhost:3000"
```

4. **Configure o banco de dados:**
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# Popular com dados de exemplo
npm run db:seed
```

5. **Execute o projeto:**
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`.

## 🎯 Como Usar

### 1. Página Inicial
- Acesse `http://localhost:3000`
- Veja a demonstração do sistema
- Clique em "Ver Exemplo" para ver a página do restaurante

### 2. Página do Cliente
- Acesse `http://localhost:3000/pizzaria-exemplo`
- Navegue pelo cardápio
- Adicione produtos ao carrinho
- Visualize o total e informações de entrega

### 3. Dashboard Administrativo
- Acesse `http://localhost:3000/pizzaria-exemplo/admin`
- **Dados para teste:**
  - Email: `admin@pizzariaexemplo.com`
  - Senha: `123456`
- Gerencie o status do restaurante (aberto/fechado)
- Visualize informações básicas

## 🗂️ Estrutura do Projeto

```
allgomenu/
├── app/                      # Next.js 14 App Router
│   ├── api/                  # API Routes
│   │   ├── admin/           # APIs administrativas
│   │   ├── restaurant/      # APIs públicas
│   │   └── orders/          # APIs de pedidos
│   ├── [slug]/              # Páginas dinâmicas por restaurante
│   │   ├── admin/           # Área administrativa
│   │   └── page.tsx         # Página do cliente
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout raiz
│   └── page.tsx             # Página inicial
├── lib/                     # Utilitários e configurações
│   ├── auth.ts              # Autenticação JWT
│   ├── cloudinary.ts        # Upload de imagens
│   ├── db.ts                # Cliente Prisma
│   ├── middleware.ts        # Middlewares
│   ├── utils.ts             # Funções utilitárias
│   └── whatsapp.ts          # Integração WhatsApp
├── prisma/                  # Configuração do banco
│   ├── schema.prisma        # Schema do banco
│   └── seed.ts              # Dados de exemplo
├── types/                   # Tipos TypeScript
│   └── index.ts             # Definições de tipos
└── estrategia/              # Documentação do projeto
    ├── prd.md               # Product Requirements Document
    ├── flowchart.md         # Fluxograma do sistema
    └── schemaprisma.md      # Schema do banco
```

## 📊 Banco de Dados

O sistema utiliza PostgreSQL com as seguintes tabelas principais:

- **restaurants**: Dados dos restaurantes
- **admin_users**: Usuários administrativos
- **categories**: Categorias de produtos
- **products**: Produtos do cardápio
- **orders**: Pedidos realizados
- **order_items**: Itens dos pedidos

## 🔐 Autenticação

O sistema utiliza JWT para autenticação dos administradores:

- **Login**: `POST /api/admin/login`
- **Token**: Salvo no localStorage do navegador
- **Middleware**: Validação automática nas rotas protegidas

## 📱 Integração WhatsApp

O sistema gera automaticamente mensagens formatadas para WhatsApp:

1. Cliente finaliza pedido
2. Sistema gera mensagem com detalhes
3. Usuário é redirecionado para WhatsApp
4. Mensagem é enviada automaticamente

**Formato da mensagem:**
```
🍴 *Novo Pedido - Nome do Restaurante*

👤 *Cliente:* Nome do Cliente
📱 *Telefone:* Telefone do Cliente
📍 *Endereço:* Endereço de Entrega

🛍️ *Pedido:*
• 2x Pizza Margherita - R$ 70,00
• 1x Coca-Cola 350ml - R$ 5,00

💰 *Total:* R$ 80,00
💳 *Pagamento:* PIX
🚚 *Entrega:* Entrega

---
⏰ Pedido realizado em: 15/12/2024 19:30:00
```

## 🎨 Personalização Visual

O sistema permite personalização completa:

- **Cores**: Primária e secundária
- **Logo**: Upload de logotipo
- **Fonte**: Seleção de fontes
- **Layout**: Diferentes disposições

## 🚀 Deploy em Produção

### Deploy no Netlify

1. **Preparar o projeto:**
   - Certifique-se de que todas as variáveis de ambiente estão configuradas
   - O arquivo `netlify.toml` já está configurado

2. **Conectar ao Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Faça login e clique em "New site from Git"
   - Conecte seu repositório

3. **Configurar build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** 18

4. **Configurar variáveis de ambiente:**
   Vá em Site settings > Environment variables e adicione:
   ```env
   DATABASE_URL="sua-string-de-conexao-supabase"
   NEXT_PUBLIC_SUPABASE_URL="sua-url-supabase"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima-supabase"
   SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico-supabase"
   NEXT_PUBLIC_APP_URL="https://seu-site.netlify.app"
   APP_URL="https://seu-site.netlify.app"
   ```

5. **Deploy:**
   - O Netlify fará o deploy automaticamente
   - Acesse seu site em `https://seu-site.netlify.app`

### Configuração do Supabase

1. **Criar projeto no Supabase:**
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Anote a URL e as chaves

2. **Configurar banco de dados:**
   - Execute as migrações: `npx prisma db push`
   - Popule com dados: `npm run db:seed`

3. **Configurar Storage (opcional):**
   - Crie um bucket para uploads
   - Configure as políticas de acesso

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Executar versão de produção

# Banco de dados
npm run db:push      # Aplicar mudanças no schema
npm run db:migrate   # Executar migrações
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados

# Linting
npm run lint         # Executar ESLint
```

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório ao Vercel**
2. **Configure as variáveis de ambiente**
3. **Deploy automático**

### Outras Plataformas

O sistema pode ser deployado em qualquer plataforma que suporte Node.js:

- Railway
- Heroku
- DigitalOcean
- AWS
- Google Cloud

## 📝 Roadmap

- [ ] ✅ Sistema base com autenticação
- [ ] ✅ Página do cliente e carrinho
- [ ] ✅ Integração WhatsApp
- [ ] ✅ Dashboard administrativo básico
- [ ] 🔄 Gerenciamento de categorias
- [ ] 🔄 Gerenciamento de produtos
- [ ] 🔄 Upload de imagens
- [ ] 🔄 Personalização visual
- [ ] 📅 Sistema de pedidos completo
- [ ] 📅 Relatórios e analytics
- [ ] 📅 Notificações push
- [ ] 📅 Múltiplos métodos de pagamento

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:

- 📧 Email: suporte@allgomenu.com
- 💬 Discord: [Link do Discord]
- 📖 Documentação: [Link da Documentação]

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Desenvolvido com ❤️ para facilitar o delivery de restaurantes locais.** 