'use client'

import { useState, useEffect } from 'react'
import UltraHeroSection from './sections/ultra-hero'
import QuantumFeatures from './sections/quantum-features'
import TechStackVisualization from './sections/tech-stack-viz'
import PerformanceDashboard from './sections/performance-dashboard'
import EnterpriseCTA from './sections/enterprise-cta'
import FuturisticNav from './sections/futuristic-nav'
import FloatingParticles from './effects/floating-particles'
import MorphingGradient from './effects/morphing-gradient'

export default function UltraModernLanding() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {mounted && <FloatingParticles />}
      <MorphingGradient />
      <FuturisticNav />
      <UltraHeroSection />
      <QuantumFeatures />
      <TechStackVisualization />
      <PerformanceDashboard />
      <EnterpriseCTA />
    </div>
  )
}
