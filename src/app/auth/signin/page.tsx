'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Brain, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then(session => {
      if (session) {
        router.push('/dashboard')
      }
    })

    // Check for OAuth errors in URL
    const error = searchParams.get('error')
    if (error) {
      if (error === 'Configuration') {
        setError('GitHub OAuth is not configured. Please check environment variables.')
      } else if (error === 'AccessDenied') {
        setError('Access denied. You must authorize the app to continue.')
      } else if (error === 'Verification') {
        setError('Verification failed. Please try again.')
      } else {
        setError(`Authentication error: ${error}`)
      }
    }
  }, [router, searchParams])

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    setError(null)
    
    // Check if running in browser
    if (typeof window === 'undefined') {
      setError('Cannot sign in on server side')
      setIsLoading(false)
      return
    }

    try {
      console.log('Initiating GitHub sign in...')
      const result = await signIn('github', { 
        callbackUrl: searchParams.get('redirect') || '/dashboard',
        redirect: true
      })
      
      console.log('Sign in result:', result)
      
      if (result?.error) {
        console.error('Sign in error:', result.error)
        if (result.error === 'Configuration') {
          setError('GitHub OAuth is not properly configured. Check your environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET).')
        } else if (result.error === 'AccessDenied') {
          setError('You denied access. Please try again and authorize the application.')
        } else {
          setError(`Failed to sign in: ${result.error}`)
        }
        setIsLoading(false)
      }
      // If redirect is true and no error, the page will redirect automatically
    } catch (error: any) {
      console.error('Sign in exception:', error)
      setError('An unexpected error occurred. Please check the console for details.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Pro
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in with GitHub to access your personalized AI interview platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <Github className="w-5 h-5 mr-2" />
                Continue with GitHub
              </>
            )}
          </Button>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Need help? Make sure GitHub OAuth is configured in your environment variables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}