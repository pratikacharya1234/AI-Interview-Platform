import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check NextAuth configuration
 * Access at: /api/auth/debug
 * 
 * WARNING: Remove or protect this endpoint in production!
 */
export async function GET() {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    nextauthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
    githubClientId: process.env.GITHUB_CLIENT_ID ? 'SET (hidden)' : 'NOT SET',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
    
    // Show first/last few characters to help verify
    githubClientIdPreview: process.env.GITHUB_CLIENT_ID 
      ? `${process.env.GITHUB_CLIENT_ID.substring(0, 4)}...${process.env.GITHUB_CLIENT_ID.slice(-4)}`
      : 'NOT SET',
    
    expectedCallbackUrl: process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/github`
      : 'NOT SET',
  }

  // Check for common issues
  const issues: string[] = []

  if (!process.env.NEXTAUTH_URL) {
    issues.push('NEXTAUTH_URL is not set')
  } else if (process.env.NEXTAUTH_URL.endsWith('/')) {
    issues.push('NEXTAUTH_URL has trailing slash - remove it')
  } else if (!process.env.NEXTAUTH_URL.startsWith('http')) {
    issues.push('NEXTAUTH_URL must start with http:// or https://')
  }

  if (!process.env.NEXTAUTH_SECRET) {
    issues.push('NEXTAUTH_SECRET is not set')
  } else if (process.env.NEXTAUTH_SECRET.length < 32) {
    issues.push('NEXTAUTH_SECRET is too short (should be 32+ characters)')
  }

  if (!process.env.GITHUB_CLIENT_ID) {
    issues.push('GITHUB_CLIENT_ID is not set')
  }

  if (!process.env.GITHUB_CLIENT_SECRET) {
    issues.push('GITHUB_CLIENT_SECRET is not set')
  }

  const response = {
    status: issues.length === 0 ? 'OK' : 'ISSUES_FOUND',
    config,
    issues,
    instructions: issues.length > 0 ? [
      'Fix the issues above',
      'For Vercel: Set environment variables in Settings → Environment Variables',
      'For local: Update .env.local file',
      'After fixing, redeploy (Vercel) or restart dev server (local)'
    ] : [
      'Configuration looks good!',
      'If GitHub login still fails, check:',
      '1. GitHub OAuth App callback URL matches expectedCallbackUrl above',
      '2. GitHub OAuth App is not suspended',
      '3. Browser console for client-side errors'
    ]
  }

  return NextResponse.json(response, {
    status: issues.length === 0 ? 200 : 500,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}
