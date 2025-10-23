'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useSupabase } from '@/lib/supabase/supabase-provider'
import ModernSidebar from '@/components/navigation/modern-sidebar'
import TopBar from '@/components/navigation/top-bar'
import CommandPalette from '@/components/navigation/command-palette'

interface ModernLayoutProps {
  children: React.ReactNode
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const user = useUser()
  const { supabase } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [commandOpen, setCommandOpen] = useState(false)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      const currentPath = pathname
      router.push(`/auth/supabase-signin?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, router, pathname])

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ModernSidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <TopBar onCommandOpen={() => setCommandOpen(true)} />

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Command palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
