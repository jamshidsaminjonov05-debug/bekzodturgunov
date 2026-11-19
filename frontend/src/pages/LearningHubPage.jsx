import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Back, ErrorBox, Heading, Loader, Paper, Stat } from '../components/ui'

const TABS = [
  ['stories', '📚 Hikoyalar'], ['podcasts', '🎧 Podcast'], ['pronunciation', '🗣️ Talaffuz'],
  ['conversation', '💬 Suhbat'], ['world', '🌍 Dunyo'], ['placement', '🎯 Aniqlash testi'],
  ['groups', '👥 Guruhlar'], ['media', '🎬 Media'], ['community', '✍️ Yozuvlar'],
  ['progress', '📈 Progress'], ['courses', '🎓 Kurslarim'],
]

/** GitHub-uslubidagi faoliyat xaritasi va yutuqlar */
function Progress() {
  const { user } = useAuth()
  const [heat, setHeat] = useState(null)
  const [ach, setAch] = useState(null)
  useEffect(() => {
    if (!user) return
    api('/activity/heatmap').then(setHeat).catch(() => {})
    api('/achievements').then(setAch).catch(() => {})
  }, [user])
  if (!user) return <p className="card tertiary">Progressni ko'rish uchun kiring.</p>
  const shades = ['shade-0', 'shade-1', 'shade-2', 'shade-3', 'shade-4']
  return (
    <div>
      <Heading as="h2">My Progress 📈</Heading>
      {!heat ? <Loader /> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm mb-md">
            <Stat label="Faol kunlar" value={heat.total_active} />
            <Stat label="Hozirgi seriya" value={heat.current_streak} />
            <Stat label="Eng uzun seriya" value={heat.longest_streak} />
            <Stat label="Jami harakat" value={heat.total_actions} />
          </div>
          <div className="card overflow-x-auto mb-md">
            <h3 className="mt-0">Faoliyat xaritasi (365 kun)</h3>
            <div className="heatmap">
              {heat.days.map((d) => <span key={d.date} className={`heat-cell ${shades[d.level]}`} title={`${d.date} — ${d.count} harakat`} />)}
            </div>
            <div className="flex items-center gap-1 mt-2 tertiary text-xs">
              Kam <span className="heat-cell shade-0" /><span className="heat-cell shade-1" /><span className="heat-cell shade-2" /><span className="heat-cell shade-3" /><span className="heat-cell shade-4" /> Ko'p
            </div>
          </div>
        </>
      )}
      <Heading as="h2">Yutuqlar 🏅</Heading>
      {!ach ? <Loader /> : (
        <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-3">
          {ach.map((a) => (
            <div key={a.id} className={`card flex items-center gap-sm ${a.unlocked ? '' : 'opacity-50'}`}>
              <span className="text-2xl">{a.unlocked ? a.icon : '🔒'}</span>
              <span className="flex-1">{a.title}</span>
              {a.unlocked && <span className="tag tag-yellow">olindi</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Mening kurslarim — haqiqiy yozilishlar va bepul o'z-o'zini o'qitish kurslari */
function Courses({ goTab }) {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  useEffect(() => { if (user) api('/enrollments').then(setItems).catch(() => setItems([])) }, [user])
  const free = [
    { title: 'ELS Intermediate', to: '/bolim/kitoblar', icon: '📗', sub: "59 pasaj, lug'at va testlar" },
    { title: 'English Games', to: '/games', icon: '🎮', sub: "O'yinlar va XP" },
    { title: 'Grammatika', to: '/bolim/grammatika', icon: '📐', sub: 'Qoidalar va mashqlar' },
    { title: 'Lug\'at', to: '/bolim/lugat', icon: '🗂️', sub: "Mavzuli so'zlar" },
  ]
  return (
    <div>
      <Heading as="h2">My Courses 🎓</Heading>
      <h3>Bepul o'z-o'zini o'qitish</h3>
      <div className="grid gap-sm sm:grid-cols-2 mb-md">
        {free.map((c) => <Link key={c.title} to={c.to} className="card flex items-center gap-sm"><span className="text-2xl">{c.icon}</span><span><b className="block">{c.title}</b><span className="tertiary text-sm">{c.sub}</span></span></Link>)}
      </div>
      <h3>Mening guruhlarim</h3>
      {!user ? <p className="card tertiary">Ko'rish uchun kiring.</p>
        : !items ? <Loader /> : items.length === 0 ? <p className="card tertiary">Hali guruhga yozilmadingiz. <button className="btn !py-0" onClick={() => goTab('groups')}>Guruhlarga qarash →</button></p>
        : <div className="grid gap-sm md:grid-cols-2">{items.map((i) => <div key={i.id} className="card flex items-center gap-sm"><span className="flex-1">{i.group}</span><span className="tag">{i.status}</span></div>)}</div>}
    </div>
  )
}

/** Admin kiritgan media havolalari (litsenziyali) */
function Media({ kind }) {
  const [items, setItems] = useState(null)
  useEffect(() => { api(`/media?kind=${kind}`).then(setItems).catch(() => setItems([])) }, [kind])
  return (
    <div>
      <Heading as="h2">{kind === 'video' ? 'Filmlar va seriallar 🎬' : 'Inglizcha yangiliklar 📰'}</Heading>
      {!items ? <Loader /> : items.length === 0 ? (
        <p className="card tertiary">Hali havolalar yo'q — admin tomonidan litsenziyali manbalar qo'shilganda shu yerda ko'rinadi.</p>
      ) : (
        <div className="grid gap-sm md:grid-cols-2">
          {items.map((m) => (
            <div key={m.id} className="card">
              <span className="tag tag-blue">{m.level || '—'}</span>
              <h3 className="mt-1 mb-1">{m.title}</h3>
              <p className="secondary text-sm m-0 mb-2">{m.description}</p>
              <a href={m.url} target="_blank" rel="noreferrer" className="btn !py-0.5">Havolani ochish ↗</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Guruhlar va yozilish */
function Groups() {
  const { user, openLogin } = useAuth()
  const [mode, setMode] = useState('online')
  const [groups, setGroups] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    api(`/groups?mode=${mode}`).then(setGroups).catch(() => setGroups([]))
    if (user) api('/enrollments').then(setEnrollments).catch(() => {})
  }, [mode, user])

  const enroll = async (id) => {
    if (!user) { openLogin(); return }
    try {
      const r = await api(`/groups/${id}/enroll`, { method: 'POST', body: { message: '' } })
      setMsg(r.telegram ? `Ariza saqlandi. Telegram orqali yozilish: ${r.telegram}` : 'Ariza saqlandi (pending).')
      if (r.telegram) window.open(r.telegram, '_blank', 'noopener')
      setEnrollments(await api('/enrollments'))
    } catch (e) { setMsg(`Xatolik: ${e.message}`) }
  }

  return (
    <div>
      <Heading as="h2">Guruhlarda o'qish 👥</Heading>
      <div className="flex gap-2 mb-md">
        <button className={`btn !py-0.5 ${mode === 'online' ? 'btn-primary' : ''}`} onClick={() => setMode('online')}>Online (Telegram)</button>
        <button className={`btn !py-0.5 ${mode === 'offline' ? 'btn-primary' : ''}`} onClick={() => setMode('offline')}>Offline</button>
      </div>
      {msg && <p className="card secondary">{msg}</p>}
      {!groups ? <Loader /> : groups.length === 0 ? (
        <p className="card tertiary">Hali guruhlar yo'q — admin tomonidan jadval va narx kiritilganda ko'rinadi.</p>
      ) : (
        <div className="grid gap-sm md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.id} className="card">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <b className="font-display text-xl">{g.title}</b>
                <span className="tag">{g.level_from} → {g.level_to}</span>
              </div>
              <p className="secondary text-sm m-0">👨‍🏫 {g.teacher || '—'} · 📅 {g.start_date || '—'}</p>
              <p className="secondary text-sm m-0">{g.days} · 🕐 {g.time} · {g.duration}</p>
              {g.mode === 'offline' && <p className="secondary text-sm m-0">📍 {g.location} {g.map_url && <a href={g.map_url} target="_blank" rel="noreferrer">· xarita ↗</a>}</p>}
              <p className="secondary text-sm m-0">💰 {g.price || 'Admin belgilaydi'}</p>
              <p className="tertiary text-sm m-0 mb-2">Bo'sh o'rin: {g.seats}/{g.capacity}</p>
              <button className="btn btn-yellow !py-0.5" disabled={g.seats === 0} onClick={() => enroll(g.id)}>Telegram orqali yozilish →</button>
            </div>
          ))}
        </div>
      )}
      {enrollments.length > 0 && (
        <div className="mt-md">
          <h3>Arizalarim</h3>
          {enrollments.map((e) => <div key={e.id} className="card flex items-center gap-sm"><span className="flex-1">{e.group}</span><span className="tag">{e.status}</span></div>)}
        </div>
      )}
    </div>
  )
}

/** Yozuv hamjamiyati — faqat rozilik bilan */
function Community() {
  const { user, openLogin } = useAuth()
  const [posts, setPosts] = useState(null)
  const [mine, setMine] = useState(null)
  useEffect(() => {
    api('/writings').then(setPosts).catch(() => setPosts([]))
    if (user) api('/writings/mine').then(setMine).catch(() => setMine([]))
  }, [user])
  const toggle = async (id, published) => {
    await api('/writings/publish', { method: 'POST', body: { writing_id: id, published: !published } })
    setMine(await api('/writings/mine'))
    setPosts(await api('/writings'))
  }
  return (
    <div>
      <Heading as="h2">Yozuv hamjamiyati ✍️</Heading>
      {user && (
        <div className="card mb-md">
          <h3 className="mt-0">Mening yozuvlarim</h3>
          {!mine ? <Loader /> : mine.length === 0 ? <p className="tertiary">Hali yozuv yubormadingiz.</p> : mine.map((w) => (
            <div key={w.id} className="card flex items-center gap-sm mb-2">
              <span className="flex-1 min-w-0 truncate">Task {w.task} · {w.prompt}</span>
              <button className={`btn !py-0 ${w.published ? 'btn-primary' : ''}`} onClick={() => toggle(w.id, w.published)}>
                {w.published ? 'Nashrdan olish' : 'Nashr qilish (rozilik)'}
              </button>
            </div>
          ))}
        </div>
      )}
      <h3>Hamjamiyat yozuvlari</h3>
      {!posts ? <Loader /> : posts.length === 0 ? <p className="card tertiary">Hali ommaviy yozuv yo'q.</p> : (
        <div className="grid gap-sm md:grid-cols-2">
          {posts.map((p) => (
            <div key={p.id} className="card">
              <b>{p.name}</b> <span className="tag">{p.level || '—'}</span>
              <p className="secondary text-sm m-0 mt-1">{p.text}…</p>
            </div>
          ))}
        </div>
      )}
      {!user && <p className="tertiary text-sm mt-md">Yozuv nashr qilish uchun kiring.</p>}
    </div>
  )
}

function speak(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'; u.rate = rate
  window.speechSynthesis.speak(u)
}

/** Hikoyalar va podcast uchun umumiy o'qish ko'rinishi */
function TextPlayer({ items, onProgress }) {
  const [active, setActive] = useState(null)
  const [rate, setRate] = useState(0.9)
  if (!items?.length) return <p className="card tertiary">Hali kontent yo'q.</p>
  const text = active?.text || active?.transcript || ''
  return (
    <div className="grid gap-md md:grid-cols-[280px_1fr]">
      <div className="grid gap-1 content-start">
        {items.map((it, i) => (
          <button key={it.id} className={`card text-left flex items-center gap-sm ${active?.id === it.id ? 'selected' : ''}`}
            onClick={() => setActive(it)}>
            <span className="text-xl">{it.category === 'Stories' ? '📖' : '🎧'}</span>
            <span className="flex-1 min-w-0">
              <span className="block truncate font-display">{it.title}</span>
              <span className="block tertiary text-sm">{it.level} · {it.words || text.split(' ').length} so'z</span>
            </span>
          </button>
        ))}
      </div>
      <div className="card">
        {!active ? <p className="tertiary">O'qish uchun chapdan tanlang.</p> : (
          <>
            <div className="flex items-center gap-2 flex-wrap mb-md">
              <h3 className="m-0 flex-1">{active.title}</h3>
              <button className="btn !py-0.5" onClick={() => speak(text, rate)}>▶ Ovozli o'qish</button>
              <button className="btn !py-0.5" onClick={() => { window.speechSynthesis?.cancel() }}>⏹ To'xtatish</button>
              <select className="input !w-auto !py-0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))}>
                <option value={0.7}>0.7x</option><option value={0.9}>0.9x</option><option value={1}>1x</option><option value={1.2}>1.2x</option>
              </select>
            </div>
            <article className="paper-sheet p-md leading-8 whitespace-pre-line">{text}</article>
            {active.glossary?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-md">
                {active.glossary.map((g, i) => <span key={i} className="card !py-1">{g.word} — <span className="secondary">{g.meaning}</span></span>)}
              </div>
            )}
            {onProgress && (
              <button className="btn btn-yellow mt-md" onClick={() => onProgress(active.id, 100)}>O'qildi deb belgilash ✓</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Pronunciation() {
  const [target, setTarget] = useState('The weather is beautiful today.')
  const [heard, setHeard] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const { user, openLogin } = useAuth()
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition

  const listen = () => {
    speak(target, 0.85)
    if (!SR) { setError('Bu brauzer mikrofonni qo\'llab quvvatlamaydi — matnni o\'zingiz yozing.'); return }
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = false
    rec.onresult = (e) => setHeard(e.results[0][0].transcript)
    rec.onerror = () => setError('Mikrofon ruxsati berilmadi.')
    rec.start()
  }

  const submit = async () => {
    if (!user) { openLogin(); return }
    try { setResult(await api('/pronunciation/submit', { method: 'POST', body: { kind: 'sentence', target, heard } })) }
    catch (e) { setError(e) }
  }

  return (
    <div className="card max-w-2xl">
      <Heading as="h2">Talaffuz laboratoriyasi 🗣️</Heading>
      <ErrorBox error={error} />
      <p className="secondary m-0">Matnni tinglang, so'ng o'zingiz ayting — mikrofon yozib oladi.</p>
      <div className="paper-sheet p-md leading-8 text-lg mb-md">{target}</div>
      <div className="flex gap-2 flex-wrap mb-md">
        <button className="btn" onClick={listen}>🎤 Tingla va ayt</button>
        <button className="btn" onClick={() => setTarget('I would like a cup of tea, please.')}>Boshqa gap</button>
      </div>
      <textarea className="input min-h-[90px]" placeholder="Eshitilgan matn…" value={heard} onChange={(e) => setHeard(e.target.value)} />
      <button className="btn btn-yellow mt-sm" disabled={!heard.trim()} onClick={submit}>Baholash ✓</button>
      {result && (
        <div className="card mt-md">
          <b className="font-display text-2xl">{result.score}/100</b>
          <p className="secondary m-0">{result.note}</p>
        </div>
      )}
    </div>
  )
}

function Conversation() {
  const { user, openLogin } = useAuth()
  const [topics, setTopics] = useState(null)
  const [active, setActive] = useState(null)
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { api('/conversation/topics').then(setTopics).catch(() => {}) }, [])

  const ask = async () => {
    if (!user) { openLogin(); return }
    setBusy(true)
    try {
      const r = await api('/tutor/ask', { method: 'POST', body: { message, context: `Speaking topic: ${active?.title}` } })
      setAnswer(r.answer)
    } catch (e) { setAnswer(`Xatolik: ${e.message}`) } finally { setBusy(false) }
  }

  return (
    <div className="grid gap-md md:grid-cols-2">
      <div>
        <Heading as="h2">Suhbat mavzulari 💬</Heading>
        {!topics ? <Loader /> : topics.map((t) => (
          <button key={t.id} className={`card w-full text-left mb-2 ${active?.id === t.id ? 'selected' : ''}`} onClick={() => setActive(t)}>
            <span className="tag tag-blue">{t.level}</span> <b>{t.title}</b>
          </button>
        ))}
      </div>
      <div className="card">
        <Heading as="h2">AI bilan mashq</Heading>
        {!active ? <p className="tertiary">Mavzu tanlang.</p> : (
          <>
            <ul className="secondary">{active.prompts.map((p, i) => <li key={i}>{p}</li>)}</ul>
            <textarea className="input min-h-[100px] mt-sm" placeholder="Javobingizni yozing…" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className="btn btn-yellow mt-sm" disabled={busy || !message.trim()} onClick={ask}>{busy ? 'Yozilmoqda…' : 'Fikr-mulohaza olish →'}</button>
            {answer && <div className="card mt-md whitespace-pre-line">{answer}</div>}
          </>
        )}
      </div>
    </div>
  )
}

function World() {
  const [scenarios, setScenarios] = useState(null)
  const [active, setActive] = useState(null)
  useEffect(() => { api('/scenarios').then(setScenarios).catch(() => {}) }, [])
  return (
    <>
      <Heading as="h2">Virtual ingliz dunyosi 🌍</Heading>
      {!scenarios ? <Loader /> : (
        <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-4 mb-md">
          {scenarios.map((s) => (
            <button key={s.id} className="card text-left" onClick={() => setActive(s)}>
              <span className="text-3xl block mb-2">{s.icon}</span>
              <b>{s.title}</b><span className="tag ml-2">{s.level}</span>
            </button>
          ))}
        </div>
      )}
      {active && (
        <div className="card max-w-2xl">
          <h3 className="mt-0">{active.icon} {active.title}</h3>
          {active.dialogue.map(([who, line], i) => (
            <p key={i} className="m-0 mb-2"><b>{who}:</b> {line}
              <button className="btn !py-0 ml-2" onClick={() => speak(line)}>▶</button>
            </p>
          ))}
          <div className="flex flex-wrap gap-2 mt-md">
            {active.vocab.map((w) => <span key={w} className="card !py-1">{w}</span>)}
          </div>
        </div>
      )}
    </>
  )
}

function Placement() {
  const { user, openLogin } = useAuth()
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [goal, setGoal] = useState(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    api('/placement/questions').then(setQuestions).catch(() => {})
    if (user) api('/goal').then(setGoal).catch(() => {})
  }, [user])

  const submit = async () => {
    if (!user) { openLogin(); return }
    try { setResult(await api('/placement/submit', { method: 'POST', body: { answers } })) }
    catch (e) { setResult({ error: e.message }) }
  }
  const saveGoal = async () => {
    if (!user) { openLogin(); return }
    setSaving(true)
    await api('/goal', { method: 'POST', body: goal })
    setSaving(false)
  }

  return (
    <div className="grid gap-md md:grid-cols-2">
      <div className="card">
        <Heading as="h2">Aniqlash testi 🎯</Heading>
        {!questions ? <Loader /> : questions.map((q, i) => (
          <div key={q.id} className="mb-md">
            <p className="m-0 mb-2"><span className="tag">{q.skill}</span> {i + 1}. {q.prompt}</p>
            <div className="flex flex-wrap gap-2">
              {(q.options || []).map((o) => (
                <button key={o} className={`option !w-auto ${answers[q.id] === o ? 'selected' : ''}`}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))}>{o}</button>
              ))}
            </div>
          </div>
        ))}
        <button className="btn btn-yellow" disabled={!Object.keys(answers).length} onClick={submit}>Natijani ko'rish ✓</button>
        {result?.error && <ErrorBox error={{ message: result.error }} />}
        {result?.estimated_level && (
          <div className="card mt-md">
            <b className="font-display text-3xl">{result.estimated_level}</b>
            <p className="secondary m-0">Taxminiy daraja</p>
            <div className="grid grid-cols-3 gap-2 mt-sm">
              {Object.entries(result.scores).map(([k, v]) => <Stat key={k} label={k} value={`${v}%`} />)}
            </div>
            <p className="tertiary text-sm mt-md">{result.note}</p>
          </div>
        )}
      </div>
      <div className="card">
        <Heading as="h2">Maqsadim 🎓</Heading>
        {!user ? <p className="tertiary">Maqsad qo'yish uchun kiring.</p> : (
          <div className="grid gap-2">
            <select className="input" value={goal?.target_level || 'B2'} onChange={(e) => setGoal({ ...goal, target_level: e.target.value })}>
              <option>B1</option><option>B2</option><option>C1</option>
            </select>
            <select className="input" value={goal?.duration || '3 oy'} onChange={(e) => setGoal({ ...goal, duration: e.target.value })}>
              {['1 oy', '2 oy', '3 oy', '6 oy', '9 oy', '12 oy'].map((d) => <option key={d}>{d}</option>)}
            </select>
            <input className="input" type="number" min="1" max="12" placeholder="Kuniga soat"
              value={goal?.hours_per_day || 1} onChange={(e) => setGoal({ ...goal, hours_per_day: Number(e.target.value) })} />
            <input className="input" placeholder="Eng zaif ko'nikma (masalan: Listening)"
              value={goal?.weak_skills || ''} onChange={(e) => setGoal({ ...goal, weak_skills: e.target.value })} />
            <button className="btn btn-yellow justify-self-start" disabled={saving} onClick={saveGoal}>Saqlash</button>
            <p className="tertiary text-sm">Maqsad asosida asosiy sahifadagi vazifalar moslashtiriladi.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LearningHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') || 'stories')
  const [stories, setStories] = useState(null)
  const [podcasts, setPodcasts] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    api('/stories').then(setStories).catch(() => {})
    api('/podcasts').then(setPodcasts).catch(() => {})
  }, [])

  const progress = async (id, p) => { if (user) await api('/progress', { method: 'POST', body: { item_id: id, progress: p } }) }

  return (
    <Paper variant="grid" className="min-h-[70vh]">
      <Back to="/#bolimlar">Bo'limlar</Back>
      <Heading as="h1" sub="Bepul o'quv modullari — hammasi bitta joyda.">O'quv markazi 🎓</Heading>
      <div className="flex flex-wrap gap-2 mb-md">
        {TABS.map(([k, l]) => <button key={k} className={`btn !py-0.5 ${tab === k ? 'btn-primary' : ''}`}
          onClick={() => { setTab(k); setSearchParams({ tab: k }) }}>{l}</button>)}
      </div>
      {tab === 'stories' && <TextPlayer items={stories} onProgress={progress} />}
      {tab === 'podcasts' && <TextPlayer items={podcasts} />}
      {tab === 'pronunciation' && <Pronunciation />}
      {tab === 'conversation' && <Conversation />}
      {tab === 'world' && <World />}
      {tab === 'placement' && <Placement />}
      {tab === 'groups' && <Groups />}
      {tab === 'media' && (
        <>
          <Media kind="podcast" />
          <div className="mt-lg"><Media kind="video" /></div>
          <div className="mt-lg"><Media kind="news" /></div>
        </>
      )}
      {tab === 'community' && <Community />}
      {tab === 'progress' && <Progress />}
      {tab === 'courses' && <Courses goTab={(k) => { setTab(k); setSearchParams({ tab: k }) }} />}
    </Paper>
  )
}
