'use client'

import { SessionProvider } from 'next-auth/react'
import { SupabaseProvider } from './providers/supabase-provider'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </SessionProvider>
  )
}