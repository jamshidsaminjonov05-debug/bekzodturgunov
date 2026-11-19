import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Back, ErrorBox, Heading, Loader, Paper, Stat } from '../components/ui'

const LEVELS = ['', 'A1', 'A2', 'B1', 'B2', 'C1']
const DIFFS = [['easy', 'Oson'], ['medium', 'O‘rta'], ['hard', 'Qiyin']]

/** Bitta o'yin oqimi: savollar -> javoblar -> natija */
function GameRunner({ game, level, difficulty, onDone }) {
  const { user, openLogin } = useAuth()
  const [data, setData] = useState(null)
  const [picked, setPicked] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const seed = 42

  useEffect(() => {
    setData(null); setResult(null); setPicked({}); setError(null)
    api(`/games/questions?game=${game.id}&level=${level}&difficulty=${difficulty}&seed=${seed}`)
      .then(setData).catch(setError)
  }, [game.id, level, difficulty])

  if (error) return <ErrorBox error={error} />
  if (!data) return <Loader />
  if (!data.available) return <p className="card tertiary">Bu o'yin uchun materiallar hali yuklanmadi.</p>
  if (!data.questions.length) return <p className="card tertiary">Bu darajada savol topilmadi.</p>

  const submit = async () => {
    if (!user) { openLogin(); return }
    setBusy(true); setError(null)
    try {
      setResult(await api('/games/submit', {
        method: 'POST',
        body: { game: game.id, level, difficulty, seed, answers: picked },
      }))
    } catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-sm flex-wrap mb-md">
        <h3 className="m-0">{game.icon} {game.title}</h3>
        <button className="btn !py-0.5" onClick={onDone}>← O'yinlarga qaytish</button>
      </div>
      {data.questions.map((q, i) => {
        const r = result?.results.find((x) => x.id === q.id)
        return (
          <div key={q.id} className="mb-md">
            <p className="m-0 mb-2"><span className="font-mono tertiary mr-2">{i + 1}.</span>{q.prompt}</p>
            {q.type === 'mcq' ? (
              <div className="grid gap-1">
                {(q.options || []).map((o) => {
                  let cls = picked[q.id] === o ? 'selected' : ''
                  if (result) cls = o === r?.answer ? 'good' : picked[q.id] === o ? 'bad' : ''
                  return <button key={o} className={`option !w-auto !justify-start text-left ${cls}`} disabled={!!result}
                    onClick={() => setPicked((p) => ({ ...p, [q.id]: o }))}>{o}</button>
                })}
              </div>
            ) : (
              <input className="input max-w-md" placeholder="javobingiz…" disabled={!!result}
                value={picked[q.id] ?? ''} onChange={(e) => setPicked((p) => ({ ...p, [q.id]: e.target.value }))} />
            )}
            {r && <p className={`m-0 mt-1 text-sm ${r.correct ? 'text-good' : 'text-bad'}`}>
              {r.correct ? '✓' : `✗ to'g'ri: ${r.answer}`}
            </p>}
          </div>
        )
      })}
      <ErrorBox error={error} />
      {result ? (
        <div className="flex items-center gap-sm flex-wrap">
          <span className="font-display text-3xl">{result.score}/{result.total}</span>
          <span className="tag tag-yellow">+{result.xp} XP</span>
          <button className="btn" onClick={() => { setPicked({}); setResult(null); setData({ ...data, questions: [...data.questions].reverse() }) }}>Qayta ishlash</button>
        </div>
      ) : (
        <button className="btn btn-yellow" disabled={busy || !Object.keys(picked).length} onClick={submit}>
          {busy ? 'Yuborilmoqda…' : user ? 'Tekshirish ✓' : 'Kirib, tekshirish'}
        </button>
      )}
    </div>
  )
}

