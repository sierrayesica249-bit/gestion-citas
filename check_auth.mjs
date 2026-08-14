import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwxpwfbokqtgstteyaao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwMTY0NiwiZXhwIjoyMDkzNDc3NjQ2fQ.lEnqcz4ha-DDGWJ7PkNtmCJu_pw9TspAlGFlyZ2ixk0';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testEmails = [
  'admin@senas.edu',
  'coordinador@senas.edu',
  'psicologia@senas.edu',
  'enfermeria@senas.edu',
  'trabajosocial@senas.edu',
  'aprendiz@senas.edu'
];

async function main() {
  console.log('=== Verificando usuarios de Auth ===');
  
  // List all users
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error.message);
  }
  
  testEmails.forEach(email => {
    const user = users?.find(u => u.email === email);
    if (user) {
      console.log(`\n${email}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`);
      console.log(`  Created: ${user.created_at}`);
    } else {
      console.log(`\n${email}: NO EXISTE EN AUTH`);
    }
  });
  
  // If any missing, create them
  console.log('\n=== Creando usuarios faltantes ===');
  for (const email of testEmails) {
    const user = users?.find(u => u.email === email);
    if (!user) {
      console.log(`Creando: ${email}`);
      const { data, error: createErr } = await supabase.auth.admin.createUser({
        email: email,
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
          full_name: email.replace('@senas.edu', '').replace(/^[a-z]/, str => str.toUpperCase()) + ' SENA',
          document_number: '10000000' + Math.floor(Math.random() * 100)
        }
      });
      
      if (createErr) {
        console.error(`${email}: Error - ${createErr.message}`);
      } else {
        console.log(`${email}: Creado OK - ${data.user.id}`);
      }
    }
  }
  
  // Final verification
  const { data: { users: finalUsers } } = await supabase.auth.admin.listUsers();
  
  console.log('\n=== VERIFICACIÓN FINAL ===');
  testEmails.forEach(email => {
    const user = finalUsers?.find(u => u.email === email);
    console.log(`${email} | ${user ? 'OK' : 'FALTA'}`);
  });
  
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});