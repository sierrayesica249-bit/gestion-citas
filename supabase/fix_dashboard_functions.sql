-- ============================================
-- FIX: Funciones RPC del Dashboard
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. KPIs generales
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_appointments BIGINT,
  completed_appointments BIGINT,
  cancelled_appointments BIGINT,
  no_show_count BIGINT,
  avg_wait_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT AS completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')::BIGINT AS cancelled_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no_show')::BIGINT AS no_show_count,
    COALESCE(
      ROUND(AVG(
        CASE WHEN a.status = 'completed'
          THEN EXTRACT(EPOCH FROM (a.updated_at - a.created_at)) / 86400
          ELSE NULL
        END
      )::NUMERIC, 1),
      0
    ) AS avg_wait_days
  FROM appointments a
  WHERE a.scheduled_date >= start_date
    AND a.scheduled_date <= end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Citas mensuales
CREATE OR REPLACE FUNCTION public.get_monthly_appointments(year_param INTEGER)
RETURNS TABLE (
  month TEXT,
  total BIGINT,
  completed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(a.scheduled_date, 'Mon') AS month,
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT AS completed
  FROM appointments a
  WHERE EXTRACT(YEAR FROM a.scheduled_date) = year_param
  GROUP BY TO_CHAR(a.scheduled_date, 'Mon'), EXTRACT(MONTH FROM a.scheduled_date)
  ORDER BY EXTRACT(MONTH FROM a.scheduled_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
