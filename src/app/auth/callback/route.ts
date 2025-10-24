import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'

  console.log('Auth callback received:', { code: !!code, redirect })

  // Create response early so we can set cookies on it
  const response = NextResponse.redirect(new URL(redirect, requestUrl.origin))

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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
              response.cookies.set({
                name,
                value,
                ...options,
              })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/auth/supabase-signin?error=auth_failed', requestUrl.origin))
      }

      console.log('Session exchanged successfully:', { userId: data.session?.user?.id })
    } catch (error) {
      console.error('Error in callback:', error)
      return NextResponse.redirect(new URL('/auth/supabase-signin?error=auth_failed', requestUrl.origin))
    }
  }

  console.log('Redirecting to:', redirect)
  return response
}
