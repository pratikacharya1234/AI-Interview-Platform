import type { Metadata } from 'next'
import HeroSection from '@/components/landing/hero-section'
import HowItWorksSection from '@/components/landing/how-it-works'
import FeaturesSection from '@/components/landing/features-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import PricingSection from '@/components/landing/pricing-section'
import CTASection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'
import LandingNavigation from '@/components/landing/landing-navigation'

export const metadata: Metadata = {
  title: 'AI Interview Pro — AI-Powered Interview Practice Platform',
  description: 'Boost your interview confidence with AI. Get real-time insights, track improvement, and practice like never before.',
  keywords: 'AI interview practice, job interview preparation, mock interviews, career coaching, interview feedback, technical interviews, behavioral interviews',
  authors: [{ name: 'AI Interview Pro Team' }],
  openGraph: {
    title: 'AI Interview Pro — Master Every Interview with AI',
    description: 'Practice with our adaptive AI interviewer, get real-time feedback, and land your dream job.',
    type: 'website',
    url: 'https://aiinterviewpro.com',
    siteName: 'AI Interview Pro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Interview Pro Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Interview Pro — AI-Powered Interview Practice',
    description: 'Boost your interview confidence with AI-powered practice sessions.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavigation />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
