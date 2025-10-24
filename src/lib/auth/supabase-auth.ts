/**
 * Supabase Authentication Utilities
 *
 * This module provides authentication helper functions for server-side usage.
 * Replaces NextAuth with Supabase Auth.
 */

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for server-side operations (API routes, Server Components)
 * Properly handles cookies for session management
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Called from Server Component - cookies are read-only
            // This is expected behavior when called from Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Called from Server Component - cookies are read-only
          }
        },
      },
    }
  )
}

/**
 * Gets the currently authenticated user from the Supabase session
 * Returns null if no authenticated user
 *
 * This replaces NextAuth's getServerSession()
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Gets the current session
 * Returns null if no session exists
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Validates that a user is authenticated
 * Throws an error with appropriate message if not authenticated
 * Returns the user object if authenticated
 *
 * Use this in API routes that require authentication
 */
export async function requireAuth(): Promise<User> {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error('Unauthorized: Please sign in to access this resource')
  }

  return user
}

/**
 * Gets user ID from the current session
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const user = await getAuthenticatedUser()
  return user?.id || null
}

/**
 * Checks if user has a specific role
 * Roles are stored in user_metadata.role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getAuthenticatedUser()

  if (!user) return false

  const userRole = user.user_metadata?.role
  return userRole === role
}

/**
 * Gets user profile from database
 * Links auth.users to user_profiles table
 */
export async function getUserProfile(userId?: string) {
  const supabase = await createServerSupabaseClient()

  const targetUserId = userId || (await getUserId())

  if (!targetUserId) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', targetUserId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile
}

/**
 * Creates or updates user profile after signup/login
 */
export async function upsertUserProfile(user: User) {
  const supabase = await createServerSupabaseClient()

  const profileData = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(profileData, {
      onConflict: 'id',
    })

  if (error) {
    console.error('Error upserting user profile:', error)
    throw error
  }

  return profileData
}
