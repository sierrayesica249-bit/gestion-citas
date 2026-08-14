import { useState } from "react";
import { useAdmin } from "./hooks/useAdmin";
import UserManagement from "./components/UserManagement";
import AuditLogViewer from "./components/AuditLogViewer";
import { Users, ClipboardList, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const adminState = useAdmin();

  const tabs = [
    { id: "users", label: "Usuarios", icon: Users },
    { id: "audit", label: "Auditoría", icon: ClipboardList },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Panel de Administración</h1>
          <p>Gestiona usuarios, auditoría y configuración del sistema</p>
        </div>
      </header>

      <div
        className="admin-tabs"
        role="tablist"
        aria-label="Secciones de administración"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
            tabIndex={tab === t.id ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                const nextTab = tabs[(tabs.findIndex((t) => t.id === tab) + 1) % tabs.length];
                setTab(nextTab.id);
              } else if (e.key === "ArrowLeft") {
                const prevTab = tabs[(tabs.findIndex((t) => t.id === tab) - 1 + tabs.length) % tabs.length];
                setTab(prevTab.id);
              }
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div
        className="admin-tab-content"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "users" && <UserManagement admin={adminState} />}
        {tab === "audit" && <AuditLogViewer admin={adminState} />}
        {tab === "settings" && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Settings size={36} />
            </div>
            <h3 className="empty-state-title">Configuración</h3>
            <p className="empty-state-description">
              Módulo de configuración en desarrollo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
