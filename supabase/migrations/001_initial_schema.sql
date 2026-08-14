-- ============================================
-- GESTION DE CITAS SENA BIENESTAR
-- Script completo - Ejecutar en SQL Editor
-- ============================================

-- Limpiar politique viejas si existen
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Only SuperAdmin can view audit logs" ON audit_logs;

-- 1. TABLA DE ROLES
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA DE DEPENDENCIAS
CREATE TABLE IF NOT EXISTS dependencies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  document_number TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  role_id BIGINT REFERENCES roles(id),
  dependency_id BIGINT REFERENCES dependencies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA DE CITAS
CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dependency_id BIGINT REFERENCES dependencies(id),
  professional_id UUID REFERENCES profiles(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  reason TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABLA DE AUDITORIA (con ip_address INET)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para busquedas rapidas
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);

-- 6. TABLA DE CONFIGURACION (con value JSONB)
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGER: Crear perfil automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, document_number, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'document_number', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DATOS INICIALES
-- ============================================
INSERT INTO roles (name, description) VALUES
  ('SUPERADMIN', 'Administrador del sistema'),
  ('COORDINACION', 'Coordinador de bienestar'),
  ('PSICOLOGIA', 'Profesional de psicologia'),
  ('ENFERMERIA', 'Profesional de enfermeria'),
  ('TRABAJO_SOCIAL', 'Profesional de trabajo social'),
  ('APRENDIZ', 'Aprendiz SENA')
ON CONFLICT (name) DO NOTHING;

INSERT INTO dependencies (name, color) VALUES
  ('Psicologia', '#8b5cf6'),
  ('Enfermeria', '#ef4444'),
  ('Trabajo Social', '#f59e0b'),
  ('Bienestar General', '#22c55e')
ON CONFLICT DO NOTHING;

-- Configuracion inicial
INSERT INTO system_config (key, value, description) VALUES
  ('appointment_limits', '{"max_pending_per_user": 2, "max_advance_days": 30, "min_advance_hours": 24}', 'Limites de agendamiento'),
  ('working_hours', '{"start":"08:00", "end":"17:00", "days":[1,2,3,4,5]}', 'Horario de atencion'),
  ('notification_settings', '{"reminder_hours_before": 24, "enabled": true}', 'Configuracion de notificaciones')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Politicas
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = professional_id);

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = professional_id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name IN ('SUPERADMIN', 'COORDINACION')))
  );

CREATE POLICY "Only SuperAdmin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

-- ============================================
-- RPC FUNCTIONS para Dashboard
-- ============================================

-- KPIs generales del dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_appointments BIGINT,
  completed_appointments BIGINT,
  cancelled_appointments BIGINT,
  no_show_count BIGINT,
  avg_wait_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT AS completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')::BIGINT AS cancelled_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no_show')::BIGINT AS no_show_count,
    COALESCE(
      ROUND(AVG(
        CASE WHEN a.status = 'completed'
          THEN EXTRACT(EPOCH FROM (a.updated_at - a.created_at)) / 86400
          ELSE NULL
        END
      )::NUMERIC, 1),
      0
    ) AS avg_wait_days
  FROM appointments a
  WHERE a.scheduled_date >= start_date
    AND a.scheduled_date <= end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Citas mensuales para grafico de tendencia
CREATE OR REPLACE FUNCTION public.get_monthly_appointments(year_param INTEGER)
RETURNS TABLE (
  month TEXT,
  total BIGINT,
  completed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(a.scheduled_date, 'Mon') AS month,
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT AS completed
  FROM appointments a
  WHERE EXTRACT(YEAR FROM a.scheduled_date) = year_param
  GROUP BY TO_CHAR(a.scheduled_date, 'Mon'), EXTRACT(MONTH FROM a.scheduled_date)
  ORDER BY EXTRACT(MONTH FROM a.scheduled_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
