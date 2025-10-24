import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance
let client: SupabaseClient | null = null

// Helper function to parse chunked cookies
function parseCookieString(cookieString: string, name: string): string | null {
  const cookies = cookieString.split(';').map(c => c.trim())
  const chunks: { [key: string]: string } = {}

  // Find all cookie chunks (e.g., name.0, name.1, name.2)
  for (const cookie of cookies) {
    const equalIndex = cookie.indexOf('=')
    if (equalIndex === -1) continue

    const key = cookie.substring(0, equalIndex).trim()
    const value = cookie.substring(equalIndex + 1).trim()

    if (key.startsWith(name)) {
      chunks[key] = value
    }
  }

  // Check if we have chunked cookies (name.0, name.1, etc.)
  const chunkPattern = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\d+$`)
  const chunkKeys = Object.keys(chunks)
    .filter(k => chunkPattern.test(k))
    .sort((a, b) => {
      // Sort by chunk number (e.g., name.0, name.1, name.2)
      const aNum = parseInt(a.split('.').pop() || '0', 10)
      const bNum = parseInt(b.split('.').pop() || '0', 10)
      return aNum - bNum
    })

  if (chunkKeys.length > 0) {
    console.log(`Found ${chunkKeys.length} cookie chunks for ${name}: ${chunkKeys.join(', ')}`)
    const assembled = chunkKeys.map(k => chunks[k]).join('')
    console.log(`Assembled cookie length: ${assembled.length}`)
    return assembled
  }

  // Otherwise return the single cookie value
  if (chunks[name]) {
    console.log(`Found single cookie: ${name}`)
    return chunks[name]
  }

  return null
}

export function createClient() {
  // Return existing instance if it exists
  if (client) {
    return client
  }

  // Create new instance with custom cookie handling for chunked cookies
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') {
            return null
          }

          const value = parseCookieString(document.cookie, name)

          // Only log main auth token, not every lookup
          if (name.includes('auth-token') && !name.match(/\.\d+$/)) {
            if (value) {
              console.log(`✓ Cookie retrieved: ${name} (length: ${value.length})`)
            } else {
              console.log(`⚠️ Cookie not found: ${name}`)
            }
          }

          return value
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') {
            return
          }

          console.log(`Setting cookie: ${name}`)

          // For large cookies, we need to chunk them
          const maxChunkSize = 3600 // Safe size for cookie chunks

          if (value.length > maxChunkSize) {
            console.log(`Cookie ${name} is large (${value.length} chars), will be chunked`)
            // Clear any existing chunks
            let i = 0
            while (document.cookie.includes(`${name}.${i}=`)) {
              document.cookie = `${name}.${i}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
              i++
            }

            // Create new chunks
            const chunks = Math.ceil(value.length / maxChunkSize)
            for (let i = 0; i < chunks; i++) {
              const chunk = value.slice(i * maxChunkSize, (i + 1) * maxChunkSize)
              const cookieStr = `${name}.${i}=${chunk}; path=/; ${options.maxAge ? `max-age=${options.maxAge};` : ''} ${options.sameSite ? `samesite=${options.sameSite};` : ''} ${options.secure ? 'secure;' : ''}`
              document.cookie = cookieStr
            }
            console.log(`✓ Cookie ${name} split into ${chunks} chunks`)
          } else {
            const cookieStr = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge};` : ''} ${options.sameSite ? `samesite=${options.sameSite};` : ''} ${options.secure ? 'secure;' : ''}`
            document.cookie = cookieStr
            console.log(`✓ Cookie ${name} set (single chunk)`)
          }
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') {
            return
          }

          console.log(`Removing cookie: ${name}`)

          // Remove main cookie
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`

          // Remove any chunks
          let i = 0
          while (document.cookie.includes(`${name}.${i}=`)) {
            document.cookie = `${name}.${i}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            i++
          }

          console.log(`✓ Cookie ${name} and chunks removed`)
        }
      }
    }
  )

  return client
}
