-- ============================================
-- HABILITAR REALTIME PARA LA TABLA appointments
-- Permite que las notificaciones de la campana
-- lleguen en tiempo real cuando se agenda una cita.
-- ============================================

-- Asegurar que el payload de realtime incluya la fila completa
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

-- Agregar la tabla a la publicacion de realtime (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
  END IF;
END
$$;

-- Politica para que los profesionales vean citas de su dependencia
-- (necesaria para que reciban notificaciones en tiempo real)
DROP POLICY IF EXISTS "Professionals can view dependency appointments" ON public.appointments;

CREATE POLICY "Professionals can view dependency appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role_id = (SELECT id FROM roles WHERE name IN ('PSICOLOGIA', 'ENFERMERIA', 'TRABAJO_SOCIAL'))
        AND p.dependency_id = appointments.dependency_id
    )
  );