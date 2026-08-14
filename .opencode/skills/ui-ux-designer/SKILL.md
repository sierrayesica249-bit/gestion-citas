---
name: ui-ux-designer
description: Use when designing, redesigning, or auditing UI/UX for web or mobile dashboards, SaaS products, or admin panels. Covers design systems, component libraries, responsive layouts, accessibility (WCAG 2.2 AA), dark mode, and 2026 design trends. Trigger keywords: design, UI, UX, dashboard, redesign, interface, layout, component, style, CSS, theme, accessibility, responsive, mobile-first.
---

# UI/UX Designer Skill — Calm Professional Design System

## When to Use This Skill

- Redesigning existing interfaces (web apps, dashboards, admin panels)
- Creating new UI components from scratch
- Auditing accessibility (WCAG 2.2 AA compliance)
- Applying dark mode to existing designs
- Building responsive layouts (mobile-first)
- Creating design tokens and component libraries
- Reviewing UI code for best practices

## Core Design Philosophy: "Calm Professional"

Inspired by Linear, Vercel, and Stripe. The interface should feel:
- **Quiet** — whitespace is a feature, not wasted space
- **Intentional** — every pixel earns its place
- **Fast** — zero visual friction between user and goal
- **Accessible** — usable by everyone, everywhere

## Design Tokens System

### Color Architecture

```css
:root {
  /* Primary Brand — Full scale (50-900) */
  --color-primary-50: #f0fdf4;
  --color-primary-100: #dcfce7;
  --color-primary-200: #bbf7d0;
  --color-primary-300: #86efac;
  --color-primary-400: #4ade80;
  --color-primary-500: #39a900;  /* Brand primary */
  --color-primary-600: #2d8a00;
  --color-primary-700: #1a6b00;
  --color-primary-800: #14532d;
  --color-primary-900: #0a3d00;

  /* Neutrals — Never use raw gray, always token */
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e5e5e5;
  --color-gray-300: #d4d4d4;
  --color-gray-400: #a3a3a3;
  --color-gray-500: #737373;
  --color-gray-600: #525252;
  --color-gray-700: #404040;
  --color-gray-800: #262626;
  --color-gray-900: #171717;
  --color-gray-950: #0a0a0a;

  /* Semantic Surfaces */
  --surface-primary: #ffffff;
  --surface-secondary: #f9fafb;
  --surface-tertiary: #f3f4f6;
  --surface-inverse: var(--color-gray-950);

  /* Semantic Text */
  --text-primary: var(--color-gray-950);
  --text-secondary: var(--color-gray-500);
  --text-tertiary: var(--color-gray-400);
  --text-inverse: #ffffff;

  /* Borders */
  --border-default: var(--color-gray-200);
  --border-strong: var(--color-gray-300);
  --border-focus: var(--color-primary-500);
}
```

### Typography Scale (Modular, not random)

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;    /* 12px — captions, badges */
  --text-sm: 0.875rem;   /* 14px — secondary text */
  --text-base: 1rem;     /* 16px — body */
  --text-lg: 1.125rem;   /* 18px — subtitles */
  --text-xl: 1.25rem;    /* 20px — card titles */
  --text-2xl: 1.5rem;    /* 24px — page titles */
  --text-3xl: 1.875rem;  /* 30px — hero */
  --text-4xl: 2.25rem;   /* 36px — hero large */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing Scale (Base 4px)

```css
:root {
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
}
```

### Shadows (Layered, not flat)

```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  --shadow-ring: 0 0 0 3px rgba(57, 169, 0, 0.3);
}
```

### Transitions

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Component Patterns

### Buttons — 6 States Required

Every button MUST have these states:
1. **Default** — base style
2. **Hover** — background darken 10%
3. **Focus-visible** — ring with `--shadow-ring`
4. **Active/Pressed** — background darken 15%, scale 0.98
5. **Disabled** — opacity 0.5, cursor not-allowed
6. **Loading** — spinner icon, text unchanged, disabled

```css
.btn-primary {
  /* ... base styles ... */
  transition: all var(--duration-normal) var(--ease-default);
}
.btn-primary:hover { background-color: color-mix(in srgb, var(--color-primary-500) 90%, black); }
.btn-primary:focus-visible { box-shadow: var(--shadow-ring); outline: 2px solid var(--border-focus); outline-offset: 2px; }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.btn-primary[data-loading="true"] { pointer-events: none; }
```

### Cards — Hierarchy Pattern

```css
.card {
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: box-shadow var(--duration-normal) var(--ease-default);
}
.card:hover { box-shadow: var(--shadow-md); }
```

### Forms — Input States

Every input MUST have:
- Label with `htmlFor` matching input `id`
- Placeholder text (not instead of label)
- Focus ring (green for SENA)
- Error state with `aria-describedby`
- Disabled state

### Tables — Responsive Pattern

Desktop: full table with horizontal scroll on small screens
Mobile: transform rows into cards

