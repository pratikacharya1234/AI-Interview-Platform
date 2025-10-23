'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Brain, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SupabaseSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const redirectTo = searchParams.get('redirect') || '/dashboard'
      const origin = window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          scopes: 'read:user user:email',
        },
      })

      if (error) {
        console.error('GitHub sign in error:', error)
        setError(error.message)
        setIsLoading(false)
      }
      // If successful, user will be redirected to GitHub
    } catch (error: any) {
      console.error('Sign in exception:', error)
      setError(error.message || 'An unexpected error occurred')
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
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Connecting to GitHub...
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
                Powered by Supabase Authentication
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
