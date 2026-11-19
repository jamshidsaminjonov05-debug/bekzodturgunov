// Backend manzili: lokalda Vite proxy (/api), Vercel'da VITE_API_URL env orqali beriladi
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const TOKEN_KEY = 'token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(t) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const data = await res.json().catch(() => null)
  // Backend o'rniga HTML (masalan, index.html) kelsa — bu xato, jimgina null qaytarmaymiz
  if (res.ok && data === null && !(res.headers.get('content-type') || '').includes('json')) {
    const err = new Error("Server bilan bog'lanib bo'lmadi")
    err.status = 502
    throw err
  }
  if (!res.ok) {
    let msg = data?.detail ?? `Xatolik (${res.status})`
    if (Array.isArray(msg)) msg = msg.map((d) => d.msg).join(', ')
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}
