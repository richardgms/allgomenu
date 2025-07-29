'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useIsMobile } from '@/hooks/use-mobile'

interface AdminLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const { isAuthenticated, loading, hasAccessToRestaurant } = useAuth()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (!hasAccessToRestaurant(params.slug)) {
        router.push('/login')
        return
      }
    }
  }, [isAuthenticated, loading, hasAccessToRestaurant, params.slug, router])

  // Não renderizar durante SSR para evitar hydration mismatch
  if (isMobile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const handleMenuToggle = () => {
    setSidebarOpen(prev => !prev)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !hasAccessToRestaurant(params.slug)) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar - sempre visível */}
      <div className="hidden lg:block">
        <AdminSidebar slug={params.slug} />
      </div>
      
      {/* Mobile sidebar - renderizado separadamente para overlay */}
      <div className="lg:hidden">
        <AdminSidebar 
          slug={params.slug} 
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader 
          slug={params.slug} 
          onMenuToggle={handleMenuToggle}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}