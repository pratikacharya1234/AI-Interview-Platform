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

  // Check for NextAuth session
  let token = null
  try {
    token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  } catch (error) {
    console.log('NextAuth token check error:', error)
  }
  
  // User is authenticated if NextAuth session exists
  const isAuthenticated = !!token

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/interview/audio',
    '/interview/video', 
    '/interview/text',
    '/interview/voice',
    '/interview/history',
    '/interview/feedback',
    '/interview/performance',
    '/practice',
    '/profile',
    '/settings',
    '/analytics',
    '/reports',
    '/preferences',
    '/achievements',
    '/ai/coach',
    '/ai/feedback',
    '/ai/prep',
    '/mentor',
    '/mock',
    '/coding',
    '/learning'
  ]
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  // If accessing protected route without auth, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    console.log('No authenticated user, redirecting to login')
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access login/signin, redirect to dashboard
  if (isAuthenticated && (
    request.nextUrl.pathname === '/login' || 
    request.nextUrl.pathname === '/signin' ||
    request.nextUrl.pathname.startsWith('/auth/signin')
  )) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Allow all other paths (public pages)
  return NextResponse.next()
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
