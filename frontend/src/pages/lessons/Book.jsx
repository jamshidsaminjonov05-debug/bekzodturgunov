import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { ErrorBox, Heading } from '../../components/ui'

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '')
const fmtTime = (s) => `0:${String(Math.max(0, s)).padStart(2, '0')}`

/** Matndagi har bir so'z bosiladigan: noma'lum so'zlarni belgilash uchun */
function HighlightedPassage({ text, selected, onToggle }) {
  const parts = text.split(/(\s+)/)
  let n = -1
  return (
    <article className="paper-sheet p-md pl-14 md:pl-20 border-2 border-bg-tertiary mb-md leading-8 text-lg whitespace-pre-line">
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>
        const clean = part.replace(/[^\p{L}\p{N}'’-]/gu, '').toLowerCase()
        if (!clean) return <span key={i}>{part}</span>
        n += 1
        return (
          <button key={i} type="button" title="Bosib noma'lum so'z sifatida belgilang"
            className={`word-token ${selected.has(clean) ? 'marked' : ''}`}
            onClick={() => onToggle(clean)}>{part}</button>
        )
      })}
    </article>
  )
}

function Result({ result, label }) {
  if (!result) return null
  return (
    <div className="card mt-sm">
      <div className="flex items-center gap-sm flex-wrap">
        <span className="font-display text-2xl">{result.score}/{result.total}</span>
        <span className="tertiary">{label || (result.saved ? 'Natija profilingizga saqlandi ✓' : 'Kiring — natija saqlansin')}</span>
      </div>
    </div>
  )
}

function ResultLine({ r, i }) {
  return (
    <p className={`m-0 text-sm ${r.correct ? 'text-good' : 'text-bad'}`}>
      {r.correct ? '✓' : '✗'} {i + 1}. {r.given || '—'}
      {!r.correct && r.answer ? ` → to'g'ri: ${r.answer}` : ''}
      {r.explanation ? ` · ${r.explanation}` : ''}
    </p>
  )
}

/** Belgilangan so'zlar: ma'nosini yozib tekshirish */
function WordMeanings({ unit, selected, answers, setAnswers, result, onCheck, busy }) {
  const list = [...selected]
  const matched = (token) => (unit.glossary || []).find((g) =>
    [g.word, ...(g.forms || [])].some((f) => norm(f) === norm(token)))
  return (
    <div className="mb-lg">
      <Heading as="h3">Noma'lum so'zlarim ({list.length})</Heading>
      {list.length === 0 ? (
        <p className="tertiary m-0">Matndagi so'zlar ustiga bosing — ular yuqorida rang bilan belgilanadi va bu ro'yxatga tushadi.</p>
      ) : (
        <>
          <p className="secondary text-sm m-0 mb-2">Har bir so'zning ma'nosini yozing (yoki so'zning o'zini yozsangiz ham bo'ladi), keyin tekshiring.</p>
          <div className="grid gap-2 mb-sm">
            {list.map((token) => {
              const g = matched(token)
              const key = g ? g.word : token
              const r = result?.results.find((x) => x.id === key)
              return (
                <div key={token} className="card flex items-center gap-sm flex-wrap">
                  <span className="font-display text-lg shrink-0">{token}</span>
                  {g && <span className="tag tag-blue">{g.word}</span>}
                  <input className="input flex-1 min-w-[180px]" placeholder="ma'nosi…"
                    value={answers[key] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))} />
                  {r && <span className={r.correct ? 'text-good' : 'text-bad'}>{r.correct ? '✓' : `✗ ${r.answer}`}</span>}
                </div>
              )
            })}
          </div>
          <button className="btn btn-yellow" onClick={onCheck} disabled={busy || !list.some((t) => answers[matched(t)?.word || t])}>
            {busy ? 'Yuborilmoqda…' : "Ma'nolarni tekshirish ✓"}
          </button>
          <Result result={result} />
        </>
      )}
    </div>
  )
}

