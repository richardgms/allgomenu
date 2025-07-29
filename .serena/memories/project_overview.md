# AllGoMenu - Multi-tenant Restaurant Delivery System

## Project Purpose
AllGoMenu is a complete multi-tenant restaurant delivery system that allows multiple restaurants to operate under a single platform. Each restaurant has its own customizable subdomain/slug with both a public ordering interface and a private admin dashboard.

## Core Features
- **Multi-tenant Architecture**: Each restaurant operates with its own slug (e.g., `/pizzaria-exemplo`)
- **Public Customer Interface**: Menu browsing, cart management, order placement with WhatsApp integration
- **Admin Dashboard**: Complete restaurant management with analytics, menu management, orders, customization
- **WhatsApp Integration**: Automatic order forwarding via formatted WhatsApp messages
- **Dynamic Theming**: Restaurant-specific color schemes and branding
- **Real-time Analytics**: Sales, customer, product, and performance analytics
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui components with Radix UI primitives
- **State Management**: Zustand stores with React Query for server state
- **Authentication**: JWT-based authentication
- **File Upload**: Cloudinary and Supabase Storage support
- **Charts**: Recharts for analytics visualization
- **Drag & Drop**: @dnd-kit for interactive UI
- **Styling**: CSS custom properties for dynamic theming