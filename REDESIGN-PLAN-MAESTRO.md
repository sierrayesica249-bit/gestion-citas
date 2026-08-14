# Plan Maestro de Rediseño UI/UX — SENA Bienestar

> **Fecha:** 11 de Junio, 2026
> **Versión:** 2.0
> **Objetivo:** Transformar la interfaz de una aplicación que se ve "construida por IA" a un producto con diseño premium, profesional y coherente, siguiendo tendencias 2026 y buenas prácticas de la industria.

---

## PARTE I: ANÁLISIS COMPETITIVO — TOP 5 DASHBOARDS MUNDIALES

### 1. Stripe Dashboard
- **URL:** https://dashboard.stripe.com
- **Qué hace excepcional:**
  - Progressive disclosure: 3 KPIs principales (revenue, volume, disputes) visibles al instar
  - Tablas financieras con alineación tabular de números
  - Paleta neutra con un accent (indigo) que no compite con los datos
  - Hover states, focus rings, y micro-interacciones en cada elemento
  - Información densa sin overwhelm — "breathing room" entre datos
- **Lección para SENA:** Cómo mostrar datos densos (citas, profesionales) sin saturar la vista. Tablas con acciones inline.

### 2. Linear
- **URL:** https://linear.app
- **Qué hace excepcional:**
  - Diseño "calm" — whitespace masivo, zero visual noise
  - Command palette (Cmd+K) para navegación rápida
  - Sidebar colapsable con iconos + tooltips
  - Empty states diseñados para ser memorables, no genéricos
  - Dark mode como default, no como opción
  - Cada botón tiene 6 estados: default, hover, focus-visible, active, disabled, loading
- **Lección para SENA:** Cómo lograr un look "premium" con minimalismo. Sidebar colapsable. Empty states accionables.

### 3. Vercel
- **URL:** https://vercel.com/dashboard
- **Qué hace excepcional:**
  - Dashboard ultra-limpio — cada elemento "gana" su lugar
  - Dark mode con contraste agresivo (negro puro + blanco puro)
  - Geist font (tipografía geométrica, tight, moderna)
  - Deploy status como KPI central con indicadores de estado en tiempo real
  - Breadcrumb navigation para contexto profundo
- **Lección para SENA:** Cómo lograr un look "engineered to look designed". Monochrome base + un accent.

### 4. Notion
- **URL:** https://www.notion.so
- **Qué hace excepcional:**
  - Widgets modulares — el usuario puede reorganizar su dashboard
  - Empty states con personalidad ("No hay nada aquí. ¡Crea algo!")
  - AI integrado de forma contextual (no un chat box separada)
  - Vistas flexibles: tabla, calendar, board, timeline — misma data
  - Onboarding que se adapta al rol del usuario
- **Lección para SENA:** Empty states que inviten a la acción. Personalización por rol. AI contextual.

### 5. HubSpot
- **URL:** https://app.hubspot.com
- **Qué hace excepcional:**
  - Role-based dashboards: cada rol ve métricas relevantes
  - KPI cards con trend arrows y comparación temporal
  - Charts con tooltips personalizados y labels directos
  - Progressive disclosure: resumen → detalle → drill-down
  - Onboarding guiado con checklists de configuración
- **Lección para SENA:** KPIs con tendencias temporales. Dashboards por rol. Onboarding de configuración.

---

## PARTE II: TENDENCIAS UI/UX 2026

### Tendencia 1: Calm Interfaces
- Reducir carga cognitiva. Eliminar ruido visual.
- Whitespace generoso, defaults visibles, jerarquías claras.
- Reference: Linear, Vercel

### Tendencia 2: Progressive Disclosure
- Mostrar 3-5 métricas primarias. El resto detrás de clicks.
- Investigación NN/g: usuarios escanean dashboards en 2.3 segundos antes de decidir si interactúan o cierran.
- Reference: Stripe, HubSpot

### Tendencia 3: Bento Grid Layouts
- Layouts modulares tipo "caja bento" con tarjetas asimétricas.
- CSS Grid + subgrid para layouts responsivos sin hacks.
- Reference: Apple keynotes, Notion, modern dashboards

