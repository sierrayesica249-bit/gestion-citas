# 2. Prototipos (Wireframes de baja fidelidad)

Sistema de Gestión de Citas — Bienestar al Aprendiz.

> Los wireframes reflejan la estructura y el flujo real de la aplicación
> (rutas, componentes y estados). Sirven de referencia para desarrollo y pruebas.

---

## 2.1. Login — `/login`

```
┌───────────────────────────────────────────────────────────────┐
│                                                    [☾ tema]   │
│                    ┌───────────────────────┐                  │
│                    │        [logo SENA]    │                  │
│                    │   Iniciar Sesión      │                  │
│                    │   SENA Bienestar      │                  │
│                    │                       │                  │
│                    │   Email               │                  │
│                    │   [📧 tu.email@...  ] │                  │
│                    │   Contraseña          │                  │
│                    │   [🔒 •••••••••••  ]  │                  │
│                    │                       │                  │
│                    │   [   Entrar   ]      │                  │
│                    │       ── o ──         │                  │
│                    │   Credenciales prueba │                  │
│                    │   ¿No tienes cuenta?  │                  │
│                    │   Regístrate aquí     │                  │
│                    └───────────────────────┘                  │
└───────────────────────────────────────────────────────────────┘

Componentes: card centrada, logo, campos con icono, botón primario bloque,
alerta de error, aviso de correo sin confirmar (reenviar), switch tema.
```

---

## 2.2. Registro — `/register`

```
┌───────────────────────────────────────────────────────────────┐
│   Logo · Crear cuenta · SENA Bienestar                        │
│   Nombre completo  [                        ]                 │
│   Documento        [                        ]                 │
│   Email            [                        ]                 │
│   Teléfono         [                        ]                 │
│   Contraseña       [                        ]                 │
│   Confirmar        [                        ]                 │
│   [   Crear cuenta   ]                                       │
│   ¿Ya tienes cuenta? → Inicia sesión                         │
└───────────────────────────────────────────────────────────────┘

Formulario de alta con validación en cliente (Zod) y mensajes por campo.
Tras registrarse: confirmación por correo antes del primer inicio de sesión.
```

---

## 2.3. Layout general (privado)

Se aplica a todas las pantallas autenticadas.

```
┌───────────┬───────────────────────────────────────────────────┐
│  SENA     │  ☰   [Título de la página]        [Nombre usuario]│
│  Bienestar├───────────────────────────────────────────────────┤
│           │                                                   │
│  [nav]    │                                                   │
│  ➜ Mis Citas        Contenido de la pantalla (children)       │
│  ➜ Mi Perfil                                                 │
│           │                                                   │
│  Usuario  │                                                   │
│  [Salir]  │                                                   │
└───────────┴───────────────────────────────────────────────────┘

Sidebar (256px, colapsa a overlay en móvil) · Topbar (64px) · Contenido con
ancho máximo 1400px.
```

---

## 2.4. Dashboard del Aprendiz — `/dashboard`

```
┌───────────┬────────────────────────────────────────────────────┬─────────────┐
│ SENA      │ ✨ jueves, 14 de agosto de 2026                    │             │
│ Bienestar │ ¡Buenos días, Ana!                                 │             │
│           │ Tu próxima cita es el 20 de agosto en Psicología   │             │
│ ➜ Mis     │                           [+ Agendar cita]        │             │
│   Citas   │────────────────────────────────────────────────────│  SERVICIOS  │
│ ➜ Mi      │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │  [🧠] Psi.. │
│   Perfil  │ │ Total  │ │Pendien.│ │Confirm.│ │Complet.│       │  [🩺] Enf.. │
│           │ │   3    │ │   1    │ │   1    │ │   1    │       │  [👥] T.Soc │
│           │ └────────┘ └────────┘ └────────┘ └────────┘       │  [+ Nueva]  │
│ Usuario   │────────────────────────────────────────────────────│  ────────── │
│ [Salir]   │ ¿Cómo te sientes hoy?  😔 😐 🙂 😊 😄              │  HORARIOS   │
│           │────────────────────────────────────────────────────│  ● Psi L-V  │
│           │ PRÓXIMA CITA          [● Pendiente]                │    8–5      │
│           │ ┌────────┐ 🧠 Psicología                           │  ● Enf L-V  │
│           │ │ 20 AGO │ 🕐 09:00 · Ansiedad                      │    7–4      │
│           │ └────────┘                                         │  ● T.S L-V  │
│           │────────────────────────────────────────────────────│    8–5      │
│           │ [Próximas] [Todas] [Historial]         3 citas    │             │
│           │ ┌───────────────────────────────────────────────┐  │             │
│           │ │ 14 AGO  🧠 Psicología 🕐 08:00 [● Pendiente] ✕│  │             │
│           │ │ 05 AGO  🩺 Enfermería 🕐 10:00 [● Confirmada] │  │             │
│           │ └───────────────────────────────────────────────┘  │             │
└───────────┴────────────────────────────────────────────────────┴─────────────┘

KPIs, rastreador de ánimo, tarjeta "próxima cita", pestañas (Próximas/Todas/
Historial), filas de cita con badge de estado y botón cancelar (✕) si está
pendiente o confirmada. Sidebar derecha: servicios y horarios.
```

