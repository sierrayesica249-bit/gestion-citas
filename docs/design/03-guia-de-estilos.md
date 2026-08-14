# 3. Guía de Estilos — "Calm Professional Design System"

Sistema de Gestión de Citas — Bienestar al Aprendiz (SENA).

> La guía de estilos documenta los **design tokens** y componentes definidos en
> `src/shared/styles/` (principalmente `tokens.css`) para garantizar coherencia
> visual en toda la aplicación.

---

## 3.1. Principios de diseño

1. **Calm & Profesional:** tono institucional SENA, sobrio y confiable.
2. **Accesible:** contraste AA, foco visible, soporte de teclado y lectores de pantalla.
3. **Consistente:** todo se construye a partir de tokens y componentes reutilizables.
4. **Responsive:** de móvil (menú overlay) a escritorio (sidebar fija).

---

## 3.2. Color

### Marca institucional SENA

| Token            | Valor      | Uso                                        |
|------------------|------------|--------------------------------------------|
| `--sena-green` / `--green-500` | `#39a900` | Color primario de acción (botones, enlaces activos) |
| `--sena-dark`    | `#1a1a1a`  | Texto y superficies oscuras                |
| `--sena-gray`    | `#f5f5f5`  | Fondos secundarios                         |
| `--sena-white`   | `#ffffff`  | Superficies principales                    |

### Escala de verde SENA

| Token       | Valor      |
|-------------|------------|
| `--green-50`| `#f0fdf4`  |
| `--green-100`| `#dcfce7` |
| `--green-200`| `#bbf7d0` |
| `--green-300`| `#86efac` |
| `--green-400`| `#4ade80` |
| `--green-500`| `#39a900`  ← primario |
| `--green-600`| `#2d8a00` |
| `--green-700`| `#1a6b00` |
| `--green-800`| `#14532d` |
| `--green-900`| `#0a3d00` |

### Grises neutros

| Token       | Valor      |
|-------------|------------|
| `--gray-50` | `#fafafa`  |
| `--gray-100`| `#f5f5f5`  |
| `--gray-200`| `#e5e5e5`  |
| `--gray-300`| `#d4d4d4`  |
| `--gray-400`| `#a3a3a3`  |
| `--gray-500`| `#737373`  |
| `--gray-600`| `#525252`  |
| `--gray-700`| `#404040`  |
| `--gray-800`| `#262626`  |
| `--gray-900`| `#171717`  |
| `--gray-950`| `#0a0a0a`  |

### Colores de estado

| Estado    | Token           | Valor      | Fondo claro     | Fondo oscuro    |
|-----------|-----------------|------------|-----------------|-----------------|
| Éxito     | `--success`     | `#22c55e`  | `--success-light` `#dcfce7` | `--success-dark` `#16a34a` |
| Advertencia | `--warning`   | `#f59e0b`  | `--warning-light` `#fef3c7` | `--warning-dark` `#d97706` |
| Error     | `--error`       | `#ef4444`  | `--error-light`  `#fee2e2`  | `--error-dark`  `#dc2626` |
| Información | `--info`      | `#3b82f6`  | `--info-light`   `#dbeafe`  | `--info-dark`   `#2563eb` |

### Superficies y texto

| Token                    | Valor                                  |
|--------------------------|----------------------------------------|
| `--surface-primary`      | `#ffffff`                              |
| `--surface-secondary`    | `#f9fafb`                              |
| `--surface-tertiary`     | `#f3f4f6`                              |
| `--surface-inverse`      | `--gray-950` (`#0a0a0a`)               |
| `--surface-sidebar`      | `--gray-950` (sidebar oscura)          |
| `--text-primary`         | `--gray-950`                           |
| `--text-secondary`       | `--gray-500`                           |
| `--text-tertiary`        | `--gray-400`                           |
| `--text-inverse`         | `#ffffff`                              |
| `--text-link`            | `--green-600` (`#2d8a00`)              |
| `--text-link-hover`      | `--green-700` (`#1a6b00`)              |

