import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwxpwfbokqtgstteyaao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwMTY0NiwiZXhwIjoyMDkzNDc3NjQ2fQ.lEnqcz4ha-DDGWJ7PkNtmCJu_pw9TspAlGFlyZ2ixk0';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const users = [
  { email: 'admin@senas.edu', password: 'admin123', full_name: 'Administrador SENA', document_number: '1000000001', role: 'SUPERADMIN', dependency: 'Bienestar General' },
  { email: 'coordinador@senas.edu', password: 'admin123', full_name: 'Coordinador Bienestar', document_number: '1000000002', role: 'COORDINACION', dependency: 'Bienestar General' },
  { email: 'psicologia@senas.edu', password: 'admin123', full_name: 'Psicologo SENA', document_number: '1000000003', role: 'PSICOLOGIA', dependency: 'Psicologia' },
  { email: 'enfermeria@senas.edu', password: 'admin123', full_name: 'Enfermero SENA', document_number: '1000000004', role: 'ENFERMERIA', dependency: 'Enfermeria' },
  { email: 'trabajosocial@senas.edu', password: 'admin123', full_name: 'Trabajador Social SENA', document_number: '1000000005', role: 'TRABAJO_SOCIAL', dependency: 'Trabajo Social' },
  { email: 'aprendiz@senas.edu', password: 'admin123', full_name: 'Aprendiz SENA', document_number: '1000000006', role: 'APRENDIZ', dependency: 'Bienestar General' },
];

async function main() {
  console.log('=== PASO 1: Verificar login con credenciales actuales ===\n');
  
  const workingUsers = [];
  const brokenUsers = [];
  
  for (const u of users) {
    // Use a temporary client for each login test
    const tempClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDE2NDYsImV4cCI6MjA5MzQ3NzY0Nn0.FRWF-Knri2oXX6RMrFKWfo_OB07AuAOqt0Qoiob9c0k');
    const { data, error } = await tempClient.auth.signInWithPassword({
      email: u.email,
      password: u.password
    });
    
    if (error) {
      console.log(`  X ${u.email}: ${error.message}`);
      brokenUsers.push(u);
    } else {
      console.log(`  OK ${u.email}: Login exitoso (user ID: ${data.user.id})`);
      workingUsers.push({ ...u, id: data.user.id });
      await tempClient.auth.signOut();
    }
  }
  
  console.log(`\nResult: ${workingUsers.length} funcionan, ${brokenUsers.length} no funcionan`);
  
  if (brokenUsers.length === 0) {
    console.log('\nTodos los usuarios pueden iniciar sesion!');
    await ensureProfiles(workingUsers);
    process.exit(0);
  }
  
  console.log('\n=== PASO 2: Resetear contrasenas de usuarios rotos ===\n');
  
  for (const u of brokenUsers) {
    console.log(`Reseteando password para ${u.email}...`);
    
    // Try to create the user (will fail if exists, but we can catch)
    const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        full_name: u.full_name,
        document_number: u.document_number
      }
    });
    
    if (createErr) {
      if (createErr.message?.includes('already registered')) {
        console.log(`  Ya existe, intentando reset por email...`);
        
        // Try to use the admin API to update by searching via raw SQL
        // Since listUsers is broken, we'll use a different approach
        // Try signInWithPassword with wrong password first to trigger error with user ID
        // OR use the management API
        
        // Alternative: Use the resetPasswordForEmail flow
        const { error: resetErr } = await supabase.auth.admin.inviteUserByEmail(u.email, {
          data: { reset: true }
        });
        
        if (resetErr) {
          console.log(`  Invite falló: ${resetErr.message}`);
        } else {
          console.log(`  Invite enviado OK`);
        }
      } else {
        console.error(`  Error creando: ${createErr.message}`);
      }
    } else {
      console.log(`  Usuario creado OK: ${createData.user.id}`);
      
      // Update password via admin
      const { error: updateErr } = await supabase.auth.admin.updateUser(
        createData.user.id,
        { password: u.password, email_confirm: true }
      );
      
      if (updateErr) {
        console.error(`  Error actualizando password: ${updateErr.message}`);
      } else {
        console.log(`  Password actualizado OK`);
      }
    }
  }
  
  console.log('\n=== PASO 3: Verificar login despues del fix ===\n');
  
  const allUsers = [];
  for (const u of users) {
    const tempClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDE2NDYsImV4cCI6MjA5MzQ3NzY0Nn0.FRWF-Knri2oXX6RMrFKWfo_OB07AuAOqt0Qoiob9c0k');
    const { data, error } = await tempClient.auth.signInWithPassword({
      email: u.email,
      password: u.password
    });
    
    if (error) {
      console.log(`  X ${u.email}: ${error.message}`);
    } else {
      console.log(`  OK ${u.email}: Login exitoso`);
      allUsers.push({ ...u, id: data.user.id });
      await tempClient.auth.signOut();
    }
  }
  
  if (allUsers.length > 0) {
    await ensureProfiles(allUsers);
  }
  
  console.log('\n=== CREDENCIALES FINALES ===');
  users.forEach(u => console.log(`${u.email} / ${u.password}`));
  
  process.exit(0);
}

async function ensureProfiles(authUsers) {
  console.log('\n=== PASO 4: Verificar y crear perfiles ===\n');
  
  // Get roles and dependencies
  const { data: roles } = await supabase.from('roles').select('*');
  const { data: deps } = await supabase.from('dependencies').select('*');
  
  if (!roles || roles.length === 0) {
    console.log('ERROR: No hay roles en la tabla. Ejecuta fix_final.sql primero.');
    return;
  }
  
  const roleMap = new Map(roles.map(r => [r.name, r.id]));
  const depMap = new Map(deps?.map(d => [d.name, d.id]) || []);
  
  for (const u of authUsers) {
    const roleId = roleMap.get(u.role);
    const depId = depMap.get(u.dependency);
    
    if (!roleId) {
      console.log(`  ERROR: Rol "${u.role}" no encontrado`);
      continue;
    }
    
    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, role_id')
      .eq('id', u.id)
      .maybeSingle();
    
    if (existing) {
      // Update profile
      const { error } = await supabase.from('profiles').upsert({
        id: u.id,
        full_name: u.full_name,
        document_number: u.document_number,
        email: u.email,
        is_active: true,
        role_id: roleId,
        dependency_id: depId,
      });
      
      if (error) {
        console.log(`  ERROR ${u.email}: ${error.message}`);
      } else {
        console.log(`  OK ${u.email}: perfil actualizado (${u.role})`);
      }
    } else {
      // Create profile
      const { error } = await supabase.from('profiles').insert({
        id: u.id,
        full_name: u.full_name,
        document_number: u.document_number,
        email: u.email,
        is_active: true,
        role_id: roleId,
        dependency_id: depId,
      });
      
      if (error) {
        console.log(`  ERROR creando perfil ${u.email}: ${error.message}`);
      } else {
        console.log(`  OK ${u.email}: perfil creado (${u.role})`);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
