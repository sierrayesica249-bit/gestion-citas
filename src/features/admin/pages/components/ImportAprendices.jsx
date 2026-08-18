import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  X,
  FileSpreadsheet,
  UserPlus,
  Lock,
  User,
  Building2,
  AlertTriangle,
} from "lucide-react";

const COLUMN_ALIASES = {
  documento: ["documento", "document", "cedula", "documento de identidad", "identificacion"],
  nombres: ["nombres", "nombre", "first name", "nombre(s)"],
  apellidos: ["apellidos", "apellido", "last name", "apellido(s)"],
  correo: ["correo", "email", "correo electronico", "correo electrónico", "correo electronico", "e-mail", "mail"],
  telefono: ["telefono", "teléfono", "celular", "telefono celular", "cel", "movil"],
  ficha: ["ficha", "numero ficha", "n° ficha", "no ficha"],
  programa: ["programa", "programa de formacion", "programa de formación", "formacion", "formación"],
};

function normalize(str = "") {
  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findColumn(header) {
  const key = normalize(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(key) || key.includes(field)) return field;
  }
  return null;
}

function mapRows(sheet) {
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || [];
  const columnMap = {};
  headers.forEach((h, i) => {
    const field = findColumn(h);
    if (field && !columnMap[field]) columnMap[field] = i;
  });

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const line = data[i];
    if (!line || !line.some((c) => c !== undefined && c !== null && String(c).trim() !== "")) continue;
    const get = (field) => (columnMap[field] !== undefined ? line[columnMap[field]] : "");
    const nombres = String(get("nombres") || "").trim();
    const apellidos = String(get("apellidos") || "").trim();
    const fullName = [nombres, apellidos].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    rows.push({
      row: i + 1,
      document_number: String(get("documento") || "").trim(),
      full_name: fullName,
      email: String(get("correo") || "").trim().toLowerCase(),
      phone: String(get("telefono") || "").trim().replace(/^\+/, ""),
      ficha: String(get("ficha") || "").trim(),
      programa: String(get("programa") || "").trim(),
    });
  }
  return { rows, mappedCount: Object.keys(columnMap).length };
}

