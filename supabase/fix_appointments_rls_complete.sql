-- ============================================
-- FIX: Appointment RLS for all roles
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Limpiar policies viejas de appointments
DO $$ BEGIN DROP POLICY IF EXISTS "Users can view own appointments" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can create appointments" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Users can update own appointments" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Coordination can view all appointments" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Coordination can update all appointments" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_coord_admin_insert" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "allow_aprendiz_insert_own" ON appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 2. SELECT: Aprendiz ve sus propias citas
CREATE POLICY "aprendiz_select_own"
ON appointments FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 3. SELECT: Profesional ve todas las citas de su dependencia
CREATE POLICY "professional_select_dependency"
ON appointments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role_id IN (SELECT id FROM roles WHERE name IN ('PSICOLOGIA', 'ENFERMERIA', 'TRABAJO_SOCIAL'))
    AND dependency_id = appointments.dependency_id
  )
);

-- 4. SELECT: Coordinacion y Admin ven TODAS las citas
CREATE POLICY "admin_select_all"
ON appointments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role_id IN (SELECT id FROM roles WHERE name IN ('SUPERADMIN', 'COORDINACION'))
  )
);

-- 5. INSERT: Aprendiz crea sus propias citas
CREATE POLICY "aprendiz_insert_own"
ON appointments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 6. INSERT: Coordinacion y Admin pueden crear citas para cualquier usuario
CREATE POLICY "admin_insert_any"
ON appointments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role_id IN (SELECT id FROM roles WHERE name IN ('SUPERADMIN', 'COORDINACION'))
  )
);

-- 7. UPDATE: Profesional puede actualizar citas de su dependencia (confirmar, completar)
CREATE POLICY "professional_update_dependency"
ON appointments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role_id IN (SELECT id FROM roles WHERE name IN ('PSICOLOGIA', 'ENFERMERIA', 'TRABAJO_SOCIAL'))
    AND dependency_id = appointments.dependency_id
  )
);

-- 8. UPDATE: Aprendiz puede cancelar sus propias citas
CREATE POLICY "aprendiz_update_own"
ON appointments FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- 9. UPDATE: Coordinacion y Admin pueden actualizar cualquier cita
CREATE POLICY "admin_update_any"
ON appointments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role_id IN (SELECT id FROM roles WHERE name IN ('SUPERADMIN', 'COORDINACION'))
  )
);

-- Verificar policies creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'appointments'
ORDER BY policyname;
