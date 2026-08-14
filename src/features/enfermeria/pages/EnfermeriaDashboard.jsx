import { useEffect, useState, useRef, useMemo } from "react";
import { useAppointments } from "../../appointments/hooks/useAppointments";
import { useAuth } from "../../../providers/AuthProvider";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  StickyNote,
  Send,
  X,
  Users,
  Plus,
  ClipboardList,
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
  Pill,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_TABS = [
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Completadas" },
  { key: "all", label: "Todas" },
];

export default function EnfermeriaDashboard() {
  const { appointments, fetchAppointments, updateStatus, cancelAppointment, isLoading } = useAppointments();
  const { profile } = useAuth();
  const [mainTab, setMainTab] = useState("overview");
  const [filter, setFilter] = useState("pending");
  const [notesModal, setNotesModal] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const modalRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ user_id: "", dependency_id: "", scheduled_date: "", scheduled_time: "08:00", reason: "" });
  const [students, setStudents] = useState([]);
  const [dependencies, setDependencies] = useState([]);

  useEffect(() => {
    if (profile?.dependency_id) {
      fetchAppointments({ status: filter === "all" ? undefined : filter });
    }
  }, [filter, fetchAppointments, profile?.dependency_id]);

  useEffect(() => {
    if (showForm) {
      supabase.from("profiles").select("id, full_name, email").then(({ data }) => setStudents(data || []));
      supabase.from("dependencies").select("id, name").then(({ data }) => setDependencies(data || []));
    }
  }, [showForm]);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!form.user_id) { toast.error("Selecciona un aprendiz"); return; }
    if (!form.dependency_id) { toast.error("Selecciona una dependencia"); return; }
    if (!form.scheduled_date) { toast.error("Selecciona una fecha"); return; }
    setCreating(true);
    try {
      const { error } = await supabase.rpc("create_appointment", {
        p_user_id: form.user_id,
        p_dependency_id: Number(form.dependency_id),
        p_scheduled_date: form.scheduled_date,
        p_scheduled_time: form.scheduled_time,
        p_reason: form.reason || null,
      });
      if (error) throw error;
      toast.success("Cita creada correctamente");
      setShowForm(false);
      setForm({ user_id: "", dependency_id: "", scheduled_date: "", scheduled_time: "08:00", reason: "" });
      fetchAppointments({ status: filter === "all" ? undefined : filter });
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast.error("Error creando cita: " + (err.message || "Error desconocido"));
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = (id) => updateStatus(id, "confirmed");
  const handleComplete = (id) => updateStatus(id, "completed");
  const handleNoshow = (id) => updateStatus(id, "no_show");
  const handleCancel = (id) => cancelAppointment(id);

  const handleSaveNote = async (appointmentId) => {
    if (!noteText.trim()) return;
    await updateStatus(appointmentId, "confirmed", noteText.trim());
    setNotesModal(null);
    setNoteText("");
  };

  const toggleExpand = (id) => setExpandedCard(expandedCard === id ? null : id);

  const allPatients = useMemo(() => {
    const map = new Map();
    appointments.forEach((apt) => {
      if (!apt.profiles?.full_name) return;
      const id = apt.user_id;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: apt.profiles.full_name,
          doc: apt.profiles.document_number,
          count: 0,
          completed: 0,
          pending: 0,
          lastDate: apt.scheduled_date,
        });
      }
      const p = map.get(id);
      p.count++;
      if (apt.status === "completed") p.completed++;
      if (apt.status === "pending") p.pending++;
      if (apt.scheduled_date > p.lastDate) p.lastDate = apt.scheduled_date;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [appointments]);

  const notesHistory = useMemo(() => appointments.filter((apt) => apt.notes), [appointments]);

  const stats = useMemo(() => ({
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  }), [appointments]);

  const completionRate = useMemo(() => {
    const total = stats.pending + stats.confirmed + stats.completed;
    return total > 0 ? Math.round((stats.completed / total) * 100) : 0;
  }, [stats]);

  const getPriorityLevel = (patient) => {
    if (patient.pending >= 3) return "urgente";
    if (patient.pending >= 1) return "seguimiento";
    return "control";
  };

  const mainTabs = [
    { id: "overview", label: "Vista General", icon: Stethoscope },
    { id: "citas", label: "Mis Citas", icon: Calendar },
    { id: "patients", label: "Pacientes", icon: Users },
    { id: "notes", label: "Notas Clínicas", icon: ClipboardList },
  ];

  if (isLoading && appointments.length === 0) {
    return (
      <div className="dashboard-container" role="status" aria-label="Cargando">
        <header className="dashboard-header">
          <div>
            <div className="skeleton skeleton-text" style={{ width: 280, height: 28 }} />
            <div className="skeleton skeleton-text-sm" style={{ width: 200, marginTop: 8 }} />
          </div>
        </header>
        <div className="psych-stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container psych-dashboard">
      {/* HERO HEADER */}
      <div className="nursing-hero">
        <div className="psych-hero-content">
          <div className="psych-hero-left">
            <div className="nursing-hero-icon">🏥</div>
            <div className="psych-hero-text">
              <h1>Consulta de Enfermería</h1>
              <p>{profile?.dependencies?.name || "Enfermería"} — Atención en salud y primeros auxilios</p>
            </div>
          </div>
          <div className="nursing-hero-badge">
            <Activity size={14} />
            Atención activa
          </div>
        </div>

        <div className="nursing-hero-stats">
          <div className="nursing-hero-stat">
            <div className="nursing-hero-stat-icon">🩺</div>
            <div className="nursing-hero-stat-value">{stats.pending}</div>
            <div className="nursing-hero-stat-label">Por Atender</div>
          </div>
          <div className="nursing-hero-stat">
            <div className="nursing-hero-stat-icon">💉</div>
            <div className="nursing-hero-stat-value">{stats.confirmed}</div>
            <div className="nursing-hero-stat-label">En Atención</div>
          </div>
          <div className="nursing-hero-stat">
            <div className="nursing-hero-stat-icon">✅</div>
            <div className="nursing-hero-stat-value">{completionRate}%</div>
            <div className="nursing-hero-stat-label">Tasa Éxito</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="role-tabs" role="tablist" aria-label="Secciones de enfermería">
        {mainTabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mainTab === t.id}
            className={`role-tab ${mainTab === t.id ? "active red" : ""}`}
            onClick={() => setMainTab(t.id)}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* BOTÓN NUEVA CITA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="coord-action-btn primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Nueva Cita
        </button>
      </div>

      <div className="admin-tab-content" role="tabpanel">
        {/* TAB: OVERVIEW */}
        {mainTab === "overview" && (
          <>
            <div className="psych-content-card">
              <div className="psych-content-header">
                <h3 className="psych-content-title">
                  <Users size={18} /> Mis Pacientes
                </h3>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{allPatients.length} paciente{allPatients.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="psych-content-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                {allPatients.length === 0 ? (
                  <div className="empty-state" style={{ width: '100%' }}>
                    <div className="empty-state-icon"><Stethoscope size={40} /></div>
                    <h3 className="empty-state-title">Sin pacientes aún</h3>
                    <p className="empty-state-description">Las citas asignadas a enfermería aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="nursing-patient-grid" style={{ width: '100%' }}>
                    {allPatients.map((p) => {
                      const priority = getPriorityLevel(p);
                      return (
                        <div key={p.id} className="nursing-patient-card">
                          <div className="psych-patient-enhanced-header">
                            <div className="psych-patient-enhanced-info">
                              <div className="nursing-patient-avatar">{p.name[0]}</div>
                              <div>
                                <span className="psych-patient-enhanced-name">{p.name}</span>
                                <span className="psych-patient-enhanced-doc">{p.doc || "Sin documento"}</span>
                              </div>
                            </div>
                            <span className={`nursing-priority-badge ${priority}`}>
                              {priority === 'urgente' ? <AlertTriangle size={10} /> : <Shield size={10} />}
                              {priority === 'urgente' ? 'Urgente' : priority === 'seguimiento' ? 'Seguimiento' : 'Control'}
                            </span>
                          </div>
                          <div className="psych-patient-enhanced-stats">
                            <div className="psych-patient-mini-stat">
                              <strong>{p.count}</strong>
                              <small>Total</small>
                            </div>
                            <div className="psych-patient-mini-stat">
                              <strong>{p.completed}</strong>
                              <small>Atendidas</small>
                            </div>
                            <div className="psych-patient-mini-stat">
                              <strong>{p.pending}</strong>
                              <small>Pendientes</small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB: CITAS */}
        {mainTab === "citas" && (
          <>
            <div className="filter-pills" role="tablist" aria-label="Filtrar por estado">
              {STATUS_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  className={`filter-pill red ${filter === key ? "active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="psych-appointments" role="tabpanel">
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Calendar size={40} /></div>
                  <h3 className="empty-state-title">No hay citas</h3>
                  <p className="empty-state-description">No hay citas en esta categoría.</p>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="nursing-enhanced-row" data-status={apt.status}>
                    <div className="nursing-enhanced-main" onClick={() => toggleExpand(apt.id)}>
                      <div className="psych-enhanced-info">
                        <div className="psych-enhanced-patient">
                          <div className="nursing-enhanced-avatar">{apt.profiles?.full_name?.[0] || "?"}</div>
                          <div>
                            <span className="psych-enhanced-name">{apt.profiles?.full_name || "Sin nombre"}</span>
                            <span className="psych-enhanced-doc">{apt.profiles?.document_number || ""}</span>
                          </div>
                        </div>
                        <div className="psych-enhanced-meta">
                          <span><Calendar size={13} /> {format(parseISO(apt.scheduled_date), "dd MMM yyyy", { locale: es })}</span>
                          <span><Clock size={13} /> {apt.scheduled_time}</span>
                        </div>
                        <span className="nursing-enhanced-status" data-s={apt.status}>
                          {apt.status === "pending" && "Pendiente"}
                          {apt.status === "confirmed" && "En Atención"}
                          {apt.status === "completed" && "Atendida"}
                          {apt.status === "cancelled" && "Cancelada"}
                          {apt.status === "no_show" && "No asistió"}
                        </span>
                      </div>
                      <span style={{ color: '#9ca3af', flexShrink: 0 }}>
                        {expandedCard === apt.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>

                    {expandedCard === apt.id && (
                      <div className="psych-appointment-details">
                        {apt.reason && (
                          <div className="psych-detail-section">
                            <FileText size={14} />
                            <div>
                              <strong>Motivo de consulta</strong>
                              <p>{apt.reason}</p>
                            </div>
                          </div>
                        )}
                        {apt.notes && (
                          <div className="psych-detail-section">
                            <StickyNote size={14} />
                            <div>
                              <strong>Notas clínicas</strong>
                              <p>{apt.notes}</p>
                            </div>
                          </div>
                        )}
                        <div className="psych-actions">
                          {apt.status === "pending" && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => handleConfirm(apt.id)}>
                                <CheckCircle size={14} /> Atender
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleNoshow(apt.id)}>
                                <XCircle size={14} /> No asistió
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt.id)}>
                                <XCircle size={14} /> Apartar Cita
                              </button>
                            </>
                          )}
                          {apt.status === "confirmed" && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => handleComplete(apt.id)}>
                                <CheckCircle size={14} /> Completar
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => { setNotesModal(apt); setNoteText(apt.notes || ""); }}
                              >
                                <StickyNote size={14} /> {apt.notes ? "Editar notas" : "Agregar notas"}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt.id)}>
                                <XCircle size={14} /> Apartar Cita
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* TAB: PACIENTES */}
        {mainTab === "patients" && (
          <div className="psych-patients">
            {allPatients.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Users size={40} /></div>
                <h3 className="empty-state-title">No hay pacientes</h3>
                <p className="empty-state-description">Aún no se han registrado citas en enfermería.</p>
              </div>
            ) : (
              <div className="nursing-patient-grid">
                {allPatients.map((p) => {
                  const priority = getPriorityLevel(p);
                  return (
                    <div key={p.id} className="nursing-patient-card">
                      <div className="psych-patient-enhanced-header">
                        <div className="psych-patient-enhanced-info">
                          <div className="nursing-patient-avatar">{p.name[0]}</div>
                          <div>
                            <span className="psych-patient-enhanced-name">{p.name}</span>
                            <span className="psych-patient-enhanced-doc">{p.doc || "Sin documento"}</span>
                          </div>
                        </div>
                        <span className={`nursing-priority-badge ${priority}`}>
                          {priority === 'urgente' ? <AlertTriangle size={10} /> : <Shield size={10} />}
                          {priority === 'urgente' ? 'Urgente' : priority === 'seguimiento' ? 'Seguimiento' : 'Control'}
                        </span>
                      </div>
                      <div className="psych-patient-enhanced-stats">
                        <div className="psych-patient-mini-stat">
                          <strong>{p.count}</strong>
                          <small>Total</small>
                        </div>
                        <div className="psych-patient-mini-stat">
                          <strong>{p.completed}</strong>
                          <small>Atendidas</small>
                        </div>
                        <div className="psych-patient-mini-stat">
                          <strong>{p.pending}</strong>
                          <small>Pendientes</small>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: NOTAS */}
        {mainTab === "notes" && (
          <div className="psych-content-card">
            <div className="psych-content-header">
              <h3 className="psych-content-title">
                <ClipboardList size={18} /> Historial de Notas Clínicas
              </h3>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>{notesHistory.length} nota{notesHistory.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {notesHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><ClipboardList size={40} /></div>
                  <h3 className="empty-state-title">No hay notas registradas</h3>
                  <p className="empty-state-description">Las notas clínicas aparecerán aquí cuando las agregues a las citas atendidas.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {notesHistory.map((apt) => (
                    <div key={apt.id} className="enhanced-note-card">
                      <div className="enhanced-note-header">
                        <div className="enhanced-note-patient">
                          <div className="nursing-enhanced-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                            {apt.profiles?.full_name?.[0] || "?"}
                          </div>
                          <div>
                            <span className="psych-enhanced-name" style={{ fontSize: 14 }}>{apt.profiles?.full_name}</span>
                            <span className="psych-enhanced-doc">
                              {format(parseISO(apt.scheduled_date), "dd MMM yyyy", { locale: es })} — {apt.scheduled_time}
                            </span>
                          </div>
                        </div>
                        <span className="nursing-enhanced-status" data-s={apt.status}>
                          {apt.status === "completed" ? "Atendida" : "En Atención"}
                        </span>
                      </div>
                      {apt.reason && (
                        <div style={{ fontSize: 13, color: '#6b7280', padding: '8px 12px', background: '#f9fafb', borderRadius: 8, marginBottom: 10 }}>
                          <strong style={{ color: '#374151' }}>Motivo:</strong> {apt.reason}
                        </div>
                      )}
                      <div className="enhanced-note-body red">
                        <StickyNote size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
                        <p style={{ margin: 0 }}>{apt.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes modal */}
      {notesModal && (
        <div className="modal-overlay" onClick={() => setNotesModal(null)} role="dialog" aria-modal="true">
          <div ref={modalRef} className="modal-content enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <StickyNote size={18} /> Notas Clínicas
              </h2>
              <button className="modal-close" onClick={() => setNotesModal(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="nursing-enhanced-avatar" style={{ width: 44, height: 44 }}>
                  {notesModal.profiles?.full_name?.[0] || "?"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{notesModal.profiles?.full_name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} />
                    {format(parseISO(notesModal.scheduled_date), "PPP", { locale: es })} a las {notesModal.scheduled_time}
                  </div>
                </div>
              </div>
              {notesModal.reason && (
                <div className="psych-notes-reason">
                  <strong>Motivo:</strong> {notesModal.reason}
                </div>
              )}
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Describe signos vitales, tratamientos aplicados, medicación suministrada, recomendaciones de salud..."
                rows={6}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setNotesModal(null)}>Cancelar</button>
                <button className="btn btn-primary btn-sm" onClick={() => handleSaveNote(notesModal.id)} disabled={!noteText.trim()}>
                  <Send size={14} /> Guardar notas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA CITA */}
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
                  <textarea className="form-textarea" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} rows={3} placeholder="Describe el motivo de la consulta de enfermería..." />
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
