import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  CreditCard,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import SenaLogo from "../../../shared/components/SenaLogo";
import "../../../shared/styles/auth.css";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    document_number: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("auth-theme") || "dark");

  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("auth-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.full_name.trim()) {
      setValidationError("El nombre es obligatorio");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Ingresa un email valido");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const result = await signUp(formData.email, formData.password, {
      full_name: formData.full_name,
      document_number: formData.document_number,
    });
    setLoading(false);
    if (result.success) {
      if (result.needsConfirmation) {
        toast.success("Cuenta creada! Revisa tu email para confirmar tu cuenta.");
        navigate("/login");
      } else {
        toast.success("Registro exitoso! Bienvenido.");
        const role = result.profile?.roles?.name;
        let path = "/dashboard";
        if (role === "SUPERADMIN") path = "/admin";
        else if (role === "COORDINACION") path = "/coordination";
        else if (role === "PSICOLOGIA") path = "/psychology";
        else if (role === "ENFERMERIA") path = "/enfermeria";
        else if (role === "TRABAJO_SOCIAL") path = "/social-work";
        navigate(path, { replace: true });
      }
    } else {
      setValidationError(result.error || "Error al crear la cuenta");
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

      <div className="auth-card auth-card-lg" role="main">
        <div className="auth-brand">
          <div className="auth-logo">
            <SenaLogo size={72} />
          </div>
          <h1>Crear cuenta</h1>
          <p className="auth-subtitle">
            SENA Bienestar — Agenda tus citas de bienestar
          </p>
        </div>

        {validationError && (
          <div className="auth-error" role="alert">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-fullname" className="form-label form-label-required">
              Nombre completo
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <User size={18} />
              </span>
              <input
                id="reg-fullname"
                type="text"
                name="full_name"
                className="form-input"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
                autoComplete="name"
                aria-required="true"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-document" className="form-label form-label-required">
              Número de documento
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <CreditCard size={18} />
              </span>
              <input
                id="reg-document"
                type="text"
                name="document_number"
                className="form-input"
                value={formData.document_number}
                onChange={handleChange}
                required
                placeholder="Ej: 1234567890"
                autoComplete="off"
                aria-required="true"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label form-label-required">
              Email institucional
            </label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">
                <Mail size={18} />
              </span>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu.email@ejemplo.com"
                autoComplete="email"
                aria-required="true"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password" className="form-label form-label-required">
                Contraseña
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  aria-required="true"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm" className="form-label form-label-required">
                Confirmar
              </label>
              <div className="form-input-wrapper">
                <span className="form-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary btn-block ${loading ? "btn-loading" : ""}`}
          >
            {!loading && <UserPlus size={18} />}
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <p className="auth-footer">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="auth-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
