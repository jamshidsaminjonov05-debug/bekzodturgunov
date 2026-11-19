import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { COURSE_LINK, SECTIONS, TELEGRAM } from '../lib/sections'
import { Heading, Paper, Stat } from '../components/ui'
import CertificateCard from '../components/CertificateCard'
import LevelAvatar from '../components/LevelAvatar'

/** Polaroid uslubidagi portret: skotch, qo'lyozma imzo va C1 stikeri */
function Portrait() {
  const [broken, setBroken] = useState(false)
  return (
    <figure className="polaroid m-0 shrink-0 rotate-[-3deg] mt-3 mr-3">
      <span className="tape" aria-hidden />
      {broken ? (
        <div className="w-[210px] h-[230px] bg-accent-secondary flex items-center justify-center font-display text-7xl text-[#333]">BT</div>
      ) : (
        <img
          src="/avatar.jpg"
          alt="Bekzod Turg'unov"
          width={210}
          height={230}
          className="block w-[210px] h-[230px] object-cover object-[50%_20%]"
          onError={() => setBroken(true)}
        />
      )}
      <figcaption className="font-display text-2xl text-center py-2">Bekzod Turg'unov</figcaption>
      <span className="sticker" aria-hidden>C1<span className="text-xs font-mono">ustoz</span></span>
    </figure>
  )
}

function Countdown({ to }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ms = Math.max(0, new Date(to) - now)
  const h = String(Math.floor(ms / 3.6e6)).padStart(2, '0')
  const m = String(Math.floor((ms % 3.6e6) / 6e4)).padStart(2, '0')
  const s = String(Math.floor((ms % 6e4) / 1000)).padStart(2, '0')
  return <span className="font-mono">{h}:{m}:{s}</span>
}

/** Kirmagan foydalanuvchi — shaxsiy sayt haqidagi asosiy sahifa */
function Guest({ contest, openLogin }) {
  return (
    <>
      <Paper variant="grid" className="pt-lg pb-lg">
        <div className="flex gap-lg flex-col items-center md:flex-row">
          <Portrait />
          <div className="flex flex-col gap-sm">
            <h1>
              Salom! Men <span className="outlined">Bekzod</span> <span className="wave">👋</span>
            </h1>
            <p className="text-xl m-0">
              Bu yer — <mark>C1 ni maqsad qilgan</mark> Multilevelchilar hamjamiyati.
            </p>
            <p className="secondary m-0">
              Respublikada tushgan va tushadigan savollar hamda sizni C1 ga olib boruvchi
              General English materiallar — <span className="marker marker-blue">hammasi bir joyda</span>.
            </p>
            <div className="flex flex-wrap gap-sm mt-sm">
              <a href="#bolimlar" className="btn btn-primary">Mashq qilishni boshlash →</a>
              <a href="#kurs" className="btn">Kursga yozilish</a>
            </div>
          </div>
        </div>
      </Paper>

      <Paper variant="lined">
        <div className="grid gap-sm md:grid-cols-3">
          <a href="#kurs" className="card">
            <span className="tag tag-yellow">Qabul ochiq</span>
            <h3 className="mt-1">1,5 oylik C1 kursi</h3>
            <p className="secondary m-0">Yanvar guruhiga yozilish <span className="card-arrow">→</span></p>
          </a>
          <Link to="/musobaqa" className="card">
            <span className="tag tag-blue">Musobaqa</span>
            <h3 className="mt-1">Lug'at Chempionati</h3>
            <p className="secondary m-0">
              {contest?.phase === 'upcoming' ? <>Boshlanishiga <Countdown to={contest.starts_at} /></> : contest?.phase === 'finished' ? 'Natijalarni ko\'rish' : 'Hozir davom etmoqda'}{' '}
              <span className="card-arrow">→</span>
            </p>
          </Link>
          <a href={TELEGRAM} target="_blank" rel="noreferrer" className="card">
            <span className="tag">Telegram</span>
            <h3 className="mt-1">@bekzodturgunovkx</h3>
            <p className="secondary m-0">Kanalga qo'shiling <span className="card-arrow">↗</span></p>
          </a>
        </div>
      </Paper>
    </>
  )
}

