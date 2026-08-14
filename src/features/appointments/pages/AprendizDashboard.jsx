import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentForm } from "../components/AppointmentForm";
import {
  Plus,
  Calendar,
  X,
  Clock,
  TrendingUp,
  CheckCircle,
  Heart,
  Brain,
  Stethoscope,
  Users,
  ChevronRight,
} from "lucide-react";
import "../../../shared/styles/aprendiz-dashboard.css";

const MOODS = [
  { emoji: "😔", label: "Triste" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "🙂", label: "Bien" },
  { emoji: "😊", label: "Feliz" },
  { emoji: "😄", label: "Muy feliz" },
];

const SERVICES = [
  { name: "Psicología", description: "Apoyo emocional y mental", icon: Brain, color: "#8b5cf6" },
  { name: "Enfermería", description: "Salud y bienestar físico", icon: Stethoscope, color: "#3b82f6" },
  { name: "Trabajo Social", description: "Acompañamiento y apoyo social", icon: Users, color: "#f59e0b" },
];

const HOURS = [
  { service: "Psicología", schedule: "Lun-Vie · 8:00–5:00 p.m.", color: "#8b5cf6" },
  { service: "Enfermería", schedule: "Lun-Vie · 7:00–4:00 p.m.", color: "#3b82f6" },
  { service: "Trabajo Social", schedule: "Lun-Vie · 8:00–5:00 p.m.", color: "#f59e0b" },
];

