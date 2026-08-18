-- ============================================
-- FIX: Agregar columnas Ficha y Programa a profiles
-- Ejecutar en Supabase SQL Editor
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ficha TEXT,
  ADD COLUMN IF NOT EXISTS programa TEXT;