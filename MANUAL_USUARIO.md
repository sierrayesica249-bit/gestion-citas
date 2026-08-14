# Manual de Usuario - SENA Bienestar

## Visión General
Esta aplicación permite a los usuarios de SENA Bienestar (Aprendices, Profesionales, Coordinadores y Administradores) gestionar citas, acceder a su perfil y visualizar dashboards personalizados según sus roles.

## Navegación Principal

### Layout de la Aplicación
El diseño utiliza una barra lateral izquierda colapsable (256px expandida, 64px colapsada) con etiqueta para iconos, un header superior con efecto glass y un área de contenido principal.

### Elementos del Sidebar
- **Brand:** Logo SENA + "Bienestar" con opción de colapso
- **Menú de navegación:** Dashboard, Citas, Perfil, Mi Perfil
- **Footer:** Avatar de usuario, nombre + rol, botón "Salir"

### Elementos del Topbar
- **Menú:** Botón hamburguesa para móvil (abre sidebar)
- **Título:** Muestra la página actual
- **Usuario:** Muestra nombre/email del usuario actual
- **Skip-to-content:** Enlace para navegación keyboard

## Roles y Accesos

### Aprendiz
- **Acceso:** "/dashboard" (Mis Citas)
- **Funcionalidades:** Ver y gestionar sus propias citas, agendar nuevas citas

### Profesional (Psicología/Trabajo Social/Enfermería)
- **Psicología:** "/psychology"
- **Trabajo Social:** "/social-work"
- **Enfermería/Mis Citas:** "/professional"
- **Funcionalidades:** Gestionar citas de aprendices asignados

### Coordinador
- **Acceso:** "/coordination"
- **Funcionalidades:** Ver KPIs de todo el equipo, horarios de profesionales, citas generales

### Administrador
- **Acceso:** "/admin"
- **Funcionalidades:** Gestionar usuarios, ver logs de auditoría, administración completa

## Guía de navegación paso a paso

### 1. Ingresar a la Aplicación
1. Diríjase a la página de inicio (/) 
2. Haga clic en "Iniciar Sesión"
3. Ingrese su email y contraseña
4. Opcional: Activar opción "Recordarme"
5. Haga clic en "Entrar"

### 2. Cerrar Sesión
1. Haga clic en su nombre/avatar en el sidebar
2. Opcional: Haga clic en la flecha/caret
3. Haga clic en "Salir" en el dropdown del perfil
4. Opcional: Confirme con el sistema si lo solicita

### 3. Navegar entre dashboards
**Desktop (sidebar expandido):**
- Haga clic en elementos del menú: Mis Citas, Psicología, Coordinación, Administración

**Mobile (sidebar off-canvas):**
- Haga clic en botón hamburguesa
- Deslice para navegar
- Haga clic en botón X para cerrar

### 4. Abrir Modal de Nueva Cita (Aprendiz)
1. Haga clic en el botón FAB "Nueva Cita" en la esquina inferior derecha (mobile) o en el header
2. Complete los pasos:
   - Paso 1: Seleccionar Dependencia
   - Paso 2: Seleccionar Fecha (con date picker visual)
   - Paso 3: Seleccionar Hora (slots seleccionables)
   - Paso 4: Confirmar detalles
3. Haga clic en "Confirmar" en el último paso
4. Verifique mensaje de éxito
5. Modal se cierra automáticamente o haga clic en "X"

### 5. Cancelar una Cita
1. En lista de citas, haga clic en cita para ver detalles
2. Haga clic en botón "Cancelar cita"
3. Sistema muestra modal de confirmación
4. Confirme con "Sí, cancelar"
5. Verifique mensaje de cancelación exitosa

### 6. Filtro de Citas (Aprendiz)
1. Haga clic en los tabs: "Todas", "Pendientes", "Completadas", "Canceladas"
2. Opcional: Use buscador para filtrar por nombre de profesional
3. Filtros se aplican instantáneamente

### 7. Ver Perfil de Usuario
1. Haga clic en "Mi Perfil" en el sidebar
2. Visualice y edite:
   - Información personal (nombre, email, teléfono)
   - Contraseña (cambiar con validación)
   - Foto de perfil (avatar con inicial + color por rol)

### 8. Accesibilidad Keyboard
- **Tab:** Navegar entre elementos interactivos
- **Enter/Space:** Activar botones seleccionados
- **Escape:** Cerrar modales, dropdowns, overlays
- **Alt + Skip:** Saltar al contenido principal

## Funcionalidades Especiales

### Modales con Focus Trap
Todos los modales tienen:
- **Focus trap:** Tab circula dentro del modal
- **Escape key:** Cierra el modal
- **X button:** Cerrar visible y accesible con aria-label
- **Overlay click:** Cerrar al hacer clic fuera del modal

### Loading States
- **Global:** Skeleton loading mientras se cargan datos
- **Botones:** Spinner visual en acciones de fondo
- **Forms:** Deshabilitado en submission, indicando proceso

### Empty States
- **Citas:** "No tienes citas agendadas" con botón "Agendar primera cita"
- **Tablas:** "No se encontraron resultados" con opción de limpiar filtros
- **Gráficas:** "No hay datos para este período" con indicador visual

## Responsive Design

### Desktop (>=1024px)
- Sidebar fijo (256px)
- KPIs: 4 por fila en grid
- Tablas: Visualización estándar
- Formulario: 2 columnas para campos

