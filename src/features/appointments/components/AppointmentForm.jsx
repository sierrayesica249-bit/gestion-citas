import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from "../validations/appointment.schema";
import { useAppointments } from "../hooks/useAppointments";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { AlertCircle, CalendarDays, Clock, FileText, Building2 } from "lucide-react";

export function AppointmentForm({ onSuccess }) {
  const { createAppointment, isCreating } = useAppointments();
  const [dependencies, setDependencies] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      scheduled_date: "",
      scheduled_time: "08:00",
      reason: "",
    },
  });

  useEffect(() => {
    async function loadDependencies() {
      const { data } = await supabase.from("dependencies").select("*");
      setDependencies(data || []);
    }
    loadDependencies();
  }, []);

  const onSubmit = async (data) => {
    const result = await createAppointment(data);
    if (result.success) {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="appointment-form" noValidate>
      <div className="form-group">
        <label htmlFor="dep-dependency" className="form-label form-label-required">
          Dependencia
        </label>
        <div className="form-input-wrapper">
          <span className="form-input-icon">
            <Building2 size={18} />
          </span>
          <select
            id="dep-dependency"
            className={`form-select ${errors.dependency_id ? "error" : ""}`}
            {...register("dependency_id")}
            aria-required="true"
            aria-invalid={!!errors.dependency_id}
            aria-describedby={errors.dependency_id ? "error-dependency" : undefined}
          >
            <option value="">Selecciona una dependencia...</option>
            {dependencies.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
        {errors.dependency_id && (
          <span className="form-error" id="error-dependency" role="alert">
            <AlertCircle size={14} />
            {errors.dependency_id.message}
          </span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dep-date" className="form-label form-label-required">
            Fecha
          </label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">
              <CalendarDays size={18} />
            </span>
            <input
              id="dep-date"
              type="date"
              className={`form-input ${errors.scheduled_date ? "error" : ""}`}
              {...register("scheduled_date")}
              aria-required="true"
              aria-invalid={!!errors.scheduled_date}
              aria-describedby={errors.scheduled_date ? "error-date" : undefined}
            />
          </div>
          {errors.scheduled_date && (
            <span className="form-error" id="error-date" role="alert">
              <AlertCircle size={14} />
              {errors.scheduled_date.message}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="dep-time" className="form-label form-label-required">
            Hora
          </label>
          <div className="form-input-wrapper">
            <span className="form-input-icon">
              <Clock size={18} />
            </span>
            <select
              id="dep-time"
              className="form-select"
              {...register("scheduled_time")}
              aria-required="true"
            >
              {Array.from({ length: 9 }, (_, i) => {
                const hour = (8 + i).toString().padStart(2, "0");
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="dep-reason" className="form-label">
          Motivo de consulta
        </label>
        <div className="form-input-wrapper" style={{ alignItems: "flex-start" }}>
          <span className="form-input-icon" style={{ top: 12 }}>
            <FileText size={18} />
          </span>
          <textarea
            id="dep-reason"
            className={`form-textarea ${errors.reason ? "error" : ""}`}
            {...register("reason")}
            rows={4}
            placeholder="Describe brevemente por qué necesitas la cita..."
            style={{ paddingLeft: "var(--space-10)" }}
            aria-invalid={!!errors.reason}
            aria-describedby={errors.reason ? "error-reason" : undefined}
          />
        </div>
        {errors.reason && (
          <span className="form-error" id="error-reason" role="alert">
            <AlertCircle size={14} />
            {errors.reason.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className={`btn btn-primary btn-block ${isCreating ? "btn-loading" : ""}`}
      >
        {!isCreating && <CalendarDays size={18} />}
        {isCreating ? "Agendando..." : "Solicitar Cita"}
      </button>
    </form>
  );
}
