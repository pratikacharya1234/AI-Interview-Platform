'use client'

import PricingSection from '@/components/landing/pricing-section'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavigation />
      <div className="pt-16">
        <PricingSection />
      </div>
      <Footer />
    </main>
  )
}
