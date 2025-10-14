# Navigation Architecture

## Overview

The AI Interview Platform uses a hierarchical navigation system with three levels:

1. **Primary Navigation** - Main sidebar (left)
2. **Secondary Navigation** - Feature-specific tabs (horizontal)
3. **Breadcrumb Navigation** - Contextual path display

## Navigation Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ Main Sidebar (Primary)                                  │
│ ├── Dashboard                                           │
│ ├── Interviews (expandable)                             │
│ ├── Performance (expandable)                            │
│ ├── Learning Center (expandable)                        │
│ ├── AI Features → /ai/coach (single link)              │
│ ├── Account (expandable)                                │
│ └── Help & Support (expandable)                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AI Features Section (Secondary Navigation)              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Breadcrumb: Dashboard > AI Features > [Current]    │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Tabs: [AI Coach] [Voice Analysis] [Smart Feedback] │ │
│ │       [Personalized Prep]                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Page Content]                                           │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Main Sidebar (`/src/components/navigation/sidebar.tsx`)

**Purpose**: Primary navigation for all major sections

**Key Features**:
- Collapsible sidebar (desktop only)
- Expandable menu items with children
- Active state highlighting
- Badge support for new features
- Responsive (hidden on mobile)

**AI Features Entry**:
```typescript
{
  id: 'ai-features',
  name: 'AI Features',
  href: '/ai/coach',  // Direct link, no children
  icon: Zap,
  badge: 'New',
}
```

**Why No Children?**
- Prevents double navigation (sidebar + tabs)
- Cleaner UX - users see secondary nav only when in AI section
- Reduces cognitive load
- Follows single responsibility principle

### 2. AI Features Layout (`/src/app/ai/layout.tsx`)

**Purpose**: Provides secondary navigation for AI features section

**Components**:
1. **Breadcrumb** - Shows navigation path
2. **Section Header** - AI Features title and description
3. **Horizontal Tabs** - Navigate between AI features
4. **Mobile Dropdown** - Responsive navigation for small screens
5. **Context Provider** - Shared state for AI features

**Features**:
```typescript
const aiFeatures = [
  { id: 'coach', name: 'AI Coach', href: '/ai/coach', ... },
  { id: 'voice', name: 'Voice Analysis', href: '/ai/voice', ... },
  { id: 'feedback', name: 'Smart Feedback', href: '/ai/feedback', ... },
  { id: 'prep', name: 'Personalized Prep', href: '/ai/prep', ... }
]
```

**Responsive Behavior**:
- Desktop: Horizontal tabs with icons
- Mobile: Dropdown select menu

### 3. Breadcrumb Component (`/src/components/navigation/breadcrumb.tsx`)

**Purpose**: Show hierarchical navigation path

**Features**:
- Auto-generates from pathname
- Custom items support
- Accessible (ARIA labels)
- Home icon for dashboard
- Clickable path segments

**Example Output**:
```
🏠 > AI Features > Voice Analysis
```

### 4. AI Navigation Hook (`/src/hooks/useAINavigation.ts`)

**Purpose**: Programmatic navigation utilities

**Exports**:
```typescript
{
  currentFeature: AIFeatureRoute | undefined
  isAIFeature: boolean
  allFeatures: AIFeatureRoute[]
  navigateToFeature: (id: string) => void
  getNextFeature: () => AIFeatureRoute | null
  getPreviousFeature: () => AIFeatureRoute | null
}
```

**Use Cases**:
- Sequential navigation (Next/Previous buttons)
- Feature detection
- Programmatic routing
- Guided tours

### 5. AI Feature Navigation Component (`/src/components/navigation/ai-feature-nav.tsx`)

**Purpose**: Previous/Next navigation between AI features

**Usage**:
```tsx
<AIFeatureNav className="mt-8" />
```

**Renders**:
```
[← Previous: Smart Feedback]    [Next: Personalized Prep →]
```

## Context Management

### AIFeaturesContext (`/src/contexts/AIFeaturesContext.tsx`)

**Purpose**: Shared state across AI features

**State**:
```typescript
{
  metrics: {
    sessionsCompleted: number
    averageScore: number
    improvementRate: number
    lastActivity: string | null
  }
  isLoading: boolean
}
```

