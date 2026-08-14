import { useEffect, useState } from "react";
import { Clock, User, Database, ArrowRight, Search } from "lucide-react";

const ACTION_COLORS = {
  CREATE_USER: "var(--success)",
  UPDATE_USER: "var(--info)",
  DELETE_APPOINTMENT: "var(--error)",
  UPDATE_CONFIG: "var(--warning)",
};

const ACTION_LABELS = {
  CREATE_USER: "Creación",
  UPDATE_USER: "Actualización",
  DELETE_APPOINTMENT: "Eliminación",
  UPDATE_CONFIG: "Configuración",
};

export default function AuditLogViewer({ admin }) {
  const { auditLogs, auditPagination, fetchAuditLogs } = admin;
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAuditLogs({ page, limit: 20 });
  }, [fetchAuditLogs, page]);

  const filteredLogs = filter
    ? auditLogs.filter(
        (l) =>
          l.action.includes(filter) ||
          l.entity_type.includes(filter) ||
          l.admin?.full_name?.includes(filter)
      )
    : auditLogs;

  const formatJSON = (data) => {
    try {
      if (typeof data === "string") {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="admin-section">
      <header className="section-header">
        <h2>Registro de Auditoría</h2>
        <span className="badge badge-lg">
          {filteredLogs.length} registros
        </span>
      </header>

      <div className="form-search">
        <span className="form-search-icon">
          <Search size={16} />
        </span>
        <input
          type="text"
          className="form-input"
          placeholder="Filtrar por acción, entidad o usuario..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filtrar registros de auditoría"
          style={{ paddingLeft: "var(--space-10)" }}
        />
      </div>

      <div className="audit-timeline" role="list" aria-label="Línea de tiempo de auditoría">
        {filteredLogs.length === 0 ? (
          <div className="empty-state-compact">
            <p>No se encontraron registros de auditoría</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="audit-item" role="listitem">
              <div
                className="audit-dot"
                style={{ backgroundColor: ACTION_COLORS[log.action] || "var(--gray-400)" }}
                aria-hidden="true"
              />
              <div className="audit-header">
                <div className="audit-time">
                  <span
                    className="audit-action"
                    style={{ color: ACTION_COLORS[log.action] }}
                  >
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>
                    <Clock size={12} />
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="audit-detail">
                  <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
                    <User size={14} />
                    <strong>{log.admin?.full_name || "Sistema"}</strong>
                    {" modificó "}
                    <Database size={14} />
                    <strong>{log.entity_type}</strong>
                    {` (ID: ${log.entity_id})`}
                  </p>

                  {log.old_data && log.new_data && (
                    <div className="audit-changes">
                      <div className="change-box old">
                        <span className="label">Antes</span>
                        <pre>{formatJSON(log.old_data)}</pre>
                      </div>
                      <ArrowRight size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0, marginTop: 16 }} />
                      <div className="change-box new">
                        <span className="label">Después</span>
                        <pre>{formatJSON(log.new_data)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {auditPagination && auditPagination.total > 20 && (
        <div className="pagination">
          <span className="pagination-info">
            Total: {auditPagination.total} registros
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Página anterior"
            >
              ←
            </button>
            <span className="pagination-info">
              Página {page} de {Math.ceil(auditPagination.total / 20)}
            </span>
            <button
              className="pagination-btn"
              disabled={page >= Math.ceil(auditPagination.total / 20)}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Página siguiente"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
