'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error handler:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-pearl dark:bg-obsidian p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-rose-alert/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-alert" />
          </div>
          <CardTitle className="text-rose-alert">Oops! Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error ID for support */}
          {error.digest && (
            <div className="bg-silver/10 p-3 rounded-lg text-center">
              <p className="text-xs text-silver">Error ID: {error.digest}</p>
            </div>
          )}
          
          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-silver/10 p-3 rounded-lg">
              <summary className="text-sm font-medium cursor-pointer text-rose-alert">
                Technical Details (Development)
              </summary>
              <div className="mt-2 text-xs font-mono text-silver">
                <p className="font-semibold">{error.name}:</p>
                <p className="mb-2">{error.message}</p>
                {error.stack && (
                  <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={reset}
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Button>
          </div>

          {/* Support information */}
          <div className="text-center text-sm text-silver border-t border-silver/20 pt-4">
            <p>Need help? Contact our support team:</p>
            <a 
              href="mailto:support@aiinterviewplatform.com" 
              className="text-prism-teal hover:underline"
            >
              support@aiinterviewplatform.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}