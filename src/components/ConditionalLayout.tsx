'use client'

import { usePathname } from 'next/navigation'
import { ModernLayout } from '@/components/layout/modern-layout'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Landing page gets no layout wrapper (it has its own navigation)
  const isLandingPage = pathname === '/'
  
  // Auth pages get minimal layout
  const isAuthPage = pathname.startsWith('/auth/') || 
                     pathname.startsWith('/login') ||
                     pathname.startsWith('/register') ||
                     pathname.startsWith('/forgot-password')
  
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
                         pathname.startsWith('/preferences') ||
                         pathname.startsWith('/leaderboard') ||
                         pathname.startsWith('/streak') ||
                         pathname.startsWith('/progress') ||
                         pathname.startsWith('/learning') ||
                         pathname.startsWith('/mentor') ||
                         pathname.startsWith('/resources') ||
                         pathname.startsWith('/help') ||
                         pathname.startsWith('/tutorials') ||
                         pathname.startsWith('/contact') ||
                         pathname.startsWith('/system-health')
  
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
  
  if (isAuthPage) {
    // Auth pages - minimal layout
    return (
      <PreferencesProvider>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          {children}
        </div>
      </PreferencesProvider>
    )
  }
  
  if (isProtectedPage) {
    // Protected pages - use modern layout with sidebar and navbar
    return (
      <PreferencesProvider>
        <ModernLayout>
          {children}
        </ModernLayout>
      </PreferencesProvider>
    )
  }
  
  // Default layout for other pages
  return (
    <PreferencesProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </PreferencesProvider>
  )
}