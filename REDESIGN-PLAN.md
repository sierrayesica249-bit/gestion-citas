# Plan de Rediseño UI/UX — SENA Bienestar (gestion-citas)

> **Fecha:** 11 de Junio, 2026
> **Objetivo:** Transformar la interfaz de una aplicación que se ve "construida por IA" a un producto con diseño premium, profesional y coherente, siguiendo tendencias 2026 y buenas prácticas de la industria.

---

## RESUMEN EJECUTIVO

### Diagnóstico Actual
La aplicación tiene una **buena arquitectura técnica** (feature-based, repository pattern, custom hooks) pero su interfaz presenta:
- Diseño genérico de "plantilla" sin personalidad visual
- Problemas críticos de accesibilidad (sin focus-visible, sin aria-labels)
- Responsive limitado (solo 2 breakpoints, tablas sin patrón mobile)
- Estados interactivos incompletos (botones sin loading/disabled visual)
- Mezcla de idiomas español/inglés
- Sin skeleton loading ni estados vacíos accionables
- Tokens de diseño incompletos (sombras, transiciones, tipografía hardcodeada)

### Propuesta de Rediseño
Aplicar un diseño **"Calm Professional"** inspirado en Linear + Vercel:
- Paleta institutional SENA con escala de grises moderna
- Sidebar colapsable con logo SVG
- Bento grid para dashboards
- Skeleton loading en todas las vistas
- Dark mode como opción
- Mobile-first responsive
- WCAG 2.2 AA compliance

---

## FASE 0: SISTEMA DE DISEÑO (Fundación)

**Objetivo:** Crear una base de tokens y componentes consistente antes de tocar cualquier página.

### 0.1 Reorganizar tokens CSS
**Archivo:** `src/shared/styles/variables.css` → renombrar a `tokens.css`

Cambios:
- Agregar escala de colores completa (50-900) para el verde SENA
- Definir escala de grises neutra (0-950)
- Agregar variables de sombras (xs-xl + ring)
- Agregar variables de transición (duration + ease)
- Agregar escala de tipografía con tamaños fijos (no rem mezclados)
- Agregar z-index scale
- Agregar breakpoints como variables
- Agregar spacing scale base 4px

### 0.2 Crear estilos base
**Nuevo archivo:** `src/shared/styles/base/reset.css`
- Box-sizing border-box global
- Font smoothing antialiased
- `:focus-visible` global con ring verde SENA
- `::selection` con fondo verde claro
- Scrollbar styling para sidebar oscuro
- `prefers-reduced-motion` para desactivar animaciones

**Nuevo archivo:** `src/shared/styles/base/animations.css`
- `@keyframes skeleton-shimmer`
- `@keyframes spin`
- `@keyframes fadeIn`
- `@keyframes slideIn`

### 0.3 Crear biblioteca de componentes
**Nuevo directorio:** `src/shared/styles/components/`

| Archivo | Contenido |
|---------|-----------|
| `buttons.css` | Todos los estados: default, hover, focus-visible, active, disabled, loading, danger, ghost, link |
| `cards.css` | Card base, kpi-card, interactive-card |
| `forms.css` | Input, label, error, input-icon, select, checkbox, radio |
| `tables.css` | Table base, table-responsive, table-cards (mobile), pagination |
| `badges.css` | Status badges, dependency badges, role badges |
| `modals.css` | Modal overlay, focus trap, animations |
| `skeleton.css` | Skeleton variants: text, circle, card, table-row, chart |
| `empty-states.css` | Empty state containers with CTA |
| `tooltips.css` | Tooltip con arrow |

---

## FASE 1: LAYOUT PRINCIPAL

**Objetivo:** Rediseñar la estructura base (sidebar + topbar + main content).

### 1.1 Sidebar Rediseñado
**Archivo:** `src/shared/components/Layout.jsx` + `layout.css`

Cambios:
- Ancho: 256px expandido, 64px colapsado (con iconos + tooltip)
- Logo: SVG SENA + texto "SENA Bienestar" con opción de colapsar a solo logo
- Nav items: Icono + texto, active state con borde izquierdo verde + fondo sutil
- Footer: Avatar + nombre + rol + botón salir
- Mobile: Off-canvas con overlay, swipe-to-close gesture
- Transición: `transform 0.3s ease` suave
- Agregar `aria-label` a botón close
- Agregar `role="navigation"` al nav

