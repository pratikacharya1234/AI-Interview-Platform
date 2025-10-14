# Navigation Flow Diagram

## User Journey: Accessing AI Features

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User on Dashboard                                       │
│                                                                  │
│  ┌──────────┐                                                   │
│  │ Sidebar  │  ← User sees "AI Features" with "New" badge      │
│  │          │                                                   │
│  │ [AI Feat]│  ← Single clickable item (no dropdown)           │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Click
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Navigate to AI Features Section                         │
│                                                                  │
│  URL: /ai/coach                                                 │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Breadcrumb: 🏠 > AI Features > AI Coach                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🌟 AI-Powered Features                                    │ │
│  │ Advanced AI tools to accelerate your interview prep       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Navigation Tabs:                                          │ │
│  │ [🧠 AI Coach] [🎧 Voice] [⭐ Feedback] [🎯 Prep]          │ │
│  │   ^^^^^^^^                                                │ │
│  │   Active                                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [AI Coach Page Content]                                        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [← Previous]              [Next: Voice Analysis →]        │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↓ Click "Voice Analysis" tab
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Switch to Different AI Feature                          │
│                                                                  │
│  URL: /ai/voice                                                 │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Breadcrumb: 🏠 > AI Features > Voice Analysis             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Navigation Tabs:                                          │ │
│  │ [🧠 AI Coach] [🎧 Voice] [⭐ Feedback] [🎯 Prep]          │ │
│  │                ^^^^^^^^                                   │ │
│  │                Active                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Voice Analysis Page Content]                                  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [← Previous: AI Coach]    [Next: Smart Feedback →]       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Navigation Flow

