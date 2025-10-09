import { createClient } from '@/lib/supabase/client'
import type { LoginForm, RegisterForm, AuthResponse } from '@/types/auth'

export async function signIn({ email, password }: LoginForm): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: {
        message: error.message,
        field: error.message.toLowerCase().includes('email') ? 'email' : 
               error.message.toLowerCase().includes('password') ? 'password' : undefined
      }
    }
  }

  return { success: true }
}

export async function signUp({ email, password }: RegisterForm): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  })

  if (error) {
    return {
      success: false,
      error: {
        message: error.message,
        field: error.message.toLowerCase().includes('email') ? 'email' : 
               error.message.toLowerCase().includes('password') ? 'password' : undefined
      }
    }
  }

  return { success: true }
}

export async function signOut(): Promise<AuthResponse> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      success: false,
      error: { message: error.message }
    }
  }

  return { success: true }
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    return null
  }
  
  return user
}