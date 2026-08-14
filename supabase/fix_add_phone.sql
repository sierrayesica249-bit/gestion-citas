-- Agregar campo teléfono a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
