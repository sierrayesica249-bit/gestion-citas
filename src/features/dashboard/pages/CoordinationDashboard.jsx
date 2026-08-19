import { useEffect, useState } from "react";
import { useDashboard } from "../../appointments/hooks/useDashboard";
import { useAppointments } from "../../appointments/hooks/useAppointments";
import { useAuth } from "../../../providers/AuthProvider";
import { KPICard } from "../components/KPICard";
import { DependencyChart } from "../components/DependencyChart";
import { MonthlyTrendChart } from "../components/MonthlyTrendChart";
import { ProfessionalTable } from "../components/ProfessionalTable";
import {
  Download,
  RefreshCw,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  ClipboardList,
  UserCheck,
  Plus,
  X,
  FileText,
  TrendingUp,
  ArrowRight,
  Activity,
  Target,
} from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";
import { notificationBus } from "../../../shared/notifications/notificationBus";

export default function CoordinationDashboard() {
  const {
    kpis,
    byDependency,
    monthlyTrend,
    professionals,
    loading,
    fetchAllMetrics,
    exportToCSV,
  } = useDashboard();

  const {
    appointments,
    fetchAppointments,
    updateStatus,
    isLoading: loadingAppointments,
  } = useAppointments();

  const { hasRole } = useAuth();
  const isCoordinator = hasRole("COORDINACION") || hasRole("SUPERADMIN");

  const [tab, setTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: format(new Date(), "yyyy-MM-01"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  const [exporting, setExporting] = useState(false);
  const [aptFilter, setAptFilter] = useState("all");
  const [error, setError] = useState(null);

  // Create appointment modal
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    user_id: "",
    dependency_id: "",
    scheduled_date: "",
    scheduled_time: "08:00",
    reason: "",
  });
  const [students, setStudents] = useState([]);
  const [dependencies, setDependencies] = useState([]);

  const tabs = [
    { id: "overview", label: "Vista General", icon: BarChart3 },
    { id: "appointments", label: "Gestionar Citas", icon: ClipboardList },
    { id: "professionals", label: "Profesionales", icon: UserCheck },
    { id: "reports", label: "Reportes", icon: FileText },
  ];

  useEffect(() => {
    try {
      fetchAllMetrics(dateRange);
    } catch (err) {
      console.error("Error loading metrics:", err);
      setError("Error cargando métricas");
    }
  }, [dateRange, fetchAllMetrics]);

  useEffect(() => {
    if (tab === "appointments") {
      try {
        fetchAppointments({ status: aptFilter === "all" ? undefined : aptFilter });
      } catch (err) {
        console.error("Error loading appointments:", err);
      }
    }
  }, [tab, aptFilter, fetchAppointments]);

  // Load students and dependencies for the form
  useEffect(() => {
    if (showForm) {
      supabase.from("profiles").select("id, full_name, email").then(({ data }) => setStudents(data || []));
      supabase.from("dependencies").select("id, name").then(({ data }) => setDependencies(data || []));
    }
  }, [showForm]);

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setExporting(true);
    await exportToCSV(dateRange);
    setExporting(false);
  };

  const handleConfirm = async (id) => {
    await updateStatus(id, "confirmed");
    fetchAppointments({ status: aptFilter === "all" ? undefined : aptFilter });
  };
  const handleComplete = async (id) => {
    await updateStatus(id, "completed");
    fetchAppointments({ status: aptFilter === "all" ? undefined : aptFilter });
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!form.user_id) { toast.error("Selecciona un aprendiz"); return; }
    if (!form.dependency_id) { toast.error("Selecciona una dependencia"); return; }
    if (!form.scheduled_date) { toast.error("Selecciona una fecha"); return; }
    setCreating(true);
    try {
      const { error } = await supabase.rpc("create_appointment", {
        p_user_id: form.user_id,
        p_dependency_id: form.dependency_id,
        p_scheduled_date: form.scheduled_date,
        p_scheduled_time: form.scheduled_time,
        p_reason: form.reason || null,
      });
      if (error) throw error;
      toast.success("Cita creada correctamente");
      notificationBus.emit({
        id: `${Date.now()}-${form.user_id}`,
        service: form.dependencyName || dependencies.find((d) => d.id === Number(form.dependency_id))?.name,
        userName: students.find((s) => s.id === form.user_id)?.full_name,
        date: form.scheduled_date,
        time: form.scheduled_time,
      });
      setShowForm(false);
      setForm({ user_id: "", dependency_id: "", scheduled_date: "", scheduled_time: "08:00", reason: "" });
      fetchAppointments({ status: aptFilter === "all" ? undefined : aptFilter });
      fetchAllMetrics(dateRange);
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast.error("Error creando cita: " + (err.message || "Error desconocido"));
    } finally {
      setCreating(false);
    }
  };

  // Today's appointments for agenda
  const todayAppts = appointments.filter((a) => {
    try {
      return isToday(parseISO(a.scheduled_date));
    } catch {
      return false;
    }
  }).sort((a, b) => (a.scheduled_time || "").localeCompare(b.scheduled_time || ""));

  if (loading && !kpis) {
    return (
      <div className="coordination-dashboard">
        <div className="loading-screen" role="status" aria-label="Cargando dashboard">
          <div className="spinner spinner-lg" />
          <p>Cargando dashboard de coordinación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coordination-dashboard">
      {/* ═══ HERO HEADER ═══ */}
      <div className="coord-hero">
        <div className="coord-hero-content">
          <div className="coord-hero-left">
            <div className="coord-hero-icon">🏢</div>
            <div className="coord-hero-text">
              <h1>Panel de Coordinación</h1>
              <p>Centro de gestión del bienestar SENA</p>
            </div>
          </div>
          <div className="coord-hero-badge">
            <Activity size={14} />
            {format(new Date(), "EEEE dd 'de' MMMM", { locale: es })}
          </div>
        </div>

        {/* Hero Stats */}
        {kpis && (
          <div className="coord-hero-stats">
            <div className="coord-hero-stat">
              <span className="coord-hero-stat-icon"><Users size={18} /></span>
              <div className="coord-hero-stat-value">{kpis.total_appointments || 0}</div>
              <div className="coord-hero-stat-label">Total Citas</div>
            </div>
            <div className="coord-hero-stat">
              <span className="coord-hero-stat-icon"><CheckCircle size={18} /></span>
              <div className="coord-hero-stat-value">
                {kpis.total_appointments > 0
                  ? `${Math.round((kpis.completed_appointments / kpis.total_appointments) * 100)}%`
                  : "0%"}
              </div>
              <div className="coord-hero-stat-label">Cumplimiento</div>
            </div>
            <div className="coord-hero-stat">
              <span className="coord-hero-stat-icon"><Clock size={18} /></span>
              <div className="coord-hero-stat-value">{Math.round(kpis.avg_wait_days || 0)}d</div>
              <div className="coord-hero-stat-label">Tiempo Espera</div>
            </div>
            <div className="coord-hero-stat">
              <span className="coord-hero-stat-icon"><AlertTriangle size={18} /></span>
              <div className="coord-hero-stat-value">{kpis.no_show_count || 0}</div>
              <div className="coord-hero-stat-label">No Asistieron</div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="coord-actions-bar">
        <button className="coord-action-btn primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nueva Cita
        </button>
        <button className="coord-action-btn" onClick={() => fetchAllMetrics(dateRange)} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spinner" : ""} /> Actualizar
        </button>
        <button className="coord-action-btn" onClick={handleExport} disabled={exporting}>
          <Download size={16} /> {exporting ? "Exportando..." : "Exportar CSV"}
        </button>
        <button className="coord-action-btn" onClick={() => setTab("appointments")}>
          <ClipboardList size={16} /> Ver Todas las Citas
        </button>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="role-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`role-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-tab-content">
        {/* ── TAB: OVERVIEW ── */}
        {tab === "overview" && (
          <>
            <div className="date-filter" role="group" aria-label="Filtro de fechas">
              <Calendar size={16} />
              <input type="date" value={dateRange.from} onChange={(e) => handleDateChange("from", e.target.value)} />
              <span>hasta</span>
              <input type="date" value={dateRange.to} onChange={(e) => handleDateChange("to", e.target.value)} />
            </div>

            {error && (
              <div className="empty-state">
                <p>{error}</p>
                <button className="btn btn-primary btn-sm" onClick={() => { setError(null); fetchAllMetrics(dateRange); }}>Reintentar</button>
              </div>
            )}

            {/* KPI Cards */}
            {kpis && (
              <section className="kpis-grid">
                <KPICard title="Total Citas" value={kpis.total_appointments} color="#39a900" subtitle="En periodo seleccionado" icon={Users} />
                <KPICard title="Tasa de Cumplimiento" value={kpis.total_appointments > 0 ? `${Math.round((kpis.completed_appointments / kpis.total_appointments) * 100)}%` : "0%"} color="#22c55e" subtitle={`${kpis.completed_appointments || 0} completadas`} icon={CheckCircle} />
                <KPICard title="Tiempo Promedio Espera" value={`${Math.round(kpis.avg_wait_days || 0)} días`} color="#f59e0b" subtitle="Desde solicitud a atención" icon={Clock} />
                <KPICard title="No Asistencia" value={kpis.no_show_count || 0} color="#ef4444" subtitle={kpis.total_appointments > 0 ? `${Math.round(((kpis.no_show_count || 0) / kpis.total_appointments) * 100)}%` : "0%"} icon={AlertTriangle} />
              </section>
            )}

            {/* Charts */}
            <section className="charts-grid">
              <DependencyChart data={byDependency} />
              <MonthlyTrendChart data={monthlyTrend} />
            </section>

            {/* Today's Agenda */}
            {todayAppts.length > 0 && (
              <div className="coord-section">
                <div className="coord-section-header">
                  <h3 className="coord-section-title">
                    <Calendar size={18} /> Agenda de Hoy
                  </h3>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{todayAppts.length} cita{todayAppts.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="coord-section-body">
                  <div className="coord-agenda">
                    {todayAppts.map((apt) => (
                      <div key={apt.id} className="coord-agenda-item">
                        <div className="coord-agenda-time">{apt.scheduled_time}</div>
                        <div className="coord-agenda-student">
                          <div className="coord-agenda-avatar">
                            {apt.profiles?.full_name?.[0] || "?"}
                          </div>
                          <div>
                            <div className="coord-agenda-name">
                              {apt.profiles?.full_name || "Sin nombre"}
                            </div>
                            <div className="coord-agenda-dep">
                              {apt.dependencies?.name || "Sin dependencia"}
                            </div>
                          </div>
                        </div>
                        <div className={`coord-apt-status coord-status-${apt.status}`}>
                          {apt.status === "pending" && "Pendiente"}
                          {apt.status === "confirmed" && "Confirmada"}
                          {apt.status === "completed" && "Completada"}
                          {apt.status === "cancelled" && "Cancelada"}
                          {apt.status === "no_show" && "No asistió"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Professional Ranking */}
            {professionals && professionals.length > 0 && (
              <div className="coord-section">
                <div className="coord-section-header">
                  <h3 className="coord-section-title">
                    <TrendingUp size={18} /> Ranking de Profesionales
                  </h3>
                </div>
                <div className="coord-section-body">
                  <div className="coord-prof-rank">
                    {professionals.slice(0, 6).map((prof, i) => {
                      const efficiency = prof.total > 0 ? Math.round((prof.completed / prof.total) * 100) : 0;
                      return (
                        <div key={prof.id || i} className="coord-prof-card">
                          <div className={`coord-prof-rank-num ${i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}>
                            {i + 1}
                          </div>
                          <div className="coord-prof-info">
                            <span className="coord-prof-name">{prof.name}</span>
                            <span className="coord-prof-count">{prof.completed}/{prof.total} citas</span>
                          </div>
                          <div className="coord-prof-efficiency">
                            <span>{efficiency}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB: APPOINTMENTS ── */}
        {tab === "appointments" && (
          <>
            <div className="coord-apt-header">
              <div className="filter-pills" role="tablist">
                {[
                  { key: "all", label: "Todas" },
                  { key: "pending", label: "Pendientes" },
                  { key: "confirmed", label: "Confirmadas" },
                  { key: "completed", label: "Completadas" },
                ].map(({ key, label }) => (
                  <button key={key} role="tab" aria-selected={aptFilter === key} className={`filter-pill ${aptFilter === key ? "active" : ""}`} onClick={() => setAptFilter(key)}>
                    {label}
                  </button>
                ))}
              </div>
              {isCoordinator && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Nueva Cita
                </button>
              )}
            </div>

            <div className="coord-appointments-list">
              {loadingAppointments ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" />)}
                </div>
              ) : appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Calendar size={40} /></div>
                  <h3 className="empty-state-title">No hay citas</h3>
                  <p className="empty-state-description">No se encontraron citas con este filtro.</p>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="coord-apt-new-row" data-status={apt.status}>
                    <div className="coord-apt-new-info">
                      <div className="coord-apt-new-name">
                        <div className="coord-apt-new-avatar">{apt.profiles?.full_name?.[0] || "?"}</div>
                        <div className="coord-apt-new-text">
                          <strong>{apt.profiles?.full_name || "Sin nombre"}</strong>
                          <small>{apt.profiles?.document_number || ""}</small>
                        </div>
                      </div>
                      <span className="coord-apt-new-dep" style={{ background: `${apt.dependencies?.color}15`, color: apt.dependencies?.color }}>
                        {apt.dependencies?.name || "Sin dep."}
                      </span>
                      <div className="coord-apt-new-datetime">
                        <span><Calendar size={13} /> {format(parseISO(apt.scheduled_date), "dd MMM", { locale: es })}</span>
                        <span><Clock size={13} /> {apt.scheduled_time}</span>
                      </div>
                      <span className="coord-apt-new-status coord-status-{apt.status}" style={{
                        background: apt.status === 'pending' ? '#fef3c7' : apt.status === 'confirmed' ? '#dbeafe' : apt.status === 'completed' ? '#d1fae5' : '#f3f4f6',
                        color: apt.status === 'pending' ? '#92400e' : apt.status === 'confirmed' ? '#1e40af' : apt.status === 'completed' ? '#065f46' : '#6b7280'
                      }}>
                        {apt.status === "pending" && "Pendiente"}
                        {apt.status === "confirmed" && "Confirmada"}
                        {apt.status === "completed" && "Completada"}
                        {apt.status === "cancelled" && "Cancelada"}
                        {apt.status === "no_show" && "No asistió"}
                      </span>
                    </div>
                    <div className="coord-apt-new-actions">
                      {apt.status === "pending" && (
                        <button className="btn btn-success btn-sm" onClick={() => handleConfirm(apt.id)}>
                          <CheckCircle size={14} /> Confirmar
                        </button>
                      )}
                      {apt.status === "confirmed" && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleComplete(apt.id)}>
                          <CheckCircle size={14} /> Completar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── TAB: PROFESSIONALS ── */}
        {tab === "professionals" && (
          <ProfessionalTable data={professionals} />
        )}

        {/* ── TAB: REPORTS ── */}
        {tab === "reports" && (
          <div className="coord-section">
            <div className="coord-section-header">
              <h3 className="coord-section-title">
                <FileText size={18} /> Exportar Reportes
              </h3>
            </div>
            <div className="coord-section-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Target size={48} style={{ color: '#39a900', marginBottom: 16 }} />
              <h3 style={{ color: '#111827', marginBottom: 8 }}>Reporte del Periodo</h3>
              <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>
                Descarga un archivo CSV con todas las citas y métricas del periodo seleccionado.
              </p>
              <div className="date-filter" style={{ justifyContent: 'center', marginBottom: 20 }}>
                <Calendar size={16} />
                <input type="date" value={dateRange.from} onChange={(e) => handleDateChange("from", e.target.value)} />
                <span>hasta</span>
                <input type="date" value={dateRange.to} onChange={(e) => handleDateChange("to", e.target.value)} />
              </div>
              <button className="coord-action-btn primary" onClick={handleExport} disabled={exporting} style={{ margin: '0 auto' }}>
                <Download size={16} /> {exporting ? "Generando..." : "Descargar Reporte CSV"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: NUEVA CITA ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title"><Plus size={18} /> Nueva Cita</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateAppointment} className="appointment-form">
                <div className="form-group">
                  <label className="form-label form-label-required">Aprendiz</label>
                  <select className="form-select" value={form.user_id} onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))} required>
                    <option value="">Seleccionar aprendiz...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Dependencia</label>
                  <select className="form-select" value={form.dependency_id} onChange={(e) => setForm((f) => ({ ...f, dependency_id: e.target.value }))} required>
                    <option value="">Seleccionar dependencia...</option>
                    {dependencies.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label form-label-required">Fecha</label>
                    <input type="date" className="form-input" value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Hora</label>
                    <select className="form-select" value={form.scheduled_time} onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))}>
                      {Array.from({ length: 9 }, (_, i) => {
                        const h = (8 + i).toString().padStart(2, "0");
                        return <option key={h} value={`${h}:00`}>{h}:00</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Motivo</label>
                  <textarea className="form-textarea" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} rows={3} placeholder="Describe el motivo de la cita..." />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                    {creating ? "Creando..." : "Crear Cita"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
