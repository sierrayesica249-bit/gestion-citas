-- INSERTAR USUARIOS DE PRUEBA
-- Ejecutar en Supabase SQL Editor
-- Credenciales:
--   admin@senas.edu         / admin123  (SUPERADMIN)
--   coordinador@senas.edu   / admin123  (COORDINACION)
--   psicologia@senas.edu    / admin123  (PSICOLOGIA)
--   enfermeria@senas.edu    / admin123  (ENFERMERIA)
--   trabajosocial@senas.edu / admin123  (TRABAJO_SOCIAL)
--   aprendiz@senas.edu      / admin123  (APRENDIZ)

-- 1. SUPERADMIN
INSERT INTO profiles (id, full_name, document_number, email, is_active, role_id, dependency_id)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'admin@senas.edu' LIMIT 1),
   'Administrador SENA', '1000000001', 'admin@senas.edu', true,
   (SELECT id FROM roles WHERE name = 'SUPERADMIN'),
   (SELECT id FROM dependencies WHERE name = 'Bienestar General'))
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Administrador SENA',
  role_id = (SELECT id FROM roles WHERE name = 'SUPERADMIN'),
  dependency_id = (SELECT id FROM dependencies WHERE name = 'Bienestar General'),
  is_active = true;

-- 2. COORDINACION
INSERT INTO profiles (id, full_name, document_number, email, is_active, role_id, dependency_id)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'coordinador@senas.edu' LIMIT 1),
   'Coordinador Bienestar', '1000000002', 'coordinador@senas.edu', true,
   (SELECT id FROM roles WHERE name = 'COORDINACION'),
   (SELECT id FROM dependencies WHERE name = 'Bienestar General'))
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Coordinador Bienestar',
  role_id = (SELECT id FROM roles WHERE name = 'COORDINACION'),
  dependency_id = (SELECT id FROM dependencies WHERE name = 'Bienestar General'),
  is_active = true;

-- 3. PSICOLOGIA
INSERT INTO profiles (id, full_name, document_number, email, is_active, role_id, dependency_id)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'psicologia@senas.edu' LIMIT 1),
   'Psicologo SENA', '1000000003', 'psicologia@senas.edu', true,
   (SELECT id FROM roles WHERE name = 'PSICOLOGIA'),
   (SELECT id FROM dependencies WHERE name = 'Psicologia'))
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Psicologo SENA',
  role_id = (SELECT id FROM roles WHERE name = 'PSICOLOGIA'),
  dependency_id = (SELECT id FROM dependencies WHERE name = 'Psicologia'),
  is_active = true;

-- 4. ENFERMERIA
INSERT INTO profiles (id, full_name, document_number, email, is_active, role_id, dependency_id)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'enfermeria@senas.edu' LIMIT 1),
   'Enfermero SENA', '1000000004', 'enfermeria@senas.edu', true,
   (SELECT id FROM roles WHERE name = 'ENFERMERIA'),
   (SELECT id FROM dependencies WHERE name = 'Enfermeria'))
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Enfermero SENA',
  role_id = (SELECT id FROM roles WHERE name = 'ENFERMERIA'),
  dependency_id = (SELECT id FROM dependencies WHERE name = 'Enfermeria'),
  is_active = true;

-- 5. TRABAJO SOCIAL
INSERT INTO profiles (id, full_name, document_number, email, is_active, role_id, dependency_id)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'trabajosocial@senas.edu' LIMIT 1),
   'Trabajador Social SENA', '1000000005', 'trabajosocial@senas.edu', true,
   (SELECT id FROM roles WHERE name = 'TRABAJO_SOCIAL'),
   (SELECT id FROM dependencies WHERE name = 'Trabajo Social'))
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Trabajador Social SENA',
  role_id = (SELECT id FROM roles WHERE name = 'TRABAJO_SOCIAL'),
  dependency_id = (SELECT id FROM dependencies WHERE name = 'Trabajo Social'),
  is_active = true;

-- 6. APRENDIZ
INSERT INTO profiles (id, full_name, document_number, email, is_active, role_id, dependency_id)
VALUES
  ((SELECT id FROM auth.users WHERE email = 'aprendiz@senas.edu' LIMIT 1),
   'Aprendiz SENA', '1000000006', 'aprendiz@senas.edu', true,
   (SELECT id FROM roles WHERE name = 'APRENDIZ'),
   (SELECT id FROM dependencies WHERE name = 'Bienestar General'))
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Aprendiz SENA',
  role_id = (SELECT id FROM roles WHERE name = 'APRENDIZ'),
  dependency_id = (SELECT id FROM dependencies WHERE name = 'Bienestar General'),
  is_active = true;

-- Verificar usuarios creados
SELECT
  p.full_name,
  p.email,
  r.name AS rol,
  d.name AS dependencia
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
LEFT JOIN dependencies d ON p.dependency_id = d.id
WHERE p.email IN (
  'admin@senas.edu',
  'coordinador@senas.edu',
  'psicologia@senas.edu',
  'enfermeria@senas.edu',
  'trabajosocial@senas.edu',
  'aprendiz@senas.edu'
)
ORDER BY r.name;