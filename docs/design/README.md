# Fase de Diseño — Sistema de Gestión de Citas Bienestar al Aprendiz

> SENA · Aplicación web de gestión de citas para bienestar del aprendiz.
> Esta carpeta contiene los entregables de la **fase de diseño** del proyecto.

## Contenido

| # | Entregable | Archivo | Descripción |
|---|------------|---------|-------------|
| 1 | Mapa de navegación | [`01-mapa-de-navegacion.md`](./01-mapa-de-navegacion.md) | Estructura de rutas, flujos por rol y matriz de accesos. |
| 2 | Prototipos | [`02-prototipos.md`](./02-prototipos.md) | Wireframes (baja fidelidad) de cada pantalla y sus componentes. |
| 3 | Guía de estilos | [`03-guia-de-estilos.md`](./03-guia-de-estilos.md) | Tokens de diseño: color, tipografía, espaciado, sombras y componentes. |

## Alcance del sistema

Aplicación **web responsive (SPA)** para la gestión de citas de bienestar:

- **Aprendiz:** agenda, consulta y cancela sus propias citas.
- **Profesionales (Psicología, Enfermería, Trabajo Social):** gestionan las citas asignadas a su dependencia.
- **Coordinación:** visión general con indicadores, gestión de citas, profesionales y reportes.
- **Administración (Superadmin):** gestión de usuarios, auditoría y configuración.

## Arquitectura de referencia (técnica)

- **Frontend:** React + Vite (SPA), React Router, diseño basado en tokens (CSS custom properties).
- **Backend / BBDD:** Supabase (PostgreSQL) con autenticación y Row Level Security.
- **Roles:** `APRENDIZ`, `PSICOLOGIA`, `ENFERMERIA`, `TRABAJO_SOCIAL`, `COORDINACION`, `SUPERADMIN`.

## Glosario

- **Dependencia:** servicio de bienestar (Psicología, Enfermería, Trabajo Social).
- **Cita:** solicitud de atención con estado `pending` (pendiente), `confirmed` (confirmada), `completed` (completada), `cancelled` (cancelada) o `no_show` (no asistió).
