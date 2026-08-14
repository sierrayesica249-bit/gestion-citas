# 1. Mapa de Navegación

Sistema de Gestión de Citas — Bienestar al Aprendiz (SPA, React Router).

## 1.1. Vista general del flujo

```
                    ┌──────────────────────────┐
                    │       / (raíz)           │
                    │   Redirige según rol     │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  ¿Usuario autenticado?   │
                    └───┬─────────────────┬────┘
              No        │                 │       Sí
                         │                 │
              ┌──────────▼───┐     ┌───────▼──────────────┐
              │   /login     │     │  Redirige a la vista │
              │  /register   │     │  de su rol (perfil)  │
              └──────────────┘     └───────────┬──────────┘
                                               │
        ┌───────────────┬───────────┬──────────┼──────────────┬──────────────┐
        ▼               ▼           ▼          ▼              ▼              ▼
   /dashboard      /psychology  /enfermeria /social-work /coordination    /admin
   (APRENDIZ)   (PSICOLOGIA)  (ENFERMERIA)(TRAB. SOCIAL)(COORDINACION) (SUPERADMIN)
        │               │           │          │              │              │
        └───────────────┴───────────┴──────────┴──────────────┴──────────────┘
                                      │
                              /profile (todos los roles)
```

## 1.2. Tabla de rutas

| Ruta               | Visibilidad | Rol(es) permitidos                         | Pantalla / módulo                       |
|--------------------|-------------|--------------------------------------------|-----------------------------------------|
| `/`                | Pública     | —                                          | Redirección según rol (`getHomeRoute`)  |
| `/login`           | Pública     | Invitado                                   | Iniciar sesión                          |
| `/register`        | Pública     | Invitado                                   | Registro de cuenta                      |
| `/unauthorized`    | Pública     | —                                          | Acceso no autorizado                    |
| `/dashboard`       | Privada     | APRENDIZ + profesionales + coordinación + admin | Dashboard del aprendiz (Mis citas) |
| `/professional`    | Privada     | PSICOLOGIA, ENFERMERIA, TRABAJO_SOCIAL     | Profesional genérico (Mis citas)        |
| `/psychology`      | Privada     | PSICOLOGIA                                 | Dashboard de Psicología                 |
| `/enfermeria`      | Privada     | ENFERMERIA                                 | Dashboard de Enfermería                 |
| `/social-work`     | Privada     | TRABAJO_SOCIAL                             | Dashboard de Trabajo Social             |
| `/coordination`    | Privada     | COORDINACION, SUPERADMIN                   | Dashboard de Coordinación               |
| `/coordinacion`    | Pública     | —                                          | Alias → redirige a `/coordination`      |
| `/admin`           | Privada     | SUPERADMIN, COORDINACION                   | Panel de administración                 |
| `/profile`         | Privada     | Todos los roles                            | Mi perfil                               |
| `*`                | Pública     | —                                          | 404 – Página no encontrada              |

> **Nota de seguridad:** todas las rutas privadas están envueltas por el componente
> `ProtectedRoute`, que verifica la sesión y el rol antes de renderizar el contenido.
> Si el rol no coincide se redirige a `/unauthorized`.

## 1.3. Redirección inicial por rol (`/`)

| Rol                     | Ruta destino |
|-------------------------|--------------|
| SUPERADMIN              | `/admin`     |
| COORDINACION            | `/coordination` |
| PSICOLOGIA              | `/psychology`   |
| ENFERMERIA              | `/enfermeria`   |
| TRABAJO_SOCIAL          | `/social-work`  |
| APRENDIZ (y otros)      | `/dashboard`    |

## 1.4. Menú lateral (Layout) según rol

