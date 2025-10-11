'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  
  // Don't show dashboard navigation on landing page
  const isLandingPage = pathname === '/'
  
  if (isLandingPage) {
    return (
      <PreferencesProvider>
        <div className="min-h-screen">
          {children}
        </div>
      </PreferencesProvider>
    )
  }

  return (
    <PreferencesProvider>
      <div className="min-h-screen bg-pearl dark:bg-obsidian">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </PreferencesProvider>
  )
}