export default function ImportAprendices({ admin, onClose }) {
  const { roles, dependencies, importAprendices } = admin;
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [missingColumns, setMissingColumns] = useState([]);
  const [options, setOptions] = useState({
    password: "Sena2024",
    roleId: "",
    dependencyId: "",
  });
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError("");
    setMissingColumns([]);
    setRows([]);
    setSummary(null);
    setProgress(0);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const { rows, mappedCount } = mapRows(firstSheet);

      if (mappedCount < 3) {
        setParseError(
          "No se reconocieron las columnas. Asegúrate de que el archivo tenga columnas como: Documento, Nombres, Apellidos, Correo, Teléfono, Ficha, Programa."
        );
        return;
      }

      const missing = [];
      if (mappedCount < 1) missing.push("Documento");
      if (!rows.some((r) => r.email)) missing.push("Correo");
      if (!rows.some((r) => r.full_name)) missing.push("Nombres/Apellidos");
      setMissingColumns(missing);

      setRows(rows);
    } catch (err) {
      setParseError("Error al leer el archivo: " + err.message);
    }
  };

  const handleImport = async () => {
    if (!rows.length) return;
    if (!options.roleId) {
      setParseError("Selecciona un rol para los usuarios importados.");
      return;
    }
    setImporting(true);
    setProgress(0);
    const result = await importAprendices(
      rows.map((r) => ({ ...r, password: options.password })),
      { password: options.password, roleId: Number(options.roleId), dependencyId: options.dependencyId ? Number(options.dependencyId) : null },
      (done, total) => setProgress(Math.round((done / total) * 100))
    );
    setImporting(false);
    setSummary(result);
  };

  const previewRows = rows.slice(0, 8);

  return (
    <div className="modal-overlay" onClick={() => !importing && onClose()} role="dialog" aria-modal="true" aria-label="Importar aprendices">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <FileSpreadsheet size={18} />
            Importar Aprendices (Excel)
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar" disabled={importing}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!rows.length && !parseError && (
            <div
              className="drop-zone"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            >
              <Upload size={28} />
              <p>Haz clic para subir un archivo <strong>.xlsx</strong></p>
              <span>Las columnas esperadas son: Documento, Nombres, Apellidos, Correo, Teléfono, Ficha, Programa</span>
            </div>
          )}

          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} hidden />

          {parseError && (
            <div className="import-error">
              <AlertTriangle size={18} />
              <span>{parseError}</span>
              {rows.length === 0 && (
                <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                  Volver a elegir archivo
                </button>
              )}
            </div>
          )}

          {fileName && rows.length > 0 && (
            <div className="import-file-info">
              <FileSpreadsheet size={16} />
              <span>{fileName} — {rows.length} aprendices detectados</span>
              <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={importing}>
                Cambiar archivo
              </button>
            </div>
          )}

          {rows.length > 0 && (
            <>
              {missingColumns.length > 0 && (
                <p className="import-warning">
                  <AlertTriangle size={14} />
                  Algunas filas no tienen {missingColumns.join(", ")}; se importarán igualmente.
                </p>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-label-required">Rol</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><User size={18} /></span>
                    <select
                      className="form-select"
                      value={options.roleId}
                      onChange={(e) => setOptions((o) => ({ ...o, roleId: e.target.value }))}
                      disabled={importing}
                    >
                      <option value="">Seleccionar...</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.description || r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dependencia</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Building2 size={18} /></span>
                    <select
                      className="form-select"
                      value={options.dependencyId}
                      onChange={(e) => setOptions((o) => ({ ...o, dependencyId: e.target.value }))}
                      disabled={importing}
                    >
                      <option value="">Ninguna</option>
                      {dependencies.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Contraseña inicial</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Lock size={18} /></span>
                    <input
                      type="text"
                      className="form-input"
                      value={options.password}
                      minLength={6}
                      onChange={(e) => setOptions((o) => ({ ...o, password: e.target.value }))}
                      disabled={importing}
                    />
                  </div>
                </div>
              </div>

              <div className="import-preview">
                <div className="import-preview-title">Vista previa ({rows.length} registros)</div>
                <div className="table-container">
                  <table className="admin-table" aria-label="Vista previa de importación">
                    <thead>
                      <tr>
                        <th scope="col">Documento</th>
                        <th scope="col">Nombre completo</th>
                        <th scope="col">Correo</th>
                        <th scope="col">Teléfono</th>
                        <th scope="col">Ficha</th>
                        <th scope="col">Programa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.document_number || "-"}</td>
                          <td>{r.full_name || "-"}</td>
                          <td>{r.email || "-"}</td>
                          <td>{r.phone || "-"}</td>
                          <td>{r.ficha || "-"}</td>
                          <td>{r.programa || "-"}</td>
                        </tr>
                      ))}
                      {rows.length > previewRows.length && (
                        <tr>
                          <td colSpan="6" className="import-more">
                            … y {rows.length - previewRows.length} más
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {importing && (
                <div className="import-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span>Importando… {progress}%</span>
                </div>
              )}

              {summary && (
                <div className="import-summary">
                  <strong>Resultado:</strong> {summary.created} creados, {summary.updated} actualizados, {summary.skipped} omitidos
                  {summary.errors?.length > 0 && (
                    <div className="import-summary-errors">
                      {summary.errors.slice(0, 5).map((e, i) => (
                        <div key={i} className="import-error">
                          <AlertTriangle size={14} />
                          <span>Fila {e.row} ({e.email || e.name}): {e.message}</span>
                        </div>
                      ))}
                      {summary.errors.length > 5 && <div>… y {summary.errors.length - 5} más</div>}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={importing}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleImport} disabled={importing || !options.roleId}>
                  <UserPlus size={16} />
                  {importing ? "Importando…" : `Importar ${rows.length} usuarios`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}