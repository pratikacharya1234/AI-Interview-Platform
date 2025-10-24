import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Create a Supabase client configured to use cookies
  const response = NextResponse.next({
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
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check for Supabase session
  let isAuthenticated = false
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    isAuthenticated = !!session && !error
  } catch (error) {
    console.log('Supabase session check error:', error)
  }

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/interview',
    '/practice',
    '/profile',
    '/settings',
    '/analytics',
    '/reports',
    '/preferences',
    '/achievements',
    '/ai',
    '/mentor',
    '/mock',
    '/coding',
    '/learning',
    '/leaderboard',
    '/streak',
    '/progress',
    '/resources',
    '/subscription',
    '/system-health'
  ]

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // If accessing protected route without auth, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    console.log('No authenticated user, redirecting to supabase signin')
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/supabase-signin'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login/signin, redirect to dashboard
  if (isAuthenticated && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signin' ||
    request.nextUrl.pathname.startsWith('/auth/signin') ||
    request.nextUrl.pathname.startsWith('/auth/supabase-signin')
  )) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Allow all other paths (public pages)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