---

## 2.5. Modal — Solicitar Nueva Cita

```
┌─────────────────────────── MODAL ──────────────────────────────┐
│  Solicitar Nueva Cita                              [✕]        │
│  Dependencia  [ Selecciona una dependencia... ▼ ]             │
│  Fecha        [dd/mm/aaaa   ]   Hora [08:00 ▼]                │
│  Motivo de consulta                                           │
│  [ Describe brevemente por qué necesitas la cita...           ]│
│  [   Solicitar Cita   ]                                       │
└────────────────────────────────────────────────────────────────┘

Abierto desde "Agendar cita" o "Nueva cita". Validación en cliente: dependencia
y fecha obligatorias; hora de 08:00 a 16:00 (paso 1 h). Cierra con ✕, Escape o
clic en el overlay. Se enfoca el modal al abrir (accesibilidad).
```

---

## 2.6. Dashboard Profesional — `/professional`

```
┌───────────┬────────────────────────────────────────────────────┐
│ SENA      │  Mis Citas                                         │
│ ➜ Mis     │  [Filtro: Todas | Pendientes | Confirmadas | ...]  │
│   Citas   │  ┌───────────────────────────────────────────────┐ │
│ ➜ Mi      │  │ 📅 20 AGO · 🧠 Aprendiz A · 09:00             │ │
│   Perfil  │  │ [Confirmar] [Cancelar]                        │ │
│           │  ├───────────────────────────────────────────────┤ │
│           │  │ 📅 05 AGO · 🩺 Aprendiz B · 10:00 [✓ Comp.]   │ │
│           │  └───────────────────────────────────────────────┘ │
│ Usuario   │                                                    │
│ [Salir]   │  (Psicología / Enfermería / Trabajo Social          │
│           │   comparten esta estructura de listado)            │
└───────────┴────────────────────────────────────────────────────┘

Cambia el estado de las citas de su dependencia (confirmar, cancelar,
completar, no asistió).
```

---

## 2.7. Dashboard Psicología — `/psychology`

Estructura tipo panel con la agenda de citas de la dependencia de **Psicología**:
KPIs del servicio, listado de citas y acciones de confirmación/cancelación.

```
┌───────────┬────────────────────────────────────────────────────┐
│ SENA      │  Psicología                                       │
│ ➜ Psicol. │  ┌────────┐ ┌────────┐ ┌────────┐                  │
│ ➜ Mi      │  │ Citas  │ │Pendien.│ │Confirm.│   [Agenda]       │
│   Perfil  │  └────────┘ └────────┘ └────────┘                  │
│           │  Listado de citas con acciones por estado           │
└───────────┴────────────────────────────────────────────────────┘
```

> Aplica el mismo patrón a **Enfermería** (`/enfermeria`) y
> **Trabajo Social** (`/social-work`).

---

## 2.8. Dashboard Coordinación — `/coordination`

```
┌───────────┬────────────────────────────────────────────────────┐
│ SENA      │  Coordinación                                      │
│ ➜ Coordin.│  [Vista General] [Gestionar Citas] [Profesionales] [Reportes]
│ ➜ Mi      │────────────────────────────────────────────────────│
│   Perfil  │  Desde: [01/08/2026]  Hasta: [14/08/2026] [🔄] [⬇ CSV]
│           │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│ Usuario   │  │ Citas  │ │ Confir.│ │ Comple.│ │ Cancel.│       │
│ [Salir]   │  └────────┘ └────────┘ └────────┘ └────────┘       │
│           │  ┌────────────────────────┐ ┌────────────────────┐ │
│           │  │ Citas por dependencia  │ │ Tendencia mensual  │ │
│           │  │  (gráfico barras)      │ │   (gráfico línea)  │ │
│           │  └────────────────────────┘ └────────────────────┘ │
│           │  ── pestaña "Gestionar Citas" ──                    │
│           │  [Filtro estado ▼] [+ Crear cita]                  │
│           │  Tabla: Aprendiz | Dep. | Fecha | Hora | Estado │   │
└───────────┴────────────────────────────────────────────────────┘

KPIs, gráficas (dependencia y tendencia mensual), tabla de profesionales,
gestión de citas (cambio de estado + creación a nombre de un aprendiz) y
exportación de reportes a CSV.
```

