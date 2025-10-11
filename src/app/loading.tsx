import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pearl dark:bg-obsidian">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo/spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-prism-teal/20 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-prism-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-obsidian dark:text-pearl mb-1">
            Loading AI Interview Platform
          </h2>
          <p className="text-sm text-silver">
            Preparing your interview experience...
          </p>
        </div>
        
        {/* Progress indicators */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-prism-teal rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-prism-teal rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-prism-teal rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}