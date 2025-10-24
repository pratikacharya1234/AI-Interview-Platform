import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'

  console.log('=== Auth Callback Start ===')
  console.log('Full URL:', request.url)
  console.log('Code present:', !!code)
  console.log('Code length:', code?.length)
  console.log('Redirect target:', redirect)
  console.log('Origin:', requestUrl.origin)
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')

  if (!code) {
    console.error('No code provided in callback')
    return NextResponse.redirect(new URL('/auth/supabase-signin?error=no_code', requestUrl.origin))
  }

  // Create response early so we can set cookies on it
  const response = NextResponse.redirect(new URL(redirect, requestUrl.origin))

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value
          console.log(`Cookie GET: ${name} = ${value ? 'present' : 'missing'}`)
          return value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            console.log(`Cookie SET: ${name}`)
            cookieStore.set({ name, value, ...options })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          } catch (error) {
            console.error('Error setting cookie:', name, error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            console.log(`Cookie REMOVE: ${name}`)
            cookieStore.set({ name, value: '', ...options })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          } catch (error) {
            console.error('Error removing cookie:', name, error)
          }
        },
      },
    }
  )

  try {
    console.log('Exchanging code for session...')
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error.message, error)
      return NextResponse.redirect(new URL('/auth/supabase-signin?error=auth_failed', requestUrl.origin))
    }

    if (!data.session) {
      console.error('No session returned after code exchange')
      return NextResponse.redirect(new URL('/auth/supabase-signin?error=no_session', requestUrl.origin))
    }

    console.log('✓ Session created successfully')
    console.log('User ID:', data.session.user.id)
    console.log('User email:', data.session.user.email)
    console.log('Expires at:', data.session.expires_at)
    console.log('Access token (first 20 chars):', data.session.access_token?.substring(0, 20) + '...')
    console.log('Response cookies being set:', response.cookies.getAll().map(c => c.name))
    console.log('=== Auth Callback End ===')
  } catch (error) {
    console.error('Exception in callback:', error)
    return NextResponse.redirect(new URL('/auth/supabase-signin?error=exception', requestUrl.origin))
  }

  console.log('Redirecting to:', redirect)
  return response
}
