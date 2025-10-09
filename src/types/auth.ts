export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthError {
  message: string
  field?: string
}

export interface AuthResponse {
  success: boolean
  error?: AuthError
}

export interface User {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}