import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import SenaLogo from "./SenaLogo";

export default function Unauthorized() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-brand">
          <div className="auth-logo">
            <SenaLogo size={56} />
          </div>
        </div>

        <div
          className="modal-confirm-icon danger"
          style={{ width: 64, height: 64, marginBottom: "var(--space-4)" }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
          403
        </h1>
        <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-3)" }}>
          Acceso No Autorizado
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "var(--text-sm)",
            marginBottom: "var(--space-6)",
            maxWidth: 320,
            margin: "0 auto var(--space-6)",
          }}
        >
          No tienes permisos para acceder a esta página. Si crees que esto es un error, contacta al administrador.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            Ir a mi inicio
          </Link>
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={18} />
            Cambiar de cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
