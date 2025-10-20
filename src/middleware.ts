import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

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

  // Check for NextAuth session first
  let token = null
  try {
    token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  } catch (error) {
    console.log('NextAuth token check skipped:', error)
  }
  
  // Then check Supabase session
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    user = data?.user
  } catch (error) {
    console.log('Supabase auth check error:', error)
  }
  
  // User is authenticated if either NextAuth or Supabase session exists
  const isAuthenticated = !!(token || user)

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/interview/audio',
    '/interview/video', 
    '/interview/text',
    '/practice',
    '/profile',
    '/settings',
    '/analytics',
    '/reports'
  ]
  
  // Allow these paths without authentication
  const publicPaths = [
    '/',
    '/auth',
    '/api'
  ]
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return response
  }

  // If accessing protected route without auth, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    console.log('No authenticated user, redirecting to signin')
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/auth/signin'))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

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