### Tendencia 4: AI-Augmented Dashboards
- Insights auto-generados, detección de anomalías, queries en lenguaje natural.
- "Show Your Work" pattern — explicar el razonamiento detrás de cada insight.
- Reference: Notion AI, Linear Agent, Tableau Pulse

### Tendencia 5: Dark Mode como Standard
- 60%+ de usuarios prefieren dark mode para interfaces de trabajo.
- Diseñar dark primero, adaptar a light.
- Reference: Vercel, Linear, GitHub

### Tendencia 6: Mobile-Specific Views
- 41% de usuarios B2B acceden dashboards desde móvil semanalmente.
- NO hacer "responsive squish" — crear vista móvil específica con 3-5 métricas críticas.
- Touch targets mínimos de 44x44px.
- Reference: Stripe mobile, Notion mobile

### Tendencia 7: Accessibility como Infraestructura
- WCAG 2.2 AA es el estándar mínimo en 2026.
- Focus management, ARIA labels, keyboard navigation, reduced motion.
- Ya no es un checkbox de compliance — es parte del wireframe desde el inicio.

### Tendencia 8: Conversational UI / Hybrid Dashboards
- Dashboard persistente para monitoreo + capa conversacional para exploración.
- Patrón dominante 2026: chat-on-top-of-structure.
- Reference: Amplitude Data Chat, Notion AI

---

## PARTE III: DIAGNÓSTICO ACTUAL — SENA BIENESTAR

### Arquitectura Técnica (POSITIVO)
| Aspecto | Estado | Evaluación |
|---------|--------|------------|
| Feature-based architecture | Directorio por dominio | Excelente |
| Repository pattern | Data access encapsulado | Excelente |
| Custom hooks | Lógica extraída | Bueno |
| React 19 + Vite 8 | Stack moderno | Excelente |
| Zod + react-hook-form | Validación robusta | Excelente |
| Recharts | Gráficas | Aceptable |
| Lucide React | Iconos | Bueno |
| Supabase | Backend + Auth + RLS | Excelente |

### Problemas de UI/UX Detectados

#### CRÍTICOS (Bloquean usability)
1. **Sin accesibilidad** — 0% aria-labels, 0% focus-visible, 0% role semantics
2. **Sin skeleton loading** — Solo texto "Cargando..." en todas las vistas
3. **Modales sin focus trap** — Usuarios keyboard no pueden usar modales
4. **Tablas sin responsive** — Se desbordan en mobile sin alternativa

#### ALTOS (Impactan experiencia)
5. **Tokens de diseño incompletos** — Sin escala de colores, sin sombras, sin transiciones
6. **Inline styles** — KPICard, AppointmentCard usan style={} en vez de CSS
7. **Empty states ausentes** — Sin estados vacíos accionables en ninguna vista
8. **Mezcla de idiomas** — "Completed" en inglés en MonthlyTrendChart
9. **Botones sin estados** — Sin loading, sin disabled visual en Login
10. **Formularios sin react-hook-form** — Login y Register usan useState manual

#### MEDIOS (Polish visual)
11. **Sin dark mode** — Esperado en 2026 para herramientas SaaS
12. **Sidebar no colapsable** — Siempre 260px fijo en desktop
13. **Gráficas sin custom tooltip** — Usan defaults de Recharts
14. **Topbar sin glass effect** — Plain white, sin backdrop-filter
15. **Avatar sin fallback robusto** — Solo primera letra, sin color por rol

---

## PARTE IV: SISTEMA DE DISEÑO (FASE 0)

### 0.1 Tokens CSS — Archivo: `src/shared/styles/tokens.css`

