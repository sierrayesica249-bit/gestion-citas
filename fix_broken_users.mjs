import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwxpwfbokqtgstteyaao.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwMTY0NiwiZXhwIjoyMDkzNDc3NjQ2fQ.lEnqcz4ha-DDGWJ7PkNtmCJu_pw9TspAlGFlyZ2ixk0';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDE2NDYsImV4cCI6MjA5MzQ3NzY0Nn0.FRWF-Knri2oXX6RMrFKWfo_OB07AuAOqt0Qoiob9c0k';

const brokenEmails = ['admin@senas.edu', 'enfermeria@senas.edu'];

async function getUsersFromAuth() {
  // Try to query auth.users via the REST API with service_role key
  // Supabase PostgREST doesn't expose auth schema by default, but we can try
  const response = await fetch(`${supabaseUrl}/rest/v1/auth.users?select=id,email`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  
  console.log(`Direct auth query failed (${response.status}), trying alternative...`);
  return null;
}

async function tryAlternativeQuery() {
  // Try querying via the pg_meta or information_schema endpoint
  // Actually, let's try using the Supabase SQL API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: "SELECT id, email FROM auth.users WHERE email IN ('admin@senas.edu', 'enfermeria@senas.edu')"
    })
  });
  
  if (response.ok) {
    return await response.json();
  }
  
  return null;
}

async function main() {
  console.log('=== Buscando IDs de usuarios con problemas ===\n');
  
  // Method 1: Direct auth query
  const users = await getUsersFromAuth();
  if (users) {
    console.log('Method 1 (auth.users):');
    users.forEach(u => console.log(`  ${u.email}: ${u.id}`));
  }
  
  // Method 2: SQL RPC
  if (!users) {
    const sqlUsers = await tryAlternativeQuery();
    if (sqlUsers) {
      console.log('Method 2 (SQL RPC):');
      sqlUsers.forEach(u => console.log(`  ${u.email}: ${u.id}`));
    }
  }
  
  // Method 3: Create temp users to find existing ones
  // Not practical, skip
  
  // If we got users, update their passwords
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const foundUsers = users || await tryAlternativeQuery();
  
  if (foundUsers) {
    console.log('\n=== Reseteando contrasenas ===\n');
    for (const u of foundUsers) {
      const { error } = await supabase.auth.admin.updateUser(u.id, {
        password: 'admin123',
        email_confirm: true
      });
      
      if (error) {
        console.log(`  X ${u.email}: ${error.message}`);
      } else {
        console.log(`  OK ${u.email}: password reseteado a admin123`);
      }
    }
    
    // Verify
    console.log('\n=== Verificacion final ===\n');
    for (const u of foundUsers) {
      const tempClient = createClient(supabaseUrl, anonKey);
      const { error } = await tempClient.auth.signInWithPassword({
        email: u.email,
        password: 'admin123'
      });
      
      if (error) {
        console.log(`  X ${u.email}: ${error.message}`);
      } else {
        console.log(`  OK ${u.email}: Login exitoso!`);
        await tempClient.auth.signOut();
      }
    }
  } else {
    console.log('\nNo se pudieron obtener los IDs. Solucion alternativa:');
    console.log('Ve a Supabase Dashboard > Authentication > Users');
    console.log('Busca admin@senas.edu y enfermeria@senas.edu');
    console.log('Haz click en cada uno y cambia la password a: admin123');
    console.log('Marca "Email confirmed" como true');
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
