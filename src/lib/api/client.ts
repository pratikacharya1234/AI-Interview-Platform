import { createClient } from '@/lib/supabase/client'

interface ApiError {
  message: string
  code?: string
  status?: number
}

class ApiClient {
  private supabase = createClient()

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<{ data: T | null; error: ApiError | null }> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession()

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(session?.access_token && {
          Authorization: `Bearer ${session.access_token}`
        }),
        ...options?.headers,
      }

      const response = await fetch(endpoint, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          data: null,
          error: {
            message: errorData.message || response.statusText,
            code: errorData.code,
            status: response.status,
          },
        }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  async get<T>(endpoint: string): Promise<{ data: T | null; error: ApiError | null }> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    body?: any
  ): Promise<{ data: T | null; error: ApiError | null }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(
    endpoint: string,
    body?: any
  ): Promise<{ data: T | null; error: ApiError | null }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<{ data: T | null; error: ApiError | null }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