**Estructura de colores:**
```css
:root {
  /* SENA Green — escala completa */
  --color-green-50: #f0fdf4;
  --color-green-100: #dcfce7;
  --color-green-200: #bbf7d0;
  --color-green-300: #86efac;
  --color-green-400: #4ade80;
  --color-green-500: #39a900;  /* Primary */
  --color-green-600: #2d8a00;
  --color-green-700: #1a6b00;
  --color-green-800: #14532d;
  --color-green-900: #0a3d00;

  /* Neutrales */
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

  /* Estado */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Superficies */
  --surface-primary: #ffffff;
  --surface-secondary: #f9fafb;
  --surface-tertiary: #f3f4f6;
  --surface-inverse: var(--color-gray-950);

  /* Texto */
  --text-primary: var(--color-gray-950);
  --text-secondary: var(--color-gray-500);
  --text-tertiary: var(--color-gray-400);
  --text-inverse: #ffffff;
  --text-link: var(--color-green-600);

  /* Bordes */
  --border-default: var(--color-gray-200);
  --border-strong: var(--color-gray-300);
  --border-focus: var(--color-green-500);

  /* Tipografía */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Espaciado (base 4px) */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Bordes */
  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  --shadow-ring: 0 0 0 3px rgba(57, 169, 0, 0.3);

  /* Transiciones */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  /* Z-Index */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-popover: 500;
  --z-toast: 600;

  /* Breakpoints (como referencia) */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;
}
```

### 0.2 Dark Mode Tokens
```css
[data-theme="dark"] {
  --surface-primary: var(--color-gray-950);
  --surface-secondary: var(--color-gray-900);
  --surface-tertiary: var(--color-gray-800);
  --surface-inverse: #ffffff;

  --text-primary: var(--color-gray-50);
  --text-secondary: var(--color-gray-400);
  --text-tertiary: var(--color-gray-500);
  --text-inverse: var(--color-gray-950);

  --border-default: var(--color-gray-800);
  --border-strong: var(--color-gray-700);

  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
}
```

### 0.3 Base Styles — Archivo: `src/shared/styles/base/reset.css`
- Box-sizing border-box global
- Font smoothing antialiased
- `:focus-visible` global con ring verde SENA
- `::selection` con fondo verde claro
- Scrollbar styling para sidebar oscuro
- `prefers-reduced-motion` para desactivar animaciones

### 0.4 Animations — Archivo: `src/shared/styles/base/animations.css`
- `@keyframes skeleton-shimmer` — gradiente izquierda-derecha
- `@keyframes spin` — para spinners
- `@keyframes fadeIn` — opacidad 0→1
- `@keyframes slideUp` — translateY(8px) + opacity 0→1
- `@keyframes slideDown` — translateY(-8px) + opacity 0→1

---

## PARTE V: BIBLIOTECA DE COMPONENTES

### Componentes CSS a crear en `src/shared/styles/components/`

| Archivo | Contenido |
|---------|-----------|
| `buttons.css` | primary, secondary, success, danger, ghost, link, icon, loading states |
| `cards.css` | card base, kpi-card, interactive-card, appointment-card |
| `forms.css` | input, label, error, input-icon, select, checkbox, radio, textarea |
| `tables.css` | table base, table-responsive, table-cards (mobile), pagination |
| `badges.css` | status-badge, role-badge, dependency-badge |
| `modals.css` | modal-overlay, modal-content, focus trap, animations |
| `skeleton.css` | skeleton-text, skeleton-circle, skeleton-card, skeleton-table-row |
| `empty-states.css` | empty-state container with icon, title, description, CTA |
| `tooltips.css` | tooltip with arrow |
| `tabs.css` | tablist, tab, tabpanel with ARIA semantics |

---

## PARTE VI: REDISEÑO POR PÁGINA

### FASE 1: Layout Principal (Layout.jsx + layout.css)

**Sidebar Rediseñado:**
- Ancho: 256px expandido, 64px colapsado (iconos + tooltip)
- Logo: SVG SENA + texto "SENA Bienestar" con opción de colapsar
- Nav items: Icono + texto, active state con borde izquierdo verde + fondo sutil
- Footer: Avatar + nombre + rol + botón salir
- Mobile: Off-canvas con overlay, swipe-to-close
- Transición: `transform 0.3s ease`
- ARIA: `role="navigation"`, `aria-label="Menú principal"`, `aria-label="Cerrar menú"`

**Topbar Rediseñada:**
- `backdrop-filter: blur(8px)` para glass effect sutil
- `border-bottom` más sutil (1px solid var(--border-default))
- Título de página con `text-lg font-semibold`
- Breadcrumb opcional
- Mobile: hamburger → X animación

