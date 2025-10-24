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
        console.log('=== SupabaseProvider: Initializing auth ===')
        console.log('Current pathname:', window.location.pathname)
        console.log('Document cookies:', document.cookie)
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')

        // Get initial session
        console.log('Calling supabase.auth.getSession()...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Error getting session:', error.message, error)
          setLoading(false)
          setUser(null)
          return
        }

        console.log('✓ Session loaded:', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          expiresAt: session?.expires_at
        })

        if (session?.user) {
          console.log('✓ User authenticated:', session.user.email)
          setUser(session.user)
        } else {
          console.log('⚠️ No session found')
          setUser(null)
        }

        setLoading(false)
        console.log('=== SupabaseProvider: Auth initialization complete ===')
      } catch (error) {
        console.error('❌ Auth initialization exception:', error)
        setUser(null)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    // This provider manages Supabase authentication state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Supabase auth state changed:', event, {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      })

      setUser(session?.user ?? null)

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('✅ SIGNED_IN event - User authenticated via Supabase')
          console.log('Refreshing router...')
          router.refresh()
          break
        case 'SIGNED_OUT':
          console.log('👋 SIGNED_OUT event - Redirecting to sign in')
          setUser(null)
          router.push('/auth/supabase-signin')
          break
        case 'TOKEN_REFRESHED':
          console.log('🔄 TOKEN_REFRESHED - Session token refreshed')
          break
        case 'USER_UPDATED':
          console.log('👤 USER_UPDATED - User data updated')
          setUser(session?.user ?? null)
          break
        case 'INITIAL_SESSION':
          console.log('🎬 INITIAL_SESSION - Session loaded on mount')
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
