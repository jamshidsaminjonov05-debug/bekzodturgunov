import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { byKind } from '../lib/sections'
import { Back, ErrorBox, Heading, LevelTag, Loader, Paper } from '../components/ui'
import { Unit } from './lessons/Book'

/** Bitta pasaj — alohida sahifa. Pasajlar ro'yxati bitta icon ortidadagi modalda. */
export default function BookUnitPage() {
  const { id, unit } = useParams()
  const [searchParams] = useSearchParams()
  const series = searchParams.get('series')
  const backTo = `/bolim/kitoblar${series ? `?series=${series}` : ''}`
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    setLesson(null)
    setError(null)
    api(`/lessons/${id}`).then(setLesson).catch(setError)
  }, [id])

  useEffect(() => {
    if (!pickerOpen) return
    const onKey = (e) => e.key === 'Escape' && setPickerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickerOpen])

  if (error) return <Paper className="min-h-[60vh]"><ErrorBox error={error} /></Paper>
  if (!lesson) return <Paper className="min-h-[60vh]"><Loader /></Paper>

  const section = byKind(lesson.kind)
  const units = lesson.data?.units || []
  const idx = Math.max(0, Math.min(units.length - 1, Number(unit) || 0))
  const unitUrl = (i) => `/kitob/${id}/${i}${series ? `?series=${series}` : ''}`

  if (!units.length) {
    return (
      <Paper variant="grid" className="min-h-[70vh]">
        <Back to="/bolim/kitoblar">Kitoblar</Back>
        <Heading as="h1">{lesson.title}</Heading>
        <p className="card tertiary">Bu kitob eski formatda. <Link to={`/dars/${id}`}>Bu yerda oching →</Link></p>
      </Paper>
    )
  }

  return (
    <Paper variant="grid" className="min-h-[70vh]">
      <Back to={backTo}>Kitoblar ro'yxati</Back>

      <div className="flex items-start justify-between gap-sm flex-wrap mb-md">
        <Heading as="h1" className="mb-0">
          <span aria-hidden>{lesson.data?.cover || '📗'}</span> {lesson.title} <LevelTag level={lesson.level} />
        </Heading>
        {/* Bitta icon — bosilganda pasajlar modalda ochiladi */}
        <button type="button" className="btn !py-0.5 shrink-0" onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog" title="Pasajlarni tanlash">
          <span className="text-xl mr-1" aria-hidden>📑</span> Pasajlar ro'yxati
        </button>
      </div>

      <Unit key={idx} unit={units[idx]} index={idx} lessonId={lesson.id} />

      {/* Oldi / orqaga faqat pasaj oxirida */}
      <div className="flex items-center justify-between gap-sm mt-lg flex-wrap">
        {idx > 0
          ? <Link to={unitUrl(idx - 1)} className="btn">← Oldingi ({idx})</Link>
          : <span />}
        <span className="tertiary font-display">{idx + 1} / {units.length}</span>
        {idx < units.length - 1
          ? <Link to={unitUrl(idx + 1)} className="btn btn-yellow">Keyingi ({idx + 2}) →</Link>
          : <span />}
      </div>

      <p className="tertiary text-sm mt-lg">
        <Link to={`/bolim/${section?.slug}`} className="secondary no-underline hover:underline">
          ← Kitoblar bo'limiga qaytish
        </Link>
      </p>

      {pickerOpen && (
        <div className="picker-backdrop" onMouseDown={() => setPickerOpen(false)}>
          <div className="picker-modal" role="dialog" aria-modal="true" aria-labelledby="picker-title"
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-sm mb-2">
              <div>
                <h2 id="picker-title" className="m-0 font-display text-2xl">📑 Pasajlar ro'yxati</h2>
                <p className="secondary text-sm m-0">Kerakli pasajni tanlang — {units.length} ta.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setPickerOpen(false)} aria-label="Yopish">×</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 mt-md">
              {units.map((u, i) => (
                <Link key={i} to={unitUrl(i)} onClick={() => setPickerOpen(false)}
                  className={`card flex items-center gap-sm ${i === idx ? 'selected' : ''}`}
                  aria-current={i === idx ? 'page' : undefined}>
                  <span className="font-display text-xl w-8 text-center shrink-0">{i + 1}</span>
                  <span className="flex-1 min-w-0 truncate">{u.title?.replace(/^\d+\.\s*/, '') || `Pasaj ${i + 1}`}</span>
                  {i === idx && <span className="tag tag-blue">hozir</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </Paper>
  )
}
