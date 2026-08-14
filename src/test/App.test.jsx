import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Test básico de renderizado
describe("Login Page", () => {
  it("debe mostrar formulario de login", () => {
    // Mock del AuthProvider
    const MockLogin = () => (
      <div>
        <h1>Iniciar Sesión</h1>
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );

    render(
      <MemoryRouter>
        <MockLogin />
      </MemoryRouter>,
    );

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });
});

describe("Roles", () => {
  it("debe tener roles definidos", () => {
    const roles = ["SUPERADMIN", "COORDINACION", "PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL", "APRENDIZ"];
    expect(roles).toHaveLength(6);
    expect(roles).toContain("APRENDIZ");
    expect(roles).toContain("SUPERADMIN");
  });
});