# Migration Guide: Navigation System Update

## Overview

This guide helps you migrate from the old navigation system (with double sidebar) to the new streamlined navigation architecture.

## Who Needs to Migrate?

- ✅ **Developers** working on AI feature pages
- ✅ **Teams** with custom navigation implementations
- ✅ **Projects** that extended the sidebar navigation

## Breaking Changes

### 1. Sidebar Structure Change

**Old Structure:**
```typescript
// AI Features had nested children in sidebar
const navigationItems = [
  {
    id: 'ai-features',
    name: 'AI Features',
    children: [
      { id: 'ai-coach', href: '/ai/coach' },
      { id: 'voice', href: '/ai/voice' },
      // ...
    ]
  }
]
```

**New Structure:**
```typescript
// AI Features is now a single link
const navigationItems = [
  {
    id: 'ai-features',
    name: 'AI Features',
    href: '/ai/coach',  // Direct link
    // No children
  }
]
```

**Action Required:**
- ❌ Remove any code that depends on `ai-features.children`
- ✅ Update to use direct link to `/ai/coach`

### 2. AI Feature Pages Now Use Layout

**Old Approach:**
```typescript
// Each page handled its own navigation
export default function AICoachPage() {
  return (
    <div>
      {/* Custom navigation here */}
      <MyCustomNav />
      {/* Page content */}
    </div>
  )
}
```

**New Approach:**
```typescript
// Layout provides navigation automatically
export default function AICoachPage() {
  return (
    <div className="space-y-6">
      {/* No need for custom navigation */}
      {/* Layout handles breadcrumb and tabs */}
      
      {/* Just your page content */}
      <Card>
        {/* ... */}
      </Card>
      
      {/* Optional: Add prev/next navigation */}
      <AIFeatureNav />
    </div>
  )
}
```

**Action Required:**
- ❌ Remove custom navigation from AI feature pages
- ✅ Use layout-provided navigation
- ✅ Optionally add `<AIFeatureNav />` for prev/next buttons

## Step-by-Step Migration

### Step 1: Update Sidebar References

If you have code that references AI Features in the sidebar:

**Before:**
```typescript
// Accessing nested children
const aiFeatures = sidebar.find(item => item.id === 'ai-features')
const aiCoach = aiFeatures.children.find(child => child.id === 'ai-coach')
```

**After:**
```typescript
// Direct access
const aiFeatures = sidebar.find(item => item.id === 'ai-features')
// aiFeatures.href is now '/ai/coach'
```

### Step 2: Remove Custom Navigation

If you added custom navigation to AI pages:

**Before:**
```tsx
// src/app/ai/coach/page.tsx
export default function AICoachPage() {
  return (
    <div>
      <CustomNavBar>
        <Link href="/ai/coach">AI Coach</Link>
        <Link href="/ai/voice">Voice</Link>
        <Link href="/ai/feedback">Feedback</Link>
        <Link href="/ai/prep">Prep</Link>
      </CustomNavBar>
      
      {/* Content */}
    </div>
  )
}
```

**After:**
```tsx
// src/app/ai/coach/page.tsx
import { AIFeatureNav } from '@/components/navigation/ai-feature-nav'

export default function AICoachPage() {
  return (
    <div className="space-y-6">
      {/* Layout provides navigation automatically */}
      
      {/* Your content */}
      <Card>
        {/* ... */}
      </Card>
      
      {/* Optional: Add sequential navigation */}
      <AIFeatureNav />
    </div>
  )
}
```

### Step 3: Update Navigation Logic

If you have custom navigation logic:

**Before:**
```typescript
// Custom navigation state
const [currentFeature, setCurrentFeature] = useState('coach')

const navigateToFeature = (featureId: string) => {
  setCurrentFeature(featureId)
  router.push(`/ai/${featureId}`)
}
```

**After:**
```typescript
// Use the navigation hook
import { useAINavigation } from '@/hooks/useAINavigation'

const { currentFeature, navigateToFeature } = useAINavigation()

// navigateToFeature('voice') - works the same way
```

### Step 4: Update Shared State

If you were passing props between AI pages:

**Before:**
```tsx
// Prop drilling
<AICoachPage 
  metrics={metrics} 
  updateMetrics={updateMetrics}
/>
```

**After:**
```tsx
// Use context
import { useAIFeatures } from '@/contexts/AIFeaturesContext'

function AICoachPage() {
  const { metrics, updateMetrics } = useAIFeatures()
  // No props needed
}
```

### Step 5: Update Tests

**Before:**
```typescript
// Testing sidebar expansion
const aiFeatures = screen.getByText('AI Features')
fireEvent.click(aiFeatures)
expect(screen.getByText('AI Coach')).toBeVisible()
```

**After:**
```typescript
// Testing direct navigation
const aiFeatures = screen.getByText('AI Features')
fireEvent.click(aiFeatures)
expect(window.location.pathname).toBe('/ai/coach')
```

## Component Replacements

### Custom Breadcrumbs

**Before:**
```tsx
// Custom breadcrumb implementation
<div className="breadcrumb">
  <Link href="/dashboard">Dashboard</Link>
  <span>/</span>
  <Link href="/ai/coach">AI Features</Link>
  <span>/</span>
  <span>AI Coach</span>
</div>
```

**After:**
```tsx
// Use built-in component
import { Breadcrumb } from '@/components/navigation/breadcrumb'

<Breadcrumb />
// Automatically generates: Dashboard > AI Features > AI Coach
```

### Custom Tab Navigation

**Before:**
```tsx
// Custom tabs
<div className="tabs">
  {features.map(feature => (
    <button 
      key={feature.id}
      onClick={() => navigate(feature.href)}
      className={pathname === feature.href ? 'active' : ''}
    >
      {feature.name}
    </button>
  ))}
</div>
```

**After:**
```tsx
// Layout provides tabs automatically
// No code needed - tabs appear on all /ai/* pages
```

### Custom Previous/Next

**Before:**
```tsx
// Custom prev/next logic
const features = ['coach', 'voice', 'feedback', 'prep']
const currentIndex = features.indexOf(currentFeature)
const nextFeature = features[currentIndex + 1]
const prevFeature = features[currentIndex - 1]

<button onClick={() => navigate(`/ai/${prevFeature}`)}>
  Previous
</button>
<button onClick={() => navigate(`/ai/${nextFeature}`)}>
  Next
</button>
```

**After:**
```tsx
// Use built-in component
import { AIFeatureNav } from '@/components/navigation/ai-feature-nav'

<AIFeatureNav />
// Automatically shows correct prev/next
```

## API Changes

### Navigation Hook

**New Hook:** `useAINavigation()`

```typescript
const {
  currentFeature,      // Current AI feature info
  isAIFeature,        // Boolean: are we in AI section?
  allFeatures,        // Array of all AI features
  navigateToFeature,  // Function: navigate to feature by ID
  getNextFeature,     // Function: get next feature
  getPreviousFeature  // Function: get previous feature
} = useAINavigation()
```

**Example:**
```typescript
// Navigate to voice analysis
navigateToFeature('voice')

// Get next feature for conditional rendering
const next = getNextFeature()
if (next) {
  console.log(`Next: ${next.name}`)
}
```

### Context API

**New Context:** `AIFeaturesContext`

```typescript
const {
  metrics,        // Shared metrics across AI features
  updateMetrics,  // Update metrics
  isLoading,      // Loading state
  setIsLoading    // Set loading state
} = useAIFeatures()
```

**Example:**
```typescript
// Update session count
updateMetrics({
  sessionsCompleted: metrics.sessionsCompleted + 1
})

// Set loading state
setIsLoading(true)
try {
  await fetchData()
} finally {
  setIsLoading(false)
}
```

## Common Migration Scenarios

### Scenario 1: Custom AI Feature Page

**Before:**
```tsx
'use client'

export default function CustomAIPage() {
  const [data, setData] = useState(null)
  
  return (
    <div>
      <nav>
        {/* Custom navigation */}
      </nav>
      <main>
        {/* Content */}
      </main>
    </div>
  )
}
```

