import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { SECTIONS } from '../lib/sections'
import { ErrorBox, Heading, Loader, Paper, Stat } from '../components/ui'
import { MediaManager, GroupManager, EnrollmentManager } from './admin/Manage'

// Yangi material uchun JSON shablonlar
const TEMPLATES = {
  test: {
    parts: [{
      title: 'Part 1', instructions: 'Choose the correct answer.',
      passage: 'Reading uchun matn (listening uchun "transcript" yoki "audio_url" yozing)',
      questions: [
        { id: 'q1', type: 'mcq', prompt: 'Savol?', options: ['A', 'B', 'C'], answer: 'A' },
        { id: 'q2', type: 'tf', prompt: 'Statement', options: ['True', 'False', 'Not Given'], answer: 'True' },
        { id: 'q3', type: 'gap', prompt: 'Gap ____', answer: ['word', 'alternative'] },
      ],
    }],
  },
  vocab: { summary: '', words: [{ word: '', meaning: '', example: '' }] },
  grammar: { summary: '', rule: '', examples: [''], exercises: [{ prompt: '', options: ['', ''], answer: '' }] },
  stories: { summary: '', text: '', glossary: [{ word: '', meaning: '' }], questions: [{ prompt: '', options: ['', ''], answer: '' }] },
  speaking: { summary: '', part: '1.1', prep_seconds: 5, answer_seconds: 30, questions: [''], tips: [] },
  writing: { summary: '', task_type: '1.1', min_words: 50, prompt: '', tips: [] },
  book: {
    summary: '', cover: '📗', intro: '',
    units: [{
      title: '1. Passage name', passage: 'matn...',
      glossary: [{ word: '', forms: [''], definition: '', meaning: '' }],
      exercises: [
        { id: 'e1', group: 'Exercise 2', type: 'mcq', prompt: '', options: ['A) ', 'B) '], answer: 'A) ' },
        { id: 'e2', group: 'Exercise 3', type: 'input', prompt: '____', answer: '' },
      ],
      test: [{ id: 't1', prompt: '', options: ['', '', '', ''], answer: '' }],
    }],
  },
}

function AdminLogin() {
  const { adminLogin } = useAuth()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(null)
  return (
    <Paper variant="lined" className="min-h-[60vh]">
      <h1>Admin panel 🔐</h1>
      <form
        className="max-w-[24rem] grid gap-sm mt-md"
        onSubmit={async (e) => {
          e.preventDefault()
          try { await adminLogin(pw) } catch (e2) { setErr(e2) }
        }}
      >
        <input className="input" type="password" placeholder="Parol" value={pw} onChange={(e) => setPw(e.target.value)} />
        <ErrorBox error={err} />
        <button className="btn btn-primary justify-self-start">Kirish</button>
      </form>
    </Paper>
  )
}