---

## 2.9. Panel de Administración — `/admin`

```
┌───────────┬────────────────────────────────────────────────────┐
│ SENA      │  Panel de Administración                           │
│ ➜ Admin   │  Gestiona usuarios, auditoría y configuración      │
│ ➜ Mi      │  [Usuarios] [Auditoría] [Configuración]           │
│   Perfil  │────────────────────────────────────────────────────│
│           │  USUARIOS:                                         │
│ Usuario   │  [Buscar...]                [+ Nuevo usuario]      │
│ [Salir]   │  ┌───────────────────────────────────────────────┐ │
│           │  │ Nombre     Email          Rol         Estado   │ │
│           │  │ Ana Pérez  ana@...        APRENDIZ    Activo   │ │
│           │  │ ...                                            │ │
│           │  └───────────────────────────────────────────────┘ │
│           │  ── AUDITORÍA: registro de acciones ──             │
│           │  ── CONFIGURACIÓN: en desarrollo ──                │
└───────────┴────────────────────────────────────────────────────┘

Pestañas: Usuarios (gestión de cuentas y roles), Auditoría (log de acciones)
y Configuración (placeholder).
```

---

## 2.10. Mi Perfil — `/profile`

```
┌───────────┬────────────────────────────────────────────────────┐
│ SENA      │  Mi Perfil                                         │
│ ➜ Mis     │  ┌─────────────────────────────────────────────┐   │
│   Citas   │  │ [avatar]  Nombre completo                   │   │
│ ➜ Mi      │  │           Rol · Email                       │   │
│   Perfil  │  └─────────────────────────────────────────────┘   │
│           │  Datos personales   [Editar]                       │
│           │  ─ Documento · Teléfono · Correo ─                 │
│ Usuario   │  Seguridad: cambiar contraseña                     │
│ [Salir]   │                                                    │
└───────────┴────────────────────────────────────────────────────┘

Accesible por todos los roles desde el menú lateral.
```

---

## 2.11. No autorizado — `/unauthorized` y 404

```
┌───────────────────────────────────────────────────────────────┐
│                      Acceso no autorizado                      │
│   No tienes permisos para ver esta página.                     │
│                    [ Volver al inicio ]                        │
└───────────────────────────────────────────────────────────────┘

404 — Página no encontrada (ruta por defecto `*`).
```

---

## 2.12. Estados de interfaz transversales

| Estado        | Descripción                                        | Ejemplo visual                                  |
|---------------|----------------------------------------------------|-------------------------------------------------|
| Cargando      | Skeleton / spinner mientras se obtienen datos      | `spinner`, tarjetas `skeleton` en dashboard     |
| Vacío         | Sin citas en la vista actual                       | icono + "No hay citas para mostrar"             |
| Error de API  | Alerta en pantalla o toast (sonner)                | banner con icono de alerta                      |
| Éxito         | Confirmación tras crear/cancelar/exportar          | toast de éxito, recarga de lista                |
| Sin permisos  | Redirect a `/unauthorized`                         | pantalla dedicada                               |

## 2.13. Componentes comunes reutilizados

- **Botones:** primario (verde SENA), secundario, ghost, bloque, con carga (`btn-loading`).
- **Formularios:** etiqueta, input/select/textarea con icono, estados `error`, mensajes de validación.
- **Tarjetas:** KPI, tarjeta de cita, tarjeta de servicio, tarjeta de perfil.
- **Badges de estado:** pendiente (ámbar), confirmada (azul), completada (verde), cancelada (rojo), no asistió (gris).
- **Tablas:** cabecera, filas con acciones, filtros por estado.
- **Modales:** overlay + tarjeta, cierre por ✕/Escape/clic fuera.
- **Pestañas:** `role=tablist`, navegables con flechas.
- **Gráficas:** barras (por dependencia) y líneas (tendencia mensual) — recharts.