```css
@media (max-width: 768px) {
  .table-responsive { display: flex; flex-direction: column; gap: var(--space-3); }
  .table-responsive thead { display: none; }
  .table-responsive tr {
    display: flex; flex-direction: column;
    background: var(--surface-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }
  .table-responsive td {
    display: flex; justify-content: space-between;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--border-default);
  }
  .table-responsive td::before {
    content: attr(data-label);
    font-weight: var(--font-semibold);
    color: var(--text-secondary);
  }
}
```

### Modals — Focus Trap + Accessibility

```html
<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Título del modal">
  <div class="modal-content">
    <!-- Focus trapped here -->
    <!-- Escape key closes -->
    <!-- Focus returns to trigger on close -->
  </div>
</div>
```

### Skeleton Loading — Required in Every View

```css
.skeleton {
  background: linear-gradient(90deg, var(--surface-tertiary) 25%, var(--surface-secondary) 50%, var(--surface-tertiary) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Empty States — Always Actionable

Every empty state MUST have:
1. An icon or illustration (not just text)
2. A clear title ("No hay citas agendadas")
3. A description ("Agenda tu primera cita para comenzar")
4. A CTA button ("Agendar cita")

## Responsive Breakpoints

```css
/* Mobile: 0-639px — single column, card views, FAB */
/* Tablet: 640-1023px — 2 columns, collapsible sidebar */
/* Desktop: 1024px+ — full sidebar, 3-4 columns */
/* Wide: 1280px+ — max-width containers */
```

## Dark Mode Implementation

Use `data-theme="dark"` on `<html>` (not just media query):

```css
[data-theme="dark"] {
  --surface-primary: var(--color-gray-950);
  --surface-secondary: var(--color-gray-900);
  --surface-tertiary: var(--color-gray-800);
  --text-primary: var(--color-gray-50);
  --text-secondary: var(--color-gray-400);
  --border-default: var(--color-gray-800);
}
```

Persist in localStorage. Provide toggle in sidebar footer.

## Accessibility Checklist (WCAG 2.2 AA)

- [ ] `:focus-visible` on ALL interactive elements
- [ ] `aria-label` on ALL icon-only buttons
- [ ] `role="navigation"` + `aria-label` on nav
- [ ] `role="tablist"` + `role="tab"` + `role="tabpanel"` on tabs
- [ ] `role="dialog"` + `aria-modal="true"` on modals
- [ ] `htmlFor`/`id` on ALL label/input pairs
- [ ] `aria-describedby` on error messages
- [ ] `aria-invalid` on invalid fields
- [ ] `aria-required` on required fields
- [ ] Color contrast 4.5:1 minimum (text), 3:1 (large text)
- [ ] No information conveyed by color alone (always + icon/text)
- [ ] `prefers-reduced-motion` media query
- [ ] Skip-to-content link
- [ ] Keyboard navigation works everywhere

## Dashboard Layout Pattern (Bento Grid)

```
┌─────────────────────────────────────────────────┐
│  [KPI Card]  [KPI Card]  [KPI Card]  [KPI Card] │  ← 4 cols desktop, 2 cols mobile
├─────────────────────────────────────────────────┤
│  [Filter Bar / Date Range / Actions]            │
├──────────────────────┬──────────────────────────┤
│  [Chart/Content]     │  [Chart/Content]          │  ← 2 cols desktop, 1 col mobile
├──────────────────────┴──────────────────────────┤
│  [Table / List]                                 │  ← full width, card view on mobile
└─────────────────────────────────────────────────┘
```

## Competitive References

| Product | What to Study | URL |
|---------|--------------|-----|
| Stripe Dashboard | Progressive disclosure, table design | https://dashboard.stripe.com |
| Linear | Calm design, sidebar, empty states | https://linear.app |
| Vercel | Dark mode, typography, KPI layout | https://vercel.com/dashboard |
| Notion | Modular widgets, AI integration | https://www.notion.so |
| HubSpot | Role-based dashboards, trend arrows | https://app.hubspot.com |

## Workflow for Applying This Skill

1. **Audit** — Review existing CSS/JSX against this checklist
2. **Tokens First** — Create/update design tokens before any component
3. **Components** — Build base components (button, card, input, table)
4. **Pages** — Apply components to pages following Bento Grid pattern
5. **Responsive** — Mobile-first, then enhance for tablet/desktop
6. **Accessibility** — Run WCAG audit, fix all violations
7. **Dark Mode** — Apply dark tokens, test all surfaces
8. **Polish** — Micro-interactions, loading states, empty states

## Quick Rules

- NEVER use raw hex colors (`#6b7280`). Always use tokens.
- NEVER hardcode font sizes. Always use `--text-*` tokens.
- NEVER skip `aria-label` on icon buttons.
- NEVER use `style={}` in JSX for layout. Use CSS classes.
- ALWAYS provide 6 button states.
- ALWAYS show skeleton loading before content.
- ALWAYS design empty states with CTA.
- ALWAYS test at 320px width (mobile minimum).
