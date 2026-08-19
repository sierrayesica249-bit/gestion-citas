import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import SenaLogo from "./SenaLogo";
import { NotificationBell } from "./NotificationBell";

export function Layout({ children }) {
  const { user, profile, signOut, isAdmin, isCoordination, isProfessional, hasRole } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const navItems = [];

  if (isAdmin()) {
    navItems.push({ to: "/admin", label: "Administración", icon: Users });
  }
  if (isCoordination()) {
    navItems.push({
      to: "/coordination",
      label: "Coordinación",
      icon: BarChart3,
    });
  }
   if (isProfessional()) {
    if (hasRole("PSICOLOGIA")) {
      navItems.push({
        to: "/psychology",
        label: "Psicología",
        icon: Calendar,
      });
    } else if (hasRole("ENFERMERIA")) {
      navItems.push({
        to: "/enfermeria",
        label: "Enfermería",
        icon: Calendar,
      });
    } else if (hasRole("TRABAJO_SOCIAL")) {
      navItems.push({
        to: "/social-work",
        label: "Trabajo Social",
        icon: Calendar,
      });
    } else {
      navItems.push({
        to: "/professional",
        label: "Mis Citas",
        icon: Calendar,
      });
    }
  }
  // Aprendiz por defecto
  if (!isAdmin() && !isCoordination() && !isProfessional()) {
    navItems.push({
      to: "/dashboard",
      label: "Mis Citas",
      icon: LayoutDashboard,
    });
  }

  // Perfil — todos los roles
  navItems.push({
    to: "/profile",
    label: "Mi Perfil",
    icon: UserCircle,
  });

  const currentPage = navItems.find((item) =>
    location.pathname.startsWith(item.to)
  );

  return (
    <div className="app-layout">
      {/* Skip to content link for keyboard navigation */}
      <a href="#main-content" className="sr-only">
        Saltar al contenido principal
      </a>

      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        aria-label="Menú de navegación principal"
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <SenaLogo size={32} />
            <div className="sidebar-brand-text">
              <span className="sidebar-logo">SENA</span>
              <span className="sidebar-logo-sub">Bienestar</span>
            </div>
          </div>
          <button
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Menú principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={closeSidebar}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" aria-hidden="true">
              {profile?.full_name?.[0] || user?.email?.[0] || "?"}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {profile?.full_name || "Usuario"}
              </span>
              <span className="sidebar-user-role">
                {profile?.roles?.name || "Sin rol"}
              </span>
            </div>
          </div>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className="main-area">
        <header className="topbar" role="banner">
          <button
            className="topbar-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={sidebarOpen}
          >
            <Menu size={20} />
          </button>
          <h1 className="topbar-title">
            {currentPage?.label || "Bienestar"}
          </h1>
          <div className="topbar-user" aria-label={`Usuario: ${profile?.full_name || user?.email}`}>
            {profile?.full_name || user?.email}
          </div>
          <NotificationBell />
        </header>
        <main className="main-content" id="main-content" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
