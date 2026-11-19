import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { byKind } from '../lib/sections'
import { Back, ErrorBox, LevelTag, Loader, Paper } from '../components/ui'

function useTimer(seconds, running) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => setLeft(seconds), [seconds])
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => clearInterval(t)
  }, [running])
  return left
}

function ListenBox({ part, revealed }) {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const speak = () => {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const u = new SpeechSynthesisUtterance(part.transcript)
    u.lang = 'en-GB'
    u.rate = 0.95
    u.onend = () => setSpeaking(false)
    synth.cancel()
    synth.speak(u)
    setSpeaking(true)
  }

  return (
    <div className="card mb-md">
      {part.audio_url ? (
        <audio controls src={part.audio_url} className="w-full" />
      ) : (
        <button className="btn btn-primary" onClick={speak} disabled={!part.transcript}>
          {speaking ? '■ To\'xtatish' : '▶ Tinglash'}
        </button>
      )}
      {revealed && part.transcript && (
        <details className="mt-sm">
          <summary className="cursor-pointer secondary">Transkript</summary>
          <p className="m-0 mt-1">{part.transcript}</p>
        </details>
      )}
    </div>
  )
}

function Question({ q, n, value, onChange, result }) {
  const state = (opt) => {
    if (!result) return value === opt ? 'selected' : ''
    if (String(opt).toLowerCase() === String(result.answer).toLowerCase()) return 'good'
    if (value === opt) return 'bad'
    return ''
  }
  return (
    <div className="mb-md" id={`q-${q.id}`}>
      <p className="m-0 mb-1">
        <span className="font-mono tertiary mr-1">{n}.</span> {q.prompt}
        {result && <span className="ml-2">{result.correct ? '✅' : '❌'}</span>}
      </p>
      {q.options ? (
        <div className={q.type === 'tf' ? 'flex flex-wrap gap-2' : 'grid gap-2'}>
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={!!result}
              className={`option ${q.type === 'tf' ? '!w-auto' : ''} ${state(opt)}`}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <input
          className="input max-w-xs"
          value={value ?? ''}
          disabled={!!result}
          onChange={(e) => onChange(e.target.value)}
          placeholder="javob…"
          autoComplete="off"
        />
      )}
      {result && !result.correct && (
        <p className="m-0 mt-1 text-good">To'g'ri javob: <b>{result.answer}</b></p>
      )}
      {result?.explanation && <p className="m-0 mt-1 tertiary">💡 {result.explanation}</p>}
    </div>
  )
}

export default function TestRunner() {
  const { id } = useParams()
  const { user, openLogin } = useAuth()
  const [test, setTest] = useState(null)
  const [error, setError] = useState(null)
  const [partIdx, setPartIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const topRef = useRef(null)

  useEffect(() => {
    api(`/tests/${id}`).then(setTest).catch(setError)
  }, [id])

  const left = useTimer((test?.minutes ?? 0) * 60, !!test && !result)
  const byId = useMemo(() => Object.fromEntries((result?.results ?? []).map((r) => [r.id, r])), [result])

  const submit = async () => {
    setBusy(true)
    try {
      const r = await api(`/tests/${id}/submit`, { method: 'POST', body: { answers } })
      setResult(r)
      setPartIdx(0)
      topRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (test && left === 0 && !result && !busy) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  if (error && !test) return <Paper className="min-h-[60vh]"><ErrorBox error={error} /></Paper>
  if (!test) return <Paper className="min-h-[60vh]"><Loader /></Paper>

  const parts = test.data.parts
  const part = parts[partIdx]
  const isListening = test.kind.includes('listening')
  const section = byKind(test.kind)
  let offset = 0
  for (let i = 0; i < partIdx; i++) offset += parts[i].questions.length
  const answered = Object.values(answers).filter((v) => v !== '' && v != null).length
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <>
      <div ref={topRef} />
      <div className="sticky top-0 z-30 px-md">
        <div className="max-w-4xl mx-auto flex items-center gap-sm flex-wrap bg-bg-secondary px-3 py-1.5">
          <span className="font-display text-xl truncate flex-1 min-w-0">{test.title}</span>
          {!result ? (
            <>
              <span className="tag">{answered}/{test.questions}</span>
              <span className={`font-mono ${left < 60 ? 'text-bad' : ''}`}>⏱ {mm}:{ss}</span>
            </>
          ) : (
            <span className="tag tag-yellow">Natija: {result.score}/{result.total}</span>
          )}
        </div>
      </div>

      <Paper variant="grid" className="min-h-[70vh]">
        <Back to={`/bolim/${section?.slug ?? ''}`}>{section?.title ?? 'Orqaga'}</Back>

        {result && (
          <div className="card pop mb-md flex items-center gap-md flex-wrap">
            <span className="font-display text-5xl">{result.score}/{result.total}</span>
            <span className="flex-1">
              <mark>{Math.round((result.score / result.total) * 100)}%</mark> to'g'ri.{' '}
              {result.saved ? 'Natija profilingizga saqlandi.' : (
                <>Natijani saqlash uchun <button className="underline bg-transparent border-0 p-0 font-[inherit] text-[inherit] cursor-pointer" onClick={openLogin}>kiring</button>.</>
              )}
            </span>
            <button className="btn" onClick={() => { setResult(null); setAnswers({}); setPartIdx(0) }}>Qayta ishlash</button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap items-center mb-md">
          {parts.map((p, i) => (
            <button key={i} className={`btn !py-0.5 ${i === partIdx ? 'btn-primary' : ''}`} onClick={() => setPartIdx(i)}>
              {i + 1}-qism
            </button>
          ))}
          <LevelTag level={test.level} />
        </div>

        <h2 className="mb-1">{part.title}</h2>
        <p className="secondary mt-0">{part.instructions}</p>

        <div className={part.passage ? 'grid gap-md md:grid-cols-2 items-start' : ''}>
          {part.passage && (
            <article className="paper-sheet p-md pl-14 md:pl-20 leading-8 border-2 border-bg-tertiary whitespace-pre-line md:sticky md:top-16">
              {part.passage}
            </article>
          )}
          <div>
            {isListening && <ListenBox key={partIdx} part={part} revealed={!!result} />}
            {part.questions.map((q, i) => (
              <Question
                key={q.id}
                q={q}
                n={offset + i + 1}
                value={answers[q.id]}
                result={byId[q.id]}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              />
            ))}
          </div>
        </div>

        <ErrorBox error={error} />
        <div className="flex gap-sm justify-between mt-md flex-wrap">
          <button className="btn" disabled={partIdx === 0} onClick={() => setPartIdx(partIdx - 1)}>← Oldingi</button>
          {partIdx < parts.length - 1 ? (
            <button className="btn" onClick={() => setPartIdx(partIdx + 1)}>Keyingi →</button>
          ) : !result ? (
            <button className="btn btn-yellow" onClick={submit} disabled={busy}>
              {busy ? 'Tekshirilmoqda…' : 'Yakunlash ✓'}
            </button>
          ) : null}
        </div>
        {!user && !result && <p className="tertiary text-sm mt-sm">Kirmasdan ham ishlash mumkin, lekin natija saqlanmaydi.</p>}
      </Paper>
    </>
  )
}