**Grid System:**
- Bento grid con CSS Grid
- `repeat(auto-fill, minmax(280px, 1fr))` para KPIs
- Responsive: 4col → 2col → 1col

### FASE 2: Páginas de Autenticación

**Login Rediseñado:**
- Card centrada + fondo gradiente sutil SENA
- SVG SENA animado (reemplazar hero.png)
- Labels + inputs con iconos + focus ring verde
- Loading spinner + disabled state en botón
- Toggle visibilidad de contraseña
- Link "¿Olvidaste tu contraseña?"
- Error via sonner toast (no inline)
- `htmlFor`/`id` en todos los labels/inputs
- `autoComplete` en campos

**Register Rediseñado:**
- SVG SENA consistente con Login
- 1 columna mobile, 2 columnas desktop (password fields)
- react-hook-form + Zod (reemplazar useState manual)
- Indicador de fortaleza de contraseña
- Mensajes de error bajo cada campo + `aria-describedby`
- Loading state en botón

### FASE 3: Dashboard del Aprendiz

**Layout Bento Grid:**
```
┌─────────────────────────────────────────────────┐
│  [KPI] Citas Pendientes    [KPI] Próxima Cita   │
│  [KPI] Completadas         [KPI] Canceladas     │
├─────────────────────────────────────────────────┤
│  [+ Nueva Cita]  [Filtros: Todas|Pendientes|Completadas] │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐   │
│  │  AppointmentCard - Próxima cita          │   │
│  │  Fecha | Hora | Profesional | Dependencia│   │
│  │  [Confirmar] [Cancelar]                  │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  AppointmentCard - Cita pasada           │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Cambios:**
- 4 KPI cards arriba (solo relevantes para aprendiz)
- Filtros como tabs horizontales (no dropdown)
- AppointmentCard: border-left 4px, status badge con icono
- Empty state: "No tienes citas agendadas" + "Agendar primera cita"
- Skeleton loading mientras carga
- Botón "Nueva Cita" prominente (FAB en mobile)
- Focus trap en modal de nueva cita
- Escape key cierra modal

**AppointmentForm Rediseñado:**
- Stepper visual (Dependencia → Fecha → Hora → Confirmar)
- Date picker visual (mini calendar)
- Time slots como botones seleccionables (no select dropdown)
- Resumen antes de confirmar
- Loading state en cada paso
- Validación inline con iconos + `aria-describedby`

**AppointmentCard Rediseñado:**
- Border-left 4px con color de status
- Status badge: icono + texto
- Información en grid: Fecha | Hora | Profesional | Dependencia
- Acciones inline con iconos
- Hover effect sutil (shadow-md)
- Confirmación antes de cancelar (modal con focus trap)
- Responsive: stack en mobile

### FASE 4: Dashboard Profesional

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  [KPI] Hoy        [KPI] Pendientes   [KPI] Semana │
├─────────────────────────────────────────────────┤
│  [Filtros: Fecha | Estado | Dependencia]        │
├─────────────────────────────────────────────────┤
│  Tabla con acciones inline                      │
│  ┌─────┬──────┬──────────┬────────┬──────────┐  │
│  │Hora │Alumno│Depto     │Estado  │Acciones  │  │
│  ├─────┼──────┼──────────┼────────┼──────────┤  │
│  │8:00 │Juan  │Psicología│Pend    │[✓][✗][·] │  │
│  └─────┴──────┴──────────┴────────┴──────────┘  │
│  Mobile: tarjetas apiladas                      │
└─────────────────────────────────────────────────┘
```

**Cambios:**
- KPIs relevantes (citas de hoy, pendientes, semana)
- Tabla con acciones inline + `aria-label` en cada botón
- Filtros de fecha y estado
- Mobile: tarjetas en vez de tabla
- Batch actions: seleccionar múltiples
- Confirmation dialog antes de "No asistió"

### FASE 5: Dashboard de Coordinación

