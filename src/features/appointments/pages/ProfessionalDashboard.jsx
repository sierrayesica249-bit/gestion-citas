import { useEffect, useState } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";

export default function ProfessionalDashboard() {
  const { appointments, fetchAppointments, updateStatus, isLoading } =
    useAppointments();
  const { profile } = useAuth();
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    if (profile?.dependency_id) {
      fetchAppointments({ status: filter });
    }
  }, [filter, fetchAppointments, profile?.dependency_id]);

  const handleConfirm = async (id) => {
    await updateStatus(id, "confirmed");
    fetchAppointments({ status: filter });
  };
  
  const handleComplete = async (id) => {
    await updateStatus(id, "completed");
    fetchAppointments({ status: filter });
  };
  
  const handleNoshow = async (id) => {
    await updateStatus(id, "no_show");
    fetchAppointments({ status: filter });
  };

  // Skeleton loading
  if (isLoading && appointments.length === 0) {
    return (
      <div className="dashboard-container" role="status" aria-label="Cargando citas">
        <header className="dashboard-header">
          <div>
            <div className="skeleton skeleton-text" style={{ width: 250, height: 28 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: 180, marginTop: 8 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ width: 80, height: 36, borderRadius: 8 }} />
            ))}
          </div>
        </header>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Citas — {profile?.dependencies?.name || "Mi Dashboard"}</h1>
          <p>Gestiona las citas de tu dependencia</p>
        </div>
        <div className="filter-tabs" role="tablist" aria-label="Filtrar por estado">
          {[
            { key: "pending", label: "Pendientes" },
            { key: "confirmed", label: "Confirmadas" },
            { key: "completed", label: "Completadas" },
          ].map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="appointments-grid" role="tabpanel">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <h3 className="empty-state-title">No hay citas {filter === "pending" ? "pendientes" : filter === "confirmed" ? "confirmadas" : "completadas"}</h3>
            <p className="empty-state-description">
              {filter === "pending"
                ? "No hay citas pendientes de atención en este momento."
                : filter === "confirmed"
                ? "No hay citas confirmadas para hoy."
                : "No hay citas completadas en este período."}
            </p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="appointments-wrapper">
              <AppointmentCard appointment={apt} isAprendiz={false} />

              {filter === "pending" && (
                <div className="professional-actions">
                  <button
                    onClick={() => handleConfirm(apt.id)}
                    className="btn btn-success btn-sm"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleNoshow(apt.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    No asistió
                  </button>
                </div>
              )}
              {filter === "confirmed" && (
                <div className="professional-actions">
                  <button
                    onClick={() => handleComplete(apt.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Completar Atención
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
