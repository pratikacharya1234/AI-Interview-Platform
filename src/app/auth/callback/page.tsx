'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Callback error:', error)
          router.push('/auth/signin?error=callback')
          return
        }

        if (session) {
          // Successfully authenticated
          router.push('/dashboard')
        } else {
          // No session found
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/signin?error=callback')
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
