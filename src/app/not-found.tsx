'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pearl dark:bg-obsidian p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          {/* 404 illustration */}
          <div className="mx-auto w-24 h-24 bg-prism-teal/10 rounded-full flex items-center justify-center mb-6">
            <Search className="w-12 h-12 text-prism-teal" />
          </div>
          <CardTitle className="text-2xl text-obsidian dark:text-pearl">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-base">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or you entered the wrong URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Suggested actions */}
          <div className="space-y-3">
            <h4 className="font-medium text-obsidian dark:text-pearl">What you can do:</h4>
            <ul className="text-sm text-silver space-y-1 text-left">
              <li>• Check the URL for typos</li>
              <li>• Go back to the previous page</li>
              <li>• Visit our homepage</li>
              <li>• Use the search feature</li>
            </ul>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-prism-teal hover:bg-teal-600 text-white shadow-md hover:shadow-teal-glow hover:scale-[1.02] active:scale-95 focus:ring-prism-teal rounded-lg transition-all duration-200 gap-2">
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          {/* Popular pages */}
          <div className="border-t border-silver/20 pt-4">
            <h4 className="font-medium text-obsidian dark:text-pearl mb-3">Popular pages:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link 
                href="/dashboard" 
                className="text-prism-teal hover:underline"
              >
                Dashboard
              </Link>
              <Link 
                href="/interview" 
                className="text-prism-teal hover:underline"
              >
                Start Interview
              </Link>
              <Link 
                href="/analytics" 
                className="text-prism-teal hover:underline"
              >
                Analytics
              </Link>
              <Link 
                href="/resources" 
                className="text-prism-teal hover:underline"
              >
                Resources
              </Link>
            </div>
          </div>

          {/* Contact support */}
          <div className="text-xs text-silver">
            <p>Still need help?</p>
            <a 
              href="mailto:support@aiinterviewplatform.com" 
              className="text-prism-teal hover:underline"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}