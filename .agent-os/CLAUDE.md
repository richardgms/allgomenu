# Agent OS - AllGoMenu Project Configuration

This file provides Agent OS context specific to the AllGoMenu project.

## Project Overview

AllGoMenu é uma plataforma multi-tenant de delivery que permite múltiplos restaurantes operarem independentemente. Ver documentação completa em `.agent-os/product/`.

## Key Project Context

### Multi-tenant Architecture
- **Slug-based routing**: `/[slug]` (customer) e `/[slug]/admin` (dashboard)
- **Data isolation**: Todas as entidades linkadas a `restaurantId`
- **Access control**: Validação de acesso por restaurante em todas as operações

### Current Implementation Status
- ✅ **Core Platform**: Sistema base funcional com temas e autenticação
- ✅ **Analytics Dashboard**: 5 endpoints com visualizações Recharts
- ✅ **WhatsApp Integration**: Templates customizáveis e geração de URLs
- ✅ **Theme System**: CSS custom properties com validação de acessibilidade
- 🔄 **Phase 1**: Analytics enhancement e polish (2 TODOs pendentes)

### Development Patterns

#### Always Include Restaurant Filtering
```typescript
// NEVER fetch data without restaurant filtering
const products = await db.product.findMany({
  where: { 
    restaurantId,  // ALWAYS include this
    // other filters...
  }
})
```

#### API Route Patterns
- **Public APIs**: `/api/restaurant/[slug]/*` (customer-facing)  
- **Protected APIs**: `/api/admin/*` (requires JWT + restaurant validation)

#### State Management
- **Zustand**: Global UI state (restaurant, menu, orders, analytics)
- **React Query**: Server state with 5min cache, auto-retry
- **Local useState**: Component-only temporary state

### Project Standards
- **Standards**: Use customized files in `~/.agent-os/standards/` 
- **Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind, shadcn/ui
- **Code Style**: TypeScript patterns, camelCase variables, PascalCase components
- **Architecture**: Multi-tenant with slug routing, theme system, analytics dashboard

### Current Priorities (Phase 1)
1. **Analytics Trend Calculations** - Fix TODOs in analytics page (trend calculations)
2. **Performance Optimization** - Optimize analytics queries
3. **Real-time Updates** - WebSocket integration for orders

## Instructions Override
This project uses Agent OS standards. Always reference:
1. `.agent-os/product/mission-lite.md` for product context
2. `.agent-os/product/tech-stack.md` for technical decisions  
3. `.agent-os/product/roadmap.md` for current priorities
4. `~/.agent-os/standards/` for development standards

When creating specs or executing tasks, always consider the multi-tenant architecture and restaurant data isolation requirements.