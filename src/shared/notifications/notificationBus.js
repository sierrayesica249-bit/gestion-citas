const listeners = new Set();

export const notificationBus = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit(notification) {
    listeners.forEach((fn) => fn(notification));
  },
};