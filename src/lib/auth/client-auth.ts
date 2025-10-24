/**
 * Client-Side Authentication Utilities
 *
 * Functions for handling authentication on the client side (browser)
 */

import { createClient } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(email: string, password: string, metadata?: {
  full_name?: string
  [key: string]: any
}) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export async function signInWithOAuth(provider: Provider) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign in with GitHub (specific helper)
 */
export async function signInWithGitHub() {
  return signInWithOAuth('github')
}

/**
 * Sign in with Google (specific helper)
 */
export async function signInWithGoogle() {
  return signInWithOAuth('google')
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  // Redirect to home page after sign out
  window.location.href = '/'
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata: Record<string, any>) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    data: metadata,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  return user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }
}
