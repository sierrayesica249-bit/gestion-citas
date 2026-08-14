import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", color: "var(--warning)", icon: AlertCircle },
  confirmed: { label: "Confirmada", color: "var(--info)", icon: CheckCircle },
  completed: { label: "Completada", color: "var(--success)", icon: CheckCircle },
  cancelled: { label: "Cancelada", color: "var(--error)", icon: XCircle },
  no_show: { label: "No asistió", color: "var(--gray-500)", icon: XCircle },
};

const DEFAULT_STATUS = { label: "Desconocido", color: "var(--gray-500)", icon: AlertCircle };

export function AppointmentCard({ appointment, onCancel, isAprendiz }) {
  const {
    dependencies,
    scheduled_date,
    scheduled_time,
    status,
    reason,
    profiles,
    professional,
  } = appointment;
  const config = STATUS_CONFIG[status] || DEFAULT_STATUS;
  const Icon = config.icon;

  return (
    <div
      className="appointment-card"
      style={{ borderLeftColor: dependencies?.color || "var(--gray-300)" }}
      role="article"
      aria-label={`Cita ${config.label} el ${scheduled_date} a las ${scheduled_time}`}
    >
      <div className="card-header">
        <div
          className="dependency-badge"
          style={{
            backgroundColor: dependencies?.color ? `${dependencies?.color}15` : undefined,
            color: dependencies?.color,
            borderColor: dependencies?.color ? `${dependencies?.color}30` : undefined,
          }}
        >
          {dependencies?.name}
        </div>
        <div
          className={`status-badge ${status}`}
          role="status"
          aria-label={`Estado: ${config.label}`}
        >
          <Icon size={12} />
          <span>{config.label}</span>
        </div>
      </div>

      <div className="card-datetime">
        <div className="datetime-item">
          <Calendar size={14} />
          <span>{format(parseISO(scheduled_date), "PPP", { locale: es })}</span>
        </div>
        <div className="datetime-item">
          <Clock size={14} />
          <span>{scheduled_time}</span>
        </div>
      </div>

      {reason && (
        <div className="card-body">
          <p className="reason">{reason}</p>
        </div>
      )}

      {!isAprendiz && profiles && (
        <div className="aprendiz-info">
          <User size={14} />
          <span>{profiles.full_name}</span>
        </div>
      )}

      {isAprendiz && professional && (
        <div className="aprendiz-info">
          <User size={14} />
          <span>Profesional: {professional.full_name}</span>
        </div>
      )}

      {isAprendiz && (status === "pending" || status === "confirmed") && (
        <div className="card-actions">
          <button
            onClick={onCancel}
            className="btn btn-danger btn-sm"
            aria-label="Cancelar esta cita"
          >
            <XCircle size={14} />
            Cancelar Cita
          </button>
        </div>
      )}
    </div>
  );
}
