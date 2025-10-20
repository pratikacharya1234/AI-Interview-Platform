'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Brain, Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authMethod, setAuthMethod] = useState<'github' | 'email'>('email')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

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
    setError(null)
    try {
      await signIn('github', { 
        callbackUrl: searchParams.get('redirect') || '/dashboard',
        redirect: true
      })
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError('GitHub login is not configured. Please use email login.')
      setAuthMethod('email')
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: email.split('@')[0],
            }
          }
        })

        if (error) throw error

        if (data.user) {
          // Try to create profile, but don't fail if table doesn't exist
          try {
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                username: email.split('@')[0],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
          } catch (profileError) {
            console.log('Profile creation skipped:', profileError)
          }

          // For local development, auto-confirm and sign in
          if (window.location.hostname === 'localhost') {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            })
            
            if (!signInError) {
              router.push(searchParams.get('redirect') || '/dashboard')
              return
            }
          }

          setError('Account created! You can now sign in.')
          setIsSignUp(false)
        }
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        if (data.user) {
          router.push(searchParams.get('redirect') || '/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Use a valid email domain for demo
      const demoEmail = 'demo.user@aiinterview.app'
      const demoPassword = 'DemoPass123!'
      
      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      })

      if (signInError) {
        // If demo account doesn't exist, create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: 'Demo User',
            }
          }
        })

        if (signUpError) throw signUpError

        // For localhost, try to sign in immediately
        if (window.location.hostname === 'localhost' || signUpData.user?.email_confirmed_at) {
          const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword
          })

          if (!newSignInError && newSignInData.user) {
            router.push(searchParams.get('redirect') || '/dashboard')
            return
          }
        }
        
        setError('Demo account created! Please check your email to verify, or sign in with your own account.')
        setIsSignUp(false)
      } else if (signInData.user) {
        router.push(searchParams.get('redirect') || '/dashboard')
      }
    } catch (error: any) {
      console.error('Demo login error:', error)
      setError(error.message || 'Demo login failed. Please create your own account using the form above.')
    } finally {
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
          {error && (
            <Alert variant={error.includes('Success') ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {authMethod === 'email' ? (
            <>
              <form id="email-form" onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up demo...
                    </>
                  ) : (
                    'Try Demo Account'
                  )}
                </Button>

                <Button
                  onClick={handleGithubSignIn}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Github className="w-5 h-5 mr-2" />
                  )}
                  Continue with GitHub
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError(null)
                  }}
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          ) : (
            <>
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setAuthMethod('email')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Continue with Email
              </Button>
            </>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}