```
┌───────────────────────────────────────────────┐
│  SENA · Bienestar                              │
├───────────────────────────────────────────────┤
│  SUPA → "/admin"            Usuarios  │ (admin)│
│  SUPCOOR → "/coordination"  Coordinación      │
│  (profesionales)                             │
│    PSI → "/psychology"      Psicología        │
│    ENF → "/enfermeria"      Enfermería        │
│    T.SOC → "/social-work"   Trabajo Social    │
│    (otro profesional) "/professional" Mis Citas│
│  (aprendiz por defecto) "/dashboard" Mis Citas│
│  TODOS → "/profile"         Mi Perfil         │
├───────────────────────────────────────────────┤
│  Usuario (avatar + nombre + rol)              │
│  [Salir] → signOut → /login                  │
└───────────────────────────────────────────────┘
```

Reglas del menú:
1. **Admin** ve: Administración, Mi Perfil.
2. **Coordinación** ve: Coordinación, Mi Perfil (+ Administración si es SUPERADMIN).
3. **Profesional** ve: la vista de su dependencia (Psicología/Enfermería/Trabajo Social) o Mis Citas (genérico), Mi Perfil.
4. **Aprendiz** ve: Mis Citas, Mi Perfil.

## 1.5. Flujos principales

### A. Autenticación

```
/ ──► /login ──► submit ──► ¿éxito? ──► sí: redirige a su rol
        │                                  │
        │ error o correo sin confirmar     └──► /dashboard | /psychology | /enfermeria |
        └──► muestra alerta / reenvío de       /social-work | /coordination | /admin
             confirmación
```

### B. Aprendiz — agendar cita

```
/dashboard ──► botón "Agendar cita" ──► modal "Solicitar Nueva Cita"
   ▲                    │
   │                    ├─ Dependencia (select)
   │                    ├─ Fecha (date) + Hora (select 08:00–16:00)
   │                    ├─ Motivo de consulta (textarea)
   │                    └─ "Solicitar Cita" ──► éxito ──► cierra modal y refresca lista
   │
   └── listado con pestañas: Próximas | Todas | Historial
```

### C. Aprendiz — cancelar cita

```
/dashboard ──► cita pendiente/confirmada ──► botón ✕ (cancelar) ──► estado = cancelled
```

### D. Coordinación — gestionar citas y reportes

```
/coordination ──► pestañas:
   ├─ Vista General   (KPIs, gráficas por dependencia, tendencia mensual)
   ├─ Gestionar Citas (filtro por estado, confirmar/cancelar/completar, crear cita)
   ├─ Profesionales   (tabla de profesionales y su carga)
   └─ Reportes        (exportar CSV del rango de fechas)
```

### E. Administración

```
/admin ──► pestañas:
   ├─ Usuarios   (CRUD de usuarios y asignación de roles)
   ├─ Auditoría  (registro de acciones del sistema)
   └─ Configuración (en desarrollo)
```

## 1.6. Mapa de estado de las citas

```
                    +--------+
      +────────────►│ pending │◄──────────────+
      │             +--------+                │
      │                │  confirmar           │  cancelar
      │                ▼                      │
   +─────+   confirmar  +-----------+         │
   │     │─────────────►│ confirmed │         │
   │     │              +-----------+         │
   │     │                  │                 │
   │     │   cancelar       │ completar       │
   │     │                  ▼                 │
   │     │              +-----------+         │
   │     │              │ completed │         │
   │     │              +-----------+         │
   │     │                  │ no asistió      │
   │     │                  ▼                 │
   │     │              +---------+           │
   └─────┼──────────────► no_show  │           │
         │              +---------+           │
         ▼                                    │
   +------------+   cancelar   +-------------+
   │ cancelled  │◄───────────────────────────┘
   +------------+
```

Estados: `pending` (pendiente), `confirmed` (confirmada), `completed` (completada),
`cancelled` (cancelada), `no_show` (no asistió).

## 1.7. Accesibilidad y responsividad

- En pantallas pequeñas la barra lateral se convierte en un menú desplegable (overlay) con botón de hamburguesa en la barra superior.
- Soporte de teclado: `Escape` cierra menú y modales; flechas navegan pestañas (`role=tablist`).
- Enlace "Saltar al contenido principal" para navegación por teclado.
- Contraste y foco visible manejados por los tokens de la guía de estilos.