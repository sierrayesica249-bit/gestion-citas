import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

// Componente reutilizable para proteger rutas
export function ProtectedRoute({
  children,
  requiredRoles = null, // null = cualquier usuario logueado
  fallback = "/login", // a dónde redirigir si no tiene acceso
}) {
  const { user, profile, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="spinner" />
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Esperar a que el perfil esté disponible para verificar roles
  if (requiredRoles && !profile) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="spinner" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  // 3. Requiere roles específicos y no los tiene → Dashboard o Unauthorized
  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Todo OK, renderizar el componente hijo
  return children;
}
