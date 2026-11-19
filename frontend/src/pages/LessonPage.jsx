import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { byKind } from '../lib/sections'
import { Back, ErrorBox, Heading, LevelTag, Loader, Paper } from '../components/ui'
import Speaking from './lessons/Speaking'
import Writing from './lessons/Writing'
import Book from './lessons/Book'

/* ---------- Mini quiz (grammatika va hikoyalar uchun) ---------- */
function Quiz({ items }) {
  const [picked, setPicked] = useState({})
  const [checked, setChecked] = useState(false)
  if (!items?.length) return null
  const score = items.filter((q, i) => picked[i] === q.answer).length
  return (
    <div>
      {items.map((q, i) => (
        <div key={i} className="mb-md">
          <p className="m-0 mb-1"><span className="font-mono tertiary">{i + 1}.</span> {q.prompt}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o) => {
              let cls = picked[i] === o ? 'selected' : ''
              if (checked) cls = o === q.answer ? 'good' : picked[i] === o ? 'bad' : ''
              return (
                <button key={o} className={`option !w-auto ${cls}`} disabled={checked} onClick={() => setPicked((p) => ({ ...p, [i]: o }))}>
                  {o}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {checked ? (
        <div className="flex items-center gap-sm">
          <span className="font-display text-3xl">{score}/{items.length}</span>
          <button className="btn" onClick={() => { setPicked({}); setChecked(false) }}>Qayta</button>
        </div>
      ) : (
        <button className="btn btn-yellow" onClick={() => setChecked(true)} disabled={Object.keys(picked).length === 0}>Tekshirish ✓</button>
      )}
    </div>
  )
}

/* ---------- Lug'at: flash-kartalar ---------- */
function Vocab({ data }) {
  const [flipped, setFlipped] = useState({})
  const [hide, setHide] = useState(true)
  return (
    <>
      <div className="flex gap-sm mb-md flex-wrap items-center">
        <button className="btn" onClick={() => setHide((h) => !h)}>{hide ? 'Tarjimalarni ko\'rsatish' : 'Tarjimalarni yashirish'}</button>
        <span className="tertiary">Kartani bosing — tarjimasi ochiladi.</span>
      </div>
      <div className="grid gap-sm sm:grid-cols-2">
        {data.words.map((w, i) => {
          const open = !hide || flipped[i]
          return (
            <button key={i} className="card hoverable text-left border-0 cursor-pointer font-[inherit] text-[inherit]" onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}>
              <span className="font-display text-2xl block">{w.word}</span>
              <span className={`block ${open ? '' : 'blur-sm select-none'}`}><mark>{w.meaning}</mark></span>
              {w.example && <span className="block tertiary text-base mt-1 italic">“{w.example}”</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

function Grammar({ data }) {
  return (
    <>
      <div className="paper-sheet p-md pl-14 md:pl-20 border-2 border-bg-tertiary mb-md leading-8 whitespace-pre-line">{data.rule}</div>
      {data.examples?.length > 0 && (
        <>
          <h3 className="mb-1">Misollar</h3>
          <ul className="mt-0 mb-md pl-5">{data.examples.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </>
      )}
      <h3 className="mb-sm">Mashqlar</h3>
      <Quiz items={data.exercises} />
    </>
  )
}

function Story({ data }) {
  return (
    <>
      <article className="paper-sheet p-md pl-14 md:pl-20 border-2 border-bg-tertiary mb-md leading-8 text-xl">{data.text}</article>
      {data.glossary?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-md">
          {data.glossary.map((g, i) => (
            <span key={i} className="card !py-1">{g.word} — <span className="secondary">{g.meaning}</span></span>
          ))}
        </div>
      )}
      <h3 className="mb-sm">Savollar</h3>
      <Quiz items={data.questions} />
    </>
  )
}

const VIEWS = { vocab: Vocab, grammar: Grammar, stories: Story, speaking: Speaking, writing: Writing, book: Book }

export default function LessonPage() {
  const { id } = useParams()
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLesson(null)
    api(`/lessons/${id}`).then(setLesson).catch(setError)
  }, [id])

  if (error) return <Paper className="min-h-[60vh]"><ErrorBox error={error} /></Paper>
  if (!lesson) return <Paper className="min-h-[60vh]"><Loader /></Paper>

  const section = byKind(lesson.kind)
  const View = VIEWS[lesson.kind]
  return (
    <Paper variant="grid" className="min-h-[70vh]">
      <Back to={`/bolim/${section?.slug}`}>{section?.title}</Back>
      <Heading as="h1" sub={lesson.data.summary}>
        {lesson.title} <LevelTag level={lesson.level} />
      </Heading>
      {View ? <View data={lesson.data} lesson={lesson} /> : <p>Noma'lum dars turi.</p>}
    </Paper>
  )
}
