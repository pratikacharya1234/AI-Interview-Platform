'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { cn } from '@/lib/utils'
import { ModernSidebar } from '@/components/navigation/modern-sidebar'
import { TopBar } from '@/components/navigation/top-bar'
import { MobileNav } from '@/components/navigation/mobile-nav'
import { CommandPalette } from '@/components/navigation/command-palette'

interface ModernLayoutProps {
  children: React.ReactNode
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const { user, loading: authLoading } = useSupabase()
  const pathname = usePathname()
  const router = useRouter()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // Show loading state while auth is loading
  // Note: Middleware handles authentication redirects for protected routes
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  // If unauthenticated at this point, show a message and let middleware redirect
  if (!user) {
    console.log('ModernLayout: No user detected, showing redirect message')
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Verifying authentication...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">If you're not redirected, please <a href="/auth/supabase-signin" className="text-blue-600 hover:underline">sign in</a></p>
        </div>
      </div>
    )
  }

  // Create session object for compatibility with components expecting NextAuth session
  const session = user ? {
    user: {
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      image: user.user_metadata?.avatar_url || null,
    }
  } : null
  
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen}
      />
      
      {/* Mobile Navigation */}
      <MobileNav 
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        session={session}
      />
      
      {/* Desktop Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <ModernSidebar 
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          className={cn(
            "hidden lg:flex transition-all duration-300",
            sidebarOpen ? "w-64" : "w-20"
          )}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar 
            session={session}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            isScrolled={isScrolled}
            className={cn(
              "sticky top-0 z-40 transition-all duration-200",
              isScrolled && "shadow-sm backdrop-blur-md bg-white/80 dark:bg-gray-900/80"
            )}
          />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Breadcrumb */}
              <div className="mb-6">
                <nav className="flex text-sm text-gray-500 dark:text-gray-400">
                  {pathname.split('/').filter(Boolean).map((segment, index, array) => (
                    <div key={segment} className="flex items-center">
                      {index > 0 && <span className="mx-2">/</span>}
                      <span className={cn(
                        index === array.length - 1 
                          ? "text-gray-900 dark:text-white font-medium" 
                          : "hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                      )}>
                        {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
                      </span>
                    </div>
                  ))}
                </nav>
              </div>
              
              {/* Page Content with Animation */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