/** Exercise 1: ta'rif bo'yicha so'z yozish */
function Definitions({ unit, answers, setAnswers, result, onCheck, busy }) {
  const g = unit.glossary || []
  if (!g.length) return null
  return (
    <div className="mb-lg">
      <Heading as="h3">Exercise 1 · Ta'rif bo'yicha so'zni yozing</Heading>
      <div className="grid gap-2 mb-sm">
        {g.map((item, i) => {
          const r = result?.results.find((x) => x.id === item.word)
          return (
            <div key={item.word} className="card grid gap-1 sm:grid-cols-[1fr_220px] items-center">
              <span><span className="font-mono tertiary mr-2">{String.fromCharCode(97 + i)})</span>{item.definition}</span>
              <input className="input" placeholder="so'z…" value={answers[item.word] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [item.word]: e.target.value }))} />
              {r && <span className={`text-sm sm:col-span-2 ${r.correct ? 'text-good' : 'text-bad'}`}>
                {r.correct ? '✓' : `✗ to'g'ri: ${r.answer}`}
              </span>}
            </div>
          )
        })}
      </div>
      <button className="btn btn-yellow" onClick={onCheck} disabled={busy || !Object.keys(answers).length}>
        {busy ? 'Yuborilmoqda…' : 'Tekshirish ✓'}
      </button>
      <Result result={result} />
    </div>
  )
}

/** Exercise 2 va 3: tugma va yozma javoblar */
function Exercises({ unit, answers, setAnswers, result, onCheck, busy }) {
  const items = unit.exercises || []
  if (!items.length) return null
  const groups = [...new Set(items.map((q) => q.group || 'Mashqlar'))]
  return (
    <div className="mb-lg">
      <Heading as="h3">Mashqlar</Heading>
      {groups.map((group) => (
        <div key={group} className="mb-md">
          <h4 className="mb-2">{group}</h4>
          {items.filter((q) => (q.group || 'Mashqlar') === group).map((q) => {
            const qid = String(q.id)
            const r = result?.results.find((x) => x.id === qid)
            return (
              <div key={qid} className="mb-md">
                <p className="m-0 mb-2"><span className="font-mono tertiary mr-2">{qid.split('-').pop()}.</span>{q.prompt}</p>
                {q.type === 'mcq' ? (
                  <div className="grid gap-1">
                    {(q.options || []).map((o) => {
                      let cls = answers[qid] === o ? 'selected' : ''
                      if (result) cls = o === r?.answer ? 'good' : answers[qid] === o ? 'bad' : ''
                      return (
                        <button key={o} className={`option !w-auto !justify-start text-left ${cls}`} disabled={!!result}
                          onClick={() => setAnswers((a) => ({ ...a, [qid]: o }))}>{o}</button>
                      )
                    })}
                  </div>
                ) : (
                  <input className="input max-w-[32rem]" placeholder="javobingizni yozing…"
                    value={answers[qid] ?? ''} disabled={!!result}
                    onChange={(e) => setAnswers((a) => ({ ...a, [qid]: e.target.value }))} />
                )}
                {r && <p className={`m-0 mt-1 text-sm ${r.correct ? 'text-good' : 'text-bad'}`}>
                  {r.correct ? '✓' : `✗ to'g'ri: ${r.answer}`}
                </p>}
              </div>
            )
          })}
        </div>
      ))}
      <button className="btn btn-yellow" onClick={onCheck} disabled={busy || !Object.keys(answers).length}>
        {busy ? 'Yuborilmoqda…' : 'Tekshirish va saqlash ✓'}
      </button>
      <Result result={result} />
    </div>
  )
}

