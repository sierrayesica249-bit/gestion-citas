-- ============================================
-- FIX COMPLETO: Usuarios, Trigger, Perfiles
-- Ejecutar TODO en Supabase SQL Editor
-- ============================================

-- PASO 1: Arreglar el trigger (causa del error "Database error finding users")
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, document_number, email, is_active, role_id, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'document_number', ''),
    COALESCE(NEW.email, ''),
    true,
    (SELECT id FROM roles WHERE name = 'APRENDIZ'),
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 2: Asegurar que los roles existen
INSERT INTO roles (name, description, permissions) VALUES
  ('SUPERADMIN', 'Administrador del sistema', '{"all": true}'),
  ('COORDINACION', 'Coordinador de bienestar', '{"view_all": true, "manage_appointments": true}'),
  ('PSICOLOGIA', 'Profesional de psicologia', '{"view_own": true}'),
  ('ENFERMERIA', 'Profesional de enfermeria', '{"view_own": true}'),
  ('TRABAJO_SOCIAL', 'Profesional de trabajo social', '{"view_own": true}'),
  ('APRENDIZ', 'Aprendiz SENA', '{"view_own": true}')
ON CONFLICT (name) DO NOTHING;

-- PASO 3: Asegurar que las dependencias existen
INSERT INTO dependencies (name, color) VALUES
  ('Psicologia', '#8b5cf6'),
  ('Enfermeria', '#ef4444'),
  ('Trabajo Social', '#f59e0b'),
  ('Bienestar General', '#22c55e')
ON CONFLICT DO NOTHING;

-- PASO 4: Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- PASO 5: Limpiar y recrear policies de profiles
DROP POLICY IF EXISTS "Enable insert for authentication trigger" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Coordination can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Coordination can update all profiles" ON profiles;

CREATE POLICY "Enable insert for authentication trigger" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

CREATE POLICY "Coordination can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION'))
  );

CREATE POLICY "Coordination can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION'))
  );

-- PASO 6: Policies de appointments
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Coordination can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Coordination can update all appointments" ON appointments;

CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = professional_id);

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = professional_id);

CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name IN ('SUPERADMIN', 'COORDINACION')))
  );

CREATE POLICY "Coordination can update all appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION'))
  );

-- PASO 7: Policies de audit_logs
DROP POLICY IF EXISTS "Only SuperAdmin can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Coordination can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;

CREATE POLICY "Only SuperAdmin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

CREATE POLICY "Coordination can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'COORDINACION'))
  );

CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PASO 8: Policies de system_config
DROP POLICY IF EXISTS "Admins can view system_config" ON system_config;
DROP POLICY IF EXISTS "Admins can update system_config" ON system_config;

CREATE POLICY "Admins can view system_config" ON system_config
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

CREATE POLICY IF NOT EXISTS "Admins can update system_config" ON system_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'))
  );

-- PASO 9: Funcion RPC para dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(start_date DATE, end_date DATE)
RETURNS TABLE (total_appointments BIGINT, completed_appointments BIGINT, cancelled_appointments BIGINT, no_show_count BIGINT, avg_wait_days NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT AS completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')::BIGINT AS cancelled_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no_show')::BIGINT AS no_show_count,
    COALESCE(ROUND(AVG(CASE WHEN a.status = 'completed' THEN EXTRACT(EPOCH FROM (a.updated_at - a.created_at)) / 86400 ELSE NULL END)::NUMERIC, 1), 0) AS avg_wait_days
  FROM appointments a
  WHERE a.scheduled_date >= start_date AND a.scheduled_date <= end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_monthly_appointments(year_param INTEGER)
RETURNS TABLE (month TEXT, total BIGINT, completed BIGINT) AS $$
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

-- LISTO! Ahora ve a pestaña Authentication y ejecuta el PASO 10
