/** Haqiqiy natijalardan tuzilgan o'quv sertifikati */
const LEVEL_COLORS = { A1: '#7fb069', A2: '#5b8c5a', B1: '#c98b3a', B2: '#b5651d', C1: '#8a4b20' }

export default function CertificateCard({ name, level, scores = {}, number, date, xp = 0, locked = false }) {
  return (
    <div className={`certificate ${locked ? 'cert-locked' : ''}`}>
      <div className="cert-top">
        <span className="cert-emblem" aria-hidden>🎓</span>
        <div>
          <b>MULTILEVEL · ENGLISH CENTER</b>
          <span>O'zbekiston · CEFR tayyorgarlik platformasi</span>
        </div>
      </div>
      <div className="cert-title">SERTIFIKAT</div>
      <div className="cert-sub">Chet tilini bilish darajasi · Level of English proficiency</div>
      <div className="cert-level" style={{ borderColor: LEVEL_COLORS[level] || '#b08a4f' }}>{level}</div>
      <p className="cert-award">Ushbu sertifikat quyidagi o'quvchiga berildi</p>
      <div className="cert-name">{locked ? '🔒 Ochilmagan' : (name || '—')}</div>
      <div className="cert-scores">
        {Object.entries(scores || {}).slice(0, 3).map(([k, v]) => (
          <div key={k}>
            <span>{k}</span>
            <b>{v != null ? `${v}%` : '—'}</b>
          </div>
        ))}
        {Object.keys(scores || {}).length === 0 && (
          <div><span>Ballar</span><b>—</b></div>
        )}
      </div>
      <div className="cert-foot">
        <span>№ {number || '—'}</span>
        <span>Sana: {date || '—'}</span>
        <span>XP: {xp}</span>
      </div>
      {!locked && (
        <button className="btn !py-0.5 mt-md no-print" onClick={() => window.print()}>
          🖨️ Chop etish / Yuklab olish
        </button>
      )}
    </div>
  )
}