---

## 3.3. Tipografía

**Familia principal:** `Inter` (Google Fonts), con respaldo system-ui.

```css
--font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### Escala tipográfica

| Token        | Tamaño   | Uso típico                        |
|--------------|----------|-----------------------------------|
| `--text-xs`  | `0.75rem`| Notas, credenciales de prueba     |
| `--text-sm`  | `0.875rem`| Texto secundario, badges         |
| `--text-base`| `1rem`   | Texto corporal                    |
| `--text-lg`  | `1.125rem`| Subtítulos                        |
| `--text-xl`  | `1.25rem` | Encabezados de sección            |
| `--text-2xl` | `1.5rem` | Títulos de tarjetas               |
| `--text-3xl` | `1.875rem`| Títulos de página                 |
| `--text-4xl` | `2.25rem` | Hero / saludo del dashboard       |

### Pesos y interlineado

- Pesos: `400` normal, `500` medium, `600` semibold, `700` bold.
- Interlineados: `1` none, `1.25` tight, `1.375` snug, `1.5` normal, `1.625` relaxed.
- Tracking: `-0.025em` tight, `0` normal, `0.025em` wide, `0.05em` wider.

---

## 3.4. Espaciado

Sistema de base **4px** (`--space-*`).

| Token            | Valor  |
|------------------|--------|
| `--space-0`      | 0      |
| `--space-1`      | 0.25rem |
| `--space-2`      | 0.5rem |
| `--space-3`      | 0.75rem |
| `--space-4`      | 1rem   |
| `--space-6`      | 1.5rem |
| `--space-8`      | 2rem   |
| `--space-10`     | 2.5rem |
| `--space-12`     | 3rem   |
| `--space-16`     | 4rem   |
| `--space-20`     | 5rem   |
| `--space-24`     | 6rem   |

**Regla práctica:** usar múltiplos de 4px. Contenido estándar: `--space-6` (1.5rem).

---

## 3.5. Bordes y radio

| Token             | Valor       |
|-------------------|-------------|
| `--radius-none`   | 0           |
| `--radius-sm`     | 0.375rem    |
| `--radius-md`     | 0.5rem      |
| `--radius-lg`     | 0.75rem     |
| `--radius-xl`     | 1rem        |
| `--radius-2xl`    | 1.5rem      |
| `--radius-full`   | 9999px      |

Bordes de superficie: `--border-subtle` (`--gray-100`), `--border-default` (`--gray-200`),
`--border-strong` (`--gray-300`), `--border-focus` (`--green-500`).

---

## 3.6. Sombras

| Token            | Valor                                                                |
|------------------|----------------------------------------------------------------------|
| `--shadow-xs`    | `0 1px 2px 0 rgba(0,0,0,.05)`                                       |
| `--shadow-sm`    | `0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)`        |
| `--shadow-md`    | `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)`     |
| `--shadow-lg`    | `0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)`   |
| `--shadow-xl`    | `0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)`  |
| `--shadow-ring`  | `0 0 0 3px rgba(57,169,0,.3)`  ← anillo de foco del primario        |

---

## 3.7. Movimiento

- Duración: `--duration-fast` 150ms · normal 200ms · slow 300ms · slower 500ms.
- Curvas: `--ease-default` / `--ease-in-out` `cubic-bezier(0.4,0,0.2,1)`,
  `--ease-out` `cubic-bezier(0,0,0.2,1)`, `--ease-bounce` `cubic-bezier(0.34,1.56,0.64,1)`.

---

## 3.8. Layout

| Token                        | Valor                 |
|------------------------------|-----------------------|
| `--sidebar-width`            | 256px                 |
| `--sidebar-collapsed-width`  | 64px                  |
| `--topbar-height`            | 64px                  |
| `--content-max-width`        | 1400px                |
| `--content-padding`          | 1.5rem (`--space-6`)  |

Z-index: dropdown 1000 · sticky 1020 · fixed 1030 · overlay 1040 · modal 1050 · popover 1060 · tooltip 1070 · toast 1080.

### Breakpoints

`--bp-sm` 640px · `--bp-md` 768px · `--bp-lg` 1024px · `--bp-xl` 1280px · `--bp-2xl` 1536px.

---

## 3.9. Componentes

### Botones (`components/buttons.css`)

| Variante    | Apariencia                                    | Uso                              |
|-------------|-----------------------------------------------|----------------------------------|
| Primario    | Fondo `--green-500`, texto blanco             | Acción principal ("Agendar cita") |
| Secundario  | Borde + fondo claro                           | Acciones alternativas            |
| Ghost / texto | Sin fondo, enlace                           | Acciones de bajo énfasis          |
| Bloque      | `width: 100%`                                 | Formularios (Entrar, Solicitar)   |
| Carga       | Clase `btn-loading`, spinner                   | Evita dobles envíos               |

### Formularios (`components/forms.css`)

- Etiqueta `form-label` (con `form-label-required` para obligatorios).
- `form-input` / `form-select` / `form-textarea` con icono en `form-input-wrapper`.
- Estado de error: clase `.error` + mensaje `form-error` con icono.
- Validación en cliente con **Zod** (`react-hook-form`).

### Tarjetas (`components/cards.css`) y KPI

- Tarjeta de cita: caja de fecha (día/mes), icono de servicio, título, detalle `🕐 hora · motivo`, badge de estado y acción cancelar.
- KPI: icono con fondo de color suave, valor grande, etiqueta.

### Badges de estado de cita

| Estado       | Clase                    | Fondo     | Texto      |
|--------------|--------------------------|-----------|------------|
| Pendiente    | `ap-status-pending`      | `#fef3c7` | `#92400e`  |
| Confirmada   | `ap-status-confirmed`    | `#dbeafe` | `#1e40af`  |
| Completada   | `ap-status-completed`    | `#d1fae5` | `#065f46`  |
| Cancelada    | `ap-status-cancelled`    | `#fee2e2` | `#991b1b`  |
| No asistió   | `ap-status-no_show`      | `#f3f4f6` | `#6b7280`  |

