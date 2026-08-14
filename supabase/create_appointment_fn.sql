DROP FUNCTION IF EXISTS create_appointment(UUID, INTEGER, DATE, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_appointment(
  p_user_id UUID,
  p_dependency_id INTEGER,
  p_scheduled_date DATE,
  p_scheduled_time TEXT,
  p_reason TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending'
)
RETURNS JSON AS $$
DECLARE
  new_appointment JSON;
BEGIN
  INSERT INTO appointments (user_id, dependency_id, scheduled_date, scheduled_time, reason, status, created_at, updated_at)
  VALUES (
    p_user_id,
    p_dependency_id,
    p_scheduled_date,
    p_scheduled_time::TIME,
    p_reason,
    p_status::appointment_status,
    NOW(),
    NOW()
  )
  RETURNING to_json(appointments.*) INTO new_appointment;
  RETURN new_appointment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_appointment TO authenticated;
