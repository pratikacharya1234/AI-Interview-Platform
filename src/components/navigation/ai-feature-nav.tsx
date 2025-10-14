'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAINavigation } from '@/hooks/useAINavigation'
import { useRouter } from 'next/navigation'

interface AIFeatureNavProps {
  className?: string
}

/**
 * Navigation component for moving between AI features
 * Shows previous/next buttons for sequential navigation
 */
export function AIFeatureNav({ className }: AIFeatureNavProps) {
  const router = useRouter()
  const { getNextFeature, getPreviousFeature } = useAINavigation()
  
  const nextFeature = getNextFeature()
  const previousFeature = getPreviousFeature()

  if (!nextFeature && !previousFeature) {
    return null
  }

  return (
    <div className={`flex items-center justify-between gap-4 ${className || ''}`}>
      {/* Previous Feature */}
      {previousFeature ? (
        <Button
          variant="outline"
          onClick={() => router.push(previousFeature.path)}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <div className="text-left">
            <div className="text-xs text-muted-foreground">Previous</div>
            <div className="font-medium">{previousFeature.name}</div>
          </div>
        </Button>
      ) : (
        <div /> // Spacer
      )}

      {/* Next Feature */}
      {nextFeature ? (
        <Button
          variant="outline"
          onClick={() => router.push(nextFeature.path)}
          className="gap-2"
        >
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Next</div>
            <div className="font-medium">{nextFeature.name}</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <div /> // Spacer
      )}
    </div>
  )
}
