import { useEffect, useRef, useState } from 'react'
import { PAPERS, usePaper } from '../lib/theme'

/** Fon tanlash: tugma bosilganda namunalar kartasi ochiladi */
export default function PaperPicker() {
  const [paper, setPaper] = usePaper()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Fonni tanlash"
        aria-expanded={open}
        title="Fon"
      >
        <span className={`pat-${paper} pat-mini block w-6 h-6 border-[1.5px] border-current`} />
      </button>

      {open && (
        <div className="menu-pop right-0 w-[300px] max-w-[calc(100vw-2rem)] p-sm">
          <p className="font-display text-2xl m-0 mb-sm">Fonni tanlang</p>
          <div className="grid grid-cols-2 gap-2">
            {PAPERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPaper(p.id)}
                className={`text-left cursor-pointer p-1.5 border-2 font-[inherit] text-[inherit] bg-bg-secondary hover:bg-bg-tertiary transition-colors ${
                  paper === p.id ? 'border-accent-primary' : 'border-transparent'
                }`}
              >
                <span className={`pat-${p.id} pat-prev block h-14 border border-bg-tertiary`} />
                <span className="flex items-center justify-between mt-1">
                  <span className="leading-tight">{p.label}</span>
                  {paper === p.id && <span aria-hidden>✓</span>}
                </span>
                <span className="block tertiary text-xs leading-tight">{p.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
