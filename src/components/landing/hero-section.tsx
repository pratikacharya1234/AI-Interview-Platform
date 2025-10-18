'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, CheckCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
        <div className="text-center">
          {/* Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50",
            "border border-blue-200 dark:border-blue-800",
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Powered by Advanced AI Technology
            </span>
          </div>

          {/* Headline */}
          <h1 className={cn(
            "mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight",
            "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300",
            "bg-clip-text text-transparent",
            "transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Master Every Interview
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text">
              with AI Precision
            </span>
          </h1>

          {/* Subheadline */}
          <p className={cn(
            "mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400",
            "transition-all duration-700 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Practice with our adaptive AI interviewer, get real-time feedback, 
            and land your dream job. Join thousands who transformed their interview performance.
          </p>

          {/* CTA Buttons */}
          <div className={cn(
            "mt-10 flex flex-col sm:flex-row gap-4 justify-center",
            "transition-all duration-700 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="group px-8 py-6 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-base font-medium border-2"
            >
              <Play className="mr-2 w-5 h-5" />
              See Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className={cn(
            "mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400",
            "transition-all duration-700 delay-400",
            mounted ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Stats */}
          <div className={cn(
            "mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto",
            "transition-all duration-700 delay-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                92%
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                4.9/5
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