/** Shaxsiy lug'at daftari */
function Notebook() {
  const { user, openLogin } = useAuth()
  const [words, setWords] = useState(null)
  const [form, setForm] = useState({ word: '', translation: '', definition: '', example: '', notes: '' })
  const [error, setError] = useState(null)

  const load = () => api('/notebook').then(setWords).catch(setError)
  useEffect(() => { if (user) load() }, [user])
  if (!user) return <p className="card tertiary">Daftarga so'z qo'shish uchun kiring. <button className="btn !py-0" onClick={openLogin}>Kirish</button></p>

  const add = async (e) => {
    e.preventDefault(); setError(null)
    try { await api('/notebook', { method: 'POST', body: form }); setForm({ word: '', translation: '', definition: '', example: '', notes: '' }); load() }
    catch (err) { setError(err) }
  }

  const statuses = ['Yangi', 'Takrorlanmoqda', 'O‘zlashtirildi']

  return (
    <>
      <ErrorBox error={error} />
      <form className="card grid gap-2 mb-md" onSubmit={add}>
        <h3 className="mt-0 mb-0">Yangi so'z qo'shish</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input" placeholder="So'z *" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} required />
          <input className="input" placeholder="Tarjima" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} />
          <input className="input" placeholder="Inglizcha ta'rif" value={form.definition} onChange={(e) => setForm({ ...form, definition: e.target.value })} />
          <input className="input" placeholder="Talaffuz" value={form.pronunciation || ''} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} />
        </div>
        <input className="input" placeholder="Misol gap" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
        <input className="input" placeholder="Izoh" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button className="btn btn-yellow justify-self-start">Qo'shish →</button>
      </form>
      {!words ? <Loader /> : words.length === 0 ? (
        <p className="card tertiary">Hali so'z yo'q — yuqoridan birinchi so'zingizni qo'shing.</p>
      ) : (
        <div className="grid gap-2">
          {words.map((w) => (
            <div key={w.id} className="card flex items-start gap-sm flex-wrap">
              <div className="flex-1 min-w-0">
                <b className="font-display text-lg">{w.word}</b> <span className="secondary">— {w.translation}</span>
                {w.definition && <p className="tertiary text-sm m-0 mt-1">{w.definition}</p>}
                {w.example && <p className="tertiary text-sm italic m-0 mt-1">“{w.example}”</p>}
              </div>
              <button className="btn !py-0" onClick={async () => { await api(`/notebook/${w.id}/review`, { method: 'PATCH' }); load() }}>
                {statuses[w.review_status]}
              </button>
              <button className="btn btn-ghost !py-0 text-bad" onClick={async () => { await api(`/notebook/${w.id}`, { method: 'DELETE' }); load() }}>×</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/** Diktant markazi — matn brauzer tomonidan ovozli o'qiladi */
function Dictation() {
  const { user, openLogin } = useAuth()
  const [task, setTask] = useState(null)
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const next = () => {
    setTask(null); setText(''); setResult(null); setError(null)
    api('/dictation').then(setTask).catch(setError)
  }
  useEffect(() => { next() }, [])

  const speak = () => {
    if (!task || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(task.text)
    u.lang = 'en-US'; u.rate = 0.85
    window.speechSynthesis.speak(u)
  }

  const submit = async () => {
    if (!user) { openLogin(); return }
    setBusy(true); setError(null)
    try { setResult(await api('/dictation/submit', { method: 'POST', body: { task_id: task.id, text } })) }
    catch (e) { setError(e) } finally { setBusy(false) }
  }

  return (
    <div className="card max-w-2xl">
      <Heading as="h2">Diktant markazi ✍️</Heading>
      <ErrorBox error={error} />
      {!task ? <Loader /> : (
        <>
          <p className="secondary m-0">Manba: <b>{task.title}</b> · {task.level || '—'} · {task.word_count} so'z</p>
          <p className="tertiary text-sm m-0 mb-3">Birinchi so'z: <b>{task.first_word}</b></p>
          <div className="flex gap-2 flex-wrap mb-md">
            <button className="btn" onClick={speak}>▶ Tinglash</button>
            <button className="btn" onClick={next}>Boshqa vazifa</button>
          </div>
          <textarea className="input min-h-[140px]" placeholder="Eshitgan matningizni yozing…"
            value={text} disabled={!!result} onChange={(e) => setText(e.target.value)} />
          {result && (
            <div className="card mt-sm">
              <b className="font-display text-2xl">{result.score}/100</b>
              <span className="tag tag-yellow ml-2">+{result.xp} XP</span>
              <p className="secondary m-0">To'g'ri so'zlar: {result.correct_words}/{result.total_words}</p>
              <p className="tertiary text-sm m-0">To'g'ri matn: {result.answer}</p>
            </div>
          )}
          {!result && <button className="btn btn-yellow mt-sm" disabled={busy || !text.trim()} onClick={submit}>
            {busy ? 'Tekshirilmoqda…' : 'Tekshirish ✓'}
          </button>}
        </>
      )}
    </div>
  )
}

export default function GamesPage() {
  const { user, openLogin } = useAuth()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') || 'games')
  const [games, setGames] = useState(null)
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [leaders, setLeaders] = useState(null)
  const [active, setActive] = useState(null)
  const [level, setLevel] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [error, setError] = useState(null)

  const load = () => {
    api('/games').then(setGames).catch(setError)
    api('/challenge').then(setChallenge).catch(() => {})
    api('/games/leaderboard').then(setLeaders).catch(() => {})
    if (user) {
      api('/games/stats').then(setStats).catch(() => {})
      api('/games/history').then(setHistory).catch(() => {})
    }
  }
  useEffect(() => { load() }, [user])

  const GAME_NAMES = Object.fromEntries((games || []).map((g) => [g.id, `${g.icon} ${g.title}`]))

  return (
    <Paper variant="grid" className="min-h-[70vh]">
      <Back to="/#bolimlar">Bo'limlar</Back>
      <Heading as="h1" sub="Ingliz tilini o'yin orqali mashq qiling — bepul.">English Games 🎮</Heading>
      <ErrorBox error={error} />

      <div className="flex flex-wrap gap-2 mb-md">
        {[['games', "🎮 O'yinlar"], ['notebook', '📓 Daftar'], ['challenge', '🎯 Kunlik'], ['history', '📈 Tarix'], ['dictation', '✍️ Diktant'], ['rating', '🏆 Reyting']].map(([k, l]) => (
          <button key={k} className={`btn !py-0.5 ${tab === k ? 'btn-primary' : ''}`}
            onClick={() => { setTab(k); setParams({ tab: k }) }}>{l}</button>
        ))}
      </div>

      {tab === 'games' && (
        stats && <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm mb-md">
          <Stat label="XP" value={stats.xp} />
          <Stat label="O'yinlar" value={stats.played} />
          <Stat label="Eng yaxshi" value={Object.keys(stats.best).length} />
        </div>
      )}

      {tab === 'games' && !active && (
        <>
          <div className="flex flex-wrap gap-2 mb-md">
            {LEVELS.map((l) => <button key={l || 'all'} className={`btn !py-0.5 ${level === l ? 'btn-primary' : ''}`} onClick={() => setLevel(l)}>{l || 'Barcha'}</button>)}
            <span className="w-px bg-bg-tertiary mx-2" />
            {DIFFS.map(([k, l]) => <button key={k} className={`btn !py-0.5 ${difficulty === k ? 'btn-primary' : ''}`} onClick={() => setDifficulty(k)}>{l}</button>)}
          </div>
          {!games ? <Loader /> : (
            <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-3">
              {games.map((g) => (
                <button key={g.id} className={`card text-left ${g.available ? 'hoverable' : 'opacity-60'}`}
                  onClick={() => g.available ? setActive(g) : setTab('challenge')}>
                  <span className="text-3xl block mb-2">{g.icon}</span>
                  <h3 className="mt-0 mb-1">{g.title}</h3>
                  <p className="secondary text-sm m-0">{g.desc}</p>
                  {!g.available && <span className="tag mt-2 inline-block">tez orada</span>}
                  {stats?.best[g.id] != null && <span className="tag tag-blue mt-2 inline-block">eng yaxshi: {stats.best[g.id]}%</span>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'games' && active && (
        <GameRunner game={active} level={level} difficulty={difficulty} onDone={() => setActive(null)} />
      )}

      {tab === 'notebook' && <Notebook />}

      {tab === 'challenge' && (
        <div className="card max-w-xl">
          <Heading as="h2">Kunlik challenge 🎯</Heading>
          {!challenge ? <Loader /> : (
            <>
              <p className="secondary m-0">Sana: <b>{challenge.date}</b></p>
              <p className="secondary m-0">O'yin: <b>{GAME_NAMES[challenge.game] || challenge.game}</b></p>
              <p className="secondary m-0">Daraja: <b>{challenge.level || 'aralash'}</b> · Qiyinlik: <b>{challenge.difficulty}</b></p>
              <p className={`m-0 mt-2 ${challenge.completed ? 'text-good' : 'tertiary'}`}>
                {challenge.completed ? '✓ Bugun bajarildi' : 'Hali bajarilmadi'}
              </p>
              <button className="btn btn-yellow mt-md" onClick={() => {
                const g = games?.find((x) => x.id === challenge.game)
                if (g) { setLevel(challenge.level); setDifficulty(challenge.difficulty); setActive(g); setTab('games') }
              }}>Boshlash →</button>
            </>
          )}
        </div>
      )}

      {tab === 'dictation' && <Dictation />}

      {tab === 'rating' && (
        !leaders ? <Loader /> : leaders.length === 0 ? <p className="card tertiary">Hali o'yin natijasi yo'q — birinchi bo'ling!</p> : (
          <div className="grid gap-2 max-w-xl">
            {leaders.map((p, i) => (
              <div key={i} className="card flex items-center gap-sm">
                <span className="font-display text-2xl w-9 text-center">{['🥇','🥈','🥉'][i] || `${i+1}.`}</span>
                <span className="flex-1 min-w-0 truncate">{p.name}</span>
                <span className="tag">{p.played} o'yin</span>
                <span className="font-mono">{p.xp} XP</span>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'history' && (
        !user ? <p className="card tertiary">Tarixni ko'rish uchun kiring.</p>
          : !history ? <Loader />
          : history.length === 0 ? <p className="card tertiary">Hali o'yin o'ynamadingiz.</p>
          : <div className="grid gap-2">
            {history.map((h) => (
              <div key={h.id} className="card flex items-center gap-sm">
                <span className="flex-1 min-w-0 truncate">{GAME_NAMES[h.game] || h.game}</span>
                <span className="tag">{h.difficulty}</span>
                <span className="font-mono">{h.score}/{h.total}</span>
                <span className="tertiary text-sm">{h.created_at?.slice(5, 10)}</span>
              </div>
            ))}
          </div>
      )}
    </Paper>
  )
}
