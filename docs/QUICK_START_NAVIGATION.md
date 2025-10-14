# Quick Start: Navigation System

## Adding a New AI Feature

### 1. Create the Page

```bash
# Create new feature directory
mkdir -p src/app/ai/my-feature

# Create page component
touch src/app/ai/my-feature/page.tsx
```

```tsx
// src/app/ai/my-feature/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MyFeaturePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Feature</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your feature content */}
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. Add to AI Features Navigation

```tsx
// src/app/ai/layout.tsx

const aiFeatures: AIFeature[] = [
  // ... existing features
  {
    id: 'my-feature',
    name: 'My Feature',
    href: '/ai/my-feature',
    icon: YourIcon,  // Import from lucide-react
    description: 'Brief description',
    badge: 'New'  // Optional
  }
]
```

### 3. Update Navigation Hook (Optional)

```tsx
// src/hooks/useAINavigation.ts

const AI_FEATURE_ROUTES: AIFeatureRoute[] = [
  // ... existing routes
  {
    id: 'my-feature',
    name: 'My Feature',
    path: '/ai/my-feature',
    description: 'Brief description'
  }
]
```

### 4. Update Breadcrumb Labels (Optional)

```tsx
// src/components/navigation/breadcrumb.tsx

const labelMap: Record<string, string> = {
  // ... existing labels
  'my-feature': 'My Feature'
}
```

## Using Navigation Components

### Breadcrumb

```tsx
import { Breadcrumb } from '@/components/navigation/breadcrumb'

// Auto-generate from pathname
<Breadcrumb />

// Or provide custom items
<Breadcrumb items={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'AI Features', href: '/ai/coach' },
  { label: 'My Feature', href: '/ai/my-feature' }
]} />
```

### AI Feature Navigation (Prev/Next)

```tsx
import { AIFeatureNav } from '@/components/navigation/ai-feature-nav'

<AIFeatureNav className="mt-8" />
```

### Using AI Navigation Hook

```tsx
import { useAINavigation } from '@/hooks/useAINavigation'

function MyComponent() {
  const { 
    currentFeature, 
    isAIFeature, 
    navigateToFeature,
    getNextFeature 
  } = useAINavigation()

  return (
    <div>
      <p>Current: {currentFeature?.name}</p>
      <button onClick={() => navigateToFeature('coach')}>
        Go to AI Coach
      </button>
    </div>
  )
}
```

### Using AI Features Context

```tsx
import { useAIFeatures } from '@/contexts/AIFeaturesContext'

function MyComponent() {
  const { metrics, updateMetrics, isLoading } = useAIFeatures()

  const handleComplete = () => {
    updateMetrics({
      sessionsCompleted: metrics.sessionsCompleted + 1
    })
  }

  return (
    <div>
      <p>Sessions: {metrics.sessionsCompleted}</p>
      <button onClick={handleComplete}>Complete Session</button>
    </div>
  )
}
```

## Common Patterns

### Feature Page Template

```tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/navigation/breadcrumb'
import { AIFeatureNav } from '@/components/navigation/ai-feature-nav'
import { useAIFeatures } from '@/contexts/AIFeaturesContext'

export default function FeaturePage() {
  const { metrics, updateMetrics } = useAIFeatures()
  const [data, setData] = useState(null)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Metric 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Value</div>
          </CardContent>
        </Card>
        {/* More stat cards */}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Title</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your content */}
        </CardContent>
      </Card>

      {/* Navigation */}
      <AIFeatureNav />
    </div>
  )
}
```

### Loading State

```tsx
import { useAIFeatures } from '@/contexts/AIFeaturesContext'

function MyComponent() {
  const { isLoading, setIsLoading } = useAIFeatures()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await fetch('/api/data')
      // Process data
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>Content</div>
}
```

### Conditional Navigation

```tsx
import { useAINavigation } from '@/hooks/useAINavigation'

function ConditionalNav() {
  const { currentFeature, getNextFeature } = useAINavigation()
  const nextFeature = getNextFeature()

  return (
    <div>
      {nextFeature && (
        <Button onClick={() => navigateToFeature(nextFeature.id)}>
          Continue to {nextFeature.name}
        </Button>
      )}
    </div>
  )
}
```

## Styling Guidelines

### Active States

```tsx
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

<Link
  className={cn(
    "base-classes",
    isActive && "active-classes"
  )}
>
  Link Text
</Link>
```

### Responsive Navigation

```tsx
{/* Desktop */}
<div className="hidden lg:flex">
  <HorizontalTabs />
</div>

{/* Mobile */}
<div className="lg:hidden">
  <DropdownMenu />
</div>
```

### Consistent Spacing

```tsx
<div className="space-y-6">  {/* Vertical spacing */}
  <Section1 />
  <Section2 />
</div>

<div className="flex gap-4">  {/* Horizontal spacing */}
  <Item1 />
  <Item2 />
</div>
```

## Troubleshooting

### Navigation not updating?
- Check if you're using Next.js `<Link>` component
- Verify pathname in `usePathname()` hook
- Ensure route is defined in `aiFeatures` array

### Double navigation appearing?
- Remove nested children from main sidebar
- Use secondary navigation in layout instead
- Check ConditionalLayout routing logic

### Breadcrumb not showing?
- Verify pathname format
- Check labelMap in breadcrumb.tsx
- Ensure Breadcrumb component is imported

### Context not working?
- Verify AIFeaturesProvider wraps your component
- Check if you're in /ai/* route
- Use useAIFeatures() hook correctly

## Best Practices

1. ✅ Always use the layout for AI features
2. ✅ Keep navigation logic in hooks
3. ✅ Use context for shared state
4. ✅ Provide loading states
5. ✅ Make navigation accessible
6. ✅ Test on mobile devices
7. ✅ Follow existing patterns
8. ✅ Document new features

## Resources

- [Full Navigation Architecture](./NAVIGATION_ARCHITECTURE.md)
- [Next.js Routing Docs](https://nextjs.org/docs/app/building-your-application/routing)
- [Accessibility Guidelines](https://www.w3.org/WAI/ARIA/apg/)
