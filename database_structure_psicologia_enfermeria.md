# Base de Datos - Psicología y Enfermería

## General Structure

Este documento describe la estructura de la base de datos para las especialidades de **Psicología** y **Enfermería** en el sistema de gestión de citas del SENA Bienestar.

## Tablas Principales Relevantes para Psicología y Enfermería

### 1. Tabla `roles` - Roles del Sistema

```sql
table: roles
- id: BIGINT (PK) - Identificador único del rol
- name: TEXT (UNIQUE NOT NULL) - Nombre del rol (ej: 'PSICOLOGIA', 'ENFERMERIA')
- description: TEXT - Descripción del rol
- permissions: JSONB DEFAULT '[]'::jsonb - Permisos del rol
- created_at: TIMESTAMPTZ DEFAULT now()
```

**Datos Iniciales para Psicología y Enfermería:**
```sql
INSERT INTO roles (name, description) VALUES
  ('PSICOLOGIA', 'Profesional de psicología'),
  ('ENFERMERIA', 'Profesional de enfermería')
ON CONFLICT (name) DO NOTHING;
```

### 2. Tabla `dependencies` - Especialidades/Dependencias

```sql
table: dependencies
- id: BIGINT (PK) - Identificador único
- name: TEXT NOT NULL - Nombre de la dependencia (ej: 'Psicologia', 'Enfermeria')
- color: TEXT DEFAULT '#3b82f6' - Color para UI
- created_at: TIMESTAMPTZ DEFAULT now()
```

**Datos Iniciales:**
```sql
INSERT INTO dependencies (name, color) VALUES
  ('Psicologia', '#8b5cf6'),
  ('Enfermeria', '#ef4444')
ON CONFLICT DO NOTHING;
```

### 3. Tabla `profiles` - Perfiles de Usuarios

```sql
table: profiles
- id: UUID (PK) - ID del usuario en auth.users
- full_name: TEXT - Nombre completo
- document_number: TEXT - Número de documento
- email: TEXT - Correo electrónico
- is_active: BOOLEAN DEFAULT true - Estado de la cuenta
- role_id: BIGINT REFERENCES roles(id) - Rol del usuario
- dependency_id: BIGINT REFERENCES dependencies(id) - Dependencia asignada
- created_at: TIMESTAMPTZ DEFAULT now()
- updated_at: TIMESTAMPTZ DEFAULT now()
```

**RLS Policies:**
- `Users can view own profile` - Los usuarios ven solo su perfil
- `Users can update own profile` - Los usuarios actualizan solo su perfil

### 4. Tabla `appointments` - Citas

```sql
table: appointments
- id: BIGINT (PK) - Identificador único
- user_id: UUID REFERENCES profiles(id) - Aprendiz que solicita cita
- dependency_id: BIGINT REFERENCES dependencies(id) - Dependencia asignada
- professional_id: UUID REFERENCES profiles(id) - Profesional asignado
- scheduled_date: DATE NOT NULL - Fecha de la cita
- scheduled_time: TIME NOT NULL - Hora de la cita
- reason: TEXT - Motivo de consulta
- notes: TEXT - Notas del profesional
- status: TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'))
- created_at: TIMESTAMPTZ DEFAULT now()
- updated_at: TIMESTAMPTZ DEFAULT now()
```

**RLS Policies:**
- `Users can view own appointments` - Los usuarios ven sus propias citas
- `Users can create appointments` - Los usuarios crean citas para sí mismos
- `Users can update own appointments` - Los usuarios actualizan sus citas

## Especialidades/Módulos Específicos

### Módulo de Psicología

Los profesionales de Psicología tienen:
- `role_id` = (SELECT id FROM roles WHERE name = 'PSICOLOGIA')
- `dependency_id` = (SELECT id FROM dependencies WHERE name = 'Psicologia')

**Columnas Especiales (Aplicación Frontend):**
- `notes` - Notas de sesión terapéutica
- `reason` - Motivo de consulta psicológica
- `status` - Estados: 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'

