'use client'

import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Briefcase, MapPin, Clock, ArrowRight, Users, Rocket, Heart, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

const openPositions = [
  {
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and scale our AI-powered interview platform using Next.js, TypeScript, and modern web technologies.'
  },
  {
    title: 'Machine Learning Engineer',
    department: 'AI/ML',
    location: 'Remote',
    type: 'Full-time',
    description: 'Develop and improve our AI models for natural language processing and interview analysis.'
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create intuitive and beautiful user experiences for our interview preparation platform.'
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help our users succeed by providing exceptional support and gathering valuable feedback.'
  }
]

const benefits = [
  {
    icon: Users,
    title: 'Remote-First Culture',
    description: 'Work from anywhere in the world with flexible hours that suit your lifestyle.'
  },
  {
    icon: Rocket,
    title: 'Growth Opportunities',
    description: 'Continuous learning budget and career development programs to help you grow.'
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance, mental health support, and wellness stipend.'
  },
  {
    icon: Target,
    title: 'Equity Participation',
    description: 'Own a piece of the company with our generous equity compensation package.'
  }
]

const values = [
  {
    title: 'User-Centric Innovation',
    description: 'Every decision we make starts with how it benefits our users and their career journey.'
  },
  {
    title: 'Continuous Learning',
    description: 'We embrace challenges as opportunities to learn and grow, both individually and as a team.'
  },
  {
    title: 'Transparent Communication',
    description: 'Open, honest, and respectful communication is the foundation of our collaboration.'
  },
  {
    title: 'Impact-Driven',
    description: 'We measure success by the positive impact we have on people\'s careers and lives.'
  }
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Join Our Mission
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Help us democratize interview preparation and empower millions to land their dream jobs
            </p>
          </div>

          {/* Company Overview */}
          <div className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Building the Future of Interview Preparation
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  At AI Interview Pro, we're revolutionizing how people prepare for job interviews. Our AI-powered platform 
                  has already helped thousands of professionals land their dream jobs, and we're just getting started.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  We're a remote-first team of passionate individuals who believe that everyone deserves access to 
                  high-quality interview preparation, regardless of their background or resources.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">92%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">25+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">15+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Benefits & Perks
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div key={benefit.title} className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Open Positions
            </h2>
            <div className="space-y-4">
              {openPositions.map((position) => (
                <div key={position.title} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {position.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {position.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Link href={`/careers/${position.title.toLowerCase().replace(/ /g, '-')}`}>
                      <Button className="group">
                        View Position
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* No Open Position CTA */}
          <div className="text-center p-12 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Don't See a Perfect Fit?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion for helping people succeed. 
              Send us your resume and tell us how you can contribute to our mission.
            </p>
            <Link href="/contact?type=careers">
              <Button size="lg">
                Send Your Application
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Hiring Process */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Our Hiring Process
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500" />
                
                {/* Steps */}
                <div className="space-y-8">
                  {[
                    { step: 1, title: 'Application Review', description: 'We review your application and portfolio within 3-5 business days' },
                    { step: 2, title: 'Initial Call', description: '30-minute conversation to discuss your experience and our culture' },
                    { step: 3, title: 'Technical Assessment', description: 'Role-specific assessment to evaluate your skills (2-4 hours)' },
                    { step: 4, title: 'Team Interviews', description: 'Meet with team members to discuss collaboration and culture fit' },
                    { step: 5, title: 'Final Decision', description: 'We make our decision within 48 hours and provide detailed feedback' }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1 pt-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
