// Oddiy xabar bus'i: api.js xatoliklarni shu yerga yuboradi, Toaster esa ko'rsatadi.
const listeners = new Set()
let recent = []

export function subscribe(fn) {
  listeners.add(fn)
  // Toaster hali mount bo'lmagan paytda chiqqan xatoliklarni ham yetkazamiz
  recent.slice(-5).forEach((t) => fn(t))
  return () => listeners.delete(fn)
}

export function emitToast(message, { type = 'error', status } = {}) {
  const toast = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: String(message),
    type,
    status,
  }
  recent = [...recent, toast].slice(-5)
  listeners.forEach((fn) => fn(toast))
  return toast.id
}
