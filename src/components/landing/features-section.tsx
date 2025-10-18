'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Mic, 
  BarChart3, 
  Shield, 
  Globe, 
  Zap,
  Video,
  FileText,
  Users,
  Clock,
  Target,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    title: 'Real-time AI Feedback',
    description: 'Get instant, actionable feedback on your answers, body language, and communication style.',
    icon: Brain,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Voice & Video Analysis',
    description: 'Advanced speech recognition and video analysis to improve verbal and non-verbal communication.',
    icon: Video,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Role-Specific Questions',
    description: 'Tailored question banks for different roles, industries, and experience levels.',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Performance Analytics',
    description: 'Detailed dashboards showing your progress, strengths, and areas for improvement.',
    icon: BarChart3,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Privacy-First Design',
    description: 'Your data is encrypted and never shared. Practice with complete confidentiality.',
    icon: Shield,
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'Multi-Language Support',
    description: 'Practice interviews in multiple languages with native-speaker quality AI.',
    icon: Globe,
    gradient: 'from-teal-500 to-blue-500'
  }
]

export default function FeaturesSection() {
  const [mounted, setMounted] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
            "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50",
            "border border-blue-200 dark:border-blue-800",
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Powerful Features
            </span>
          </div>
          
          <h2 className={cn(
            "text-4xl sm:text-5xl font-bold",
            "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300",
            "bg-clip-text text-transparent",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Everything You Need to Succeed
          </h2>
          <p className={cn(
            "mt-4 text-lg text-gray-600 dark:text-gray-400",
            "transition-all duration-700 delay-100",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Advanced AI technology meets intuitive design to create the ultimate interview preparation platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={cn(
                  "group relative",
                  "transition-all duration-700",
                  mounted ? `opacity-100 translate-y-0 delay-${index * 50}` : "opacity-0 translate-y-4"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className={cn(
                  "relative h-full p-8 rounded-2xl",
                  "bg-white dark:bg-gray-900",
                  "border-2 border-gray-200 dark:border-gray-800",
                  "transition-all duration-300",
                  "hover:border-transparent hover:shadow-2xl",
                  hoveredIndex === index && "scale-105"
                )}>
                  {/* Gradient Background on Hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
                    "bg-gradient-to-r", feature.gradient,
                    hoveredIndex === index && "opacity-5"
                  )} />

                  {/* Icon */}
                  <div className={cn(
                    "relative w-14 h-14 rounded-xl mb-6",
                    "bg-gradient-to-r", feature.gradient,
                    "flex items-center justify-center",
                    "transform transition-transform",
                    hoveredIndex === index && "scale-110 rotate-3"
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="relative text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect Line */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl",
                    "bg-gradient-to-r", feature.gradient,
                    "transform origin-left transition-transform duration-300",
                    hoveredIndex === index ? "scale-x-100" : "scale-x-0"
                  )} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className={cn(
          "mt-16 grid grid-cols-2 md:grid-cols-4 gap-8",
          "transition-all duration-700 delay-300",
          mounted ? "opacity-100" : "opacity-0"
        )}>
          {[
            { icon: Zap, label: 'Lightning Fast', value: '< 100ms response' },
            { icon: Users, label: 'Active Community', value: '50K+ users' },
            { icon: Clock, label: 'Always Available', value: '24/7 access' },
            { icon: FileText, label: 'Question Bank', value: '10K+ questions' }
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                  <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
