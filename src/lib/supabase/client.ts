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
  // Use default cookie handling from @supabase/ssr for better compatibility
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