**Layout Bento Grid:**
```
┌─────────────────────────────────────────────────┐
│  [KPI] Total Citas    [KPI] Tasa Cumplimiento   │
│  [KPI] Tiempo Promedio [KPI] No-Show Rate       │
├─────────────────────────────────────────────────┤
│  [Rango Fechas] [Exportar CSV]                   │
├──────────────────────┬──────────────────────────┤
│  Gráfico Barras      │  Gráfico Tendencia       │
│  (Por Dependencia)   │  (Mensual)               │
├──────────────────────┴──────────────────────────┤
│  Tabla Top Profesionales                         │
└─────────────────────────────────────────────────┘
```

**Cambios:**
- KPI cards con trend arrows (up/down + porcentaje)
- Gráficas: colores SENA, sin 3D, labels directos, custom tooltip
- Empty state para gráficas sin datos
- Tabla profesional con barra de eficiencia completa
- Filtro de rango con validación (from < to)
- Exportar CSV con loading state
- Responsive: KPIs 2x2 en mobile, gráficas stack

### FASE 6: Panel Admin

**AdminDashboard:**
- Tabs horizontales limpios (Usuarios | Auditoría | Config)
- Contador de registros en cada tab
- ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`
- Keyboard: arrow keys entre tabs

**UserManagement:**
- Tabla responsive con card view en mobile
- Búsqueda + filtros (rol, estado, dependencia)
- Paginación con prev/next + ellipsis
- Modal de edición funcional
- Toggle activo/inactivo con confirmación
- Avatar con inicial + color de rol
- Empty state: "No se encontraron usuarios"

**AuditLogViewer:**
- Timeline visual con línea vertical
- Dots de color por acción (create=verde, update=azul, delete=rojo)
- Before/After con diff visual
- Filtros por: usuario, acción, fecha
- JSON formateado (no `JSON.stringify` crudo)
- Mobile: tarjetas apiladas

### FASE 7: Página Unauthorized
- Ilustración SVG (no texto crudo)
- Mensaje: "Acceso no autorizado"
- Botón: "Volver al inicio"
- Logo SENA
- Centrado vertical y horizontal

---

## PARTE VII: RESPONSIVE COMPLETO

### Breakpoints
```css
/* Mobile: 0-639px */
/* Tablet: 640-1023px */
/* Desktop: 1024px+ */
/* Wide: 1280px+ */
```

### Patrones Responsive

| Componente | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Sidebar | Fijo 256px | Colapsable 64px | Off-canvas |
| KPI Grid | 4 columns | 2 columns | 2x2 grid |
| Charts Grid | 2 columns | 1 column | 1 column |
| Tables | Scroll horizontal | Scroll horizontal | Card view |
| Forms | 2 columns (some) | 1 column | 1 column |
| Modals | Centered | Centered | Full-screen |
| FABs | Hidden | Hidden | Visible (bottom-right) |

---

## PARTE VIII: ACCESIBILIDAD (WCAG 2.2 AA)

### Checklist de Implementación

1. **Focus Management**
   - `:focus-visible` en todos los botones, links, inputs
   - Focus trap en modales
   - Skip-to-content link

2. **ARIA Labels**
   - Botones icon-only: `aria-label="Cerrar menú"`
   - Nav: `role="navigation"` + `aria-label="Menú principal"`
   - Tab panels: `role="tablist"` + `aria-selected`
   - Status badges: `aria-label="Estado: Pendiente"`
   - Modal: `role="dialog"` + `aria-modal="true"` + `aria-label`

3. **Color Contrast**
   - Texto normal: 4.5:1 mínimo
   - Texto grande: 3:1 mínimo
   - No información solo por color (siempre + icono/texto)

4. **Formularios**
   - Labels asociados con `htmlFor`
   - Error messages con `aria-describedby`
   - Required fields con `aria-required`
   - Invalid fields con `aria-invalid`

5. **Reduced Motion**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

---

## PARTE IX: DARK MODE

### Estrategia
- Usar `data-theme="dark"` en `<html>` (no solo `prefers-color-scheme`)
- Toggle en sidebar footer o topbar
- Persistir en localStorage
- Tokens CSS con `[data-theme="dark"]`

### Paleta Dark
```css
[data-theme="dark"] {
  --surface-primary: #0a0a0a;
  --surface-secondary: #171717;
  --surface-tertiary: #262626;
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --border: rgba(255, 255, 255, 0.1);
}
```

---

## PARTE X: SKILL CREADA

Se ha creado una skill personalizada en `.opencode/skills/ui-ux-designer.md` que contiene:
- Principios de diseño Calm Professional
- Information Architecture basada en investigación
- Patrones de componentes (KPI, Dashboard Grid, Table, Modal, Form)
- Sistema de colores, tipografía, espaciado, sombras
- Workflow de diseño paso a paso
- Checklist de accesibilidad por componente
- Referencias competitivas (Stripe, Linear, Vercel, Notion, HubSpot)

Esta skill puede reutilizarse en cualquier proyecto futuro de diseño UI/UX.

---

## PARTE XI: ORDEN DE EJECUCIÓN

| Fase | Descripción | Dependencias | Días Est. |
|------|-------------|-------------|-----------|
| 0 | Sistema de diseño (tokens + base + component library) | Ninguna | 3-4 |
| 1 | Layout (sidebar + topbar + grid) | Fase 0 | 2-3 |
| 2 | Auth pages (Login + Register) | Fase 0 | 1-2 |
| 3 | Aprendiz Dashboard | Fases 0-1 | 2-3 |
| 4 | Professional Dashboard | Fases 0-1 | 2-3 |
| 5 | Coordination Dashboard | Fases 0-1 | 2-3 |
| 6 | Admin Panel | Fases 0-1 | 2-3 |
| 7 | Unauthorized page | Fase 0 | 0.5 |
| 8 | Responsive completo | Fases 1-6 | 2-3 |
| 9 | Accesibilidad (WCAG pass) | Todas | 2-3 |
| 10 | Dark mode | Fase 0 | 1-2 |
| **Total** | | | **20-32 días** |

---

## PARTE XII: MÉTRICAS DE ÉXITO

| Métrica | Actual (Estimado) | Objetivo |
|---------|-------------------|----------|
| Lighthouse Accessibility | ~40-50 | >90 |
| Lighthouse Performance | ~60-70 | >85 |
| Lighthouse Best Practices | ~70-80 | >90 |
| Focus Visible | 0% elements | 100% elements |
| ARIA Labels | 0% icon buttons | 100% icon buttons |
| Skeleton Loading | 0% views | 100% views |
| Mobile Usability | Partial | Complete |
| Color Contrast | Mixed | WCAG AA (4.5:1) |
| Empty States | None | All views |
| Mixed Language | Yes | Single language (ES) |
| Inline Styles | Multiple | Zero |
| CSS Token Usage | 30% | 100% |

---

## PARTE XIII: ANÁLISIS DETALLADO DE SEÑALES "AI-GENERATED" (Actualización 12/Jun/2026)

### Señales claras de que la UI fue generada por IA

| Señala | Evidencia en el código | Cómo se resuelve |
|--------|----------------------|------------------|
| **Sin identidad visual** | Solo `#39a900` como accent. Sin personalidad más allá del color. | Design system con tokens completos, tipografía con personalidad (Inter/Geist) |
| **CSS sin sistema** | `variables.css` tiene 4 colores, 4 espaciados. 30+ hex hardcodeados en otros archivos | Migrar TODOS los valores a tokens. Eliminar hex raw. |
| **Botones genéricos** | Mismo padding, misma radius, mismo weight para todo | 6 estados por botón, 3 tamaños (sm/md/lg), loading states |
| **Sidebar de 2018** | Fijo 260px negro `#1a1a1a`, sin colapsar | Sidebar colapsable 256px→64px con iconos + tooltips |
| **Tipografía sin escala** | `system-ui` default, tamaños random (`0.85rem`, `0.75rem`, `0.9rem`) | Escala modular con Inter, `--text-*` tokens |
| **Tablas sin responsive** | `admin-table`, `profesional-table` se desbordan en mobile | Card view en mobile con `data-label` attributes |
| **0% accesibilidad** | Ni un `aria-label`, ni un `role`, ni un `focus-visible` | WCAG 2.2 AA completo: focus, ARIA, contrast, keyboard |
| **Sin skeleton loading** | Solo texto "Cargando..." | Skeleton shimmer en todas las vistas |
| **Empty states ausentes** | Texto plano sin CTA | Ilustración + título + descripción + botón CTA |
| **Modales primitivos** | Sin focus trap, sin escape key, sin animación | Focus trap + escape + animación slideUp |
| **Inline styles** | `KPICard`, `AppointmentCard` usan `style={}` | Migrar a clases CSS con tokens |
| **Mezcla de idiomas** | "Completed" en inglés en MonthlyTrendChart | Unificar a español completo |

