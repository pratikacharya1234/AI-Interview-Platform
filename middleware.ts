import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  console.log(`[MIDDLEWARE] ${request.nextUrl.pathname} - User: ${user ? user.email : 'None'}, Error: ${authError?.message || 'None'}`)

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile']
  const authRoutes = ['/signin', '/signup']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    console.log(`[MIDDLEWARE] Redirecting ${request.nextUrl.pathname} to /signin - no user`)
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && user) {
    console.log(`[MIDDLEWARE] Redirecting ${request.nextUrl.pathname} to /dashboard - user authenticated`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  console.log(`[MIDDLEWARE] Allowing ${request.nextUrl.pathname}`)  

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}