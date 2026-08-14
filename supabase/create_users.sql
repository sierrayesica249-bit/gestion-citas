-- Crear usuarios del sistema SENA
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- Función para crear usuario con perfil
CREATE OR REPLACE FUNCTION create_sena_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role_name TEXT,
  p_document_number TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  role_id_val INTEGER;
  result JSON;
BEGIN
  -- Buscar el role_id
  SELECT id INTO role_id_val FROM roles WHERE name = p_role_name;
  IF role_id_val IS NULL THEN
    RAISE EXCEPTION 'Rol % no encontrado', p_role_name;
  END IF;

  -- Crear usuario en auth (esto requiere service_role, pero SECURITY DEFINER lo permite)
  new_user_id := gen_random_uuid();

  -- Insertar en profiles directamente (sin auth.users por seguridad)
  INSERT INTO profiles (id, email, full_name, role_id, document_number, is_active, created_at, updated_at)
  VALUES (new_user_id, p_email, p_full_name, role_id_val, p_document_number, true, NOW(), NOW())
  RETURNING to_json(profiles.*) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_sena_user TO authenticated;

-- =====================================================
-- CREAR USUARIOS (cambiar emails/contraseñas si necesitas)
-- =====================================================
-- NOTA: Estos usuarios solo se crean en la tabla profiles.
-- Para login, necesitan crear su cuenta desde /register
-- o desde el panel de Admin > Nuevo Usuario.

-- Si quieres crear los usuarios completos (auth + profile),
-- hazlo desde el panel de Admin con estos datos:

-- USUARIO 1: Coordinación
--   Nombre: Coordinador General
--   Email: coordinacion@sena.com
--   Contraseña: 123456
--   Rol: Coordinador de bienestar
--   Dependencia: (cualquiera)

-- USUARIO 2: Psicología
--   Nombre: Psicólogo SENA
--   Email: psicologia@sena.com
--   Contraseña: 123456
--   Rol: Profesional de psicología
--   Dependencia: Psicología

-- USUARIO 3: Trabajo Social
--   Nombre: Trabajo Social SENA
--   Email: trabajosocial@sena.com
--   Contraseña: 123456
--   Rol: Profesional de trabajo social
--   Dependencia: Trabajo Social

-- USUARIO 4: Enfermería
--   Nombre: Enfermera SENA
--   Email: enfermeria@sena.com
--   Contraseña: 123456
--   Rol: Profesional de enfermería
--   Dependencia: Enfermería
