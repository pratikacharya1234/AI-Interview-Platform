'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Brain, Loader2 } from 'lucide-react'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then(session => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      console.error('Sign in error:', error)
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
              Sign in to access your personalized AI interview platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGithubSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Github className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Signing in...' : 'Continue with GitHub'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">Why GitHub?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Secure OAuth authentication</li>
              <li>• Access to your GitHub profile and repositories</li>
              <li>• Personalized interview questions based on your projects</li>
              <li>• No password required</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}