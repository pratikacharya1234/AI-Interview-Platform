import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingNavigation } from '@/components/navigation/landing-navigation'
import { 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  Brain, 
  Target, 
  BarChart3, 
  MessageSquare,
  Mic,
  Play,
  ChevronRight,
  Building2,
  UserCheck,
  Award,
  Zap,
  Code,
  TrendingUp as Analytics
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Interview Pro - Master Your Next Interview with AI-Powered Practice',
  description: 'Get personalized interview training, real-time feedback, and performance analytics. Practice with our advanced AI interviewer and land your dream job. Start your free trial today.',
  keywords: 'AI interview, interview practice, job interview preparation, AI interviewer, interview training, career development, job search',
  authors: [{ name: 'AI Interview Pro' }],
  openGraph: {
    title: 'AI Interview Pro - AI-Powered Interview Practice Platform',
    description: 'Master your next interview with personalized AI training, real-time feedback, and performance analytics. Join 50,000+ successful job seekers.',
    url: 'https://aiinterviewpro.com',
    siteName: 'AI Interview Pro',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Interview Pro - Master Your Next Interview',
    description: 'AI-powered interview practice platform with personalized feedback and performance analytics.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-token',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Mic className="w-4 h-4 mr-2" />
              AI-Powered Interview Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Master Your Next Interview with{' '}
              <span className="text-blue-600">AI-Powered Practice</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 sm:text-xl">
              Get personalized interview training, real-time feedback, and performance analytics. 
              Practice with our advanced AI interviewer that adapts to your skill level and provides 
              actionable insights to help you land your dream job.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto px-8 py-3">
                  Start Free Trial
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                14-Day Free Trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Cancel Anytime
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1,000+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-gray-600">Interview Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">AI Assistant Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive AI-powered tools designed to boost your interview confidence and performance.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>AI-Powered Interviews</CardTitle>
                <CardDescription>
                  Practice with our advanced AI interviewer that asks relevant questions based on your target role and experience level.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Real-Time Feedback</CardTitle>
                <CardDescription>
                  Get instant feedback on your answers, communication style, and areas for improvement after each practice session.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Track your progress with detailed analytics, performance metrics, and personalized improvement recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Role-Specific Training</CardTitle>
                <CardDescription>
                  Customize your practice sessions for specific roles, industries, and skill levels with targeted question sets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Voice & Video Practice</CardTitle>
                <CardDescription>
                  Practice with voice recognition and video analysis to improve your verbal communication and body language.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle>24/7 Availability</CardTitle>
                <CardDescription>
                  Practice anytime, anywhere. Our AI interviewer is available around the clock to help you prepare.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free and upgrade as you grow. All plans include our core AI interview features.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Basic Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <div className="text-3xl font-bold">Free</div>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    5 practice interviews per month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Basic feedback and scoring
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    General interview questions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Email support
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-blue-500 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-gray-600">/month</span></div>
                <CardDescription>For serious job seekers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Unlimited practice interviews
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Advanced AI feedback & analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Role-specific question banks
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Voice & video analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="text-3xl font-bold">Custom</div>
                <CardDescription>For teams and organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Everything in Professional
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Custom question creation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Team analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    API access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Dedicated success manager
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted by Job Seekers Worldwide
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See how our AI interview platform has helped thousands land their dream jobs.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  &ldquo;This platform completely transformed my interview skills. The AI feedback was incredibly detailed and helped me identify blind spots I never knew I had.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white font-semibold text-sm">
                    SC
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-gray-600">Software Engineer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  &ldquo;I practiced for just two weeks and landed my dream job at a Fortune 500 company. The role-specific questions were spot on.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full mr-3 flex items-center justify-center text-white font-semibold text-sm">
                    MR
                  </div>
                  <div>
                    <div className="font-semibold">Michael Rodriguez</div>
                    <div className="text-sm text-gray-600">Product Manager</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  &ldquo;The analytics helped me track my improvement over time. I went from nervous to confident in just a few sessions.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full mr-3 flex items-center justify-center text-white font-semibold text-sm">
                    EJ
                  </div>
                  <div>
                    <div className="font-semibold">Emily Johnson</div>
                    <div className="text-sm text-gray-600">Data Scientist</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the AI interviewer work?
              </h3>
              <p className="text-gray-700">
                Our AI interviewer uses advanced natural language processing to conduct realistic interview sessions. It asks relevant questions based on your target role, analyzes your responses in real-time, and provides detailed feedback on content, delivery, and areas for improvement.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my interview data secure and private?
              </h3>
              <p className="text-gray-700">
                Yes, we take data privacy seriously. All interview sessions are encrypted, and your personal data is never shared with third parties. You can delete your data at any time, and we comply with GDPR and other privacy regulations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I practice for specific roles or industries?
              </h3>
              <p className="text-gray-700">
                Absolutely! Our platform includes role-specific question banks for software engineering, product management, data science, marketing, sales, and many other fields. You can also customize sessions based on company type and seniority level.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How accurate is the AI feedback?
              </h3>
              <p className="text-gray-700">
                Our AI feedback system is trained on thousands of successful interviews and continuously improved based on user outcomes. While it provides valuable insights and guidance, we recommend using it as a complement to, not a replacement for, human feedback and coaching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of successful job seekers who&apos;ve used our AI interview platform to ace their interviews.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                Start Your Free Trial Today
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-200">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-xl">AI Interview Pro</span>
              </div>
              <p className="text-sm">
                The leading AI-powered interview preparation platform helping job seekers worldwide land their dream jobs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © 2025 AI Interview Pro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-sm hover:text-white">Terms</Link>
              <Link href="/cookies" className="text-sm hover:text-white">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}