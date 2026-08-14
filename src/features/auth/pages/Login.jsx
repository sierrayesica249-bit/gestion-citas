import { useState, useEffect } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, CheckCircle, Sun, Moon } from "lucide-react";
import SenaLogo from "../../../shared/components/SenaLogo";
import "../../../shared/styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("auth-theme") || "dark");
  const { signIn, error, resendConfirmation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("auth-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNeedsConfirmation(false);
    setResendSuccess(false);
    
    // Validaciones basicas
    if (!email || !password) {
      setLoading(false);
      return;
    }
    
    const result = await signIn(email, password);
    setLoading(false);
    
    if (result.success) {
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
        return;
      }
      const role = result.profile?.roles?.name;
      let path = "/dashboard";
      if (role === "SUPERADMIN") path = "/admin";
      else if (role === "COORDINACION") path = "/coordination";
      else if (role === "PSICOLOGIA") path = "/psychology";
      else if (role === "ENFERMERIA") path = "/enfermeria";
      else if (role === "TRABAJO_SOCIAL") path = "/social-work";
      navigate(path, { replace: true });
    }
    // Los errores ya se muestran mediante la variable 'error' del AuthProvider
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    setResendSuccess(false);
    const result = await resendConfirmation(email);
    setResending(false);
    if (result.success) {
      setResendSuccess(true);
      setNeedsConfirmation(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="auth-card" role="main">
        <div className="auth-brand">
          <div className="auth-logo">
            <SenaLogo size={72} />
          </div>
          <h1>Iniciar Sesión</h1>
          <p className="auth-subtitle">
            SENA Bienestar — Acceso institucional
          </p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {needsConfirmation && (
          <div className="auth-warning" role="alert">
            <p>Tu cuenta no ha sido confirmada aún.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleResendConfirmation}
              disabled={resending}
              style={{ marginTop: "0.5rem" }}
            >
              {resending ? (
                <>
                  <span className="spinner spinner-sm spinner-white" />
                  Enviando...
                </>
              ) : (
                "Reenviar correo de confirmación"
              )}
            </button>
          </div>
        )}

        {resendSuccess && (
          <div className="auth-success" role="status">
            <CheckCircle size={16} />
            <span>Correo de confirmación enviado. Revisa tu bandeja de entrada.</span>
          </div>
        )}

         <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <Mail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu.email@ejemplo.com"
                autoComplete="email"
                aria-required="true"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Contraseña
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
                autoComplete="current-password"
                aria-required="true"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-block ${loading ? "btn-loading" : ""}`}
            disabled={loading}
          >
            {!loading && <LogIn size={18} />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div style={{ marginTop: 16, padding: 14, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
            Credenciales de prueba:
          </p>
          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
            <div>coordinador@senas.edu / admin123</div>
            <div>psicologia@senas.edu / admin123</div>
            <div>enfermeria@senas.edu / admin123</div>
            <div>trabajosocial@senas.edu / admin123</div>
            <div>admin@senas.edu / admin123</div>
            <div>aprendiz@senas.edu / admin123</div>
            <div style={{ marginTop: 4, color: '#9ca3af' }}>(Contraseña: admin123 para todos)</div>
          </div>
        </div>

        <p className="auth-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="auth-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