/** Kirgan foydalanuvchining shaxsiy sahifasi */
function Dashboard({ user }) {
  const [data, setData] = useState(null)
  const [level, setLevel] = useState(null)

  useEffect(() => {
    api('/auth/dashboard').then(setData).catch(() => {})
    api('/auth/level').then(setLevel).catch(() => {})
  }, [])

  const CHECKS = { exercises: 'Mashqlar', glossary: "So'z ma'nolari", definitions: 'Exercise 1', test: 'Vaqtli test' }

  return (
    <>
      <Paper variant="grid" className="pt-lg pb-lg">
        <div className="flex gap-lg flex-col md:flex-row items-start md:items-center">
          <LevelAvatar level={level?.current || 'A1'} />
          <div className="flex flex-col gap-sm min-w-0">
            <h1 className="m-0">Salom, <span className="outlined">{user.name.split(' ')[0]}</span> <span className="wave">👋</span></h1>
            <p className="text-lg secondary m-0">Bu sizning shaxsiy sahifangiz — qiladigan ishlaringiz va natijalaringiz shu yerda.</p>
            {user.phone && <p className="tertiary m-0 font-mono">📱 {user.phone}</p>}
            {data && (
              <div className="grid grid-cols-3 gap-sm mt-1 max-w-md">
                <Stat label="Testlar" value={data.stats.tests} />
                <Stat label="Kitoblar" value={data.stats.books} />
                <Stat label="Writing" value={data.stats.writings} />
              </div>
            )}
          </div>
        </div>
      </Paper>

      <Paper variant="lined">
        <Heading sub="Siz uchun keyingi qadamlar.">Qiladigan ishlarim ✅</Heading>
        <div className="grid gap-sm md:grid-cols-2">
          {(data?.tasks || []).map((t) => (
            <Link key={t.title} to={t.to} className="card flex items-center gap-sm">
              <span className="text-2xl" aria-hidden>{t.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-display text-xl">{t.title}</span>
                <span className="block tertiary text-sm">{t.sub}</span>
              </span>
              <span className="card-arrow">→</span>
            </Link>
          ))}
          {!data && <p className="tertiary">Yuklanmoqda…</p>}
        </div>
      </Paper>

      <Paper variant="grid">
        <Heading sub="Oxirgi kitob mashqlaringiz.">So'nggi natijalarim 📈</Heading>
        {!data?.recent.length && <p className="card tertiary m-0">Hali kitob mashqi ishlamadingiz. <Link to="/bolim/kitoblar">Kitoblarga o'tish →</Link></p>}
        <div className="grid gap-2 md:grid-cols-2">
          {data?.recent.map((r) => (
            <Link key={r.id} to={`/kitob/${r.lesson_id}/${r.unit ?? 0}`} className="card flex items-center gap-sm">
              <span className="flex-1 min-w-0">
                <span className="block truncate">📘 {r.title}</span>
                <span className="tertiary text-sm">{CHECKS[r.check] || 'Kitob'}</span>
              </span>
              <span className="font-mono">{r.score}/{r.total}</span>
            </Link>
          ))}
        </div>
      </Paper>
    </>
  )
}

/** O'quvchilar natijalari — haqiqiy ma'lumotlardan kartalar */
function ResultsSection({ results }) {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [certFor, setCertFor] = useState(null)
  const [level, setLevel] = useState(null)
  const [certificate, setCertificate] = useState(null)
  useEffect(() => {
    api('/auth/level').then(setLevel).catch(() => {})
    api('/auth/certificate').then(setCertificate).catch(() => {})
  }, [])
  const levels = ['all', ...new Set(results.map((r) => r.level).filter(Boolean))]
  const count = (l) => l === 'all' ? results.length : results.filter((r) => r.level === l).length
  const shown = filter === 'all' ? results : results.filter((r) => r.level === filter)

  return (
    <Paper variant="grid" id="natijalar">
      <Heading sub="Platformadagi haqiqiy test natijalari.">O'quvchilar natijalari 🏆</Heading>
      <div className="flex flex-wrap gap-2 mb-md">
        {levels.map((l) => (
          <button key={l} className={`btn !py-0.5 ${filter === l ? 'btn-primary' : ''}`} onClick={() => setFilter(l)}>
            {l === 'all' ? 'Hammasi' : l} ({count(l)})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="card tertiary m-0">Hali natija yo'q — birinchi bo'ling!</p>
      ) : (
        <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r, i) => (
            <div key={r.id ?? i} className="result-card card flex flex-col">
              <div className="flex items-start justify-between gap-sm mb-2">
                <span className="cert-badge" aria-hidden>🎓</span>
                <span className={`tag ${['C1', 'C2'].includes(r.level) ? 'tag-yellow' : 'tag-blue'}`}>{r.level || '—'}</span>
              </div>
              <h3 className="mt-0 mb-0 font-display text-xl">{r.name}</h3>
              <p className="tertiary text-sm m-0 mb-2 truncate">{r.title}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-3xl">{r.score}</span>
                <span className="tertiary">/ {r.total} ball</span>
                <span className="tag ml-auto">{r.percent}%</span>
              </div>
              {r.parts?.length > 0 && (
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {r.parts.slice(0, 4).map((p, j) => (
                    <div key={j} className="part-box" title={p.title}>
                      <span className="block tertiary text-xs truncate">{p.title?.[0] || `Q${j + 1}`}</span>
                      <b className="font-mono">{p.score}</b>
                    </div>
                  ))}
                </div>
              )}
              <p className="secondary text-sm m-0 mb-3 line-clamp-2">{r.title}</p>
              <div className="flex gap-2 flex-wrap mt-auto">
                <button className="btn btn-yellow" onClick={() => setSelected(r)}>Natijani ko'rish →</button>
                <button className="btn" onClick={() => setCertFor(r)} title="Sertifikatni ko'rish">🏆 Sertifikat</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="picker-backdrop" onMouseDown={() => setSelected(null)}>
          <div className="picker-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-sm mb-2">
              <div>
                <h2 className="m-0 font-display text-2xl">🎓 {selected.name}</h2>
                <p className="secondary text-sm m-0">{selected.title}</p>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Yopish">×</button>
            </div>
            <div className="grid grid-cols-3 gap-sm my-md">
              <Stat label="Daraja" value={selected.level || '—'} />
              <Stat label="Ball" value={`${selected.score}/${selected.total}`} />
              <Stat label="Foiz" value={`${selected.percent}%`} />
            </div>
            {selected.parts?.length > 0 && (
              <div className="grid gap-1">
                {selected.parts.map((p, i) => (
                  <div key={i} className="card flex items-center gap-sm">
                    <span className="flex-1 min-w-0 truncate">{p.title || `Qism ${i + 1}`}</span>
                    <span className="font-mono">{p.score}/{p.total}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="tertiary text-sm mt-md">Bu natija foydalanuvchining haqiqiy test urinishidir.</p>
          </div>
        </div>
      )}

      {certFor && (
        <div className="picker-backdrop" onMouseDown={() => setCertFor(null)}>
          <div className="picker-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-sm mb-md">
              <h2 className="m-0 font-display text-2xl">🏆 Sertifikat</h2>
              <button className="icon-btn" onClick={() => setCertFor(null)} aria-label="Yopish">×</button>
            </div>
            <CertificateCard
              name={certFor.name || certificate?.name || ''}
              level={certFor.level || level?.current || certificate?.level || 'B1'}
              scores={Object.fromEntries((certFor.parts || []).slice(0, 3).map((p, i) => [
                p.title?.split('—')[0]?.trim() || `Qism ${i + 1}`,
                p.total ? Math.round(p.score * 100 / p.total) : 0,
              ]))}
              number={certificate?.number || `ML-${String(certFor.id ?? 0).padStart(5, '0')}`}
              date={certFor.created_at?.slice(0, 10) || certificate?.date || ''}
              xp={certificate?.xp || 0}
            />
          </div>
        </div>
      )}
    </Paper>
  )
}

function Course() {
  return (
    <Paper variant="lined" id="kurs">
      <Heading sub="Darslar 1-dekabrda boshlanadi.">
        <mark>1,5 oylik</mark> Multilevel C1 kursi
      </Heading>
      <ul className="m-0 mb-md pl-5 space-y-1">
        <li>Listening va Reading — real imtihon formatida, har hafta mock</li>
        <li>Writing — har bir ish tekshiriladi va izoh beriladi</li>
        <li>Speaking — jonli mashg'ulotlar, Part 1–3 strategiyalari</li>
        <li>C1 darajadagi lug'at va grammatika</li>
      </ul>
      <a href={COURSE_LINK} target="_blank" rel="noreferrer" className="btn btn-yellow">Kursga yozilish ↗</a>
    </Paper>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [counts, setCounts] = useState({})
  const [contest, setContest] = useState(null)
  const [results, setResults] = useState([])

  useEffect(() => {
    api('/sections').then(setCounts).catch(() => {})
    api('/contest').then(setContest).catch(() => {})
    api('/results').then(setResults).catch(() => {})
  }, [])

  return (
    <>
      {user ? <Dashboard user={user} /> : <Guest contest={contest} />}

      <Paper variant="lined" id="bolimlar">
        <Heading sub="Kerakli bo'limni tanlang — har biri alohida varaqda.">Nimani mashq qilamiz? 📝</Heading>
        <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.slug} to={s.path || `/bolim/${s.slug}`} className="card flex items-center gap-sm">
              <span className="text-3xl" aria-hidden>{s.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-display text-2xl leading-tight">{s.title}</span>
                <span className="block tertiary text-base truncate">{s.sub}</span>
              </span>
              {counts[s.kind] ? <span className="tag">{counts[s.kind]}</span> : null}
            </Link>
          ))}
        </div>
      </Paper>

      <Course />

      <ResultsSection results={results} />
    </>
  )
}