### Análisis por Componente

#### Login (`auth.css` + `Login.jsx`)
- ** positivo ** : Card centrada, form funcional, error handling
- ** negativo ** : Sin toggle visibilidad contraseña, sin "¿Olvidaste tu contraseña?", sin loading state visual en botón, sin autoComplete

#### Register (`Register.jsx`)
- ** positivo ** : react-hook-form + Zod, validación robusta
- ** negativo ** : Sin indicador fortaleza contraseña, botón "Mostrar contrasenas" no controla los inputs (solo el checkbox)

#### AprendizDashboard
- ** positivo ** : Modal funcional, empty state con CTA
- ** negativo **: Sin KPIs, sin filtros, sin skeleton loading

#### ProfessionalDashboard
- ** positivo ** : Filtros por estado, acciones inline
- ** negativo **: Sin KPIs, formato "citas-undefined" cuando profile no carga

#### CoordinationDashboard
- ** positivo ** : KPIs, gráficas, filtro de fechas
- ** negativo **: Gráficas sin custom tooltip, sin empty state, `charts-grid` minmax(400px) rompe en mobile

#### AdminDashboard
- ** positivo ** : Tabs, tabla con paginación
- ** negativo **: Tabla sin responsive, avatar roto (HTML mal estructurado en `UserManagement.jsx:81-88`), sin BRIA en tabs

