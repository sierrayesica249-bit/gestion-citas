import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// 1 Creamos el contenedor (context)

const AuthContext = createContext(null);

// 2. Hook personalizado para usar el contexto facilmente
//esto evita importar useContext y AuthContext en cada archivo

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

//3 El provider que envuelve la aplicacion
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); //usuario de Supabase Auth
  const [profile, setProfile] = useState(null); //Datos adicionales de nuestra tabla de perfil o profiles
  const [loading, setLoading] = useState(true); //Estado de cargar inicial
  const [error, setError] = useState(null); //manejo o gestion de errores

  //Efecto Escuchar cambios de sesion( login, logout, refresh)
  useEffect(() => {
    //verificar sesion existente al cargar la app
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    //suscribirse a cambios de autenticacion (login/logout en tiempo real )
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      },
    );

    // limpieza de suscripcion al desmontar ( es buena practica)
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  //funcion auxiliar: obterner el perfil + el rol desde nuestra base de datos
  const fetchProfile = async (userId, email = null) => {
    try {
      let data = null;
      let error = null;

      // Reintentar hasta 3 veces con espera creciente
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase
          .from("profiles")
          .select(
            `
              *,
              roles (name, permissions),
              dependencies(name)            
              `,
          )
          .eq("id", userId)
          .maybeSingle();

        data = result.data;
        error = result.error;

        if (data) break;
        if (error) break;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }

      if (data) {
        setProfile(data);
        return data;
      }

      // Reintento por email: evita crear un perfil duplicado con rol incorrecto
      // si la búsqueda por ID falla temporalmente al recargar la página.
      if (email) {
        const { data: byEmail } = await supabase
          .from("profiles")
          .select(
            `
              *,
              roles (name, permissions),
              dependencies(name)
            `,
          )
          .eq("email", email)
          .maybeSingle();

        if (byEmail) {
          setProfile(byEmail);
          return byEmail;
        }
      }

      // Perfil no existe: crear uno basico con rol APRENDIZ
      console.warn("Perfil no encontrado, creando perfil basico");
      const defaultRole = await supabase
        .from("roles")
        .select("id")
        .eq("name", "APRENDIZ")
        .single();

      const newProfile = {
        id: userId,
        full_name: "",
        document_number: "",
        email: email || "",
        is_active: true,
        role_id: defaultRole?.data?.id || null,
        roles: defaultRole?.data ? { name: "APRENDIZ" } : null,
        dependencies: null,
      };

      // Insert (no upsert) para no sobrescribir un perfil existente por error
      await supabase.from("profiles").insert(newProfile);
      setProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error("Error cargando perfil", err);
      setProfile(null);
      return null;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.code === "email_not_confirmed") {
          return { success: true, needsConfirmation: true, email };
        }
        // Manejar error de credenciales invalidas
        if (error.message?.includes("Invalid login credentials") || 
            error.message?.includes("invalid_credentials")) {
          const message = "Credenciales incorrectas. Verifica tu email y contraseña.";
          setError(message);
          return { success: false, error: message };
        }
        throw error;
      }

      setUser(data.session.user);

      // Buscar perfil de forma robusta (por ID y por email)
      const profileData = await fetchProfile(
        data.session.user.id,
        data.session.user.email,
      );

      return { success: true, data, profile: profileData };
    } catch (err) {
      let message;
      if (err.message === "Failed to fetch") {
        message = "No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.";
      } else if (err.message?.includes("Invalid login credentials") || 
                 err.message?.includes("invalid_credentials")) {
        message = "Credenciales incorrectas. Verifica tu email y contraseña.";
      } else {
        message = err.message || "Error al iniciar sesión";
      }
      setError(message);
      return { success: false, error: message };
    }
  };

  const resendConfirmation = async (email) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: window.location.origin + "/login" },
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      const message = err.message === "Failed to fetch"
        ? "No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde."
        : err.message;
      setError(message);
      return { success: false, error: message };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            document_number: userData.document_number,
          },
          emailRedirectTo: window.location.origin + "/login",
        },
      });

      if (error) throw error;

      if (data.session) {
        setUser(data.session.user);

        // Esperar a que el trigger cree el perfil
        let profileData = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise((r) => setTimeout(r, 1000));
          const { data } = await supabase
            .from("profiles")
            .select("*, roles(name, permissions), dependencies(name)")
            .eq("id", data.session.user.id)
            .single();
          if (data) {
            profileData = data;
            break;
          }
        }

        if (profileData) {
          setProfile(profileData);
        } else {
          // Crear perfil manualmente si el trigger fallo
          const defaultRole = await supabase
            .from("roles")
            .select("id")
            .eq("name", "APRENDIZ")
            .single();

          const newProfile = {
            id: data.session.user.id,
            full_name: userData.full_name || "",
            document_number: userData.document_number || "",
            email: data.session.user.email,
            is_active: true,
            role_id: defaultRole?.data?.id || null,
            roles: defaultRole?.data ? { name: "APRENDIZ" } : null,
            dependencies: null,
          };
          await supabase.from("profiles").upsert(newProfile, { onConflict: "id" });
          setProfile(newProfile);
        }

        return { success: true, data, profile: profileData };
      }

      if (data.user && !data.session) {
        return { success: true, data, needsConfirmation: true };
      }

      return { success: true, data };
    } catch (err) {
      console.error("SignUp error:", err);
      const message = err.message === "Failed to fetch"
        ? "No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde."
        : err.message;
      setError(message);
      return { success: false, error: message };
    }
  };
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      //El estado se limpia automaticamente por onAuthStateChange
    } catch (err) {
      setError(err.message);
    }
  };

  //SISTEMA RBAC: helper functions para verificar permisos
  const hasRole = useCallback(
    (requiredRoles) => {
      if (!profile?.roles?.name) return false;
      if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(profile.roles.name);
      }
      return profile.roles.name === requiredRoles;
    },
    [profile],
  );

  const isAdmin = useCallback(() => hasRole("SUPERADMIN"), [hasRole]);
  const isCoordination = useCallback(
    () => hasRole(["COORDINACION", "SUPERADMIN"]),
    [hasRole],
  );
  const isProfessional = useCallback(
    () => hasRole(["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]),
    [hasRole],
  );
  const isAprendiz = useCallback(() => hasRole("APRENDIZ"), [hasRole]);

  //valor proporcionado a toda la app
  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resendConfirmation,
    //helpers RBAC
    hasRole: hasRole,
    isAdmin,
    isCoordination,
    isProfessional,
    isAprendiz,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
