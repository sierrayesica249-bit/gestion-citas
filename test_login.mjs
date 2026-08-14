import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwxpwfbokqtgstteyaao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDE2NDYsImV4cCI6MjA5MzQ3NzY0Nn0.FRWF-Knri2oXX6RMrFKWfo_OB07AuAOqt0Qoiob9c0k';

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  { email: 'admin@senas.edu', password: 'admin123' },
  { email: 'coordinador@senas.edu', password: 'admin123' },
  { email: 'psicologia@senas.edu', password: 'admin123' },
  { email: 'enfermeria@senas.edu', password: 'admin123' },
  { email: 'trabajosocial@senas.edu', password: 'admin123' },
  { email: 'aprendiz@senas.edu', password: 'admin123' },
];

async function main() {
  console.log('=== Probando login con credenciales ===\n');

  for (const u of users) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: u.password,
    });

    if (error) {
      console.log(`FAIL  ${u.email}: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`OK    ${u.email}: userId=${data.user.id}`);

      // Also check profile
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, role_id, is_active')
        .eq('id', data.user.id)
        .single();

      if (pErr) {
        console.log(`      Profile: ERROR - ${pErr.message}`);
      } else {
        console.log(`      Profile: ${profile.full_name} (role_id=${profile.role_id}, active=${profile.is_active})`);
      }

      await supabase.auth.signOut();
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
