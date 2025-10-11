'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  goHome: () => void
  goBack: () => void
}

function DefaultErrorFallback({ error, resetError, goHome, goBack }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pearl dark:bg-obsidian p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-rose-alert/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-alert" />
          </div>
          <CardTitle className="text-rose-alert">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. This has been reported to our team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-silver/10 p-3 rounded-lg">
              <p className="text-xs font-mono text-rose-alert break-all">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-silver cursor-pointer">Stack trace</summary>
                  <pre className="text-xs text-silver mt-1 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={resetError}
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={goBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button 
                variant="outline" 
                onClick={goHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-silver">
            <p>If this problem persists, please contact support at</p>
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

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real application, you would send this to your error monitoring service
    console.error('Error Boundary caught an error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })

    // Example: Send to Sentry
    // Sentry.captureException(error, { contexts: { errorInfo } })
    
    // Example: Send to custom endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error, errorInfo, url: window.location.href })
    // })
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private goHome = () => {
    this.resetError()
    window.location.href = '/'
  }

  private goBack = () => {
    this.resetError()
    window.history.back()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
          goBack={this.goBack}
        />
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error handled by useErrorHandler:', error, errorInfo)
    
    // You can also trigger a state update to show an error UI
    // or report the error to your monitoring service
  }
}

// Higher-order component wrapper
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary