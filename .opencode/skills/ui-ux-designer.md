# Skill: UI/UX Designer & Dashboard Architect

## Description
Expert UI/UX designer specializing in SaaS dashboard design, mobile-first responsive interfaces, and modern design systems. Applies 2026 design trends, WCAG 2.2 AA accessibility, and premium visual craft inspired by Stripe, Linear, Vercel, and Notion.

## Core Principles

### 1. Calm Professional Design
- **Less is more**: Remove visual clutter. Every element must earn its place.
- **Whitespace is air**: Generous spacing between elements creates breathing room and hierarchy.
- **Monochrome base + one accent**: Use a neutral grayscale foundation with a single brand color for emphasis.
- **Sharp typography**: Geometric, tight fonts (Inter, Geist, Söhne). No decorative fonts.
- **High contrast**: Black on white, white on black. No muddy middle grounds.

### 2. Information Architecture
- **F-pattern scanning**: Most important metric top-left, KPIs across first row, details below.
- **Progressive disclosure**: Show 3-5 primary metrics. Hide depth behind clicks/taps.
- **One primary task per screen**: Don't compete for attention. Each view has ONE job.
- **Role-based defaults**: Different users see different entry points. Same data, different lens.
- **5-7 primary metrics max**: Research shows attention drops after 7 elements above the fold.

### 3. Mobile-First Responsive
- **44x44px minimum touch targets**: WCAG requirement for mobile.
- **Mobile-specific views**: Don't squish desktop. Show 3-5 critical metrics on mobile.
- **Card view for tables**: Tables become stacked cards on mobile.
- **FAB for primary actions**: Floating Action Button for the most important mobile action.
- **Swipe gestures**: Where appropriate, add swipe-to-dismiss, swipe-to-reveal.

### 4. Accessibility (WCAG 2.2 AA)
- **`:focus-visible`** on ALL interactive elements with a visible ring.
- **`aria-label`** on all icon-only buttons.
- **`role="navigation"`**, **`role="tablist"`**, **`role="dialog"`** on semantic elements.
- **`htmlFor`/`id`** association on ALL labels and inputs.
- **`aria-describedby`** for error messages linked to inputs.
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text.
- **`prefers-reduced-motion`**: Disable animations for users who request it.
- **Skip-to-content link** for keyboard navigation.
- **Focus trap** in modals and dialogs.

### 5. Component Patterns

#### KPI Card
```
┌─────────────────────────┐
│ [icon]  Label           │
│         ████████ 1,234  │
│         ↑ 12% vs mes ant│
└─────────────────────────┘
```
- Icon + label (sm, gray)
- Large bold value
- Trend indicator (arrow + percentage + comparison)
- Border-top 3px with accent color
- Skeleton loading state

#### Dashboard Grid (Bento)
```
┌──────────┬──────────┬──────────┬──────────┐
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4   │
├──────────┴──────────┼──────────┴──────────┤
│  Chart 1 (Bar)      │  Chart 2 (Line)     │
├─────────────────────┴─────────────────────┤
│  Table / Detailed Data                    │
└───────────────────────────────────────────┘
```

#### Data Table (Desktop → Mobile)
- Desktop: Standard table with sortable headers, inline actions
- Mobile: Stacked cards with key info + action buttons
- Pagination: Prev/Next + page numbers + ellipsis

#### Modal/Dialog
- `role="dialog"` + `aria-modal="true"` + `aria-label`
- Focus trap (Tab cycles within modal)
- Escape key closes
- Close button (X) visible
- Overlay click closes
- Animation: fadeIn + slideUp

#### Form Pattern
- Labels with `htmlFor` + `id`
- Input icons (left side)
- Focus ring (green/accent)
- Error: red border + `aria-invalid` + `aria-describedby` + message below
- Loading: spinner on submit button + disabled state
- Password: toggle visibility with eye icon

### 6. Animation & Transitions
- **Duration**: 150ms for micro-interactions, 300ms for page transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Skeleton shimmer**: Subtle left-to-right gradient animation
- **Hover states**: Shadow elevation change, not color change
- **Focus ring**: 2px offset ring in accent color

### 7. Color System
```css
/* Primary (SENA Green - expand to 50-900 scale) */
--primary-50: #f0fdf4;
--primary-100: #dcfce7;
--primary-500: #39a900;
--primary-600: #2d8a00;
--primary-700: #1a6b00;
--primary-900: #0a3d00;

/* Neutral (Grays) */
--gray-50: #fafafa;
--gray-100: #f5f5f5;
--gray-200: #e5e5e5;
--gray-300: #d4d4d4;
--gray-400: #a3a3a3;
--gray-500: #737373;
--gray-600: #525252;
--gray-700: #404040;
--gray-800: #262626;
--gray-900: #171717;
--gray-950: #0a0a0a;

/* Status */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### 8. Typography Scale
```css
--text-xs: 0.75rem;    /* 12px - labels, captions */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - subtitles */
--text-xl: 1.25rem;    /* 20px - section titles */
--text-2xl: 1.5rem;    /* 24px - page titles */
--text-3xl: 1.875rem;  /* 30px - hero numbers */
--text-4xl: 2.25rem;   /* 36px - KPI values */
```

### 9. Spacing Scale (Base 4px)
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### 10. Shadow System
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
```

## Workflow

When designing or redesigning a UI:

1. **Audit existing**: Read all component files, CSS, and layout. Identify issues.
2. **Define tokens**: Establish color, typography, spacing, shadow, and animation tokens FIRST.
3. **Build component library**: Create reusable CSS components (buttons, cards, forms, tables, modals, badges, skeletons, empty states).
4. **Layout shell**: Design sidebar + topbar + main content area with responsive behavior.
5. **Page by page**: Redesign each page using the component library and tokens.
6. **Accessibility pass**: Add ARIA attributes, focus management, contrast checks.
7. **Responsive pass**: Test and implement mobile/tablet/desktop breakpoints.
8. **Dark mode**: Extend tokens with `[data-theme="dark"]` overrides.

## Competitive References

Study these dashboards for inspiration:
1. **Stripe Dashboard** - Progressive disclosure, financial data density, clean tables
2. **Linear** - Calm design, whitespace, keyboard-first, command palette
3. **Vercel** - Minimal chrome, deployment focus, dark mode mastery
4. **Notion** - Modular widgets, flexible views, personality in empty states
5. **HubSpot** - Role-based dashboards, CRM patterns, onboarding flow

## Checklist for Every Component

- [ ] Uses CSS tokens (not hardcoded values)
- [ ] Has `:hover`, `:focus-visible`, `:active`, `:disabled` states
- [ ] Includes `aria-label` or `aria-describedby` where needed
- [ ] Uses `htmlFor`/`id` on form labels/inputs
- [ ] Has loading/skeleton state
- [ ] Has empty state with CTA
- [ ] Responsive: works on mobile (320px+), tablet (768px+), desktop (1024px+)
- [ ] No inline styles (use CSS classes)
- [ ] Consistent with design system tokens
- [ ] Keyboard accessible (Tab, Enter, Escape)
