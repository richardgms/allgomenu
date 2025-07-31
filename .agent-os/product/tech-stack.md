# Technical Stack

## Core Framework & Language
- **App Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.2+
- **Runtime**: Node.js 22 LTS
- **Package Manager**: npm

## Database & ORM  
- **Primary Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Development Workflow**: db:push for schema changes
- **Production Workflow**: db:migrate for deployments
- **Database GUI**: Prisma Studio

## Frontend Architecture
- **Frontend Framework**: React 18
- **State Management**: Zustand + React Query (@tanstack/react-query)
- **CSS Framework**: Tailwind CSS 3.3+
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts

## Authentication & Security
- **Authentication**: JWT with localStorage
- **Protected Routes**: Custom middleware with getAuthUser()
- **Access Control**: Restaurant-level isolation
- **Input Validation**: Zod schemas

## Media & Assets
- **Image Upload**: Cloudinary (primary), Supabase Storage (fallback)
- **Font Provider**: Google Fonts (self-hosted for performance)
- **Image Optimization**: Next.js Image component

## Form Handling & Validation
- **Form Library**: React Hook Form
- **Validation**: Zod schemas
- **Notifications**: react-hot-toast
- **Error Handling**: Custom error boundaries

## Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Database Browser**: Prisma Studio
- **API Testing**: Custom test scripts in ./scripts/

## Hosting & Deployment
- **Application Hosting**: Vercel (preferred) or Netlify
- **Database Hosting**: Supabase or Railway
- **Database Backups**: Automated daily
- **CI/CD Platform**: GitHub Actions or Vercel
- **Environment Management**: .env.local for development

## Integration Services
- **WhatsApp Integration**: Custom URL generation with template system
- **Message Templates**: Customizable per restaurant
- **Phone Validation**: Brazilian format support

## Performance & Monitoring
- **Caching Strategy**: React Query with stale-while-revalidate
- **Console Filtering**: Custom filter to reduce development noise
- **Query DevTools**: React Query DevTools in development
- **Performance Monitoring**: Vercel Analytics (production)

## Architecture Patterns
- **Multi-tenant**: Slug-based routing (/[slug], /[slug]/admin)
- **API Structure**: 
  - Public: /api/restaurant/[slug]/*
  - Protected: /api/admin/*
- **Theme System**: CSS custom properties with restaurant-specific configs
- **Color Management**: Advanced color space utilities in lib/color/