import { useState } from 'react'

/** Daraja oshishi bilan qo'zichoq o'sib, o'zgarib boradi */
export const EVOLUTION = {
  A1: { emoji: '🐑', name: 'Qo‘zichoq' },
  A2: { emoji: '🐏', name: 'Qo‘y' },
  B1: { emoji: '🐐', name: 'Echki' },
  B2: { emoji: '🦌', name: 'Kiyik' },
  C1: { emoji: '🦁', name: 'Sher' },
}

export default function LevelAvatar({ level, size = 'normal' }) {
  const [broken, setBroken] = useState(false)
  const ev = EVOLUTION[level] || EVOLUTION.A1
  const order = Object.keys(EVOLUTION)
  const next = EVOLUTION[order[Math.min(order.indexOf(level) + 1, order.length - 1)]]
  const big = size === 'big'
  return (
    <figure className="polaroid m-0 shrink-0 rotate-[-3deg] mt-3 mr-3">
      <span className="tape" aria-hidden />
      {level === 'A1' && !broken ? (
        <img src="/baby-lamb.png" alt="Qo‘zichoq" className="block object-cover"
          style={{ width: big ? 210 : 150, height: big ? 230 : 160 }}
          onError={() => setBroken(true)} />
      ) : (
        <div className="bg-accent-secondary flex items-center justify-center font-display"
          style={{ width: big ? 210 : 150, height: big ? 230 : 160, fontSize: big ? '6rem' : '4rem' }}>
          {ev.emoji}
        </div>
      )}
      <figcaption className="font-display text-xl text-center py-2">{ev.name}</figcaption>
      <span className="sticker" aria-hidden>{level}<span className="text-xs font-mono">daraja</span></span>
      {next && next.name !== ev.name && (
        <span className="block tertiary text-xs text-center mt-1">Keyingisi: {next.emoji} {next.name}</span>
      )}
    </figure>
  )
}
