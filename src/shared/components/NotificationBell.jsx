import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { notificationBus } from "../notifications/notificationBus";

const MAX_NOTIFICATIONS = 30;

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function buildNotification(appointment, actorName) {
  return {
    id: appointment.id,
    service:
      appointment.dependencies?.name ||
      appointment.dependencyName ||
      "Cita de bienestar",
    userName:
      appointment.profiles?.full_name ||
      appointment.userName ||
      actorName ||
      "Aprendiz",
    date: appointment.scheduled_date,
    time: appointment.scheduled_time,
    createdAt: appointment.created_at || new Date().toISOString(),
  };
}

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const addNotification = useCallback((notification) => {
    if (!notification?.id) return;
    setNotifications((prev) => {
      const alreadyExists = prev.some(
        (n) =>
          n.id === notification.id ||
          (n.userName === notification.userName &&
            n.service === notification.service &&
            n.date === notification.date &&
            n.time === notification.time),
      );
      if (alreadyExists) return prev;
      return [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
    setUnread((u) => u + 1);
    toast.info(
      `Nueva cita agendada: ${notification.userName} · ${notification.service}`,
    );
  }, []);

  // Notificaciones locales (citas creadas en esta sesión)
  useEffect(() => {
    const unsubscribe = notificationBus.subscribe(addNotification);
    return unsubscribe;
  }, [addNotification]);

  // Notificaciones en tiempo real (citas creadas por otros usuarios)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-appointments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointments" },
        (payload) => {
          addNotification(buildNotification(payload.new));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotification]);

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggleOpen = () => {
    setOpen((o) => !o);
    if (!open) setUnread(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnread(0);
  };

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        className="notif-bell-btn"
        onClick={toggleOpen}
        aria-label={`Notificaciones${unread ? ` (${unread} nuevas)` : ""}`}
        aria-expanded={open}
        title="Notificaciones"
      >
        <img src="/notif-bell.jpg" alt="" className="notif-bell-icon" />
        {unread > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="menu">
          <div className="notif-panel-header">
            <strong>Notificaciones</strong>
            {notifications.length > 0 && (
              <button className="notif-clear" onClick={clearAll}>
                Limpiar
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notif-empty">No hay notificaciones nuevas</p>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => (
                <li key={n.id} className="notif-item">
                  <span className="notif-item-title">
                    Nueva cita agendada
                  </span>
                  <span className="notif-item-text">
                    {n.userName} · {n.service}
                  </span>
                  <span className="notif-item-time">
                    {formatDateLabel(n.date)} · {n.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}