### Tablet (640-1023px)
- Sidebar colapsable (64px)
- KPIs: 2 por fila
- Tablas: Scroll horizontal o vista cards (mobile)
- Formulario: 1 columna

### Mobile (320-639px)
- Sidebar off-canvas con overlay
- KPIs: 2x2 grid
- Tablas: Cards apiladas
- Modales: Full-screen
- FAB: Botón flotante visible para acciones primarias

## Sesión de Uso Típica - Aprendiz

### Diario
1. **Login** (si es nuevo usuario)
2. **Dashboard de Aprendiz** (4 KPI cards)
3. **FILTROS:** Todas | Pendientes | Completadas | Canceladas
4. **AGENDAR NUEVA CITA:** FAB en esquina inferior derecha
5. **VISUALIZAR CITA:** Card con fecha, hora, profesional
6. **CANCELAR:** Modal de confirmación con foco trap
7. **VER PERFIL:** Actualizar información personal
8. **LOGOUT:** Desde menú superior derecho

### Ejemplo de Cancelación de Cita
```
1. Lista de citas desplegada
   └─ Card: Próxima cita - 15 de junio, 10:00 - Juan Pérez - Psicología

2. Hago clic en [Cancelar]
   └─ Modal de confirmación: "¿Estás seguro? Esta acción no se puede deshacer"

3. Hago clic en [Sí, cancelar]
   └─ Loading spinner en botón
   └─ Mensaje: "Cita cancelada exitosamente"
   └─ Cita desaparece de la lista
```

## Mensajes de Error y Notificación

### Error de Login
- **Campo vacío:** "Por favor ingrese su email"
- **Email inválido:** "Formato de email inválido"
- **Credenciales incorrectas:** "Email o contraseña incorrectos"
- **Muchos intentos:** "Demasiados intentos, intente en 5 minutos"

### Error de Formulario
- **Visible:** Icono de advertencia rojo + texto debajo del campo
- **ARIAdescripto:** "Error: Solo letras y espacios permitidos"
- **Inline:** No permitido (usar toast sonner)

### Toast Notifications
- **Éxito:** Checkmark verde + mensaje breve
- **Error:** X roja + mensaje explicativo
- **Advertencia:** Exclamación amarilla + mensaje de advertencia
- **Info:** Info azul + mensaje informativo

## Solución de Problemas

### No puedo ver el sidebar
- **Desktop:** Haga clic en botón hamburguesa en topbar
- **Mobile:** El sidebar está oculto por defecto, use el botón menú
- **Fallback:** Enlace "Saltar al contenido principal" arriba del sidebar

### La pantalla queda en loading
- **Esperar:** Loading máximo 30 segundos
- **Si continúa:** Refrescar página (Ctrl+F5)
- **Fallback:** Usar navegador diferente o modo incognito

### No puedo agendar cita
- **Form validation:** Asegurar todos campos llenos
- **Date picker:** Usar calenda visual o input
- **Time slots:** Seleccionar un slot disponible
- **Error general:** Usar botón "Limpiar formulario"

### El modal no se cierra
- **Escape key:** Presionar una vez
- **X button:** Hacer clic en botón cerrar
- **Overlay:** Hacer clic fuera del contenido del modal
- **F5:** Forzar re-render

### Problemas de responsive
- **Desktop:** Zoom al 100%, usar scroll horizontal si necesario
- **Tablet:** Rotar dispositivo o usar versión horizontal
- **Mobile:** Usar diseño de cards, no tabla

## Características de Accesibilidad

### Navegación Keyboard
- **Orden lógico:** Tab sigue de Login → Password → Entrar → Sidebar items
- **Skip link:** Alt+Skip para saltar al contenido
- **Focus ring:** Anillo verde SENA visible en todos inputs/botones

### ARIA Labels
- **Botones icon-only:** "Cerrar sesión", "Abrir menú", "Cerrar menú", "Enviar", etc.
- **Nav:** role="navigation" aria-label="Menú principal"
- **Modales:** role="dialog" aria-modal="true" aria-label="Agendar Cita"

### Color Contrast
- **Texto:** #171717 on #fafafa (WCAG AA)
- **Elementos UI:** --- 
- **Todos los botones:** Estado visual hover/focus/active con elevación/sombra

## Mejoras Futuras

Esta versión incluye:
- ✅ Design system completo con design tokens
- ✅ Componentes CSS reusables (6 estados para botones, cards, modals, etc.)
- ✅ Full responsive (320px+ con diseño mobile-first)
- ✅ Accesibilidad WCAG 2.2 AA (focus, aria, contrast, reduced motion)
- ✅ Dark mode como standard (opcional en este release)
- ✅ Skeleton loading en todas las vistas
- ✅ Empty states con CTA para cada rol

## Acrónimos

- **SENA:** Servicio Nacional de Aprendizaje
- **KPI:** Indicador Clave de Rendimiento
- **FAB:** Floating Action Button (móvil)
- **ARIA:** Accessible Rich Internet Applications
- **WCAG:** Web Content Accessibility Guidelines

## Contacto
Para bugs o mejoras:
1. Usar botón de "Reportar error" si está disponible
2. Contactar equipo de soporte técnico
3. Documentar con pasos para reproducir

## Glosario Visual

```
🟢 Estado: Disponible / success
🟡 Estado: Pendiente / warning
🔴 Estado: Cancelado / error
🔵 Acciones primarias: Botones en verde SENA
⚪ Fondo: #fafafa
⚫ Texto principal: #171717
🟤 Elementos secundarios: #404040
```

# Fin del Manual
