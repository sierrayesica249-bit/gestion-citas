import { supabase } from "../../../../lib/supabase";

export class AdminRepository {

  // USUARIOS: Listar con filtros y paginacion
  static async getUsers({ role, status, search, dependency, page = 1, limit = 20 }) {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        roles (name, description),
        dependencies (name)
      `, { count: 'exact' });

    if (role) query = query.eq('roles.name', role);
    if (status !== undefined) query = query.eq('is_active', status);
    if (dependency) query = query.eq('dependencies.name', dependency);
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,document_number.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw new Error(`Error fetching users: ${error.message}`);
    return { users: data, total: count, page, totalPages: Math.ceil(count / limit) };
  }

  // USUARIOS: Actualizar rol, dependencia o estado
  static async updateUser(userId, updates, adminId) {
    const { data: oldData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: newData, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    await this.logAction({
        userId: adminId,
        action: "UPDATE_USER",
        entityType: "user",
        entityId: userId,
        oldData,
        newData
    });

    return newData;
  }

  // Usuarios: crear nuevo usuario
  static async createUser({ email, password, fullName, roleId, dependencyId }, adminId){
    // 1. Verificar si el email ya tiene perfil
    const { data: existingProfile } = await supabase
      .from('profiles').select('id, email').eq('email', email).limit(1);

    if (existingProfile && existingProfile.length > 0) {
      // Ya existe un perfil con este email — solo actualizar
      const pid = existingProfile[0].id;
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ role_id: roleId, dependency_id: dependencyId, full_name: fullName, updated_at: new Date() })
        .eq('id', pid);
      if (updErr) throw updErr;
      const { data: result } = await supabase.from('profiles').select('*').eq('id', pid).limit(1).single();
      await this.logAction({ userId: adminId, action:'CREATE_USER', entityType:'user', entityId: pid, newData: result });
      return result;
    }

    // 2. Email nuevo — crear en Auth
    const {data: authData, error: authError}= await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
        }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error("No se pudo crear el usuario en Auth");

    const userId = authData.user.id;

    // 3. Esperar trigger (reintentos)
    let profileExists = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      const { data: check } = await supabase
        .from('profiles').select('id').eq('id', userId).limit(1);
      if (check && check.length > 0) { profileExists = true; break; }
    }

    // 4. Insertar perfil si el trigger no lo creó
    if (!profileExists) {
      await supabase.from('profiles').insert({
        id: userId, email, full_name: fullName,
        role_id: roleId, dependency_id: dependencyId,
        is_active: true, created_at: new Date(), updated_at: new Date()
      }).then(({ error }) => {
        // Ignorar errores de duplicado/FK — el perfil ya existe
        if (error) console.warn("Profile insert skipped:", error.message);
      });
    }

    // 5. Asegurar que role y dependency estén correctos
    await supabase
      .from('profiles')
      .update({ role_id: roleId, dependency_id: dependencyId, full_name: fullName, updated_at: new Date() })
      .eq('id', userId);

    // 6. Retornar perfil
    const { data: result } = await supabase.from('profiles').select('*').eq('id', userId).limit(1).single();
    await this.logAction({ userId: adminId, action:'CREATE_USER', entityType:'user', entityId: userId, newData: result });
    return result || { id: userId, email, full_name: fullName };
  }

  // AUDITORIA: Obtener logs con filtros
  static async getAuditLogs({ action, userId, dateFrom, dateTo, page=1, limit=50 }){
    let query=supabase
    .from('audit_logs')
    .select(`*`, {count:'exact'});

        if (action) query= query.eq('action', action);
        if (userId) query= query.eq('user_id', userId);
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        const from = (page - 1) *limit;
        const {data, error, count }= await query
            .order('created_at', { ascending:false})
            .range(from, from + limit-1);
        if (error) throw error;

        // Enriquecer con datos del admin si hay user_id
        const enrichedLogs = await Promise.all((data || []).map(async (log) => {
            if (!log.user_id) return log;
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', log.user_id)
                    .single();
                return { ...log, admin: profile };
            } catch {
                return log;
            }
        }));

        return {logs:enrichedLogs,total: count};
  }

  // CONFIGURACION: OBTENER Y ACTUALIZAR
  static async getConfig() {
    const {data, error } = await supabase
    .from('system_config')
    .select('*');

    if (error) throw error;
    return data.reduce((acc, item) =>({...acc, [item.key]: item.value}),{});
  }

  // ROLES: Obtener todos los roles
  static async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data;
  }

  // DEPENDENCIES: Obtener todas las dependencias
  static async getDependencies() {
    const { data, error } = await supabase
      .from('dependencies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async updateConfig(key, value, adminId) {
    const { data: oldConfig } = await supabase
    .from('system_config')
    .select('*')
    .eq('key', key)
    .single();

    const {data, error } = await supabase
    .from('system_config')
    .update({
        value,
        updated_by: adminId,
        updated_at: new Date()
    })
    .eq('key', key)
    .select()
    .single();

    if (error) throw error;

    await this.logAction({
        userId:adminId,
        action: 'UPDATE_CONFIG',
        entityType: 'config',
        entityId: key,
        oldData: oldConfig,
        newData: data
    });
    return data;
  }

  // Helper: registrar accion en auditoria
  static async logAction({userId, action, entityType, entityId, oldData, newData}) {
    const userAgent= typeof navigator !== 'undefined' ? navigator.userAgent : null;

    await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: String(entityId),
        old_data: oldData,
        new_data: newData,
        user_agent: userAgent
    });
  }
}
