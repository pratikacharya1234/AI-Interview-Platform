'use client'

import { usePathname } from 'next/navigation'
import { AppLayout as AuthenticatedLayout } from '@/components/layout/app-layout'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Landing page gets no layout wrapper (it has its own navigation)
  const isLandingPage = pathname === '/'
  
  // Protected pages that need authentication and dashboard layout
  const isProtectedPage = pathname.startsWith('/dashboard') || 
                         pathname.startsWith('/interview') || 
                         pathname.startsWith('/practice') || 
                         pathname.startsWith('/analytics') || 
                         pathname.startsWith('/settings') || 
                         pathname.startsWith('/profile') || 
                         pathname.startsWith('/subscription') ||
                         pathname.startsWith('/ai/') ||
                         pathname.startsWith('/coding') ||
                         pathname.startsWith('/mock') ||
                         pathname.startsWith('/achievements') ||
                         pathname.startsWith('/reports') ||
                         pathname.startsWith('/preferences')
  
  if (isLandingPage) {
    // Landing page - no layout wrapper, just preferences context
    return (
      <PreferencesProvider>
        <div className="min-h-screen">
          {children}
        </div>
      </PreferencesProvider>
    )
  }
  
  if (isProtectedPage) {
    // Protected pages - use authenticated layout with sidebar and navbar
    return (
      <PreferencesProvider>
        <AuthenticatedLayout>
          {children}
        </AuthenticatedLayout>
      </PreferencesProvider>
    )
  }
  
  // Default layout for other pages (if any)
  return (
    <PreferencesProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </PreferencesProvider>
  )
}