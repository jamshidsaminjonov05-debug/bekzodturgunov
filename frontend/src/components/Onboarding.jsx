import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Heading, Loader, Paper, Stat } from './ui'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'B1', 'B2', 'C1']

/** Birinchi kirish: tabrik → joylashtirish testi → natija → yo'l xaritasi */
export default function Onboarding() {
  const { user, refresh } = useAuth()
  const [step, setStep] = useState('welcome')
  const [questions, setQuestions] = useState(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [writing, setWriting] = useState('')
  const [speaking, setSpeaking] = useState('')
  const [result, setResult] = useState(null)
  const [goal, setGoal] = useState({ target_level: 'B2', duration: '3 oy', hours_per_day: 1, weak_skills: '', method: 'self' })
  const [roadmap, setRoadmap] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user || user.onboarding_done) return
    api('/placement/questions').then(setQuestions).catch(setError)
  }, [user])

  if (!user || user.onboarding_done) return null

  const finish = async () => {
    setBusy(true)
    await api('/auth/onboarding', { method: 'POST', body: { done: true } })
    await api('/goal', { method: 'POST', body: goal })
    await refresh?.()
    setBusy(false)
  }

  const submitTest = async () => {
    setBusy(true); setError(null)
    try {
      setResult(await api('/placement/submit', {
        method: 'POST',
        body: { answers, details: { writing, speaking } },
      }))
      setStep('results')
    } catch (e) { setError(e) } finally { setBusy(false) }
  }

  const buildRoadmap = async () => {
    setBusy(true)
    try {
      // Avval maqsadni saqlaymiz — aks holda roadmap ready:false qaytaradi
      await api('/goal', { method: 'POST', body: goal })
      setRoadmap(await api('/roadmap'))
      setStep('roadmap')
    } catch (e) { setError(e) } finally { setBusy(false) }
  }

  const q = questions?.[index]
  const pct = questions?.length ? Math.round(index / questions.length * 100) : 0

  return (
    <div className="onboard-overlay" role="dialog" aria-modal="true">
      <Paper variant="grid" className="onboard-card">
        {error && <p className="card border-l-4 border-bad">⚠️ {error.message}</p>}

        {step === 'welcome' && (
          <>
            <div className="confetti" aria-hidden>{['🎉', '✨', '🎊', '⭐', '🌈'].map((c, i) => <span key={i} style={{ '--i': i }}>{c}</span>)}</div>
            <div className="text-center">
              <div className="text-6xl mb-md">🎉</div>
              <Heading as="h1">Congratulations!</Heading>
              <p className="text-lg secondary">
                Welcome to your personal English learning center, <mark>{user.name.split(' ')[0]}</mark>!
              </p>
              <p className="secondary">
                Your English journey starts today. Let's discover your current level and build your learning roadmap.
              </p>
              <button className="btn btn-yellow btn-lg mt-md" onClick={() => setStep('test')}>Boshlaymiz →</button>
            </div>
          </>
        )}

        {step === 'test' && (
          <>
            <div className="flex items-center justify-between gap-sm mb-md flex-wrap">
              <Heading as="h2" className="mb-0">Let's Discover Your English Level</Heading>
              <span className="font-mono">{index + 1} / {questions?.length || 0}</span>
            </div>
            <p className="secondary text-sm m-0 mb-2">Savollar haqiqiy dars va testlardan olingan. Bu o'quv diagnostikasi, rasmiy sertifikat emas.</p>
            <div className="progress-track mb-md"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
            {!questions ? <Loader /> : index < questions.length ? (
              <>
                <div className="card">
                  <span className="tag tag-blue">{q.skill}</span>
                  <h3 className="mt-2 mb-3">{q.prompt}</h3>
                  <div className="grid gap-1">
                    {(q.options || []).map((o) => (
                      <button key={o} className={`option !w-auto !justify-start text-left ${answers[q.id] === o ? 'selected' : ''}`}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))}>{o}</button>
                    ))}
                  </div>
                </div>
                {index === questions.length - 1 && (
                  <div className="card mt-md">
                    <b>Writing (alohida baholanadi)</b>
                    <textarea className="input min-h-[80px] mt-1" placeholder="Short answer about yourself…" value={writing} onChange={(e) => setWriting(e.target.value)} />
                    <b className="block mt-2">Speaking (alohida baholanadi)</b>
                    <input className="input mt-1" placeholder="Describe your hometown in one sentence…" value={speaking} onChange={(e) => setSpeaking(e.target.value)} />
                  </div>
                )}
                <div className="flex justify-between gap-sm mt-md">
                  <button className="btn" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>← Oldingi</button>
                  {index < questions.length - 1
                    ? <button className="btn btn-yellow" disabled={!answers[q.id]} onClick={() => setIndex((i) => i + 1)}>Keyingi →</button>
                    : <button className="btn btn-yellow" disabled={busy || !Object.keys(answers).length} onClick={submitTest}>Tugatish va natija ✓</button>}
                </div>
              </>
            ) : null}
          </>
        )}

        {step === 'results' && result && (
          <>
            <div className="text-center">
              <div className="text-5xl mb-md">🎓</div>
              <Heading as="h1">Your estimated English level is {result.estimated_level}!</Heading>
              <p className="secondary">Great work! You have completed your first English assessment.</p>
              <p className="tertiary text-sm">Bu taxminiy o'quv bahosi — rasmiy CEFR sertifikati emas.</p>
            </div>
            <div className="grid grid-cols-3 gap-sm my-md">
              {Object.entries(result.scores).map(([k, v]) => <Stat key={k} label={k} value={`${v}%`} />)}
            </div>
            <div className="card">
              <b>Kuchli tomonlar</b>
              <p className="secondary m-0">{Object.entries(result.scores).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}</p>
              <b className="block mt-2">Yaxshilash kerak</b>
              <p className="secondary m-0">{Object.entries(result.scores).sort((a, b) => a[1] - b[1])[0]?.[0] || '—'}</p>
            </div>
            <button className="btn btn-yellow btn-lg mt-md w-full" onClick={buildRoadmap} disabled={busy}>Build My Learning Roadmap →</button>
          </>
        )}

        {step === 'roadmap' && (
          <>
            <Heading as="h1">My Learning Roadmap 🗺️</Heading>
            <p className="secondary">Current: <b>{roadmap?.current}</b> → Target: <b>{goal.target_level}</b> · {goal.duration}</p>
            <div className="grid gap-2 sm:grid-cols-2 mb-md">
              <select className="input" value={goal.target_level} onChange={(e) => setGoal({ ...goal, target_level: e.target.value })}>
                {['B1', 'B2', 'C1'].map((l) => <option key={l}>{l}</option>)}
              </select>
              <select className="input" value={goal.duration} onChange={(e) => setGoal({ ...goal, duration: e.target.value })}>
                {['1 oy', '2 oy', '3 oy', '6 oy', '9 oy', '12 oy'].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              {!roadmap?.ready ? (
                <p className="card tertiary">{roadmap?.message || 'Yo‘l xaritasi tayyorlanmoqda…'}</p>
              ) : (roadmap.months || []).map((m) => (
                <div key={m.month} className="card">
                  <b>Oy {m.month} — {m.phase}</b>
                  <ul className="secondary text-sm m-0 mt-1 pl-5">{(m.tasks || []).map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg mt-md w-full" onClick={finish} disabled={busy}>
              {busy ? 'Saqlanmoqda…' : 'Mening dashboardimga o\'tish →'}
            </button>
          </>
        )}
      </Paper>
    </div>
  )
}