**Modelo de Datos Clínicos:**
```sql
-- Pacientes con estadísticas de sesiones
CREATE OR REPLACE VIEW psychology_patients AS
SELECT 
  p.id,
  p.full_name,
  p.document_number,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_appointments,
  MAX(a.scheduled_date) as last_appointment_date
FROM profiles p
LEFT JOIN appointments a ON p.id = a.user_id
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'PSICOLOGIA')
GROUP BY p.id;
```

### Módulo de Enfermería

Los profesionales de Enfermería tienen:
- `role_id` = (SELECT id FROM roles WHERE name = 'ENFERMERIA')
- `dependency_id` = (SELECT id FROM dependencies WHERE name = 'Enfermeria')

**Columnas Especiales (Aplicación Frontend):**
- `notes` - Notas clínicas/nombre de procedimientos
- `reason` - Motivo de consulta de enfermería
- `status` - Estados: 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'

**Modelo de Datos Clínicos:**
```sql
-- Pacientes con seguimiento de cuidados
CREATE OR REPLACE VIEW nursing_patients AS
SELECT 
  p.id,
  p.full_name,
  p.document_number,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_appointments,
  MAX(a.scheduled_date) as last_appointment_date,
  -- Calcular prioridad basada en citas pendientes
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count
FROM profiles p
LEFT JOIN appointments a ON p.id = a.user_id
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'ENFERMERIA')
GROUP BY p.id;
```

## Vistas de Dashboard Específicas

### Vistas del Dashboard de Psicología

```sql
CREATE OR REPLACE VIEW psychology_dashboard AS
SELECT 
  'PSICOLOGIA' as specialty,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_appointments,
  COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  ROUND(
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) * 100.0 /
    NULLIF(COUNT(*), 0)
  ) as completion_rate,
  COUNT(DISTINCT a.user_id) as unique_patients
FROM appointments a
JOIN profiles p ON a.professional_id = p.id
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'PSICOLOGIA')
  AND a.status IN ('pending', 'confirmed', 'completed');
```

### Vistas del Dashboard de Enfermería

```sql
CREATE OR REPLACE VIEW nursing_dashboard AS
SELECT 
  'ENFERMERIA' as specialty,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_appointments,
  COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
  ROUND(
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) * 100.0 /
    NULLIF(COUNT(*), 0)
  ) as completion_rate,
  COUNT(DISTINCT a.user_id) as unique_patients,
  -- Prioridad: pacientes con muchas citas pendientes
  COUNT(CASE WHEN pending_patients > 2 THEN 1 END) as high_priority_patients
FROM appointments a
JOIN profiles p ON a.professional_id = p.id
LEFT JOIN (
  SELECT user_id, COUNT(*) as pending_patients
  FROM appointments
  WHERE status = 'pending'
  GROUP BY user_id
) patient_stats ON a.user_id = patient_stats.user_id
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'ENFERMERIA')
  AND a.status IN ('pending', 'confirmed', 'completed')
GROUP BY a.professional_id;
```

## Funciones RPC Específicas

### create_appointment - Crear Cita para Psicología/Enfermería