/** Vaqtli so'z testi: screenshot dagi bot holati */
function TimedTest({ questions, lessonId, unitIndex }) {
  const { user, openLogin } = useAuth()
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [index, setIndex] = useState(0)
  const [left, setLeft] = useState(30)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const answersRef = useRef({})
  const lock = useRef(false)

  const q = questions[index]
  const setAns = (next) => { answersRef.current = next; setAnswers(next) }

  const finish = async (finalAnswers) => {
    setPhase('done')
    if (!user) { openLogin(); return }
    try {
      setResult(await api(`/lessons/${lessonId}/book-submit`, {
        method: 'POST',
        body: { unit: unitIndex, check: 'test', answers: finalAnswers },
      }))
    } catch (e) { setError(e) }
  }

  useEffect(() => {
    if (phase !== 'running') return
    if (left <= 0) {
      if (lock.current) return
      lock.current = true
      const qid = String(questions[index].id)
      const next = { ...answersRef.current, [qid]: answersRef.current[qid] ?? null }
      setAns(next)
      if (index + 1 >= questions.length) finish(next)
      else { setIndex((i) => i + 1); setLeft(30); lock.current = false }
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, left, index, questions])

  if (!questions.length) return null

  if (phase === 'idle') {
    return (
      <div className="card mb-lg">
        <Heading as="h3">So'zlar bo'yicha test ⏱️</Heading>
        <p className="secondary m-0 mb-1"><b>{questions.length} ta savol</b></p>
        <p className="secondary m-0 mb-1">Har bir savol uchun <b>30 soniya</b></p>
        <p className="secondary m-0 mb-3">Vaqt tugaganda keyingi savolga o'tadi. Natija profilingizga saqlanadi.</p>
        <button className="btn btn-yellow" onClick={() => { lock.current = false; setAns({}); setPhase('running'); setIndex(0); setLeft(30) }}>
          Testni boshlash →
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="card mb-lg">
        <Heading as="h3">Test tugadi</Heading>
        <ErrorBox error={error} />
        <Result result={result} />
        {result && (
          <div className="grid gap-1 mt-sm">
            {result.results.map((r, i) => <ResultLine key={r.id} r={r} i={i} />)}
          </div>
        )}
        <button className="btn mt-sm" onClick={() => { lock.current = false; setAns({}); setResult(null); setPhase('idle'); setIndex(0); setLeft(30) }}>
          Qayta ishlash
        </button>
      </div>
    )
  }

  return (
    <div className="card mb-lg">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <span className="font-display text-xl">[{index + 1}/{questions.length}]</span>
        <span className="font-mono text-lg">{fmtTime(left)}</span>
        <button className="btn !py-0" onClick={() => finish(answersRef.current)}>To'xtatish</button>
      </div>
      <p className="m-0 mb-3 text-lg">{q.prompt}</p>
      <div className="grid gap-1">
        {(q.options || []).map((o) => (
          <button key={o} className={`option !w-auto !justify-start text-left ${answers[String(q.id)] === o ? 'selected' : ''}`}
            onClick={() => setAns({ ...answersRef.current, [String(q.id)]: o })}>{o}</button>
        ))}
      </div>
      <p className="tertiary text-sm m-0 mt-3">
        {Object.keys(answers).length ? `${Object.keys(answers).length} ta javob kiritildi` : 'No answers yet'} · ends in {fmtTime(left)}
      </p>
      <button className="btn btn-yellow mt-2" onClick={() => {
        if (index + 1 >= questions.length) finish(answersRef.current)
        else { setIndex((i) => i + 1); setLeft(30) }
      }}>Keyingi savol →</button>
    </div>
  )
}

export function Unit({ unit, index, lessonId }) {
  const { user, openLogin } = useAuth()
  const [selected, setSelected] = useState(new Set())
  const [meanAnswers, setMeanAnswers] = useState({})
  const [meanResult, setMeanResult] = useState(null)
  const [defAnswers, setDefAnswers] = useState({})
  const [defResult, setDefResult] = useState(null)
  const [exAnswers, setExAnswers] = useState({})
  const [exResult, setExResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [openSections, setOpenSections] = useState(new Set())

  const SECTIONS = [
    { k: 'words', icon: '🔤', label: "So'zlar" },
    { k: 'definitions', icon: '📝', label: 'Exercise 1' },
    { k: 'exercises', icon: '✍️', label: 'Mashqlar' },
    { k: 'test', icon: '⏱️', label: 'Test' },
  ]
  const toggleSection = (k) => setOpenSections((s) => {
    const n = new Set(s)
    n.has(k) ? n.delete(k) : n.add(k)
    return n
  })

  const send = async (check, answers, setter, only) => {
    if (!user) { openLogin(); return }
    setBusy(true); setError(null)
    try {
      const body = { unit: index, check, answers }
      if (only) body.only = only
      setter(await api(`/lessons/${lessonId}/book-submit`, { method: 'POST', body }))
    } catch (e) { setError(e) } finally { setBusy(false) }
  }

  const toggle = (word) => setSelected((s) => {
    const n = new Set(s)
    n.has(word) ? n.delete(word) : n.add(word)
    return n
  })

  return (
    <section className="mb-xl">
      <Heading as="h2">{unit.title}</Heading>
      <ErrorBox error={error} />
      <p className="secondary m-0 mb-2">Matndagi noma'lum so'zlarni bosing — ular sariq rangda belgilanadi.</p>
      <HighlightedPassage text={unit.passage || ''} selected={selected} onToggle={toggle} />

      {/* Bo'limlarni yoqish tugmalari: bosilganda chiqadi */}
      <div className="flex flex-wrap gap-2 my-md">
        {SECTIONS.map((s) => (
          <button key={s.k} type="button" className={`btn !py-0.5 ${openSections.has(s.k) ? 'btn-primary' : ''}`}
            aria-pressed={openSections.has(s.k)} onClick={() => toggleSection(s.k)}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {openSections.has('words') && (
        <WordMeanings unit={unit} selected={selected} answers={meanAnswers} setAnswers={setMeanAnswers}
          result={meanResult} busy={busy}
          onCheck={() => {
            const g = (unit.glossary || [])
            const match = (t) => g.find((x) => [x.word, ...(x.forms || [])].some((f) => norm(f) === norm(t)))
            send('glossary', meanAnswers, setMeanResult, [...selected].map((t) => match(t)?.word).filter(Boolean))
          }} />
      )}
      {openSections.has('definitions') && (
        <Definitions unit={unit} answers={defAnswers} setAnswers={setDefAnswers} result={defResult} busy={busy}
          onCheck={() => send('definitions', defAnswers, setDefResult)} />
      )}
      {openSections.has('exercises') && (
        <Exercises unit={unit} answers={exAnswers} setAnswers={setExAnswers} result={exResult} busy={busy}
          onCheck={() => send('exercises', exAnswers, setExResult)} />
      )}
      {openSections.has('test') && (
        <TimedTest questions={unit.test || []} lessonId={lessonId} unitIndex={index} />
      )}
    </section>
  )
}

/** Eski formatdagi kitoblar uchun (vocab / stories / exercises) */
function LegacyBook({ data, lessonId }) {
  const { user, openLogin } = useAuth()
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const items = data.exercises || []
  return (
    <>
      {data.intro && <div className="paper-sheet p-md mb-md">{data.intro}</div>}
      {(data.vocab || []).length > 0 && (
        <>
          <Heading as="h2">Lug'at</Heading>
          <div className="grid gap-sm sm:grid-cols-2 mb-lg">
            {data.vocab.map((w, i) => (
              <div key={i} className="card"><b>{w.word}</b> — <mark>{w.meaning}</mark>
                {w.example && <span className="block tertiary mt-1 italic">{w.example}</span>}</div>
            ))}
          </div>
        </>
      )}
      {(data.stories || []).map((s, i) => (
        <div key={i} className="mb-lg">
          <Heading as="h2">{s.title || `Hikoya ${i + 1}`}</Heading>
          <article className="paper-sheet p-md leading-8 whitespace-pre-line mb-md">{s.text}</article>
        </div>
      ))}
      {items.length > 0 && (
        <>
          <Heading as="h2">Mashqlar</Heading>
          {items.map((q, i) => {
            const qid = String(q.id ?? i)
            const r = result?.results.find((x) => x.id === qid)
            return (
              <div key={qid} className="mb-md">
                <p className="m-0 mb-2">{i + 1}. {q.prompt}</p>
                {(q.options || []).length ? (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <button key={o} className={`option !w-auto ${answers[qid] === o ? 'selected' : ''}`}
                        onClick={() => setAnswers((a) => ({ ...a, [qid]: o }))}>{o}</button>
                    ))}
                  </div>
                ) : (
                  <input className="input max-w-[32rem]" value={answers[qid] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [qid]: e.target.value }))} />
                )}
                {r && <p className={`m-0 mt-1 text-sm ${r.correct ? 'text-good' : 'text-bad'}`}>{r.correct ? '✓' : `✗ ${r.answer}`}</p>}
              </div>
            )
          })}
          <button className="btn btn-yellow" onClick={async () => {
            if (!user) { openLogin(); return }
            try {
              setResult(await api(`/lessons/${lessonId}/book-submit`, {
                method: 'POST', body: { answers },
              }))
            } catch (e) { /* ignore */ }
          }}>Tekshirish ✓</button>
          <Result result={result} />
        </>
      )}
    </>
  )
}

export default function Book({ data, lesson }) {
  if (data.units?.length) {
    // Har bir pasaj alohida sahifada — to'g'ridan-to'g'ri birinchi pasajga o'tamiz
    return <Navigate to={`/kitob/${lesson.id}/0`} replace />
  }
  return <LegacyBook data={data} lessonId={lesson.id} />
}
