import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance
let client: SupabaseClient | null = null

export function createClient() {
  // Return existing instance if it exists
  if (client) {
    return client
  }

  // Create new instance only if none exists
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split('; ')
            const cookie = cookies.find(c => c.startsWith(`${name}=`))
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
          }
          return undefined
        },
        set(name: string, value: string, options?: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=${encodeURIComponent(value)}`

            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`
            }
            if (options?.path) {
              cookieString += `; Path=${options.path}`
            }
            if (options?.domain) {
              cookieString += `; Domain=${options.domain}`
            }
            if (options?.sameSite) {
              cookieString += `; SameSite=${options.sameSite}`
            }
            if (options?.secure) {
              cookieString += `; Secure`
            }

            document.cookie = cookieString
          }
        },
        remove(name: string, options?: any) {
          if (typeof document !== 'undefined') {
            document.cookie = `${name}=; Max-Age=0; Path=${options?.path || '/'}`
          }
        },
      },
    }
  )

  return client
}
