import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { COURSE_LINK, SECTIONS, TELEGRAM } from '../lib/sections'
import { Heading, Paper } from '../components/ui'

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

const MEDALS = ['🥇', '🥈', '🥉']

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

export default function Home() {
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
      {/* HERO — katak */}
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

      {/* QISQA YO'LLAR — yo'l-yo'l */}
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

      {/* BO'LIMLAR — katak */}
      <Paper variant="grid" id="bolimlar">
        <Heading sub="Kerakli bo'limni tanlang — har biri alohida varaqda.">Nimani mashq qilamiz? 📝</Heading>
        <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link key={s.slug} to={`/bolim/${s.slug}`} className="card flex items-center gap-sm">
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

      {/* KURS — yo'l-yo'l */}
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

      {/* NATIJALAR — katak */}
      <Paper variant="grid" id="natijalar">
        <Heading sub="Platformadagi eng yaxshi test natijalari.">Natijalar 🏆</Heading>
        {results.length === 0 ? (
          <p className="card tertiary m-0">Hali natija yo'q — birinchi bo'ling!</p>
        ) : (
          <div className="grid gap-sm md:grid-cols-2">
            {results.map((r, i) => (
              <div key={i} className={`card result-row flex items-center gap-sm ${i < 3 ? `top-${i + 1}` : ''}`}>
                <span className="font-display text-2xl w-9 text-center shrink-0" aria-label={`${i + 1}-o'rin`}>
                  {MEDALS[i] ?? `${i + 1}.`}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{r.name}</span>
                  <span className="block tertiary text-sm truncate">{r.title}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className="block font-mono">{r.score}/{r.total}</span>
                  <span className="block tertiary text-xs font-mono">{Math.round((r.score / r.total) * 100)}%</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Paper>
    </>
  )
}
