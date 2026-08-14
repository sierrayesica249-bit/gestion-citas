-- Fix: document_number unique constraint
-- 1. Ver duplicados
SELECT document_number, COUNT(*) as cnt, array_agg(id) as ids
FROM profiles 
WHERE document_number IS NOT NULL
GROUP BY document_number 
HAVING COUNT(*) > 1;

-- 2. Quitar constraint unique si existe
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_document_number_key;

-- 3. Actualizar datos de Yesica
UPDATE profiles
SET 
  full_name = 'Yesica Sierra',
  phone = '3247599549',
  document_number = '1124066554',
  updated_at = NOW()
WHERE email = 'sierrayesica249@gmail.com';
