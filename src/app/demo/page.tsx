'use client'

import { useState } from 'react'
import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Play, Pause, RotateCcw, ChevronRight, Monitor, Mic, MessageSquare, BarChart3, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const demoSteps = [
  {
    title: 'Choose Interview Type',
    description: 'Select from behavioral, technical, or custom interview formats',
    duration: '0:15'
  },
  {
    title: 'Answer Questions',
    description: 'Respond to AI-generated questions via text, voice, or video',
    duration: '1:30'
  },
  {
    title: 'Receive Instant Feedback',
    description: 'Get detailed analysis on your answers and communication style',
    duration: '0:45'
  },
  {
    title: 'Track Progress',
    description: 'View performance metrics and improvement recommendations',
    duration: '0:30'
  }
]

const features = [
  {
    icon: MessageSquare,
    title: 'Natural Conversations',
    description: 'AI adapts to your responses for realistic interview simulation'
  },
  {
    icon: Mic,
    title: 'Voice Analysis',
    description: 'Evaluate tone, pace, and clarity of your verbal communication'
  },
  {
    icon: BarChart3,
    title: 'Performance Metrics',
    description: 'Track improvement with detailed analytics and insights'
  },
  {
    icon: CheckCircle,
    title: 'Actionable Feedback',
    description: 'Receive specific suggestions to improve your interview skills'
  }
]

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              See AI Interview Pro in Action
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Watch how our AI-powered platform transforms interview preparation with personalized coaching and real-time feedback
            </p>
          </div>

          {/* Demo Video Section */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
              {/* Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">Interactive Demo Video</p>
                  <Button 
                    size="lg" 
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                    onClick={handlePlayPause}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Demo
                  </Button>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={handleRestart}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <span className="text-white text-sm">3:00 / 3:00</span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Demo Steps */}
            <div className="mt-8 grid md:grid-cols-4 gap-4">
              {demoSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    currentStep === index
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${
                      currentStep === index ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Step {index + 1}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{step.duration}</span>
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    currentStep === index ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
              What You'll Experience
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Try It Yourself CTA */}
          <div className="text-center p-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Interview Skills?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start practicing with our AI interviewer today and see immediate improvements in your performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="px-8">
                  Start Free Trial
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  How realistic is the AI interviewer?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI is trained on thousands of real interview scenarios and continuously updated with industry trends. 
                  It provides realistic questions and adapts based on your responses, just like a human interviewer would.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Can I practice specific types of interviews?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can customize your practice sessions for behavioral, technical, case study, or industry-specific interviews. 
                  The AI adapts its questions and evaluation criteria based on your selection.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  How detailed is the feedback?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You receive comprehensive feedback on content quality, communication style, body language (for video), 
                  and specific areas for improvement. Each session includes actionable recommendations and progress tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
