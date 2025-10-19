'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please contact support.'
      case 'AccessDenied':
        return 'You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'OAuthSignin':
        return 'Error occurred while signing in with GitHub. Please try again.'
      case 'OAuthCallback':
        return 'Error occurred during the authentication callback. Please try again.'
      case 'OAuthCreateAccount':
        return 'Could not create user account. Please try again.'
      case 'EmailCreateAccount':
        return 'Could not create user account. Please try again.'
      case 'Callback':
        return 'Error occurred during the authentication callback. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'This account is already linked with another user.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return 'An unexpected error occurred during authentication. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {getErrorMessage()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-sm text-red-700">
              <strong>Error Code:</strong> {error || 'Unknown'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Link href="/auth/signin" className="block">
              <Button className="w-full">
                Try Again
              </Button>
            </Link>
            
            <Link href="/" className="block">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact support
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
