import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../providers/AuthProvider";
import { Navigate } from "react-router-dom";
import { Layout } from "../shared/components/Layout";

// Lazy loading para code splitting (mejor performance)
import { lazy, Suspense } from "react";

// Públicas
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const Unauthorized = lazy(() => import("../shared/components/Unauthorized"));

// Privadas - Aprendiz
const AprendizDashboard = lazy(
  () => import("../features/appointments/pages/AprendizDashboard"),
);

// Privadas - Profesional
const ProfessionalDashboard = lazy(
  () => import("../features/appointments/pages/ProfessionalDashboard"),
);

// Privadas - Psicología
const PsicologiaDashboard = lazy(
  () => import("../features/psychology/pages/PsicologiaDashboard"),
);

// Privadas - Enfermería
const EnfermeriaDashboard = lazy(
  () => import("../features/enfermeria/pages/EnfermeriaDashboard"),
);

// Privadas - Trabajo Social
const TrabajoSocialDashboard = lazy(
  () => import("../features/social-work/pages/TrabajoSocialDashboard"),
);

// Perfil
const ProfilePage = lazy(
  () => import("../features/profile/pages/ProfilePage"),
);

// Privadas - Coordinación
const CoordinationDashboard = lazy(
  () => import("../features/dashboard/pages/CoordinationDashboard"),
);

// Privadas - Admin
const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboard"),
);

function PrivateLayout({ children }) {
  return (
    <Layout>
      <Suspense fallback={<div className="loading-screen">Cargando...</div>}>
        {children}
      </Suspense>
    </Layout>
  );
}

export function AppRoutes() {
   const { user, profile, loading, isCoordination, isAdmin, hasRole } = useAuth();

  const getHomeRoute = () => {
    if (isAdmin()) return "/admin";
    if (isCoordination()) return "/coordination";
    if (hasRole("PSICOLOGIA")) return "/psychology";
    if (hasRole("ENFERMERIA")) return "/enfermeria";
    if (hasRole("TRABAJO_SOCIAL")) return "/social-work";
    return "/dashboard";
  };

  // Si hay usuario logueado pero perfil aún no cargado, esperar con timeout
  if (user && !profile && !loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando perfil...</p>
        <button 
          className="btn btn-primary" 
          style={{ marginTop: "1rem" }}
          onClick={() => window.location.href = "/login"}
        >
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="loading-screen">Cargando...</div>}>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* RUTAS PROTEGIDAS - APRENDIZ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={["APRENDIZ", "ENFERMERIA", "PSICOLOGIA", "TRABAJO_SOCIAL", "COORDINACION", "SUPERADMIN"]}>
              <PrivateLayout>
                <AprendizDashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - PROFESIONALES */}
        <Route
          path="/professional"
          element={
            <ProtectedRoute
              requiredRoles={["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]}
            >
              <PrivateLayout>
                <ProfessionalDashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - PSICOLOGÍA */}
        <Route
          path="/psychology"
          element={
            <ProtectedRoute requiredRoles="PSICOLOGIA">
              <PrivateLayout>
                <PsicologiaDashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - ENFERMERÍA */}
        <Route
          path="/enfermeria"
          element={
            <ProtectedRoute requiredRoles="ENFERMERIA">
              <PrivateLayout>
                <EnfermeriaDashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - TRABAJO SOCIAL */}
        <Route
          path="/social-work"
          element={
            <ProtectedRoute requiredRoles="TRABAJO_SOCIAL">
              <PrivateLayout>
                <TrabajoSocialDashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - COORDINACIÓN */}
        <Route
          path="/coordination"
          element={
            <ProtectedRoute requiredRoles={["COORDINACION", "SUPERADMIN"]}>
              <PrivateLayout>
                <CoordinationDashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/coordinacion" element={<Navigate to="/coordination" replace />} />

        {/* RUTAS PROTEGIDAS - ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={["SUPERADMIN", "COORDINACION"]}>
              <PrivateLayout>
                <AdminDashboard />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - PERFIL (todos los roles) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PrivateLayout>
                <ProfilePage />
              </PrivateLayout>
            </ProtectedRoute>
          }
        />

        {/* REDIRECCIÓN INICIAL */}
        <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

        {/* 404 */}
        <Route path="*" element={<div>404 - Pagina no encontrada</div>} />
      </Routes>
    </Suspense>
  );
}