**Benefits**:
- Avoid prop drilling
- Persist data across feature navigation
- Centralized state management
- Performance optimization

## Routing Structure

```
/ai/
├── layout.tsx          # AI Features Layout (wraps all AI pages)
├── coach/
│   └── page.tsx       # AI Coach page
├── voice/
│   └── page.tsx       # Voice Analysis page
├── feedback/
│   └── page.tsx       # Smart Feedback page
└── prep/
    └── page.tsx       # Personalized Prep page
```

## Best Practices

### ✅ DO

1. **Use single navigation level per context**
   - Main sidebar for app-wide navigation
   - Secondary tabs for feature-specific navigation

2. **Provide breadcrumbs for deep navigation**
   - Helps users understand their location
   - Enables quick navigation to parent sections

3. **Make active states clear**
   - Visual distinction for current page
   - Consistent styling across navigation types

4. **Support keyboard navigation**
   - Tab through navigation items
   - Enter to activate links

5. **Implement responsive navigation**
   - Horizontal tabs on desktop
   - Dropdown on mobile

### ❌ DON'T

1. **Don't create nested expandable menus in sidebar for sections with secondary nav**
   - Creates double navigation
   - Confusing UX
   - Harder to maintain

2. **Don't duplicate navigation items**
   - Each feature should have one primary access point
   - Use breadcrumbs for context, not navigation

3. **Don't hide navigation on scroll**
   - Keep navigation accessible
   - Users should always know where they are

4. **Don't use too many navigation levels**
   - Maximum 3 levels (Primary > Secondary > Breadcrumb)
   - More levels = cognitive overload

## Accessibility

### ARIA Labels
```tsx
<nav aria-label="AI Features Navigation">
  <Link aria-current={isActive ? 'page' : undefined}>
    AI Coach
  </Link>
</nav>
```

### Keyboard Support
- `Tab` - Move between navigation items
- `Enter` - Activate link
- `Escape` - Close mobile dropdown

### Screen Reader Support
- Semantic HTML (`<nav>`, `<a>`)
- Descriptive labels
- Current page indication

## Performance Considerations

1. **Client-side navigation** - Next.js Link component
2. **Prefetching** - Automatic for visible links
3. **Code splitting** - Each page loads independently
4. **Memoization** - useMemo for computed values
5. **Context optimization** - Only re-render when needed

## Testing

### Unit Tests
```typescript
// Test navigation state
expect(useAINavigation().currentFeature?.id).toBe('coach')

// Test routing
navigateToFeature('voice')
expect(pathname).toBe('/ai/voice')
```

### Integration Tests
```typescript
// Test navigation flow
await user.click(screen.getByText('Voice Analysis'))
expect(screen.getByRole('heading', { name: 'Voice Analysis' })).toBeInTheDocument()
```

### E2E Tests
```typescript
// Test complete navigation journey
await page.goto('/dashboard')
await page.click('text=AI Features')
await page.click('text=Voice Analysis')
expect(page.url()).toContain('/ai/voice')
```

## Migration Guide

### From Old Structure (Double Navigation)

**Before**:
```typescript
// Sidebar had nested children
{
  id: 'ai-features',
  children: [
    { id: 'coach', href: '/ai/coach' },
    { id: 'voice', href: '/ai/voice' },
    // ...
  ]
}
```

**After**:
```typescript
// Sidebar has single link
{
  id: 'ai-features',
  href: '/ai/coach',  // Direct link
  // No children
}

// Secondary navigation in layout
// /src/app/ai/layout.tsx handles feature navigation
```

## Future Enhancements

1. **Keyboard shortcuts** - Quick navigation (e.g., `Ctrl+1` for AI Coach)
2. **Search** - Global search across features
3. **Recent items** - Quick access to recently visited features
4. **Favorites** - Pin frequently used features
5. **Tour mode** - Guided walkthrough of AI features
6. **Analytics** - Track navigation patterns for UX improvements

## Support

For questions or issues:
- Check this documentation
- Review component source code
- Open an issue on GitHub
- Contact the development team
