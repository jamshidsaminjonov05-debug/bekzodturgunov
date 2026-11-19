import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { ErrorBox } from '../../components/ui'

const CRITERIA = { task: 'Topshiriq', coherence: 'Bog\'liqlik', vocabulary: 'Lug\'at', grammar: 'Grammatika' }

function Bar({ value }) {
  return (
    <div className="h-2 bg-bg-tertiary w-full">
      <div className="h-2 bg-accent-primary transition-all" style={{ width: `${Math.max(0, Math.min(10, value)) * 10}%` }} />
    </div>
  )
}

export default function Writing({ data, lesson }) {
  const { user, openLogin } = useAuth()
  const draftKey = `draft-${lesson.id}`
  const [text, setText] = useState(() => { try { return localStorage.getItem(draftKey) || '' } catch { return '' } })
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => { api('/writing/status').then(setStatus).catch(() => {}) }, [])
  useEffect(() => { try { localStorage.setItem(draftKey, text) } catch { /* ignore */ } }, [text, draftKey])

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const min = data.min_words || 50

  const check = async () => {
    if (!user) return openLogin()
    setBusy(true)
    setError(null)
    try {
      setResult(await api('/writing/check', { method: 'POST', body: { task_type: data.task_type, prompt: data.prompt, text } }))
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-md">
      <div className="card">
        <span className="tag tag-blue">Task {data.task_type}</span> <span className="tag">min {min} so'z</span>
        <p className="m-0 mt-sm text-xl">{data.prompt}</p>
        {data.tips?.length > 0 && <ul className="m-0 mt-sm pl-5 secondary">{data.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>}
      </div>

      <div>
        <textarea
          className="input min-h-[320px] resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Javobingizni shu yerga yozing…"
          spellCheck={false}
        />
        <div className="flex items-center justify-between flex-wrap gap-sm mt-sm">
          <span className={`font-mono ${words < min ? 'tertiary' : 'text-good'}`}>{words} / {min} so'z</span>
          <span className="flex items-center gap-sm">
            {status && (
              <span className="tertiary text-sm" title={status.model}>
                {status.online && status.available ? '🟢' : '🔴'} AI: {status.model}
              </span>
            )}
            <button className="btn btn-yellow" onClick={check} disabled={busy || words < 10}>
              {busy ? 'AI tekshirmoqda… (≈30–90 s)' : 'AI bilan tekshirish ✨'}
            </button>
          </span>
        </div>
        {status && !status.online && <p className="tertiary text-sm m-0 mt-1">Ollama ishga tushmagan: terminalda <code className="font-mono">ollama serve</code> buyrug'ini bering.</p>}
      </div>

      <ErrorBox error={error} />

      {result && (
        <div className="grid gap-md pop">
          <div className="card flex items-center gap-md flex-wrap">
            <span className="font-display text-6xl">{result.level ?? '—'}</span>
            <span className="flex-1 min-w-[200px]">
              <span className="font-mono">{result.score ?? '?'}/100</span>
              <p className="m-0">{result.summary}</p>
            </span>
          </div>

          {result.criteria && (
            <div className="grid gap-sm sm:grid-cols-2">
              {Object.entries(CRITERIA).map(([k, label]) => result.criteria[k] && (
                <div key={k} className="card">
                  <div className="flex justify-between"><b>{label}</b><span className="font-mono">{result.criteria[k].score}/10</span></div>
                  <Bar value={result.criteria[k].score} />
                  <p className="m-0 mt-1 secondary text-base">{result.criteria[k].comment}</p>
                </div>
              ))}
            </div>
          )}

          {result.mistakes?.length > 0 && (
            <div className="card">
              <h3 className="mb-sm">Xatolar</h3>
              <ul className="m-0 pl-0 list-none grid gap-sm">
                {result.mistakes.map((m, i) => (
                  <li key={i}>
                    <s className="text-bad">{m.original}</s> → <mark>{m.correction}</mark>
                    <div className="tertiary text-base">{m.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.improved && (
            <details className="paper-sheet p-md pl-14 md:pl-20 border-2 border-bg-tertiary leading-8">
              <summary className="cursor-pointer font-display text-2xl">C1 darajadagi namuna varianti</summary>
              <p className="whitespace-pre-line m-0 mt-sm">{result.improved}</p>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
