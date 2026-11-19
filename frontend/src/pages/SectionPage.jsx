import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { bySlug } from '../lib/sections'
import { Back, ErrorBox, Heading, LevelTag, Loader, Paper } from '../components/ui'
import NotFound from './NotFound'

export default function SectionPage() {
  const { slug } = useParams()
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
      {items?.length === 0 && <p className="card tertiary">Bu bo'limga hali material qo'shilmagan.</p>}
      <div className="grid gap-sm md:grid-cols-2">
        {items?.map((it) => (
          <Link key={it.id} to={section.type === 'test' ? `/test/${it.id}` : `/dars/${it.id}`} className="card">
            <div className="flex items-center gap-2 mb-1">
              <LevelTag level={it.level} />
              {section.type === 'test' && (
                <span className="tag">{it.questions} savol · {it.minutes} daq</span>
              )}
            </div>
            <h3>{it.title}</h3>
            <p className="secondary m-0">
              {it.summary || (section.type === 'test' ? `${it.parts} qism` : '')} <span className="card-arrow">→</span>
            </p>
          </Link>
        ))}
      </div>
    </Paper>
  )
}
