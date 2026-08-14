import { useState } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import {
  User,
  Mail,
  CreditCard,
  Shield,
  Building2,
  Calendar,
  Save,
  X,
  Pencil,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Info,
  Settings,
  Phone,
  CheckCircle,
  XCircle,
  PencilLine,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// Funciones permitidas por rol (con links a la sección correspondiente)
const ROLE_PERMISSIONS = {
  SUPERADMIN: {
    label: "Super Administrador",
    color: "#ef4444",
    description: "Control total del sistema",
    functions: [
      { name: "Gestionar usuarios", allowed: true, link: "/admin" },
      { name: "Crear / editar / eliminar usuarios", allowed: true, link: "/admin" },
      { name: "Asignar roles y dependencias", allowed: true, link: "/admin" },
      { name: "Ver auditoría del sistema", allowed: true, link: "/admin" },
      { name: "Configurar el sistema", allowed: true, link: "/admin" },
      { name: "Ver reportes y KPIs", allowed: true, link: "/coordination" },
      { name: "Gestionar todas las citas", allowed: true, link: "/coordination" },
      { name: "Exportar datos (CSV)", allowed: true, link: "/coordination" },
    ],
  },
  COORDINACION: {
    label: "Coordinación",
    color: "#3b82f6",
    description: "Coordinación de bienestar institucional",
    functions: [
      { name: "Ver reportes y KPIs", allowed: true, link: "/coordination" },
      { name: "Gestionar todas las citas", allowed: true, link: "/coordination" },
      { name: "Asignar profesionales a citas", allowed: true, link: "/coordination" },
      { name: "Ver auditoría", allowed: true, link: "/coordination" },
      { name: "Exportar datos (CSV)", allowed: true, link: "/coordination" },
      { name: "Crear / eliminar usuarios", allowed: true, link: "/admin" },
      { name: "Configurar el sistema", allowed: true, link: "/admin" },
    ],
  },
  PSICOLOGIA: {
    label: "Psicología",
    color: "#8b5cf6",
    description: "Profesional de psicología",
    functions: [
      { name: "Ver citas asignadas", allowed: true, link: "/psychology" },
      { name: "Confirmar / completar citas", allowed: true, link: "/psychology" },
      { name: "Agregar notas de sesión", allowed: true, link: "/psychology" },
      { name: "Ver lista de pacientes", allowed: true, link: "/psychology" },
    ],
  },
  ENFERMERIA: {
    label: "Enfermería",
    color: "#ef4444",
    description: "Profesional de enfermería",
    functions: [
      { name: "Ver citas asignadas", allowed: true, link: "/enfermeria" },
      { name: "Confirmar / completar citas", allowed: true, link: "/enfermeria" },
      { name: "Agregar notas de sesión", allowed: true, link: "/enfermeria" },
      { name: "Ver lista de pacientes", allowed: true, link: "/enfermeria" },
    ],
  },
  TRABAJO_SOCIAL: {
    label: "Trabajo Social",
    color: "#f59e0b",
    description: "Profesional de trabajo social",
    functions: [
      { name: "Ver citas asignadas", allowed: true, link: "/social-work" },
      { name: "Confirmar / completar citas", allowed: true, link: "/social-work" },
      { name: "Agregar notas de sesión", allowed: true, link: "/social-work" },
      { name: "Ver pacientes", allowed: true, link: "/social-work" },
    ],
  },
  APRENDIZ: {
    label: "Aprendiz",
    color: "#22c55e",
    description: "Aprendiz SENA",
    functions: [
      { name: "Agendar citas de bienestar", allowed: true, link: "/dashboard" },
      { name: "Ver mis citas", allowed: true, link: "/dashboard" },
      { name: "Cancelar citas propias", allowed: true, link: "/dashboard" },
      { name: "Editar perfil", allowed: true, link: "/profile" },
    ],
  },
};

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("info");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    document_number: profile?.document_number || "",
    phone: profile?.phone || "",
  });

  const [pwForm, setPwForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [changingPw, setChangingPw] = useState(false);

  // Email change
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  const tabs = [
    { id: "info", label: "Información", icon: Info },
    { id: "account", label: "Cuenta", icon: Settings },
    { id: "roles", label: "Rol y Funciones", icon: Shield },
  ];

  const roleName = profile?.roles?.name || "APRENDIZ";
  const roleInfo = ROLE_PERMISSIONS[roleName] || ROLE_PERMISSIONS.APRENDIZ;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim(),
          document_number: form.document_number.trim(),
          phone: form.phone.trim(),
          updated_at: new Date(),
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Perfil actualizado correctamente");
      setEditing(false);
      window.location.reload();
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: profile?.full_name || "",
      document_number: profile?.document_number || "",
      phone: profile?.phone || "",
    });
    setEditing(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPassword) return;
    if (pwForm.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setChangingPw(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email || user?.email,
        password: pwForm.current,
      });
      if (signInError) throw new Error("La contraseña actual es incorrecta");
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada correctamente");
      setPwForm({ current: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  // ── Change email ──
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === (profile.email || user?.email)) {
      setEditingEmail(false);
      return;
    }
    setChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast.success("Se envió un enlace de confirmación a tu nuevo correo");
      setEditingEmail(false);
      setNewEmail("");
    } catch (err) {
      toast.error("Error cambiando correo: " + err.message);
    } finally {
      setChangingEmail(false);
    }
  };

  if (!profile) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="dashboard-header">
        <div>
          <h1>Mi Perfil</h1>
          <p>Información personal, cuenta y permisos</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs" role="tablist" aria-label="Secciones del perfil">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => { setTab(t.id); setEditing(false); }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-tab-content">
        {/* ── TAB: INFORMACIÓN ── */}
        {tab === "info" && (
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">{profile.full_name?.[0] || "?"}</div>
              <div className="profile-name-section">
                <h2 className="profile-name">{profile.full_name || "Sin nombre"}</h2>
                <span className="profile-role-badge" style={{ color: roleInfo.color, backgroundColor: `${roleInfo.color}15` }}>
                  <Shield size={14} />
                  {roleInfo.label}
                </span>
              </div>
              {!editing && (
                <button className="btn btn-outline btn-sm profile-edit-btn" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Editar
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="profile-form">
                <div className="profile-fields">
                  <div className="profile-field">
                    <label className="profile-field-label"><User size={16} /> Nombre completo</label>
                    <input type="text" className="form-input" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required autoFocus />
                  </div>
                  <div className="profile-field">
                    <label className="profile-field-label"><Phone size={16} /> Teléfono</label>
                    <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Ej: 300 123 4567" />
                  </div>
                  <div className="profile-field">
                    <label className="profile-field-label"><CreditCard size={16} /> Número de documento</label>
                    <input type="text" className="form-input" value={form.document_number} onChange={(e) => setForm((f) => ({ ...f, document_number: e.target.value }))} placeholder="Opcional" />
                  </div>
                </div>
                <div className="profile-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel}><X size={14} /> Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}><Save size={14} /> {saving ? "Guardando..." : "Guardar"}</button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="profile-field">
                  <div className="profile-field-label"><User size={16} /> Nombre</div>
                  <div className="profile-field-value">{profile.full_name || "Sin nombre"}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label"><Phone size={16} /> Teléfono</div>
                  <div className="profile-field-value">{profile.phone || "No registrado"}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label"><Mail size={16} /> Correo electrónico</div>
                  <div className="profile-field-value">{profile.email || user?.email || "-"}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label"><CreditCard size={16} /> Documento</div>
                  <div className="profile-field-value">{profile.document_number || "No registrado"}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label"><Building2 size={16} /> Dependencia</div>
                  <div className="profile-field-value">{profile.dependencies?.name || "Sin asignar"}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label"><Calendar size={16} /> Miembro desde</div>
                  <div className="profile-field-value">
                    {profile.created_at ? format(parseISO(profile.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: CUENTA ── */}
        {tab === "account" && (
          <div className="profile-card">
            <div className="profile-section-header">
              <KeyRound size={20} />
              <div><h3>Cambiar Contraseña</h3><p>Actualiza tu contraseña de acceso</p></div>
            </div>
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="profile-fields">
                <div className="profile-field">
                  <label className="profile-field-label"><Lock size={16} /> Contraseña actual</label>
                  <div className="profile-pw-wrapper">
                    <input type={showPw.current ? "text" : "password"} className="form-input" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} placeholder="Ingresa tu contraseña actual" required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}>{showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <div className="profile-field">
                  <label className="profile-field-label"><Lock size={16} /> Nueva contraseña</label>
                  <div className="profile-pw-wrapper">
                    <input type={showPw.new ? "text" : "password"} className="form-input" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="Mínimo 6 caracteres" minLength={6} required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))}>{showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <div className="profile-field">
                  <label className="profile-field-label"><Lock size={16} /> Confirmar contraseña</label>
                  <div className="profile-pw-wrapper">
                    <input type={showPw.confirm ? "text" : "password"} className="form-input" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="Repite la nueva contraseña" minLength={6} required />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}>{showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                {pwForm.newPassword && pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
                  <span className="profile-pw-error">Las contraseñas no coinciden</span>
                )}
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn btn-primary btn-sm" disabled={changingPw || !pwForm.current || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirm}>
                  <KeyRound size={14} /> {changingPw ? "Cambiando..." : "Cambiar contraseña"}
                </button>
              </div>
            </form>
            <div className="profile-section-divider" />
            <div className="profile-section-header">
              <Mail size={20} />
              <div style={{ flex: 1 }}>
                <h3>Correo electrónico</h3>
                {editingEmail ? (
                  <form onSubmit={handleChangeEmail} className="profile-email-form">
                    <input
                      type="email"
                      className="form-input"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="nuevo@correo.com"
                      autoFocus
                      required
                    />
                    <div className="profile-email-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingEmail(false); setNewEmail(""); }}>
                        <X size={14} /> Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={changingEmail || !newEmail.trim()}>
                        <Save size={14} /> {changingEmail ? "Enviando..." : "Guardar"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-email-row">
                    <p>{profile.email || user?.email}</p>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditingEmail(true); setNewEmail(profile.email || user?.email || ""); }}>
                      <PencilLine size={14} /> Cambiar
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="profile-section-header">
              <Calendar size={20} />
              <div><h3>Cuenta creada</h3><p>{profile.created_at ? format(parseISO(profile.created_at), "dd 'de' MMMM 'de' yyyy", { locale: es }) : "-"}</p></div>
            </div>
          </div>
        )}

        {/* ── TAB: ROL Y FUNCIONES ── */}
        {tab === "roles" && (
          <div className="profile-card">
            <div className="profile-role-header" style={{ borderColor: roleInfo.color }}>
              <div className="profile-role-icon" style={{ background: `${roleInfo.color}15`, color: roleInfo.color }}>
                <Shield size={28} />
              </div>
              <div>
                <h2 className="profile-role-title">{roleInfo.label}</h2>
                <p className="profile-role-desc">{roleInfo.description}</p>
              </div>
            </div>

            <div className="profile-permissions">
              <h3 className="profile-permissions-title">Funciones de tu rol</h3>
              <p className="profile-permissions-hint">Haz clic en una función para ir a esa sección</p>
              {roleInfo.functions.map((fn, i) => (
                <div
                  key={i}
                  className={`profile-permission-item ${fn.allowed && fn.link ? "clickable" : ""}`}
                  onClick={() => fn.allowed && fn.link && navigate(fn.link)}
                  role={fn.allowed && fn.link ? "button" : undefined}
                  tabIndex={fn.allowed && fn.link ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && fn.allowed && fn.link) navigate(fn.link);
                  }}
                >
                  <div className={`profile-permission-icon ${fn.allowed ? "allowed" : "denied"}`}>
                    {fn.allowed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <span className={`profile-permission-text ${fn.allowed ? "" : "denied"}`}>
                    {fn.name}
                  </span>
                  {fn.allowed && fn.link && <span className="profile-permission-arrow">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
