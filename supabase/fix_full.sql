-- ============================================
-- FIX COMPLETO: Schema + RLS + Triggers
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. TRIGGER: Crear perfil automaticamente (versión corregida)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, document_number, email, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'document_number', ''),
    COALESCE(NEW.email, ''),
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Asegurar que roles existen
INSERT INTO roles (name, description) VALUES
  ('SUPERADMIN', 'Administrador del sistema'),
  ('COORDINACION', 'Coordinador de bienestar'),
  ('PSICOLOGIA', 'Profesional de psicologia'),
  ('ENFERMERIA', 'Profesional de enfermeria'),
  ('TRABAJO_SOCIAL', 'Profesional de trabajo social'),
  ('APRENDIZ', 'Aprendiz SENA')
ON CONFLICT (name) DO NOTHING;

-- 3. Asegurar que dependencias existen
INSERT INTO dependencies (name, color) VALUES
  ('Psicologia', '#8b5cf6'),
  ('Enfermeria', '#ef4444'),
  ('Trabajo Social', '#f59e0b'),
  ('Bienestar General', '#22c55e')
ON CONFLICT DO NOTHING;

-- 4. RLS: Habilitar en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 5. Limpiar policies viejas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication trigger" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Coordination can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Coordination can update all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Coordination can view all appointments" ON appointments;

DROP POLICY IF EXISTS "Only SuperAdmin can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Coordination can view audit logs" ON audit_logs;

DROP POLICY IF EXISTS "Admins can view system_config" ON system_config;
DROP POLICY IF EXISTS "Admins can update system_config" ON system_config;

-- 6. POLICIES: PROFILES
-- Trigger puede insertar
CREATE POLICY "Enable insert for authentication trigger" ON profiles
  FOR INSERT WITH CHECK (true);

-- Usuarios ven su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuarios actualizan su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- SUPERADMIN ve todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN')
    )
  );

-- SUPERADMIN actualiza todos los perfiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN')
    )
  );

-- COORDINACION ve todos los perfiles
CREATE POLICY "Coordination can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION')
    )
  );

-- COORDINACION actualiza perfiles (para asignar dependencias)
CREATE POLICY "Coordination can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION')
    )
  );

-- 7. POLICIES: APPOINTMENTS
-- Usuarios ven sus propias citas
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() = professional_id
  );

-- Usuarios crean sus propias citas
CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuarios actualizan sus propias citas
CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (
    auth.uid() = user_id
    OR auth.uid() = professional_id
  );

-- SUPERADMIN y COORDINACION ven todas las citas
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id IN (
        SELECT id FROM roles
        WHERE name IN ('SUPERADMIN', 'COORDINACION')
      )
    )
  );

-- COORDINACION puede actualizar citas (asignar profesionales)
CREATE POLICY "Coordination can update all appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION')
    )
  );

-- 8. POLICIES: AUDIT_LOGS
-- SUPERADMIN ve todos los logs
CREATE POLICY "Only SuperAdmin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN')
    )
  );

-- COORDINACION ve logs de auditoría
CREATE POLICY "Coordination can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION')
    )
  );

-- Cualquier usuario autenticado puede insertar logs (para el trigger de auditoría)
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. POLICIES: SYSTEM_CONFIG
-- SUPERADMIN ve y actualiza configuración
CREATE POLICY "Admins can view system_config" ON system_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN')
    )
  );

CREATE POLICY "Admins can update system_config" ON system_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN')
    )
  );

-- 10. RPC FUNCTIONS (si no existen)
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
