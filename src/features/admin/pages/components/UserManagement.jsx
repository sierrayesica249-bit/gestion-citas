import { useEffect, useState, useRef, useCallback } from "react";
import { Search, UserPlus, MoreVertical, Pencil, Power, X, Mail, Lock, User, Building2 } from "lucide-react";

export default function UserManagement({ admin }) {
  const { users, pagination, loading, fetchUsers, updateUserRoles, roles, fetchRoles, dependencies, fetchDependencies, createUser } = admin;
  const [filter, setFilter] = useState({ search: "", role: "", dependency: "", page: 1 });
  const [openMenu, setOpenMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role_id: "", dependency_id: "" });
  const menuRef = useRef(null);

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    if (openMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu, closeMenu]);

  useEffect(() => {
    fetchUsers(filter);
  }, [filter, fetchUsers]);

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [roles.length, fetchRoles]);

  useEffect(() => {
    if (dependencies.length === 0) {
      fetchDependencies();
    }
  }, [dependencies.length, fetchDependencies]);

  const toggleUserStatus = (user) => {
    updateUserRoles(user.id, {
      role_id: user.role_id,
      dependency_id: user.dependency_id,
      is_active: !user.is_active,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name || !form.role_id) return;
    setCreating(true);
    const result = await createUser({
      email: form.email,
      password: form.password,
      fullName: form.full_name,
      roleId: Number(form.role_id),
      dependencyId: form.dependency_id ? Number(form.dependency_id) : null,
    });
    setCreating(false);
    if (result.success) {
      setShowCreateModal(false);
      setForm({ email: "", password: "", full_name: "", role_id: "", dependency_id: "" });
    }
  };

  return (
    <div className="admin-section">
      <header className="section-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <UserPlus size={16} />
          Nuevo Usuario
        </button>
      </header>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={filter.search}
            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
            aria-label="Buscar usuarios"
          />
        </div>
        <select
          value={filter.role}
          onChange={(e) => setFilter((f) => ({ ...f, role: e.target.value }))}
          aria-label="Filtrar por rol"
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.description || r.name}
            </option>
          ))}
        </select>
        <select
          value={filter.dependency}
          onChange={(e) => setFilter((f) => ({ ...f, dependency: e.target.value, page: 1 }))}
          aria-label="Filtrar por dependencia"
        >
          <option value="">Todas las dependencias</option>
          {dependencies.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table" aria-label="Gestión de usuarios">
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Rol</th>
                <th scope="col">Dependencia</th>
                <th scope="col">Estado</th>
                <th scope="col">Última actualización</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="table-empty">
                      <p>No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={!u.is_active ? "table-row-inactive" : ""}>
                    <td data-label="Usuario">
                      <div className="avatar">
                        <div className="avatar-circle">
                          {u.full_name?.[0] || "?"}
                        </div>
                        <div>
                          <div className="name">{u.full_name}</div>
                          <div className="email">
                            {u.email || u.document_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Rol">
                      <span
                        className={`role-badge ${u.roles?.name.toLowerCase()}`}
                      >
                        {u.roles?.name}
                      </span>
                    </td>
                    <td data-label="Dependencia">
                      {u.dependencies?.name || "-"}
                    </td>
                    <td data-label="Estado">
                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`status-toggle ${u.is_active ? "activo" : "inactivo"}`}
                        aria-label={`${u.is_active ? "Desactivar" : "Activar"} usuario ${u.full_name}`}
                        aria-pressed={u.is_active}
                      />
                    </td>
                    <td data-label="Última actualización">
                      {new Date(u.updated_at).toLocaleDateString()}
                    </td>
                    <td data-label="Acciones">
                      <div className="table-actions" ref={openMenu === u.id ? menuRef : undefined}>
                        <button
                          className="btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === u.id ? null : u.id);
                          }}
                          aria-label={`Acciones para ${u.full_name}`}
                          aria-haspopup="true"
                          aria-expanded={openMenu === u.id}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === u.id && (
                          <div className="dropdown-menu" role="menu">
                            <button
                              className="dropdown-item"
                              role="menuitem"
                              onClick={() => {
                                closeMenu();
                                alert(`Editar usuario: ${u.full_name}`);
                              }}
                            >
                              <Pencil size={14} />
                              Editar
                            </button>
                            <button
                              className="dropdown-item"
                              role="menuitem"
                              onClick={() => {
                                closeMenu();
                                toggleUserStatus(u);
                              }}
                            >
                              <Power size={14} />
                              {u.is_active ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Total: {pagination.total} usuarios
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={pagination.page <= 1}
              onClick={() => setFilter((f) => ({ ...f, page: f.page - 1 }))}
              aria-label="Página anterior"
            >
              ←
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`pagination-btn ${pagination.page === i + 1 ? "active" : ""}`}
                onClick={() => setFilter((f) => ({ ...f, page: i + 1 }))}
                aria-label={`Página ${i + 1}`}
                aria-current={pagination.page === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilter((f) => ({ ...f, page: f.page + 1 }))}
              aria-label="Página siguiente"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} role="dialog" aria-modal="true" aria-label="Crear usuario">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <UserPlus size={18} />
                Nuevo Usuario
              </h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateUser} className="appointment-form">
                <div className="form-group">
                  <label className="form-label form-label-required">Nombre completo</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><User size={18} /></span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nombre y apellido"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Correo electrónico</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Mail size={18} /></span>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">Contraseña</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon"><Lock size={18} /></span>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label form-label-required">Rol</label>
                    <div className="form-input-wrapper">
                      <span className="form-input-icon"><User size={18} /></span>
                      <select
                        className="form-select"
                        value={form.role_id}
                        onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                        required
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
                        value={form.dependency_id}
                        onChange={(e) => setForm((f) => ({ ...f, dependency_id: e.target.value }))}
                      >
                        <option value="">Ninguna</option>
                        {dependencies.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                    {creating ? "Creando..." : "Crear Usuario"}
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
