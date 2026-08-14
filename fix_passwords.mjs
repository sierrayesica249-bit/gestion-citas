import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwxpwfbokqtgstteyaao.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwMTY0NiwiZXhwIjoyMDkzNDc3NjQ2fQ.lEnqcz4ha-DDGWJ7PkNtmCJu_pw9TspAlGFlyZ2ixk0';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDE2NDYsImV4cCI6MjA5MzQ3NzY0Nn0.FRWF-Knri2oXX6RMrFKWfo_OB07AuAOqt0Qoiob9c0k';

// Service role client for admin operations (bypasses RLS)
const svcClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Anon client for login testing
const anonClient = createClient(supabaseUrl, anonKey);

const users = [
  { email: 'admin@senas.edu', password: 'admin123', full_name: 'Administrador SENA' },
  { email: 'coordinador@senas.edu', password: 'admin123', full_name: 'Coordinador Bienestar' },
  { email: 'psicologia@senas.edu', password: 'admin123', full_name: 'Psicologo SENA' },
  { email: 'enfermeria@senas.edu', password: 'admin123', full_name: 'Enfermero SENA' },
  { email: 'trabajosocial@senas.edu', password: 'admin123', full_name: 'Trabajador Social SENA' },
  { email: 'aprendiz@senas.edu', password: 'admin123', full_name: 'Aprendiz SENA' },
];

async function main() {
  console.log('=== Fix passwords (v4) ===\n');

  // 1. Get profiles with service_role (bypasses RLS)
  const { data: profiles, error: profErr } = await svcClient
    .from('profiles')
    .select('id, email, full_name');

  if (profErr) {
    console.error('Error profiles:', profErr.message);
    process.exit(1);
  }

  console.log(`Profiles: ${profiles.length}`);
  profiles.forEach(p => console.log(`  ${p.email}: ${p.id}`));

  // 2. Update passwords via REST admin API
  console.log('\n--- Updating passwords ---\n');

  for (const u of users) {
    const profile = profiles.find(p => p.email === u.email);
    if (!profile) {
      console.log(`SKIP  ${u.email}: no profile`);
      continue;
    }

    const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users/${profile.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name }
      })
    });

    if (resp.ok) {
      console.log(`OK    ${u.email}`);
    } else {
      const err = await resp.json();
      console.log(`FAIL  ${u.email}: ${err.msg || err.error_description || resp.status}`);
    }
  }

  // 3. Verify login
  console.log('\n--- Login verification ---\n');
  for (const u of users) {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: u.email,
      password: u.password
    });
    if (error) {
      console.log(`FAIL  ${u.email}: ${error.message}`);
    } else {
      console.log(`OK    ${u.email}`);
      await anonClient.auth.signOut();
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
