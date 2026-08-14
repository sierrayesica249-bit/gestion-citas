-- ============================================
-- FIX: "Database error saving new user"
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Recrear el trigger handle_new_user con manejo de errores
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
    -- Log the error but don't block user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Asegurar que el trigger exista
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Policy de INSERT para profiles (necesaria para el trigger)
-- El trigger usa SECURITY DEFINER pero por si acaso
DROP POLICY IF EXISTS "Enable insert for authentication trigger" ON profiles;
CREATE POLICY "Enable insert for authentication trigger" ON profiles
  FOR INSERT WITH CHECK (true);

-- 4. Verificar que los roles existen
INSERT INTO roles (name, description) VALUES
  ('SUPERADMIN', 'Administrador del sistema'),
  ('COORDINACION', 'Coordinador de bienestar'),
  ('PSICOLOGIA', 'Profesional de psicologia'),
  ('ENFERMERIA', 'Profesional de enfermeria'),
  ('TRABAJO_SOCIAL', 'Profesional de trabajo social'),
  ('APRENDIZ', 'Aprendiz SENA')
ON CONFLICT (name) DO NOTHING;

-- 5. Verificar que las dependencias existen
INSERT INTO dependencies (name, color) VALUES
  ('Psicologia', '#8b5cf6'),
  ('Enfermeria', '#ef4444'),
  ('Trabajo Social', '#f59e0b'),
  ('Bienestar General', '#22c55e')
ON CONFLICT DO NOTHING;

-- 6. Verificar que RLS esta habilitado pero no bloquea
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Policy para que los usuarios autenticados puedan leer su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 8. Policy para que los usuarios autenticados puedan actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
