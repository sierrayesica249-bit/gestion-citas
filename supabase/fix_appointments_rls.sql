-- Fix RLS para que coordinadores puedan crear citas
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- Eliminar políticas viejas
DO $$ BEGIN
  DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Coordinators can insert appointments" ON appointments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON appointments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Coordinators and admins can insert appointments" ON appointments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Aprendices can insert own appointments" ON appointments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Política: coordinadores y admin pueden crear citas para cualquier usuario
CREATE POLICY "allow_coord_admin_insert"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    JOIN roles ON roles.id = profiles.role_id
    WHERE profiles.id = auth.uid()
    AND roles.name IN ('COORDINACION', 'SUPERADMIN')
  )
);

-- Política: aprendices pueden crear sus propias citas
CREATE POLICY "allow_aprendiz_insert_own"
ON appointments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles
    JOIN roles ON roles.id = profiles.role_id
    WHERE profiles.id = auth.uid()
    AND roles.name = 'APRENDIZ'
  )
);
