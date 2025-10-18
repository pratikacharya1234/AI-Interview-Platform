import HeroSection from '@/components/landing/hero-section'
import HowItWorksSection from '@/components/landing/how-it-works'
import FeaturesSection from '@/components/landing/features-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import PricingSection from '@/components/landing/pricing-section'
import CTASection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'
import LandingNavigation from '@/components/landing/landing-navigation'

export default function Home() {
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
