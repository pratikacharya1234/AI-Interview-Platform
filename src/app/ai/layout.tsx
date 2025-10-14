'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  Brain, 
  Headphones, 
  Star, 
  Target,
  Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/navigation/breadcrumb'
import { AIFeaturesProvider } from '@/contexts/AIFeaturesContext'

interface AIFeature {
  id: string
  name: string
  href: string
  icon: any
  description: string
  badge?: string
}

const aiFeatures: AIFeature[] = [
  {
    id: 'coach',
    name: 'AI Coach',
    href: '/ai/coach',
    icon: Brain,
    description: 'Personalized coaching sessions',
    badge: 'Beta'
  },
  {
    id: 'voice',
    name: 'Voice Analysis',
    href: '/ai/voice',
    icon: Headphones,
    description: 'Advanced voice metrics'
  },
  {
    id: 'feedback',
    name: 'Smart Feedback',
    href: '/ai/feedback',
    icon: Star,
    description: 'AI-enhanced insights'
  },
  {
    id: 'prep',
    name: 'Personalized Prep',
    href: '/ai/prep',
    icon: Target,
    description: 'Custom study plans'
  }
]

export default function AIFeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <AIFeaturesProvider>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        {/* AI Features Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI-Powered Features</h1>
              <p className="text-sm text-muted-foreground">
                Advanced AI tools to accelerate your interview preparation
              </p>
            </div>
          </div>

          {/* Secondary Navigation - Horizontal Tabs */}
          <Card className="p-1 bg-muted/50">
            <nav className="flex flex-wrap gap-1" aria-label="AI Features Navigation">
              {aiFeatures.map((feature) => {
                const Icon = feature.icon
                const isActive = pathname === feature.href
                
                return (
                  <Link
                    key={feature.id}
                    href={feature.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200",
                      "hover:bg-background hover:shadow-sm",
                      isActive 
                        ? "bg-background shadow-sm border border-border" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-primary" : ""
                    )} />
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium text-sm whitespace-nowrap",
                        isActive ? "text-foreground" : ""
                      )}>
                        {feature.name}
                      </span>
                      {feature.badge && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-1.5 py-0 h-5"
                        >
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </Card>

          {/* Mobile Dropdown Navigation - Only visible on small screens */}
          <div className="lg:hidden">
            <select
              value={pathname}
              onChange={(e) => window.location.href = e.target.value}
              className="w-full p-3 rounded-lg border bg-background"
              aria-label="Select AI Feature"
            >
              {aiFeatures.map((feature) => (
                <option key={feature.id} value={feature.href}>
                  {feature.name} - {feature.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Content */}
        <div className="pb-8">
          {children}
        </div>
      </div>
    </AIFeaturesProvider>
  )
}
