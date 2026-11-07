// Bus de eventos mínimo y sin dependencias, compartido por escenas y UI.
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const off = this.on(event, (...args) => {
      off();
      handler(...args);
    });
    return off;
  }

  off(event, handler) {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event, ...args) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of [...set]) {
      try {
        handler(...args);
      } catch (error) {
        console.error(`[EventBus] Error en "${event}":`, error);
      }
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const events = new EventBus();
