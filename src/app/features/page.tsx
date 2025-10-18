'use client'

import FeaturesSection from '@/components/landing/features-section'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavigation />
      <div className="pt-16">
        <FeaturesSection />
      </div>
      <Footer />
    </main>
  )
}
