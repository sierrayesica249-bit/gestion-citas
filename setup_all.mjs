import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwxpwfbokqtgstteyaao.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwMTY0NiwiZXhwIjoyMDkzNDc3NjQ2fQ.lEnqcz4ha-DDGWJ7PkNtmCJu_pw9TspAlGFlyZ2ixk0';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  { email: 'admin@senas.edu', full_name: 'Administrador SENA', document_number: '1000000001', role: 'SUPERADMIN', dependency: 'Bienestar General' },
  { email: 'coordinador@senas.edu', full_name: 'Coordinador Bienestar', document_number: '1000000002', role: 'COORDINACION', dependency: 'Bienestar General' },
  { email: 'psicologia@senas.edu', full_name: 'Psicologo SENA', document_number: '1000000003', role: 'PSICOLOGIA', dependency: 'Psicologia' },
  { email: 'enfermeria@senas.edu', full_name: 'Enfermero SENA', document_number: '1000000004', role: 'ENFERMERIA', dependency: 'Enfermeria' },
  { email: 'trabajosocial@senas.edu', full_name: 'Trabajador Social SENA', document_number: '1000000005', role: 'TRABAJO_SOCIAL', dependency: 'Trabajo Social' },
  { email: 'aprendiz@senas.edu', full_name: 'Aprendiz SENA', document_number: '1000000006', role: 'APRENDIZ', dependency: 'Bienestar General' },
];

async function main() {
  console.log('=== Creando usuarios de auth ===');
  
  for (const u of users) {
    console.log(`\nProcesando: ${u.email}`);
    
    // Sign up via auth API
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: u.email,
      password: 'admin123',
      options: {
        emailRedirectTo: null,
        data: {
          full_name: u.full_name,
          document_number: u.document_number
        }
      }
    });
    
    if (authErr) {
      if (authErr.message?.includes('already registered')) {
        console.log('  Usuario ya existe en auth');
      } else {
        console.error('  Error de signup:', authErr.message);
      }
      continue;
    }
    
    if (authData?.user) {
      console.log('  Usuario auth creado:', authData.user.id);
    }
  }
  
  // Get roles and dependencies
  const { data: roles } = await supabase.from('roles').select('*');
  const { data: deps } = await supabase.from('dependencies').select('*');
  
  const roleMap = new Map(roles?.map(r => [r.name, r.id]));
  const depMap = new Map(deps?.map(d => [d.name, d.id]));
  
  console.log('\n=== Actualizando perfiles ===');
  for (const u of users) {
    const roleId = roleMap.get(u.role);
    const depId = depMap.get(u.dependency);
    
    if (!roleId) {
      console.error(`  Rol "${u.role}" no encontrado`);
      // Create the role
      const { data: newRole } = await supabase.from('roles').insert({
        name: u.role,
        description: `Rol de ${u.role}`,
        permissions: ['all']
      }).select().single();
      if (newRole) roleMap.set(u.role, newRole.id);
      continue;
    }
    
    if (!depId) {
      console.error(`  Dep "${u.dependency}" no encontrado`);
      continue;
    }
    
    // Get the auth user ID
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(x => x.email === u.email);
    
    let profileId;
    if (authUser) {
      profileId = authUser.id;
      console.log(`  Auth user:`, profileId);
    } else {
      // Find profile by email
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', u.email)
        .maybeSingle();
      profileId = existing?.id;
    }
    
    if (!profileId) {
      console.error(`  No se encontro usuario para:`, u.email);
      continue;
    }
    
    // Update profile
    const { error: upsertErr } = await supabase.from('profiles').upsert({
      id: profileId,
      full_name: u.full_name,
      document_number: u.document_number,
      email: u.email,
      is_active: true,
      role_id: roleId,
      dependency_id: depId,
    });
    
    if (upsertErr) {
      console.error(`  Error actualizando:`, upsertErr.message);
    } else {
      console.log(`  Perfil actualizado OK`);
    }
  }
  
  // Final verification
  console.log('\n=== VERIFICACIÓN FINAL ===');
  const { data: allProfiles } = await supabase.from('profiles').select('full_name, email, role_id, dependency_id');
  const { data: allRoles } = await supabase.from('roles').select('*');
  const { data: allDeps } = await supabase.from('dependencies').select('*');
  
  const roleMapFinal = new Map(allRoles.map(r => [r.id, r.name]));
  const depMapFinal = new Map(allDeps.map(d => [d.id, d.name]));
  
  users.forEach(u => {
    const p = allProfiles?.find(p => p.email === u.email);
    console.log(`${u.email} | ${roleMapFinal.get(p?.role_id) || 'NO ROLE'} | ${depMapFinal.get(p?.dependency_id) || 'NO DEP'}`);
  });
  
  console.log('\n=== CREDENCIALES ===');
  users.forEach(u => {
    console.log(`${u.email} / admin123`);
  });
  
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});