---

## PARTE XIV: ESTUDIO COMPETITIVO — TOP 5 DASHBOARDS (Con Links)

### 1. Stripe Dashboard
- **URL:** https://dashboard.stripe.com
- **Qué estudiar:** Progressive disclosure (3 KPIs principales → drill-down), tablas financieras con alineación tabular, paleta neutra + accent indigo, hover states en cada fila
- **Lección SENA:** Cómo mostrar datos densos (citas, profesionales) sin saturar. Tablas con acciones inline.

### 2. Linear
- **URL:** https://linear.app
- **Qué estudiar:** Calm design (whitespace masivo, zero visual noise), sidebar colapsable con iconos, empty states memorables, command palette (Cmd+K), dark mode como default
- **Lección SENA:** Look "premium" con minimalismo. Sidebar colapsable. Empty states accionables.

### 3. Vercel
- **URL:** https://vercel.com/dashboard
- **Qué estudiar:** Ultra-limpio (cada elemento gana su lugar), Geist font (tipografía geométrica moderna), dark mode con contraste agresivo, deploy status como KPI central
- **Lección SENA:** "Engineered to look designed". Monochrome base + un accent.

### 4. Notion
- **URL:** https://www.notion.so
- **Qué estudiar:** Widgets modulares, empty states con personalidad, AI contextual (no chat separada), vistas flexibles (tabla/calendar/board), onboarding por rol
- **Lección SENA:** Empty states que inviten a la acción. Personalización por rol.

### 5. HubSpot
- **URL:** https://app.hubspot.com
- **Qué estudiar:** Role-based dashboards (cada rol ve métricas relevantes), KPI cards con trend arrows, charts con tooltips personalizados, progressive disclosure (resumen → detalle → drill-down)
- **Lección SENA:** KPIs con tendencias temporales. Dashboards por rol.

### Fuentes de Inspiración Adicional
- **Behance SaaS Dashboards:** https://www.behance.net/search/projects/SAAS%20dashboard
- **Muzli Dashboard Inspiration:** https://muz.li/inspiration/dashboard-inspiration
- **SaaSUI Design Library:** https://www.saasui.design/blog/7-saas-ui-design-trends-2026
- **Dribbble Dashboard Trends:** https://dribbble.com/shots/tagged/dashboard
- **Layers.to SaaS Dashboard:** https://layers.to/search/saas-dashboard

