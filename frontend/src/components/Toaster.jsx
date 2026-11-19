import { useEffect, useRef, useState } from 'react'
import { subscribe } from '../lib/toastBus'

/** Ekranning o'ng past burchagida chiqadigan xatolik bildirishnomalari */
export default function Toaster() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Set())

  useEffect(() => {
    const unsubscribe = subscribe((t) => {
      setToasts((list) => list.some((x) => x.id === t.id) ? list : [...list.slice(-3), t])
      const timer = setTimeout(() => {
        setToasts((list) => list.filter((x) => x.id !== t.id))
        timers.current.delete(timer)
      }, 6000)
      timers.current.add(timer)
    })
    return () => {
      unsubscribe()
      timers.current.forEach(clearTimeout)
      timers.current.clear()
    }
  }, [])

  return (
    <div className="toast-stack" role="region" aria-label="Bildirishnomalar">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
          <span className="toast-icon" aria-hidden>{t.type === 'error' ? '⚠️' : '✓'}</span>
          <span className="toast-text">{t.message}</span>
          <button type="button" className="toast-close" aria-label="Yopish"
            onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}>×</button>
        </div>
      ))}
    </div>
  )
}
