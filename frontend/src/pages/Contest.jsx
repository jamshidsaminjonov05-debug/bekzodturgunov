import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { COURSE_LINK } from '../lib/sections'
import { ErrorBox, Heading, Loader, Paper, Stat } from '../components/ui'

const OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
// Toshkent vaqti (UTC+5, yozgi vaqt yo'q)
const fmtTime = (iso) => {
  const d = new Date(new Date(iso).getTime() + 5 * 3600e3)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getUTCDate()}-${OYLAR[d.getUTCMonth()]}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
}
const fmtClock = (iso) => fmtTime(iso).split(', ')[1]

function useClock(offset) {
  const [now, setNow] = useState(Date.now() + offset)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 1000)
    return () => clearInterval(t)
  }, [offset])
  return now
}

function hms(ms) {
  ms = Math.max(0, ms)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(Math.floor(ms / 3.6e6))}:${p(Math.floor((ms % 3.6e6) / 6e4))}:${p(Math.floor((ms % 6e4) / 1000))}`
}

/* ------------------------- O'yin ------------------------- */
function Play({ info, onDone }) {
  const [q, setQ] = useState(null)
  const [left, setLeft] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [entry, setEntry] = useState(info.entry)
  const [warn, setWarn] = useState(null)
  const [error, setError] = useState(null)
  const busy = useRef(false)

  const load = useCallback(async () => {
    try {
      const r = await api('/contest/question')
      setEntry(r.entry)
      if (r.done) return onDone(r.entry)
      setQ(r)
      setLeft(r.seconds_left)
      setFeedback(null)
    } catch (e) {
      setError(e)
    }
  }, [onDone])

  useEffect(() => { load() }, [load])

  // savol taymeri
  useEffect(() => {
    if (!q || feedback) return
    if (left <= 0) { load(); return }
    const t = setTimeout(() => setLeft((l) => Math.max(0, +(l - 0.1).toFixed(1))), 100)
    return () => clearTimeout(t)
  }, [q, left, feedback, load])

  // sahifadan chiqib ketishni kuzatish
  useEffect(() => {
    const onHide = async () => {
      if (document.visibilityState !== 'hidden') return
      try {
        const e = await api('/contest/leave', { method: 'POST' })
        setEntry(e)
        if (e.disqualified) onDone(e)
        else setWarn(`Ogohlantirish: sahifadan ${e.leaves} marta chiqdingiz. ${info.max_leaves}-marta chiqsangiz, musobaqadan chetlatilasiz.`)
      } catch { /* ignore */ }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [info.max_leaves, onDone])

  const pick = async (i) => {
    if (busy.current || feedback) return
    busy.current = true
    try {
      const r = await api('/contest/answer', { method: 'POST', body: { index: q.index, option: i } })
      setEntry(r.entry)
      setFeedback({ picked: i, ...r })
      setTimeout(() => {
        busy.current = false
        if (r.entry.finished) onDone(r.entry)
        else load()
      }, 700)
    } catch (e) {
      busy.current = false
      if (e.status === 409) load()
      else setError(e)
    }
  }

  if (!q) return <Loader />
  const pct = (left / info.seconds_per_question) * 100

  return (
    <div className="grid gap-md">
      <div className="grid grid-cols-4 gap-sm">
        <Stat label="Savol" value={`${q.index + 1}/${entry.total}`} />
        <Stat label="Ball" value={entry.score} />
        <Stat label="To'g'ri" value={entry.correct} />
        <Stat label="Xato" value={entry.wrong} />
      </div>
      {warn && <p className="card m-0 border-l-4 border-bad">⚠️ {warn}</p>}
      <div className="card pop" key={q.index}>
        <div className="flex justify-between items-center mb-sm">
          <span className="tag tag-blue">{q.level} · ±{q.points}</span>
          <span className={`font-mono ${left < 4 ? 'text-bad' : ''}`}>{left.toFixed(1)}s</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary mb-md"><div className="h-1.5 bg-accent-secondary" style={{ width: `${pct}%`, transition: 'width .1s linear' }} /></div>
        <p className="tertiary m-0">Ma'nosini toping</p>
        <p className="font-display text-5xl m-0 mb-md">{q.word}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o, i) => {
            let cls = ''
            if (feedback) cls = i === feedback.answer ? 'good' : i === feedback.picked ? 'bad' : ''
            return (
              <button key={i} className={`option ${cls}`} onClick={() => pick(i)} disabled={!!feedback}>
                <span className="font-mono tertiary">{'ABCD'[i]}</span> {o}
              </button>
            )
          })}
        </div>
        {feedback && (
          <p className={`m-0 mt-sm ${feedback.correct ? 'text-good' : 'text-bad'}`}>
            {feedback.timed_out ? 'Vaqt tugadi — 0 ball' : feedback.correct ? `To'g'ri! +${feedback.delta}` : `Xato: ${feedback.delta}`}
          </p>
        )}
      </div>
      <ErrorBox error={error} />
    </div>
  )
}

/* ------------------------- Reyting ------------------------- */
function Leaderboard() {
  const [data, setData] = useState(null)
  useEffect(() => {
    let alive = true
    const tick = () => api('/contest/leaderboard').then((d) => alive && setData(d)).catch(() => {})
    tick()
    const t = setInterval(tick, 4000)
    return () => { alive = false; clearInterval(t) }
  }, [])
  if (!data) return <Loader />
  return (
    <div className="grid gap-md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
        <Stat label="Ro'yxatdan o'tgan" value={data.stats.registered} />
        <Stat label="Hozir yechmoqda" value={data.stats.solving} />
        <Stat label="Yakunlagan" value={data.stats.finished} />
        <Stat label="Eng yuqori ball" value={data.stats.best} />
      </div>
      <div className="card overflow-x-auto">
        <h3 className="mb-sm flex items-center gap-2"><span className="live-dot" /> Top 10</h3>
        <table className="w-full text-left border-collapse">
          <thead className="tertiary text-sm">
            <tr><th className="py-1">O'rin</th><th>Ism</th><th>Ball</th><th>To'g'ri</th><th>Savol</th><th>Vaqt</th></tr>
          </thead>
          <tbody>
            {data.top.length === 0 && <tr><td colSpan={6} className="tertiary py-2">Hali ishtirokchi yo'q</td></tr>}
            {data.top.map((r) => (
              <tr key={r.rank} className={`border-t border-dotted border-bg-tertiary ${r.me ? 'bg-accent-secondary/30' : ''}`}>
                <td className="py-1 font-display text-xl">{['🥇', '🥈', '🥉'][r.rank - 1] ?? r.rank}</td>
                <td>{r.name}{r.me && ' (siz)'}</td>
                <td className="font-mono">{r.score}</td>
                <td className="font-mono">{r.correct}</td>
                <td className="font-mono">{r.question}</td>
                <td className="font-mono">{Math.floor(r.seconds / 60)}:{String(r.seconds % 60).padStart(2, '0')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.me && data.me.rank > 10 && <p className="m-0 mt-sm">Sizning o'rningiz: <b>{data.me.rank}</b> · {data.me.score} ball</p>}
      </div>
      <div className="paper-sheet p-md pl-14 md:pl-20 border-2 border-bg-tertiary">
        <h3 className="mb-1">Jonli voqealar</h3>
        {data.events.length === 0 ? <p className="tertiary m-0">Hozircha jim…</p> : (
          <ul className="m-0 pl-0 list-none leading-8">
            {data.events.map((e, i) => (
              <li key={i}>
                <span className="font-mono tertiary text-sm mr-2">
                  {fmtClock(e.at)}
                </span>
                {e.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ------------------------- Sahifa ------------------------- */
export default function Contest() {
  const { user, openLogin } = useAuth()
  const [info, setInfo] = useState(null)
  const [offset, setOffset] = useState(0)
  const [tab, setTab] = useState('musobaqa')
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(null)
  const now = useClock(offset)

  const load = useCallback(() => api('/contest').then((d) => {
    setInfo(d)
    setOffset(new Date(d.server_now) - Date.now())
  }).catch(setError), [])

  useEffect(() => { load() }, [load, user])
  useEffect(() => {
    if (playing) return
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [playing, load])

  // faza vaqti kelganda yangilash
  useEffect(() => {
    if (!info) return
    const edges = [info.starts_at, info.join_until, info.ends_at].map((d) => new Date(d).getTime())
    if (edges.some((e) => Math.abs(now - e) < 1000)) load()
  }, [now, info, load])

  const join = async () => {
    if (!user) return openLogin()
    try {
      await api('/contest/join', { method: 'POST' })
      await load()
      setPlaying(true)
    } catch (e) {
      setError(e)
    }
  }

  const onDone = useCallback(() => { setPlaying(false); load() }, [load])

  if (!info) return <Paper className="min-h-[60vh]">{error ? <ErrorBox error={error} /> : <Loader />}</Paper>

  const entry = info.entry
  const canJoin = info.phase === 'open' || user?.is_admin
  const canContinue = entry && !entry.finished && info.phase !== 'finished'

  return (
    <>
      <Paper variant="grid">
        <span className="tag tag-yellow">Ochiq musobaqa · hamma uchun bepul</span>
        <h1 className="mt-sm">{info.questions} ta so'z. <mark>Bitta urinish.</mark> Kim birinchi?</h1>
        <p className="secondary">{info.title} · {fmtTime(info.starts_at)} (Toshkent vaqti)</p>

        <div className="flex gap-2 mt-md">
          {[['musobaqa', 'Musobaqa'], ['reyting', 'Reyting']].map(([k, l]) => (
            <button key={k} className={`btn !py-0.5 ${tab === k ? 'btn-primary' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </Paper>

      <Paper variant="lined" className="min-h-[50vh]">
        {tab === 'reyting' ? <Leaderboard /> : playing ? (
          <Play info={info} onDone={onDone} />
        ) : (
          <div className="grid gap-md">
            <div className="card flex flex-wrap items-center gap-md">
              {info.phase === 'upcoming' && <><span className="flex-1">Boshlanishiga qoldi</span><span className="font-mono text-4xl">{hms(new Date(info.starts_at) - now)}</span></>}
              {info.phase === 'open' && <><span className="flex-1"><span className="live-dot mr-2" />Kirish ochiq — yopilishiga</span><span className="font-mono text-4xl">{hms(new Date(info.join_until) - now)}</span></>}
              {info.phase === 'running' && <><span className="flex-1">Kirish yopildi. Musobaqa tugashiga</span><span className="font-mono text-4xl">{hms(new Date(info.ends_at) - now)}</span></>}
              {info.phase === 'finished' && <span>Musobaqa yakunlandi. Natijalarni <button className="underline bg-transparent border-0 p-0 font-[inherit] text-[inherit] cursor-pointer" onClick={() => setTab('reyting')}>reytingda</button> ko'ring.</span>}
            </div>

            {entry?.finished ? (
              <div className="card pop">
                <h3>{entry.disqualified ? 'Siz musobaqadan chetlatildingiz' : 'Siz yakunladingiz! 🎉'}</h3>
                <p className="m-0">Ball: <b>{entry.score}</b> · To'g'ri: {entry.correct} · Xato: {entry.wrong}</p>
                {user?.is_admin && <p className="tertiary m-0 mt-1">Bu admin sinovi edi. Natija reytingga qo'shilmaydi.</p>}
              </div>
            ) : canContinue ? (
              <button className="btn btn-yellow justify-self-start" onClick={() => setPlaying(true)}>Davom ettirish →</button>
            ) : canJoin ? (
              <div>
                <button className="btn btn-yellow" onClick={join}>{user ? 'Musobaqani boshlash →' : 'Kirish va boshlash →'}</button>
                {user?.is_admin && info.phase !== 'open' && <p className="tertiary text-sm m-0 mt-1">Admin sifatida sinov rejimida o'ynaysiz.</p>}
              </div>
            ) : null}
            <ErrorBox error={error} />

            <div>
              <Heading>Qoidalar</Heading>
              <ul className="m-0 pl-5 leading-8">
                <li>{info.questions} ta savol, har biriga <b>{info.seconds_per_question} soniya</b>. Maksimal ball: <b>{info.max_points}</b>.</li>
                <li>So'zlar, iboralar, idiomalar va phrasal verblar.</li>
                <li>To'g'ri javob uchun: {Object.entries(info.points).map(([l, p]) => `${l} +${p}`).join(', ')}. Xato javob uchun shuncha ball ayiriladi, javob berilmasa 0 ball.</li>
                <li>Ball teng bo'lsa, tezroq tugatgan ishtirokchi yuqorida turadi.</li>
                <li>Har bir ishtirokchiga bitta urinish beriladi. Sahifadan {info.max_leaves} marta chiqsangiz, musobaqadan chetlatilasiz.</li>
                <li>Kirish {fmtTime(info.starts_at)} – {fmtClock(info.join_until)} oralig'ida ochiq bo'ladi.</li>
                {info.prize && <li>🏆 <mark>{info.prize}</mark></li>}
              </ul>
            </div>
          </div>
        )}
      </Paper>

      <Paper variant="grid">
        <div className="card flex flex-wrap items-center gap-md">
          <span className="flex-1">Bekzod Turg'unovning 1,5 oylik Multilevel C1 kursida o'qing. Darslar 1-dekabrda boshlanadi.</span>
          <a href={COURSE_LINK} target="_blank" rel="noreferrer" className="btn btn-yellow">Kursga yozilish ↗</a>
        </div>
      </Paper>
    </>
  )
}
