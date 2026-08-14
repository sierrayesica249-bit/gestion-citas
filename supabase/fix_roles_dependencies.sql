-- ============================================
-- FIX: Asignar rol y dependencia a usuarios
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. CORREGIR TRIGGER: ahora asigna rol APRENDIZ por defecto
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

-- 2. Reemplazar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Asegurar que roles existen
INSERT INTO roles (name, description) VALUES
  ('SUPERADMIN', 'Administrador del sistema'),
  ('COORDINACION', 'Coordinador de bienestar'),
  ('PSICOLOGIA', 'Profesional de psicologia'),
  ('ENFERMERIA', 'Profesional de enfermeria'),
  ('TRABAJO_SOCIAL', 'Profesional de trabajo social'),
  ('APRENDIZ', 'Aprendiz SENA')
ON CONFLICT (name) DO NOTHING;

-- 4. Asegurar que dependencias existen
INSERT INTO dependencies (name, color) VALUES
  ('Psicologia', '#8b5cf6'),
  ('Enfermeria', '#ef4444'),
  ('Trabajo Social', '#f59e0b'),
  ('Bienestar General', '#22c55e')
ON CONFLICT DO NOTHING;

-- 5. ASIGNAR ROL a usuarios que no tienen (role_id NULL)
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'APRENDIZ')
WHERE role_id IS NULL;

-- 6. ASIGNAR DEPENDENCIA a usuarios que no tienen (dependency_id NULL)
-- Asigna "Bienestar General" por defecto a los que no tengan dependencia
UPDATE profiles
SET dependency_id = (SELECT id FROM dependencies WHERE name = 'Bienestar General')
WHERE dependency_id IS NULL;

-- 7. Verificar resultado
SELECT 
  p.full_name,
  p.email,
  r.name AS rol,
  d.name AS dependencia
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
LEFT JOIN dependencies d ON p.dependency_id = d.id
ORDER BY p.created_at;
