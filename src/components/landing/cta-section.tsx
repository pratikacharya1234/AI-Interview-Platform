'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CTASection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Animated Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
          "bg-white/10 backdrop-blur-sm border border-white/20",
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">
            Limited Time Offer
          </span>
        </div>

        {/* Headline */}
        <h2 className={cn(
          "text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6",
          "transition-all duration-700 delay-100",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Ready to Land Your
          <br />
          Dream Job?
        </h2>

        {/* Subheadline */}
        <p className={cn(
          "text-xl text-blue-100 mb-8 max-w-2xl mx-auto",
          "transition-all duration-700 delay-200",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          Join 50,000+ professionals who transformed their interview performance 
          and secured their dream positions with AI Interview Pro
        </p>

        {/* CTA Buttons */}
        <div className={cn(
          "flex flex-col sm:flex-row gap-4 justify-center mb-8",
          "transition-all duration-700 delay-300",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Link href="/dashboard">
            <Button 
              size="lg" 
              className="group px-8 py-6 text-base font-medium bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-base font-medium border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              View Pricing Plans
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className={cn(
          "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-blue-100",
          "transition-all duration-700 delay-400",
          mounted ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* Social Proof */}
        <div className={cn(
          "mt-12 pt-12 border-t border-white/20",
          "transition-all duration-700 delay-500",
          mounted ? "opacity-100" : "opacity-0"
        )}>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">92%</div>
              <div className="text-sm text-blue-200 mt-1">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="text-sm text-blue-200 mt-1">User Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-blue-200 mt-1">Active Users</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