### 1.2 Topbar Rediseñada
**Archivo:** `src/shared/styles/layout.css`

Cambios:
- `backdrop-filter: blur(8px)` para efecto glass sutil
- `border-bottom` más sutil (1px solid gray-200)
- Título de página con `text-lg font-semibold`
- Breadcrumb opcional para navegación profunda
- Mobile: hamburger menu con animación a X

### 1.3 Grid System
**Nuevo archivo:** `src/shared/styles/layout/grid.css`

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

.dashboard-grid--2col {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

@media (max-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## FASE 2: PÁGINAS DE AUTENTICACIÓN

### 2.1 Login Rediseñado
**Archivo:** `src/features/auth/pages/Login.jsx` + `auth.css`

| Elemento | Actual | Rediseño |
|----------|--------|----------|
| Layout | Card centrada | Card centrada + fondo gradiente sutil SENA |
| Logo | hero.png | SVG SENA animado + texto |
| Formulario | Labels + inputs básicos | Labels + inputs con iconos + focus ring verde |
| Botón | "Entrar" sin estado | Loading spinner + disabled state |
| Password | Sin toggle | Toggle visibilidad (ojo) |
| Olvidé contraseña | No existe | Link "¿Olvidaste tu contraseña?" |
| Registro | Link abajo | Botón secundario "Crear cuenta" |
| Error | Texto rojo | Toast notification (sonner) |
| Responsive | Sin cambios | Card se adapta a mobile con padding reducido |

### 2.2 Register Rediseñado
**Archivo:** `src/features/auth/pages/Register.jsx`

| Elemento | Actual | Rediseño |
|----------|--------|----------|
| Logo | hero.png | SVG SENA consistente con Login |
| Formulario | 2 columnas (password) | 1 columna en mobile, 2 en desktop |
| Validación | Mensajes inline | Mensajes bajo cada campo + icono error |
| Botón | "Crear cuenta" con spinner | Mismo patrón que Login |
| Password strength | No existe | Indicador visual de fortaleza |
| Terminos | No existe | Checkbox "Acepto términos" (si aplica) |

---

## FASE 3: DASHBOARD DEL APRENDIZ

### 3.1 AprendizDashboard Rediseñado
**Archivo:** `src/features/appointments/pages/AprendizDashboard.jsx`

Layout actual: Lista simple de citas con tarjetas.

Layout rediseñado (Bento Grid):
```
┌─────────────────────────────────────────────────┐
│  [KPI] Citas Pendientes    [KPI] Próxima Cita   │
│  [KPI] Completadas         [KPI] Canceladas     │
├─────────────────────────────────────────────────┤
│  [+ Nueva Cita]  [Filtros: Todas | Pendientes | Completadas]  │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐   │
│  │  AppointmentCard - Próxima cita          │   │
│  │  Fecha | Hora | Profesional | Dependencia│   │
│  │  [Confirmar] [Cancelar]                  │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  AppointmentCard - Cita pasada           │   │
│  │  ...                                     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

Cambios:
- 4 KPI cards arriba (solo las relevantes para aprendiz)
- Filtros como tabs horizontales (no dropdown)
- AppointmentCard: border-left color-coded, status badge con icono
- Empty state: "No tienes citas agendadas" + botón "Agendar primera cita"
- Skeleton loading mientras carga
- Botón "Nueva Cita" prominente (fab en mobile)

### 3.2 AppointmentForm Rediseñado
**Archivo:** `src/features/appointments/components/AppointmentForm.jsx`

Cambios:
- Stepper visual (Paso 1: Dependencia → Paso 2: Fecha → Paso 3: Hora → Paso 4: Confirmar)
- Select de dependencia con icono y color
- Date picker visual (mini calendar) en vez de input date
- Time slots como botones seleccionables (no select dropdown)
- Resumen antes de confirmar
- Loading state en cada paso
- Validación inline con iconos

### 3.3 AppointmentCard Rediseñado
**Archivo:** `src/features/appointments/components/AppointmentCard.jsx`

Cambios:
- Border-left 4px con color de status
- Status badge: icono + texto (no solo color)
- Información en grid: Fecha | Hora | Profesional | Dependencia
- Acciones inline: botones de acción con iconos
- Hover effect sutil (shadow-md)
- Confirmación antes de cancelar (modal)
- Responsive: stack en mobile

---

## FASE 4: DASHBOARD PROFESIONAL

### 4.1 ProfessionalDashboard Rediseñado
**Archivo:** `src/features/appointments/pages/ProfessionalDashboard.jsx`

Layout:
```
┌─────────────────────────────────────────────────┐
│  [KPI] Hoy        [KPI] Pendientes   [KPI] Semana │
├─────────────────────────────────────────────────┤
│  [Filtros: Fecha | Estado | Dependencia]        │
├─────────────────────────────────────────────────┤
│  Tabla de citas con acciones rápidas             │
│  ┌─────┬──────┬──────────┬────────┬──────────┐  │
│  │Hora │Alumno│Dependencia│Estado  │Acciones  │  │
│  ├─────┼──────┼──────────┼────────┼──────────┤  │
│  │8:00 │Juan  │Psicología│Pendiente│[✓][✗][·]│  │
│  └─────┴──────┴──────────┴────────┴──────────┘  │
└─────────────────────────────────────────────────┘
```

Cambios:
- KPIs relevantes para profesional (citas de hoy, pendientes, semana)
- Tabla con acciones inline (confirmar, completar, no asistió)
- Filtros de fecha y estado
- Mobile: tarjetas en vez de tabla
- Batch actions: seleccionar múltiples para confirmar/completar

---

## FASE 5: DASHBOARD DE COORDINACIÓN

### 5.1 CoordinationDashboard Rediseñado
**Archivo:** `src/features/dashboard/pages/CoordinationDashboard.jsx`

Layout (Bento Grid):
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
│  ┌─────┬──────┬──────────┬──────────┐           │
│  │#    │Nombre│Dependencia│Eficiencia│           │
│  └─────┴──────┴──────────┴──────────┘           │
└─────────────────────────────────────────────────┘
```

Cambios:
- KPI cards con trend arrows (up/down + porcentaje)
- Gráficas: colores consistentes, sin 3D, labels directos
- Empty state para gráficas sin datos
- Tabla profesional con barra de eficiencia completa (con track de fondo)
- Filtro de rango de fechas con validación (from < to)
- Exportar CSV con loading state
- Responsive: KPIs 2x2 en mobile, gráficas stack

### 5.2 KPICard Rediseñado
**Archivo:** `src/features/dashboard/components/KPICard.jsx`

Cambios:
- Icono del KPI (izquierda)
- Valor grande y bold
- Label en texto sm gris
- Trend: flecha + porcentaje con color (verde=subió, rojo=bajó)
- Border-top 3px con color accent
- Skeleton loading state

### 5.3 Gráficas Rediseñadas
**Archivos:** `DependencyChart.jsx`, `MonthlyTrendChart.jsx`

Cambios:
- Tooltip personalizado con formato SENA
- Labels directos en vez de legend
- Colores de la paleta SENA
- Empty state: "No hay datos para este período"
- Responsive: altura se adapta
- Sin animaciones excesivas

---

## FASE 6: PANEL ADMIN

### 6.1 AdminDashboard Rediseñado
**Archivo:** `src/features/admin/pages/AdminDashboard.jsx`

Cambios:
- Tabs horizontales limpios (Usuarios | Auditoría | Config)
- Contador de registros en cada tab
- Búsqueda global con debounce

### 6.2 UserManagement Rediseñado
**Archivo:** `src/features/admin/components/UserManagement.jsx`

Cambios:
- Tabla responsive con card view en mobile
- Búsqueda + filtros (rol, estado, dependencia)
- Paginación con prev/next + ellipsis
- Modal de edición funcional (implementar)
- Botón "Nuevo Usuario" funcional (implementar)
- Toggle activo/inactivo con confirmación
- Avatar con inicial + color de rol
- Empty state: "No se encontraron usuarios"

### 6.3 AuditLogViewer Rediseñado
**Archivo:** `src/features/admin/components/AuditLogViewer.jsx`

Cambios:
- Timeline visual con línea vertical
- Dots de color por acción (create=verde, update=azul, delete=rojo)
- Before/After con diff visual (resaltado de cambios)
- Filtros por: usuario, acción, fecha
- Paginación
- JSON formateado (no `JSON.stringify` crudo)
- Mobile: tarjetas apiladas

---

## FASE 7: PÁGINA UNAUTHORIZED

**Archivo:** `src/shared/components/Unauthorized.jsx`

Cambios:
- Ilustración SVG (no texto crudo)
- Mensaje: "Acceso no autorizado"
- Subtexto: "No tienes permisos para acceder a esta página"
- Botón: "Volver al inicio" con estilo btn-primary
- Logo SENA
- Centrado vertical y horizontal

---

## FASE 8: RESPONSIVE COMPLETO

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

## FASE 9: ACCESIBILIDAD

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

3. **Color Contrast**
   - Texto normal: 4.5:1 mínimo
   - Texto grande: 3:1 mínimo
   - No información solo por color

4. **Formularios**
   - Labels asociados con `htmlFor`
   - Error messages con `aria-describedby`
   - Required fields con `aria-required`

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

## FASE 10: DARK MODE (Opcional)

### Estrategia
- Usar `data-theme="dark"` en `<html>` (no `prefers-color-scheme` solamente)
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

## ORDEN DE EJECUCIÓN RECOMENDADO

| Fase | Descripción | Dependencias | Días Est. |
|------|-------------|-------------|-----------|
| 0 | Sistema de diseño (tokens + base) | Ninguna | 2-3 |
| 1 | Layout (sidebar + topbar + grid) | Fase 0 | 2-3 |
| 2 | Auth pages (Login + Register) | Fase 0 | 1-2 |
| 3 | Aprendiz Dashboard | Fases 0-1 | 2-3 |
| 4 | Professional Dashboard | Fases 0-1 | 2-3 |
| 5 | Coordination Dashboard | Fases 0-1 | 2-3 |
| 6 | Admin Panel | Fases 0-1 | 2-3 |
| 7 | Unauthorized page | Fase 0 | 0.5 |
| 8 | Responsive completo | Fases 1-6 | 2-3 |
| 9 | Accesibilidad | Todas | 1-2 |
| 10 | Dark mode (opcional) | Fase 0 | 1-2 |
| **Total** | | | **18-28 días** |

---

## MÉTRICAS DE ÉXITO

| Métrica | Actual (Estimado) | Objetivo |
|---------|-------------------|----------|
| Lighthouse Accessibility | ~40-50 | >90 |
| Lighthouse Performance | ~60-70 | >85 |
| Lighthouse Best Practices | ~70-80 | >90 |
| Focus Visible | 0% elements | 100% elements |
| ARIA Labels | 0% icon buttons | 100% icon buttons |
| Skeleton Loading | 0% views | 100% views |
| Mobile Usability | Partial | Complete |
| Color Contrast | Mixed | WCAG AA |
| Empty States | None | All views |
| Mixed Language | Yes | Single language |

---

## PREGUNTAS PARA EL USUARIO

Antes de ejecutar, necesito que respondas:

1. **¿Cuál es el rol principal de usuario?** ¿El más frecuente es Aprendiz, Profesional, Coordinación o Admin?
2. **¿Dark mode es prioritario?** ¿Lo necesitas ahora o puede ser fase 2?
3. **¿Qué idioma usamos?** ¿Todo en español o hay contenido en inglés que debe mantenerse?
4. **¿Hay restricciones de marca?** ¿Los colores del SENA deben ser exactos o podemos crear una paleta expandida?
5. **¿Cuánto tiempo tienes?** ¿Necesitas algo funcional en 1 semana o puedes esperar el plan completo?
6. **¿El formulario de registro necesita campos adicionales?** ¿Terminos y condiciones? ¿Email verification?
7. **¿Necesitas notificaciones push o solo toast locales?**
8. **¿Hay alguien más en el equipo?** ¿Trabajas solo o hay diseñadores/devs adicionales?

---

*Este plan está diseñado para ejecutarse incrementalmente. Cada fase es independiente y puede deployarse por separado. La Fase 0 (sistema de diseño) es la más crítica — sin ella, todos los demás cambios serán inconsistentes.*