### Tablas (`components/tables.css`)

Cabecera con fondo `--surface-secondary`, filas con `border-default`, estados de fila,
filtros y acciones por fila.

### Modales (`components/modals.css`)

Overlay oscurecido, tarjeta `--radius-lg`, cierre por ✕ / Escape / clic fuera,
foco movido al abrir y restaurado al cerrar.

### Pestañas (`components/tabs.css`)

`role=tablist`, activa con indicador `--green-500`, navegables con flechas
(izquierda/derecha).

### Gráficas

- **Barras:** citas por dependencia (`DependencyChart`).
- **Líneas:** tendencia mensual (`MonthlyTrendChart`).
- Librería: **Recharts**; errores capturados por `ChartErrorBoundary`.

---

## 3.10. Modo oscuro

Se activa con `data-theme="dark"` en `<html>` (login/registro) y ajusta las
superficies y sombras:

| Token                  | Claro         | Oscuro           |
|------------------------|---------------|------------------|
| `--surface-primary`    | `#ffffff`     | `--gray-950`     |
| `--surface-secondary`  | `#f9fafb`     | `--gray-900`     |
| `--surface-sidebar`    | `--gray-950`  | `#000000`        |
| `--text-primary`       | `--gray-950`  | `--gray-50`      |
| `--border-default`     | `--gray-200`  | `--gray-800`     |

---

## 3.11. Accesibilidad

- Enlace "Saltar al contenido principal".
- Etiquetas `aria-required`, `aria-invalid`, `aria-describedby` en formularios.
- `role=tablist` / `tab` / `tabpanel` en pestañas con navegación por flechas.
- Contraste AA en los pares de color definidos arriba.
- Anillo de foco `--shadow-ring` (verde `rgba(57,169,0,.3)`) sobre el foco por defecto.