**After:**
```tsx
'use client'

import { useAIFeatures } from '@/contexts/AIFeaturesContext'
import { AIFeatureNav } from '@/components/navigation/ai-feature-nav'

export default function CustomAIPage() {
  const { metrics, updateMetrics } = useAIFeatures()
  const [data, setData] = useState(null)
  
  return (
    <div className="space-y-6">
      {/* Layout provides navigation */}
      
      {/* Your content */}
      <Card>
        {/* ... */}
      </Card>
      
      {/* Optional navigation */}
      <AIFeatureNav />
    </div>
  )
}
```

### Scenario 2: Shared State Between Features

**Before:**
```tsx
// Parent component managing state
function AIFeaturesContainer() {
  const [sharedData, setSharedData] = useState({})
  
  return (
    <>
      <AICoachPage data={sharedData} setData={setSharedData} />
      <VoicePage data={sharedData} setData={setSharedData} />
    </>
  )
}
```

**After:**
```tsx
// Use context (no container needed)
function AICoachPage() {
  const { metrics, updateMetrics } = useAIFeatures()
  // Access shared state directly
}

function VoicePage() {
  const { metrics, updateMetrics } = useAIFeatures()
  // Same shared state
}
```

### Scenario 3: Dynamic Navigation

**Before:**
```tsx
// Manually tracking current page
const [currentPage, setCurrentPage] = useState('coach')

useEffect(() => {
  const page = pathname.split('/').pop()
  setCurrentPage(page)
}, [pathname])
```

**After:**
```tsx
// Use hook
const { currentFeature } = useAINavigation()
// currentFeature.id gives you 'coach', 'voice', etc.
```

## Troubleshooting

### Issue: Navigation not appearing

**Cause:** Page not in `/ai/*` route  
**Solution:** Ensure your page is under `/src/app/ai/`

### Issue: Breadcrumb shows wrong path

**Cause:** Custom breadcrumb items not set  
**Solution:** Update label map in `breadcrumb.tsx` or pass custom items

### Issue: Context not working

**Cause:** Not wrapped in AIFeaturesProvider  
**Solution:** Layout automatically provides context for `/ai/*` routes

### Issue: Tabs not highlighting correctly

**Cause:** Pathname doesn't match feature href  
**Solution:** Verify route matches exactly (e.g., `/ai/coach` not `/ai/coach/`)

## Rollback Plan

If you need to rollback:

1. Restore old sidebar structure:
```bash
git checkout HEAD~1 src/components/navigation/sidebar.tsx
```

2. Remove new layout:
```bash
rm src/app/ai/layout.tsx
```

3. Restore old page structure:
```bash
git checkout HEAD~1 src/app/ai/*/page.tsx
```

## Testing Your Migration

### Checklist

- [ ] Sidebar shows "AI Features" as single link
- [ ] Clicking "AI Features" navigates to `/ai/coach`
- [ ] Breadcrumb appears on AI pages
- [ ] Tabs appear on AI pages
- [ ] Active tab is highlighted
- [ ] Previous/Next buttons work (if added)
- [ ] Context provides shared state
- [ ] Navigation hook works correctly
- [ ] Mobile dropdown appears on small screens
- [ ] No console errors
- [ ] TypeScript compiles without errors

### Test Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Test
npm run test
```

## Getting Help

### Resources
- [Architecture Guide](./NAVIGATION_ARCHITECTURE.md)
- [Quick Start](./QUICK_START_NAVIGATION.md)
- [Navigation Flow](./NAVIGATION_FLOW.md)

### Support
- Check documentation first
- Review component source code
- Open an issue on GitHub
- Contact development team

## Timeline

**Recommended Migration Timeline:**

- **Week 1:** Review documentation, plan migration
- **Week 2:** Update code, test locally
- **Week 3:** QA testing, fix issues
- **Week 4:** Deploy to production

## Conclusion

The new navigation system provides:
- ✅ Better user experience (no double navigation)
- ✅ Cleaner code architecture
- ✅ Reusable components
- ✅ Better performance
- ✅ Improved accessibility

Most projects will require minimal changes, as the layout handles navigation automatically.

---

**Questions?** Check the [Quick Start Guide](./QUICK_START_NAVIGATION.md) or contact the team.