function ContentEditor() {
  const [kind, setKind] = useState('reading')
  const [items, setItems] = useState(null)
  const [edit, setEdit] = useState(null) // {id?, title, level, minutes, json}
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)
  const section = SECTIONS.find((s) => s.kind === kind)

  const load = useCallback(() => {
    setItems(null)
    api(`/admin/items?kind=${kind}`).then(setItems).catch(setError)
  }, [kind])
  useEffect(() => { load(); setEdit(null) }, [load])

  const startNew = () => setEdit({
    title: '', level: 'B2', minutes: 30,
    json: JSON.stringify(section.type === 'test' ? TEMPLATES.test : TEMPLATES[kind], null, 2),
  })

  const save = async () => {
    setError(null)
    let data
    try { data = JSON.parse(edit.json) } catch (e) { return setError(new Error(`JSON xato: ${e.message}`)) }
    const body = { kind, title: edit.title, level: edit.level, minutes: Number(edit.minutes) || 30, data }
    try {
      if (edit.id) await api(`/admin/items/${kind}/${edit.id}`, { method: 'PUT', body })
      else await api('/admin/items', { method: 'POST', body })
      setMsg('Saqlandi ✓')
      setEdit(null)
      load()
    } catch (e) { setError(e) }
  }

  const remove = async (it) => {
    if (!window.confirm(`"${it.title}" o'chirilsinmi?`)) return
    try { await api(`/admin/items/${kind}/${it.id}`, { method: 'DELETE' }); load() } catch (e) { setError(e) }
  }

  return (
    <div className="grid gap-md">
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map((s) => (
          <button key={s.kind} className={`btn !py-0.5 ${s.kind === kind ? 'btn-primary' : ''}`} onClick={() => setKind(s.kind)}>{s.title}</button>
        ))}
      </div>
      {msg && <p className="m-0 text-good">{msg}</p>}
      <ErrorBox error={error} />
      {edit ? (
        <div className="card grid gap-sm">
          <div className="grid gap-sm md:grid-cols-[1fr_100px_100px]">
            <input className="input" placeholder="Sarlavha" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            <input className="input" placeholder="Daraja" value={edit.level} onChange={(e) => setEdit({ ...edit, level: e.target.value })} />
            {section.type === 'test' && <input className="input" type="number" title="Daqiqa" value={edit.minutes} onChange={(e) => setEdit({ ...edit, minutes: e.target.value })} />}
          </div>
          <textarea className="input font-mono text-sm min-h-[420px] !leading-6 !bg-none" value={edit.json} onChange={(e) => setEdit({ ...edit, json: e.target.value })} spellCheck={false} />
          <div className="flex gap-sm">
            <button className="btn btn-yellow" onClick={save}>Saqlash</button>
            <button className="btn btn-ghost" onClick={() => setEdit(null)}>Bekor qilish</button>
          </div>
        </div>
      ) : (
        <>
          <button className="btn btn-yellow justify-self-start" onClick={startNew}>+ Yangi qo'shish</button>
          {!items ? <Loader /> : items.length === 0 ? <p className="tertiary">Bo'sh</p> : (
            <div className="grid gap-2">
              {items.map((it) => (
                <div key={it.id} className="card flex items-center gap-sm">
                  <span className="tag">{it.level || '—'}</span>
                  <span className="flex-1 truncate">{it.title}</span>
                  <button className="btn !py-0" onClick={() => setEdit({ id: it.id, title: it.title, level: it.level, minutes: it.minutes ?? 30, json: JSON.stringify(it.data, null, 2) })}>Tahrirlash</button>
                  <button className="btn btn-ghost !py-0 text-bad" onClick={() => remove(it)}>O'chirish</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function toLocalInput(iso) {
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function ContestEditor() {
  const [c, setC] = useState(null)
  const [json, setJson] = useState('')
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)

  const load = useCallback(() => api('/admin/contest').then((d) => {
    setC({ ...d, starts_local: toLocalInput(d.starts_at) })
    setJson(JSON.stringify(d.questions, null, 2))
  }).catch(setError), [])
  useEffect(() => { load() }, [load])

  if (!c) return error ? <ErrorBox error={error} /> : <Loader />

  const set = (k) => (e) => setC({ ...c, [k]: e.target.value })
  const save = async () => {
    setError(null)
    let questions
    try { questions = JSON.parse(json) } catch (e) { return setError(new Error(`JSON xato: ${e.message}`)) }
    try {
      await api('/admin/contest', {
        method: 'PUT',
        body: {
          title: c.title, prize: c.prize, starts_at: new Date(c.starts_local).toISOString(),
          join_minutes: +c.join_minutes, duration_minutes: +c.duration_minutes,
          seconds_per_question: +c.seconds_per_question, questions,
        },
      })
      setMsg('Saqlandi ✓')
      load()
    } catch (e) { setError(e) }
  }
  const reset = async () => {
    if (!window.confirm('Barcha ishtirokchilar natijasi o\'chiriladi. Davom etamizmi?')) return
    await api('/admin/contest/reset', { method: 'POST' })
    setMsg('Natijalar tozalandi ✓')
  }
  const startIn = (min) => setC({ ...c, starts_local: toLocalInput(new Date(Date.now() + min * 60000).toISOString()) })

  const field = (label, k, type = 'text') => (
    <label className="grid gap-1"><span className="tertiary text-sm">{label}</span><input className="input" type={type} value={c[k]} onChange={set(k)} /></label>
  )

  return (
    <div className="card grid gap-sm">
      <div className="grid gap-sm md:grid-cols-2">
        {field('Nomi', 'title')}
        {field('Mukofot', 'prize')}
        {field('Boshlanish (brauzer vaqti)', 'starts_local', 'datetime-local')}
        {field('Kirish ochiq (daqiqa)', 'join_minutes', 'number')}
        {field('Umumiy davomiylik (daqiqa)', 'duration_minutes', 'number')}
        {field('Har savolga soniya', 'seconds_per_question', 'number')}
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="btn !py-0" onClick={() => startIn(0)}>Hozir boshlash</button>
        <button className="btn !py-0" onClick={() => startIn(5)}>5 daqiqadan keyin</button>
      </div>
      <span className="tertiary text-sm">Savollar: {`[{"word", "options": [4 ta], "answer": index (0 dan), "level": "A2..C2"}]`}</span>
      <textarea className="input font-mono text-sm min-h-[360px] !leading-6 !bg-none" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
      {msg && <p className="m-0 text-good">{msg}</p>}
      <ErrorBox error={error} />
      <div className="flex gap-sm flex-wrap">
        <button className="btn btn-yellow" onClick={save}>Saqlash</button>
        <button className="btn btn-ghost text-bad" onClick={reset}>Natijalarni tozalash</button>
      </div>
    </div>
  )
}

function Users() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api('/admin/users').then(setRows).catch(() => setRows([])) }, [])
  if (!rows) return <Loader />
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left">
        <thead className="tertiary text-sm"><tr><th>ID</th><th>Ism</th><th>Telefon</th><th>Testlar</th><th>Ro'yxatdan o'tgan</th></tr></thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-t border-dotted border-bg-tertiary">
              <td className="font-mono">{u.id}</td><td>{u.name}</td><td className="font-mono">{u.phone || '—'}</td><td className="font-mono">{u.attempts}</td>
              <td className="tertiary">{new Date(u.created_at).toLocaleString('uz-UZ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Admin() {
  const { user, ready } = useAuth()
  const [tab, setTab] = useState('kontent')
  const [stats, setStats] = useState(null)

  useEffect(() => { if (user?.is_admin) api('/admin/stats').then(setStats).catch(() => {}) }, [user])

  if (!ready) return <Paper className="min-h-[60vh]"><Loader /></Paper>
  if (!user?.is_admin) return <AdminLogin />

  return (
    <>
      <Paper variant="grid">
        <Heading as="h1">Admin panel</Heading>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-sm">
            <Stat label="Foydalanuvchi" value={stats.users} />
            <Stat label="Testlar" value={stats.tests} />
            <Stat label="Darslar" value={stats.lessons} />
            <Stat label="Kitoblar" value={stats.books ?? 0} />
            <Stat label="Urinishlar" value={stats.attempts} />
            <Stat label="Writing" value={stats.writings} />
          </div>
        )}
        <div className="flex gap-2 mt-md">
          {[['kontent', 'Kontent'], ['media', 'Media'], ['groups', 'Guruhlar'], ['enrollments', 'Arizalar'], ['musobaqa', 'Musobaqa'], ['users', 'Foydalanuvchilar']].map(([k, l]) => (
            <button key={k} className={`btn !py-0.5 ${tab === k ? 'btn-primary' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </Paper>
      <Paper variant="lined" className="min-h-[50vh]">
        {tab === 'kontent' && <ContentEditor />}
        {tab === 'media' && <MediaManager />}
        {tab === 'groups' && <GroupManager />}
        {tab === 'enrollments' && <EnrollmentManager />}
        {tab === 'musobaqa' && <ContestEditor />}
        {tab === 'users' && <Users />}
      </Paper>
    </>
  )
}