---

## PARTE XV: TENDENCIAS UI/UX 2026 (Investigación Actualizada)

| Tendencia | Fuente | Aplicación en SENA |
|-----------|--------|-------------------|
| **Calm Interfaces** | Linear, Vercel | Sidebar colapsable, KPIs limpios, sin ruido visual |
| **Progressive Disclosure** | Stripe, HubSpot | 3-5 KPIs visibles, resto detrás de clicks |
| **Bento Grid Layouts** | Apple, Notion | Dashboard coordinación con grid asimétrico |
| **Dark Mode Standard** | 60%+ usuarios lo prefieren | Toggle en sidebar, tokens `[data-theme="dark"]` |
| **Mobile-Specific Views** | Stripe mobile, Notion mobile | Card view para tablas, FAB para acciones primarias |
| **Accessibility (WCAG 2.2 AA)** | Requisito legal 2026 | Focus management, ARIA, keyboard nav |
| **Glassmorphism 2.0** | topbar con `backdrop-filter: blur(8px)` | Efecto sutil en topbar |
| **Micro-animaciones** | Cada interacción tiene feedback | Hover, loading, skeleton shimmer |
| **AI-Augmented Dashboards** | Notion AI, Tableau Pulse | Insights auto-generados (fase futura) |
| **Modular Layouts** | Notion, Monday | Widgets reorganizables (fase futura) |

---

## PARTE XVI: SKILL CREADA

Se ha creado la skill en `.opencode/skills/ui-ux-designer/SKILL.md` que contiene:
- Filosofía de diseño "Calm Professional"
- Sistema completo de design tokens (colores, tipografía, espaciado, sombras, transiciones)
- Patrones de componentes (botones 6 estados, cards, forms, tables, modals, skeleton, empty states)
- Responsive breakpoints y patrones
- Implementación de dark mode
- Checklist de accesibilidad WCAG 2.2 AA
- Workflow de aplicación paso a paso
- Reglas rápidas (nunca hex raw, siempre tokens, siempre aria-label)

**La skill se auto-carga** cuando opencode detecta tareas de diseño UI/UX.

---

## PARTE XVII: PREGUNTAS PARA EL USUARIO

Antes de ejecutar el plan, necesito que respondas:

1. **¿Cuál es el rol principal de usuario?** ¿El más frecuente es Aprendiz, Profesional, Coordinación o Admin?
2. **¿Dark mode es prioritario?** ¿Lo necesitas ahora o puede ser fase 2?
3. **¿Qué idioma usamos?** ¿Todo en español o hay contenido en inglés que debe mantenerse?
4. **¿Hay restricciones de marca?** ¿Los colores del SENA deben ser exactos o podemos crear una paleta expandida?
5. **¿Cuánto tiempo tienes?** ¿Necesitas algo funcional en 1 semana o puedes esperar el plan completo (~20-30 días)?
6. **¿El formulario de registro necesita campos adicionales?** ¿Términos y condiciones? ¿Email verification?
7. **¿Necesitas notificaciones push o solo toast locales?**
8. **¿Hay alguien más en el equipo?** ¿Trabajas solo o hay diseñadores/devs adicionales?
9. **¿Quieres mantener Recharts o prefieres otra librería?** (Nivo o Tremor son más modernas para dashboards)
10. **¿Necesitas internacionalización (i18n) o solo español?**
11. **¿Qué dashboards son prioridad?** ¿Empezamos por el más usado (Aprendiz) o por el más complejo (Coordinación/Admin)?
12. **¿Necesitas ilustraciones SVG personalizadas o usamos lucide-react para empty states?**

---

*Este plan está diseñado para ejecutarse incrementalmente. Cada fase es independiente y puede deployarse por separado. La Fase 0 (sistema de diseño) es la más crítica — sin ella, todos los demás cambios serán inconsistentes.*

*La skill creada en `.opencode/skills/ui-ux-designer/SKILL.md` puede reutilizarse en futuros proyectos de diseño UI/UX.*
