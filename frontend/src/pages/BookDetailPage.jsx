import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { BOOK_TABS, findBook } from '../lib/bookCatalog'
import { Back, ErrorBox, Heading, LevelTag, Loader, Paper } from '../components/ui'

export default function BookDetailPage() {
  const { id } = useParams()
  const book = findBook(id)
  const [tab, setTab] = useState('units')
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!book?.elsSeries) return
    api(`/lessons?kind=book`).then((list) => {
      const found = list.find((b) => b.series === book.elsSeries)
      if (found) api(`/lessons/${found.id}`).then(setLesson).catch(setError)
    }).catch(setError)
  }, [book])

  if (!book) {
    return (
      <Paper variant="grid" className="min-h-[70vh]">
        <Back to="/bolim/kitoblar">Kitoblar</Back>
        <Heading as="h1">Kitob topilmadi</Heading>
        <p className="card tertiary">Bunday kitob katalogda yo'q.</p>
      </Paper>
    )
  }

  const sectionLink = `/bolim/${book.section}`
  const units = lesson?.data?.units || []
  const first = units[0]

  const Empty = ({ icon = '📭', text }) => (
    <div className="card tertiary">
      <span className="text-3xl block mb-2" aria-hidden>{icon}</span>
      {text}
    </div>
  )

  const TabContent = () => {
    if (tab === 'units') {
      if (!units.length) return <Empty text="Bu kitob uchun unitlar hali yuklanmadi. Kontent admin panel orqali qo'shiladi." />
      return (
        <div className="grid gap-2 md:grid-cols-2">
          {units.map((u, i) => (
            <Link key={i} to={`/kitob/${lesson.id}/${i}`} className="card flex items-center gap-sm">
              <span className="font-display text-2xl w-9 text-center shrink-0">{i + 1}</span>
              <span className="flex-1 min-w-0 truncate">{u.title}</span>
              <span className="card-arrow">→</span>
            </Link>
          ))}
        </div>
      )
    }
    if (tab === 'passages') {
      if (!units.length) return <Empty text="Pasajlar hali yuklanmadi." />
      return (
        <div className="card">
          <h3 className="mt-0">{first.title}</h3>
          <article className="paper-sheet p-md leading-8 whitespace-pre-line">{first.passage}</article>
          <Link to={`/kitob/${lesson.id}/0`} className="btn btn-yellow">Mashqlarga o'tish →</Link>
        </div>
      )
    }
    if (tab === 'vocabulary') {
      if (!first?.glossary?.length) return <Empty text="Lug'at hali yuklanmadi." />
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {first.glossary.map((g, i) => (
            <div key={i} className="card">
              <b>{g.word}</b> — <mark>{g.meaning}</mark>
              <span className="block tertiary text-sm mt-1">{g.definition}</span>
            </div>
          ))}
        </div>
      )
    }
    if (tab === 'audio') {
      return <Empty icon="🎧" text="Bu kitob uchun audio materiallar hali yuklanmadi. Audio qo'shilganda shu yerda tinglash mumkin bo'ladi." />
    }
    if (tab === 'tests') {
      if (!first?.test?.length) return <Empty text="Testlar hali yuklanmadi." />
      return (
        <div className="card">
          <p className="secondary m-0 mb-2">{first.test.length} ta savol · har biriga 30 soniya</p>
          <Link to={`/kitob/${lesson.id}/0`} className="btn btn-yellow">Testni boshlash →</Link>
        </div>
      )
    }
    if (tab === 'answers') {
      if (!first?.exercises?.length) return <Empty text="Javoblar hali yuklanmadi." />
      return (
        <div className="card grid gap-1">
          {first.exercises.map((q, i) => (
            <p key={i} className="m-0"><span className="font-mono tertiary mr-2">{i + 1}.</span>{q.prompt.slice(0, 70)}… → <b>{q.answer}</b></p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Paper variant="grid" className="min-h-[70vh]">
      <Back to={sectionLink}>{book.section} bo'limi</Back>
      <div className="flex gap-md items-start flex-wrap mb-md">
        <div className="book-cover shrink-0"><img src={book.cover} alt={book.title} /></div>
        <div className="flex-1 min-w-0">
          <Heading as="h1" className="mb-1">{book.title} <LevelTag level={book.level} /></Heading>
          <p className="secondary m-0">{book.desc}</p>
          <p className="tertiary text-sm m-0 mt-1">{book.author}</p>
        </div>
      </div>

      <ErrorBox error={error} />
      {book.elsSeries && !lesson && !error && <Loader />}

      <nav aria-label="Kitob bo'limlari" className="flex flex-wrap gap-2 mb-md">
        {BOOK_TABS.map((t) => (
          <button key={t.key} type="button" className={`btn !py-0.5 ${tab === t.key ? 'btn-primary' : ''}`}
            onClick={() => setTab(t.key)} aria-pressed={tab === t.key}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <TabContent />
    </Paper>
  )
}
