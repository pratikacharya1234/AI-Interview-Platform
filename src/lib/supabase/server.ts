import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type cookies } from 'next/headers'

// Helper function to parse chunked cookies from cookie store
function getChunkedCookie(cookieStore: Awaited<ReturnType<typeof cookies>>, name: string): string | undefined {
  // Check if we have chunked cookies (name.0, name.1, etc.)
  const chunks: string[] = []
  let chunkIndex = 0

  while (true) {
    const chunkName = `${name}.${chunkIndex}`
    const chunkValue = cookieStore.get(chunkName)?.value

    if (!chunkValue) {
      break
    }

    chunks.push(chunkValue)
    chunkIndex++
  }

  // If we found chunks, reassemble them
  if (chunks.length > 0) {
    console.log(`[Server] Found ${chunks.length} cookie chunks for ${name}`)
    return chunks.join('')
  }

  // Otherwise return the single cookie value
  return cookieStore.get(name)?.value
}

export async function createClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getChunkedCookie(cookieStore, name)
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
