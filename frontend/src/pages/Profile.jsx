import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { byKind } from '../lib/sections'
import { ErrorBox, Heading, Loader, Paper, Stat } from '../components/ui'

const fmt = (iso) => { const d = new Date(iso); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}` }

export default function Profile() {
  const { user, ready, openLogin } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) api('/auth/history').then(setData).catch(setError)
  }, [user])

  if (!ready) return <Paper className="min-h-[60vh]"><Loader /></Paper>
  if (!user) {
    return (
      <Paper variant="lined" className="min-h-[60vh]">
        <h1>Profil</h1>
        <p className="secondary">Natijalaringizni ko'rish uchun kiring.</p>
        <button className="btn btn-yellow" onClick={openLogin}>Kirish</button>
      </Paper>
    )
  }

  const avg = data?.attempts.length
    ? Math.round((data.attempts.reduce((s, a) => s + a.score / a.total, 0) / data.attempts.length) * 100)
    : 0

  return (
    <>
      <Paper variant="grid">
        <h1>Salom, <mark>{user.name}</mark>!</h1>
        {data && (
          <div className="grid grid-cols-3 gap-sm mt-md">
            <Stat label="Testlar" value={data.attempts.length} />
            <Stat label="O'rtacha" value={`${avg}%`} />
            <Stat label="Writing" value={data.writings.length} />
          </div>
        )}
      </Paper>
      <Paper variant="lined" className="min-h-[40vh]">
        <ErrorBox error={error} />
        {!data && !error && <Loader />}
        {data && (
          <div className="grid gap-lg md:grid-cols-2">
            <div>
              <Heading>Test natijalari</Heading>
              {data.attempts.length === 0 && <p className="tertiary">Hali test ishlamadingiz. <Link to="/#bolimlar">Boshlash →</Link></p>}
              <div className="grid gap-2">
                {data.attempts.map((a) => (
                  <Link key={a.id} to={`/test/${a.test_id}`} className="card flex items-center gap-sm">
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{a.title}</span>
                      <span className="tertiary text-sm">{byKind(a.kind)?.title} · {fmt(a.created_at)}</span>
                    </span>
                    <span className="font-mono">{a.score}/{a.total}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Heading>Writing tekshiruvlari</Heading>
              {data.writings.length === 0 && <p className="tertiary">Hali writing yubormadingiz.</p>}
              <div className="grid gap-2">
                {data.writings.map((w) => (
                  <div key={w.id} className="card flex items-center gap-sm">
                    <span className="flex-1">Task {w.task_type} <span className="tertiary text-sm">· {fmt(w.created_at)}</span></span>
                    <span className="tag tag-blue">{w.level ?? '—'}</span>
                    <span className="font-mono">{w.score ?? '?'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Paper>
    </>
  )
}
