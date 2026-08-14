import { useState, useCallback } from "react";
import { AppointmentRepository } from "../api/appointments.repository";
import { toast } from "sonner";
import { useAuth } from "../../../providers/AuthProvider";
import { supabase } from "../../../lib/supabase";

// ESTADOS DE CARGA ESPECÍFICOS (mejor UX que un genérico "loading")
const STATUS = {
  IDLE: "idle",
  CREATING: "creating",
  FETCHING: "fetching",
  UPDATING: "updating",
  ERROR: "error",
};

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const { user, profile, isAprendiz, isProfessional, isAdmin, isCoordination } = useAuth();

  // FETCH: Obtener citas según el rol automáticamente
  const fetchAppointments = useCallback(
    async (filters = {}) => {
      setStatus(STATUS.FETCHING);
      setError(null);

      try {
        // RBAC implícito: los filtros dependen del rol
        let roleFilters = {};
        if (isAprendiz()) {
          roleFilters = { userId: user.id };
        } else if (isProfessional()) {
          // Profesional ve citas de su dependencia
          roleFilters = { dependencyId: profile?.dependency_id };
        } else if (isCoordination() || isAdmin()) {
          // Coordinación/Admin ven todas las citas (sin filtro de dependencia)
          roleFilters = {};
        }

        const data = await AppointmentRepository.fetch({
          ...roleFilters,
          ...filters,
        });
        setAppointments(data);
        return data;
      } catch (err) {
        setError(err.message);
        toast.error("Error cargando citas");
        return [];
      } finally {
        setStatus(STATUS.IDLE);
      }
    },
    [user, profile, isAprendiz, isProfessional, isAdmin, isCoordination],
  );

  // CREATE: Crear cita con validaciones de negocio
  const createAppointment = useCallback(async (formData) => {
    setStatus(STATUS.CREATING);

    try {
      // Regla de negocio: máximo de citas pendientes (configurable en system_config)
      if (isAprendiz()) {
        const pendingCount = await AppointmentRepository.countPending(user.id);
        const { data: cfg } = await supabase
          .from("system_config")
          .select("value")
          .eq("key", "appointment_limits")
          .maybeSingle();
        const maxPending = cfg?.value?.max_pending_per_user ?? 2;
        if (pendingCount >= maxPending) {
          throw new Error(
            `Ya tienes ${maxPending} citas pendientes. Espera a que se atienda una.`,
          );
        }
      }

      // Verificar disponibilidad de horario
      const isAvailable = await AppointmentRepository.checkAvailability(
        formData.dependency_id,
        formData.scheduled_date,
        formData.scheduled_time,
      );

      if (!isAvailable) {
        throw new Error("Este horario ya está ocupado. Selecciona otro.");
      }

      // Crear la cita
      const newAppointment = await AppointmentRepository.create({
        ...formData,
        user_id: user.id,
        status: "pending",
      });

      // OPTIMISTIC UPDATE: Actualizamos UI inmediatamente
      setAppointments((prev) => [...prev, newAppointment]);
      toast.success("Cita agendada correctamente");
      return { success: true, data: newAppointment };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  }, [user, isAprendiz]);

  // UPDATE STATUS: Cambiar estado (confirmar, completar, cancelar)
  const updateStatus = useCallback(async (appointmentId, newStatus, notes = null) => {
    setStatus(STATUS.UPDATING);

    try {
      const updates = { status: newStatus };
      if (notes) updates.notes = notes;

      const updated = await AppointmentRepository.update(
        appointmentId,
        updates,
      );

      // Actualizar estado local sin recargar todo
      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? updated : app)),
      );

      toast.success(
        `Cita ${newStatus === "confirmed" ? "confirmada" : "actualizada"}`,
      );
      return { success: true };
    } catch (err) {
      toast.error("Error actualizando cita");
      return { success: false, error: err.message };
    } finally {
      setStatus(STATUS.IDLE);
    }
  }, []);

  // CANCEL: Cancelar cita (pending o confirmed)
  const cancelAppointment = useCallback(async (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (!appointment) {
      toast.error("Cita no encontrada");
      return { success: false };
    }

    if (appointment.status !== "pending" && appointment.status !== "confirmed") {
      toast.error("Solo se pueden cancelar citas pendientes o confirmadas");
      return { success: false };
    }

    return updateStatus(appointmentId, "cancelled");
  }, [updateStatus, appointments]);

  return {
    appointments,
    status,
    error,
    isLoading: status === STATUS.FETCHING,
    isCreating: status === STATUS.CREATING,
    fetchAppointments,
    createAppointment,
    updateStatus,
    cancelAppointment,
  };
}
