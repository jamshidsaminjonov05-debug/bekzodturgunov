import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { bySlug } from '../lib/sections'
import { BOOK_CATALOG } from '../lib/bookCatalog'
import { Back, ErrorBox, Heading, LevelTag, Loader, Paper } from '../components/ui'
import NotFound from './NotFound'

/** Bo'limga tegishli kitoblar (katalog) */
function BookStrip({ books }) {
  if (!books?.length) return null
  return (
    <div className="mb-lg">
      <Heading as="h2">Kitoblar 📚</Heading>
      <div className="grid gap-sm sm:grid-cols-2 md:grid-cols-3">
        {books.map((b) => (
          <Link key={b.id} to={`/kitob-katalog/${b.id}`} className="card flex gap-sm items-start">
            <img src={b.cover} alt={b.title} className="w-[64px] h-[90px] object-cover border-2 border-fg-primary shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block font-display text-lg leading-tight">{b.title}</span>
              <span className="block tertiary text-sm mt-1">{b.level}</span>
              <span className="block tertiary text-sm mt-1 line-clamp-2">{b.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

const SERIES = [
  { key: 'els1', icon: '📕', label: 'ELS Book 1' },
  { key: 'intermediate', icon: '📗', label: 'ELS Intermediate' },
  { key: 'upper', icon: '📘', label: 'ELS Upper-Intermediate' },
  { key: 'advanced', icon: '📙', label: 'ELS Advanced' },
]

/** Muqovali kitob card'i: ochish va mavzularni modaldan tanlash */
function BookCard({ book, series }) {
  const [open, setOpen] = useState(false)
  const q = series ? `?series=${series}` : ''
  const units = book.units || []
  const cover = book.image || '/books/els.jpg' // barcha kitoblarda ELS muqovasi
  const url = (i) => `/kitob/${book.id}/${i}${q}`

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="card book-card flex flex-col h-full">
      <div className="flex gap-md items-start">
        <Link to={url(0)} className="book-cover shrink-0" aria-label={`${book.title} kitobini ochish`}>
          <img src={cover} alt={book.title} onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling?.style?.setProperty('display', 'flex')
          }} />
          <span className="book-cover-fallback" style={{ display: 'none' }}>{book.cover || '📘'}</span>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <LevelTag level={book.level} />
            {units.length > 0 && <span className="tag">{units.length} pasaj</span>}
          </div>
          <h3 className="mt-0 mb-1">{book.title}</h3>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mt-auto pt-md">
        <Link to={url(0)} className="btn !py-0.5">📖 Kitobni ochish</Link>
        {units.length > 0 && (
          <button type="button" className="btn !py-0.5" onClick={() => setOpen(true)} aria-haspopup="dialog">
            📑 Mavzular ({units.length})
          </button>
        )}
      </div>

      {open && (
        <div className="picker-backdrop" onMouseDown={() => setOpen(false)}>
          <div className="picker-modal" role="dialog" aria-modal="true" aria-label={`${book.title} mavzulari`}
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-sm mb-2">
              <div>
                <h2 className="m-0 font-display text-2xl">📑 {book.title}</h2>
                <p className="secondary text-sm m-0">Mavzuni tanlang — {units.length} ta pasaj.</p>
              </div>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Yopish">×</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 mt-md">
              {units.map((u, i) => (
                <Link key={u.index} to={url(u.index)} onClick={() => setOpen(false)} className="card flex items-center gap-sm">
                  <span className="font-display text-xl w-8 text-center shrink-0">{u.index + 1}</span>
                  <span className="flex-1 min-w-0 truncate">{u.title?.replace(/^\d+\.\s*/, '') || `Pasaj ${i + 1}`}</span>
                  <span className="card-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SectionPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const series = searchParams.get('series')
  const section = bySlug(slug)
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!section) return
    setItems(null)
    setError(null)
    const path = section.type === 'test' ? `/tests?kind=${section.kind}` : `/lessons?kind=${section.kind}`
    api(path).then(setItems).catch(setError)
  }, [section])

  if (!section) return <NotFound />

  return (
    <Paper variant="lined" className="min-h-[70vh]">
      <Back to="/#bolimlar">Bo'limlar</Back>
      <Heading as="h1" sub={section.sub}>
        <span aria-hidden>{section.icon}</span> {section.title}
      </Heading>
      <ErrorBox error={error} />
      {!items && !error && <Loader />}

      {/* Har bir bo'lim uchun alohida kitoblar katalogi */}
      <BookStrip books={BOOK_CATALOG[slug]} />

      {section.kind !== 'book' && items?.length === 0 && <p className="card tertiary">Bu bo'limga hali material qo'shilmagan.</p>}

      {section.kind === 'book' ? (
        <>
          {/* Daraja bo'yicha filtr: tanlangan daraja faqat o'z kitoblarini ko'rsatadi */}
          <div className="flex flex-wrap gap-2 mb-md">
            <button className={`btn !py-0.5 ${!series ? 'btn-primary' : ''}`} onClick={() => setSearchParams({})}>
              📚 Hammasi
            </button>
            {SERIES.map((s) => (
              <button key={s.key}
                className={`btn !py-0.5 ${series === s.key ? 'btn-primary' : ''}`}
                onClick={() => setSearchParams({ series: s.key })}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          <div className="grid gap-md md:grid-cols-2">
            {(series ? (items || []).filter((b) => b.series === series) : items)?.map((book) => (
              <BookCard key={book.id} book={book} series={series || book.series || ''} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-sm md:grid-cols-2">
          {items?.map((it) => (
            <Link key={it.id} to={section.type === 'test' ? `/test/${it.id}` : `/dars/${it.id}`} className="card">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <LevelTag level={it.level} />
                {section.type === 'test' && (
                  <span className="tag">{it.questions} savol · {it.minutes} daq</span>
                )}
              </div>
              <h3>{it.cover && <span className="mr-1" aria-hidden>{it.cover}</span>}{it.title}</h3>
              <p className="secondary m-0">
                {it.summary || (section.type === 'test' ? `${it.parts} qism` : '')} <span className="card-arrow">→</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </Paper>
  )
}