```
┌──────────────────────────────┐
│ Mobile View (< 1024px)       │
│                              │
│ ☰ Menu                       │
│                              │
│ ┌──────────────────────────┐ │
│ │ 🌟 AI-Powered Features   │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │ Select AI Feature ▼      │ │
│ │                          │ │
│ │ • AI Coach               │ │
│ │ • Voice Analysis         │ │
│ │ • Smart Feedback         │ │
│ │ • Personalized Prep      │ │
│ └──────────────────────────┘ │
│                              │
│ [Page Content]               │
│                              │
└──────────────────────────────┘
```

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Layout                               │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐│
│  │   Sidebar    │  │         Main Content                     ││
│  │              │  │                                          ││
│  │  Dashboard   │  │  ┌────────────────────────────────────┐ ││
│  │  Interviews  │  │  │   AI Features Layout               │ ││
│  │  Performance │  │  │   (wraps all /ai/* pages)          │ ││
│  │  Learning    │  │  │                                    │ ││
│  │  AI Features─┼──┼──┼→ Provides:                         │ ││
│  │  Account     │  │  │   - Breadcrumb                     │ ││
│  │  Help        │  │  │   - Secondary Navigation           │ ││
│  │              │  │  │   - Context Provider               │ ││
│  └──────────────┘  │  │                                    │ ││
│                    │  │  ┌──────────────────────────────┐  │ ││
│                    │  │  │  Individual Page             │  │ ││
│                    │  │  │  (coach/voice/feedback/prep) │  │ ││
│                    │  │  │                              │  │ ││
│                    │  │  │  Uses:                       │  │ ││
│                    │  │  │  - useAINavigation()         │  │ ││
│                    │  │  │  - useAIFeatures()           │  │ ││
│                    │  │  │  - AIFeatureNav component    │  │ ││
│                    │  │  └──────────────────────────────┘  │ ││
│                    │  └────────────────────────────────────┘ ││
│                    └──────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AIFeaturesProvider                         │
│                   (Context at layout level)                  │
│                                                              │
│  State:                                                      │
│  ├─ metrics: { sessionsCompleted, averageScore, ... }       │
│  ├─ isLoading: boolean                                      │
│  └─ updateMetrics: (newMetrics) => void                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AI Coach    │  │    Voice     │  │   Feedback   │      │
│  │    Page      │  │   Analysis   │  │     Page     │      │
│  │              │  │     Page     │  │              │      │
│  │ useAIFeatures│  │ useAIFeatures│  │ useAIFeatures│      │
│  │      ↓       │  │      ↓       │  │      ↓       │      │
│  │  Read/Write  │  │  Read/Write  │  │  Read/Write  │      │
│  │   Metrics    │  │   Metrics    │  │   Metrics    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Navigation Decision Tree

```
User clicks "AI Features" in sidebar
            ↓
    Navigate to /ai/coach
            ↓
    ┌───────────────────┐
    │ Is user on mobile?│
    └───────────────────┘
         ↙         ↘
       Yes          No
        ↓            ↓
    Show         Show
    Dropdown     Horizontal
    Menu         Tabs
        ↓            ↓
    User selects  User clicks
    from dropdown  tab
        ↓            ↓
        └────┬───────┘
             ↓
    Update URL (client-side navigation)
             ↓
    Layout re-renders with new active state
             ↓
    Page content loads
             ↓
    Previous/Next buttons update
```

## Accessibility Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Keyboard Navigation                                          │
│                                                              │
│  Tab Key:                                                    │
│  1. Focus on "AI Features" in sidebar                       │
│  2. Enter → Navigate to /ai/coach                           │
│  3. Tab → Focus on breadcrumb links                         │
│  4. Tab → Focus on navigation tabs                          │
│  5. Arrow keys → Move between tabs                          │
│  6. Enter → Activate selected tab                           │
│  7. Tab → Focus on page content                             │
│  8. Tab → Focus on Previous/Next buttons                    │
│                                                              │
│  Screen Reader:                                              │
│  - "Navigation, AI Features Navigation"                     │
│  - "Link, AI Coach, current page"                           │
│  - "Link, Voice Analysis"                                   │
│  - "Button, Next: Voice Analysis"                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example

```
User completes a coaching session
            ↓
    Component calls updateMetrics()
            ↓
    ┌───────────────────────────┐
    │ AIFeaturesContext         │
    │ updateMetrics({           │
    │   sessionsCompleted: +1   │
    │ })                        │
    └───────────────────────────┘
            ↓
    Context state updates
            ↓
    All subscribed components re-render
            ↓
    ┌─────────────────────────────────┐
    │ Stats cards show updated values │
    │ Progress bars update            │
    │ Badges reflect new status       │
    └─────────────────────────────────┘
```

## Route Structure

```
/
├── dashboard/
│   └── page.tsx
│
├── ai/                          ← AI Features Section
│   ├── layout.tsx              ← Wraps all AI pages
│   │   ├── Provides breadcrumb
│   │   ├── Provides tabs navigation
│   │   └── Provides context
│   │
│   ├── coach/
│   │   └── page.tsx            ← Individual feature page
│   │
│   ├── voice/
│   │   └── page.tsx
│   │
│   ├── feedback/
│   │   └── page.tsx
│   │
│   └── prep/
│       └── page.tsx
│
└── [other routes...]
```

## Component Hierarchy

```
RootLayout
└── ConditionalLayout
    └── AppLayout
        ├── Sidebar (Primary Navigation)
        │   └── AI Features (single link)
        │
        └── Main Content
            └── AIFeaturesLayout (for /ai/* routes)
                ├── Breadcrumb
                ├── Section Header
                ├── Secondary Navigation (Tabs)
                ├── AIFeaturesProvider (Context)
                │   └── Page Content
                │       ├── useAINavigation() hook
                │       ├── useAIFeatures() hook
                │       └── AIFeatureNav component
                └── Mobile Dropdown
```

## Event Flow

```
User Action: Click "Voice Analysis" tab
            ↓
Next.js Link intercepts click
            ↓
Client-side navigation (no page reload)
            ↓
URL updates: /ai/coach → /ai/voice
            ↓
usePathname() hook detects change
            ↓
Layout re-renders:
  - Breadcrumb updates
  - Active tab changes
  - Previous/Next buttons update
            ↓
Page component renders
            ↓
useAINavigation() provides current feature
            ↓
Content displays with correct context
```

## Summary

The navigation system provides:

1. **Clear Hierarchy**: Primary → Secondary → Breadcrumb
2. **No Duplication**: Single source of truth for each navigation level
3. **Responsive**: Adapts to screen size
4. **Accessible**: Keyboard and screen reader support
5. **Performant**: Client-side navigation, optimized re-renders
6. **Maintainable**: Modular components, clear separation of concerns

This architecture ensures a smooth, intuitive user experience while maintaining code quality and scalability.