```sql
CREATE OR REPLACE FUNCTION public.create_appointment(
  p_user_id UUID,
  p_dependency_id BIGINT,
  p_scheduled_date DATE,
  p_scheduled_time TIME,
  p_reason TEXT
)
RETURNS UUID AS $$
BEGIN
  INSERT INTO appointments (
    user_id, 
    dependency_id, 
    scheduled_date, 
    scheduled_time, 
    reason,
    status
  ) VALUES (
    p_user_id,
    p_dependency_id,
    p_scheduled_date,
    p_scheduled_time,
    p_reason,
    'pending'
  )
  RETURNING id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Índices Recomendados

```sql
-- Índices para optimización del dashboard
CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_status ON appointments(professional_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_user_status ON appointments(user_id, status);

-- Índices para vistas del dashboard
CREATE INDEX IF NOT EXISTS idx_psychology_dashboard ON psychology_dashboard USING btree (specialty);
CREATE INDEX IF NOT EXISTS idx_nursing_dashboard ON nursing_dashboard USING btree (specialty);
```

## Flujo de Datos por Especialidad

### Psicología
1. **Usuario (Aprendiz)** solicita cita → `appointments` (status: 'pending')
2. **Profesional de Psicología** asigna → `appointments.professional_id`
3. **Profesional** confirma cita → `appointments.status` = 'confirmed'
4. **Profesional** completa sesión → `appointments.status` = 'completed', agrega `notes`
5. **Dashboard** muestra estadísticas de sesiones y pacientes

### Enfermería
1. **Usuario (Aprendiz)** solicita cita → `appointments` (status: 'pending')
2. **Profesional de Enfermería** asigna → `appointments.professional_id`
3. **Profesional** atiende cita → `appointments.status` = 'confirmed'
4. **Profesional** completa atención → `appointments.status` = 'completed', agrega `notes`
5. **Dashboard** muestra seguimiento de prioridades y estado de atención

## Consultas Comunes por Especialidad

### 1. Obtener próximas citas para Psicología
```sql
SELECT 
  a.id,
  a.scheduled_date,
  a.scheduled_time,
  a.reason,
  p.full_name as patient_name,
  p.document_number
FROM appointments a
JOIN profiles p ON a.user_id = p.id
WHERE a.professional_id = :psychology_professional_id
  AND a.status = 'confirmed'
  AND a.scheduled_date >= CURRENT_DATE
ORDER BY a.scheduled_date, a.scheduled_time;
```

### 2. Obtener pacientes de alto riesgo para Enfermería
```sql
WITH patient_pending_counts AS (
  SELECT 
    user_id,
    COUNT(*) as pending_count,
    COUNT(CASE WHEN scheduled_date < CURRENT_DATE THEN 1 END) as overdue_count
  FROM appointments
  WHERE status = 'pending'
  GROUP BY user_id
)
SELECT 
  p.id,
  p.full_name,
  p.document_number,
  COALESCE(ppc.pending_count, 0) as pending_appointments,
  COALESCE(ppc.overdue_count, 0) as overdue_appointments,
  CASE 
    WHEN COALESCE(ppc.pending_count, 0) >= 3 THEN 'urgente'
    WHEN COALESCE(ppc.pending_count, 0) >= 1 THEN 'seguimiento'
    ELSE 'control'
  END as priority
FROM profiles p
LEFT JOIN patient_pending_counts ppc ON p.id = ppc.user_id
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'ENFERMERIA')
ORDER BY 
  (CASE WHEN COALESCE(ppc.pending_count, 0) >= 3 THEN 0
        WHEN COALESCE(ppc.pending_count, 0) >= 1 THEN 1
        ELSE 2 END),
  p.full_name;
```

### 3. Obtener estadísticas mensuales para Psicología
```sql
SELECT 
  TO_CHAR(a.scheduled_date, 'Mon') as month,
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) as confirmed,
  ROUND(
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) * 100.0 /
    NULLIF(COUNT(*), 0)
  ) as completion_rate,
  EXTRACT(MONTH FROM a.scheduled_date) as month_num
FROM appointments a
JOIN profiles p ON a.professional_id = p.id
WHERE p.role_id = (SELECT id FROM roles WHERE name = 'PSICOLOGIA')
  AND a.scheduled_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY EXTRACT(MONTH FROM a.scheduled_date), TO_CHAR(a.scheduled_date, 'Mon')
ORDER BY month_num;
```

## Migración Específica para Psicología y Enfermería

### Script de Migración Completo

```sql
-- Primero ejecutar schema base (001_initial_schema.sql)
-- Luego ejecutar este script para agregar funcionalidad específica:

-- 1. Agregar función para verificar si un usuario es psicólogo/enfermero
CREATE OR REPLACE FUNCTION public.is_psychology_professional(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
      AND role_id = (SELECT id FROM roles WHERE name = 'PSICOLOGIA')
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Agregar función para verificar si un usuario es enfermero
CREATE OR REPLACE FUNCTION public.is_nursing_professional(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
      AND role_id = (SELECT id FROM roles WHERE name = 'ENFERMERIA')
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Agregar trigger para validar roles específicos
CREATE OR REPLACE FUNCTION public.validate_specialty_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que un usuario con rol PSICOLOGIA tenga dependencia Psicologia
  IF NEW.role_id = (SELECT id FROM roles WHERE name = 'PSICOLOGIA') 
     AND NEW.dependency_id IS DISTINCT FROM (SELECT id FROM dependencies WHERE name = 'Psicologia') THEN
    RAISE EXCEPTION 'Los psicólogos deben estar asignados a la dependencia Psicologia';
  END IF;

  -- Validar que un usuario con rol ENFERMERIA tenga dependencia Enfermeria  
  IF NEW.role_id = (SELECT id FROM roles WHERE name = 'ENFERMERIA')
     AND NEW.dependency_id IS DISTINCT FROM (SELECT id FROM dependencies WHERE name = 'Enfermeria') THEN
    RAISE EXCEPTION 'Los enfermeros deben estar asignados a la dependencia Enfermeria';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_specialty_roles ON profiles;
CREATE TRIGGER trigger_validate_specialty_roles
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_specialty_roles();
```

## Resumen del Modelo de Datos

| Entidad | Psicología | Enfermería | Campos Especiales |
|--------|------------|------------|------------------|
| **roles** | 'PSICOLOGIA' | 'ENFERMERIA' | name, description |
| **dependencies** | 'Psicologia', '#8b5cf6' | 'Enfermeria', '#ef4444' | name, color |
| **profiles** | role_id + dependency_id | role_id + dependency_id | full_name, document_number, email |
| **appointments** | Todas las columnas | Todas las columnas | reason, notes, status |

## Requisitos de Consulta Específica

### Para Psicología:
1. Verificar si un usuario es psicólogo profesional
2. Obtener todas las citas asignadas a un psicólogo específico
3. Obtener estadísticas de sesiones por paciente
4. Filtrar citas por estado ('pending', 'confirmed', 'completed', 'no_show')

### Para Enfermería:
1. Verificar si un usuario es enfermero profesional
2. Obtener todas las citas asignadas a un enfermero específico
3. Obtener seguimiento de prioridad de pacientes
4. Obtener tiempo promedio de atención y tasa de éxito

## Documentación de API Específica por Especialidad

### Endpoints Psicología (Frontend: PsicologiaDashboard.jsx)

- `GET /api/appointments?professional_id=:id&status=pending` - Obtener citas pendientes
- `PATCH /api/appointments/:id` - Confirmar cita
- `POST /api/appointments/:id/notes` - Guardar notas de sesión
- `GET /api/dashboard/psychology` - Obtener estadísticas del dashboard

### Endpoints Enfermería (Frontend: EnfermeriaDashboard.jsx)

- `GET /api/appointments?professional_id=:id&status=confirmed` - Obtener citas activas
- `PATCH /api/appointments/:id` - Completar atención
- `POST /api/appointments/:id/notes` - Guardar notas clínicas
- `GET /api/dashboard/nursing` - Obtener estadísticas del dashboard

## Este esquema proporciona:

✅ Estructura completa para Psicología y Enfermería
✅ Vistas específicas para el dashboard por especialidad  
✅ Funciones RPC para operaciones específicas
✅ RLS policies para seguridad por rol
✅ Índices para optimización del rendimiento
✅ Triggers para validación de roles
✅ Consultas comunes predefinidas
✅ Migración lista para implementar

**Nota:** El frontend (React) para cada especialidad está estructurado con componentes específicos que aprovechan estas vistas y funciones del backend.
