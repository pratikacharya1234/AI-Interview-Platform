'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
import { Sidebar } from '@/components/navigation/sidebar'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Redirect to login if not authenticated
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    redirect('/')
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={`relative flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } hidden lg:flex`}
      >
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
        
        {/* Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute -right-4 top-4 z-40 h-8 w-8 rounded-full p-0 border-2 bg-background shadow-md"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-3 w-3" />
          ) : (
            <PanelLeftClose className="h-3 w-3" />
          )}
        </Button>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navigation Header */}
        <Navbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Higher-order component for protected pages
export function withAppLayout<T extends {}>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <AppLayout>
        <Component {...props} />
      </AppLayout>
    )
  }
}