'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: SupabaseClient
  user: User | null
  loading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing Supabase auth...')
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
        }

        console.log('Session loaded:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        })

        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    // This provider manages Supabase authentication state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth state changed:', event)

      setUser(session?.user ?? null)

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          // User signed in through Supabase
          console.log('Supabase session detected')
          router.refresh()
          break
        case 'SIGNED_OUT':
          // User signed out - redirect to signin page
          setUser(null)
          router.push('/auth/supabase-signin')
          break
        case 'TOKEN_REFRESHED':
          // Token was refreshed
          console.log('Supabase token refreshed')
          break
        case 'USER_UPDATED':
          // User data was updated
          setUser(session?.user ?? null)
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <Context.Provider value={{ supabase, user, loading }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}