export default function AprendizDashboard() {
  const { profile } = useAuth();
  const { appointments, fetchAppointments, cancelAppointment, isLoading } = useAppointments();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("proximas");
  const [mood, setMood] = useState(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && showForm) {
        setShowForm(false);
        previousFocusRef.current?.focus();
      }
    },
    [showForm]
  );

  useEffect(() => {
    if (showForm) {
      previousFocusRef.current = document.activeElement;
      document.addEventListener("keydown", handleKeyDown);
      modalRef.current?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showForm, handleKeyDown]);

  const openForm = () => setShowForm(true);
  const closeForm = () => {
    setShowForm(false);
    previousFocusRef.current?.focus();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getFormattedDate = () => {
    const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const now = new Date();
    return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
  };

  const firstName = profile?.full_name?.split(" ")[0] || "Usuario";
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const nextAppointment = appointments
    .filter((a) => a.status === "pending" || a.status === "confirmed")
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))[0];

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "proximas") return apt.status === "pending" || apt.status === "confirmed";
    if (activeTab === "historial") return apt.status === "completed" || apt.status === "cancelled";
    return true;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const months = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
    return { day: d.getDate(), month: months[d.getMonth()] };
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", color: "#92400e", label: "Pendiente" },
      confirmed: { bg: "#dbeafe", color: "#1e40af", label: "Confirmada" },
      completed: { bg: "#d1fae5", color: "#065f46", label: "Completada" },
      cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelada" },
      no_show: { bg: "#f3f4f6", color: "#6b7280", label: "No asistió" },
    };
    return styles[status] || styles.pending;
  };

  if (isLoading && appointments.length === 0) {
    return (
      <div className="ap-layout">
        <div className="ap-main">
          <div className="ap-skeleton-header" />
          <div className="ap-skeleton-kpis">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ap-skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-layout">
      <div className="ap-main">
        {/* Header */}
        <div className="ap-header">
          <div className="ap-header-decor-1" />
          <div className="ap-header-decor-2" />
          <div className="ap-header-content">
            <div className="ap-header-text">
              <p className="ap-header-date">✨ {getFormattedDate()}</p>
              <h1 className="ap-header-title">¡{getGreeting()}, {firstName}!</h1>
              <p className="ap-header-subtitle">
                {nextAppointment
                  ? `Tu próxima cita es el ${new Date(nextAppointment.scheduled_date + "T00:00:00").getDate()} de ${
                      ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"][
                        new Date(nextAppointment.scheduled_date + "T00:00:00").getMonth()
                      ]
                    } en ${nextAppointment.dependencies?.name || "bienestar"}`
                  : "No tienes citas programadas"}
              </p>
            </div>
            <button className="ap-btn-primary" onClick={openForm}>
              <Plus size={18} />
              <span>Agendar cita</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="ap-kpis">
          {[
            { label: "Total", value: appointments.length, icon: Calendar, bg: "#f0fdf4", iconColor: "#16a34a" },
            { label: "Pendientes", value: pendingCount, icon: Clock, bg: "#fefce8", iconColor: "#ca8a04" },
            { label: "Confirmadas", value: confirmedCount, icon: TrendingUp, bg: "#eff6ff", iconColor: "#2563eb" },
            { label: "Completadas", value: completedCount, icon: CheckCircle, bg: "#f0fdf4", iconColor: "#16a34a" },
          ].map((kpi) => (
            <div key={kpi.label} className="ap-kpi-card">
              <div className="ap-kpi-icon" style={{ background: kpi.bg }}>
                <kpi.icon size={22} color={kpi.iconColor} />
              </div>
              <div>
                <p className="ap-kpi-value">{kpi.value}</p>
                <p className="ap-kpi-label">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mood Tracker */}
        <div className="ap-mood">
          <div className="ap-mood-info">
            <div className="ap-mood-icon">
              <Heart size={20} color="#16a34a" />
            </div>
            <div>
              <p className="ap-mood-title">¿Cómo te sientes hoy?</p>
              <p className="ap-mood-subtitle">Registro de bienestar diario</p>
            </div>
          </div>
          <div className="ap-mood-emojis">
            {MOODS.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`ap-mood-btn ${mood === m.label ? "active" : ""}`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Next Appointment */}
        {nextAppointment && (
          <div className="ap-next-apt">
            <p className="ap-next-label">PRÓXIMA CITA</p>
            <div className="ap-next-content">
              <div className="ap-next-info">
                <div className="ap-next-date-box">
                  <span className="ap-next-day">{formatDate(nextAppointment.scheduled_date).day}</span>
                  <span className="ap-next-month">{formatDate(nextAppointment.scheduled_date).month}</span>
                </div>
                <div>
                  <p className="ap-next-service">{nextAppointment.dependencies?.name || "Cita de bienestar"}</p>
                  <p className="ap-next-detail">🕐 {nextAppointment.scheduled_time} · {nextAppointment.reason || "Sin especificar"}</p>
                </div>
              </div>
              <span className="ap-status-badge ap-status-pending">● Pendiente</span>
            </div>
          </div>
        )}

        {/* Tabs + Appointments */}
        <div className="ap-tabs-container">
          <div className="ap-tabs-header">
            <div className="ap-tabs">
              {[
                { key: "proximas", label: "Próximas" },
                { key: "todas", label: "Todas" },
                { key: "historial", label: "Historial" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`ap-tab ${activeTab === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="ap-tabs-count">{filteredAppointments.length} citas</span>
          </div>

          <div className="ap-apt-list">
            {filteredAppointments.length === 0 ? (
              <div className="ap-empty">
                <Calendar size={40} />
                <p>No hay citas para mostrar</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const dateInfo = formatDate(apt.scheduled_date);
                const status = getStatusStyle(apt.status);
                return (
                  <div key={apt.id} className="ap-apt-row">
                    <div className="ap-apt-date-box">
                      <span className="ap-apt-day">{dateInfo.day}</span>
                      <span className="ap-apt-month">{dateInfo.month}</span>
                    </div>
                    <div className="ap-apt-icon">
                      <Calendar size={16} color="#4f46e5" />
                    </div>
                    <div className="ap-apt-info">
                      <p className="ap-apt-service">{apt.dependencies?.name || "Cita de bienestar"}</p>
                      <p className="ap-apt-detail">🕐 {apt.scheduled_time} · {apt.reason || "Sin especificar"}</p>
                    </div>
                    {(apt.status === "pending" || apt.status === "confirmed") && (
                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        className="ap-apt-cancel"
                        title="Cancelar cita"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <span className={`ap-status-badge ap-status-${apt.status}`}>● {status.label}</span>
                    <ChevronRight size={16} className="ap-apt-arrow" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Right */}
      <div className="ap-sidebar">
        {/* Services */}
        <div className="ap-sidebar-card">
          <h3 className="ap-sidebar-title">SERVICIOS</h3>
          <div className="ap-services-list">
            {SERVICES.map((srv) => (
              <div key={srv.name} className="ap-service-item">
                <div className="ap-service-icon" style={{ background: `${srv.color}15` }}>
                  <srv.icon size={18} color={srv.color} />
                </div>
                <div className="ap-service-info">
                  <p className="ap-service-name">{srv.name}</p>
                  <p className="ap-service-desc">{srv.description}</p>
                </div>
                <ChevronRight size={14} className="ap-service-arrow" />
              </div>
            ))}
          </div>
          <button className="ap-btn-new-apt" onClick={openForm}>
            <Plus size={16} />
            Nueva cita
          </button>
        </div>

        {/* Business Hours */}
        <div className="ap-sidebar-card">
          <h3 className="ap-sidebar-title">HORARIOS DE ATENCIÓN</h3>
          <div className="ap-hours-list">
            {HOURS.map((h) => (
              <div key={h.service} className="ap-hour-item">
                <div className="ap-hour-dot" style={{ background: h.color }} />
                <div>
                  <p className="ap-hour-service">{h.service}</p>
                  <p className="ap-hour-schedule">{h.schedule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="ap-modal-overlay" onClick={closeForm}>
          <div className="ap-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h2>Solicitar Nueva Cita</h2>
              <button className="ap-modal-close" onClick={closeForm}>
                <X size={16} />
              </button>
            </div>
            <AppointmentForm
              onSuccess={() => {
                closeForm();
                fetchAppointments();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
