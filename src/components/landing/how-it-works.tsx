'use client'

import { useState, useEffect } from 'react'
import { UserPlus, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    number: '01',
    title: 'Sign Up & Set Goals',
    description: 'Create your profile and tell us about your target role, experience level, and interview goals.',
    icon: UserPlus,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    number: '02',
    title: 'Practice with AI',
    description: 'Engage in realistic interview sessions with our AI that adapts to your responses and skill level.',
    icon: MessageSquare,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    number: '03',
    title: 'Get Instant Feedback',
    description: 'Receive detailed analysis on your answers, communication style, and areas for improvement.',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500'
  },
  {
    number: '04',
    title: 'Track & Improve',
    description: 'Monitor your progress over time and see your interview skills transform with data-driven insights.',
    icon: CheckCircle,
    color: 'from-pink-500 to-red-500'
  }
]

export default function HowItWorksSection() {
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className={cn(
            "text-4xl sm:text-5xl font-bold",
            "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300",
            "bg-clip-text text-transparent",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            How It Works
          </h2>
          <p className={cn(
            "mt-4 text-lg text-gray-600 dark:text-gray-400",
            "transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Four simple steps to interview success
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "relative group",
                    "transition-all duration-700",
                    mounted ? `opacity-100 translate-y-0 delay-${index * 100}` : "opacity-0 translate-y-4"
                  )}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Card */}
                  <div className={cn(
                    "relative bg-white dark:bg-gray-900 rounded-2xl p-6",
                    "border-2 transition-all duration-300",
                    activeStep === index 
                      ? "border-blue-500 shadow-xl scale-105" 
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  )}>
                    {/* Step Number */}
                    <div className={cn(
                      "absolute -top-4 -right-4 w-12 h-12 rounded-full",
                      "bg-gradient-to-r", step.color,
                      "flex items-center justify-center text-white font-bold text-sm",
                      "shadow-lg"
                    )}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={cn(
                      "w-14 h-14 rounded-xl mb-4",
                      "bg-gradient-to-r", step.color,
                      "flex items-center justify-center",
                      "transform transition-transform group-hover:scale-110"
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Progress Indicator */}
                    <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full bg-gradient-to-r", step.color,
                          "transition-all duration-1000",
                          activeStep === index ? "w-full" : "w-0"
                        )}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
