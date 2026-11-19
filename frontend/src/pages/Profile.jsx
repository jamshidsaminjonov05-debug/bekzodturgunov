import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { byKind } from '../lib/sections'
import { ErrorBox, Heading, Loader, Paper, Stat } from '../components/ui'
import CertificateCard from '../components/CertificateCard'
import LevelAvatar from '../components/LevelAvatar'

const fmt = (iso) => { const d = new Date(iso); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}` }
const BOOK_CHECK = { exercises: 'Mashqlar', glossary: "So'z ma'nolari", definitions: 'Exercise 1', test: 'Vaqtli test' }

/** Kirmagan foydalanuvchi uchun profil ko'rinishi */
function GuestProfile({ openLogin }) {
  const features = [
    { icon: '🎯', title: 'Test natijalari', sub: 'Listening, Reading va General testlaringiz — ball va foiz bilan.' },
    { icon: '📘', title: 'Kitob mashqlari', sub: 'Har bir pasaj bo‘yicha so‘zlar, mashqlar va vaqtli test natijalari.' },
    { icon: '✍️', title: 'Writing tekshiruvlari', sub: 'Yuborgan ishlaringiz, AI bahosi va darajangiz.' },
    { icon: '📈', title: 'Kundalik progress', sub: 'Asosiy sahifada vazifalaringiz va oxirgi natijalaringiz.' },
  ]
  return (
    <>
      <Paper variant="grid" className="pt-lg pb-lg">
        <div className="flex gap-lg flex-col md:flex-row items-center">
          <div className="guest-avatar shrink-0" aria-hidden>📊</div>
          <div className="flex flex-col gap-sm">
            <h1 className="m-0">Sizning profilingiz <span className="wave">👋</span></h1>
            <p className="text-lg secondary m-0">
              Bu sizning <mark>shaxsiy kabinetingiz</mark> — natijalar, vazifalar va o'sish dinamikangiz shu yerda yig'iladi.
            </p>
            <p className="secondary m-0">
              Ko'rish uchun kiring: <b>ism</b> va <b>telefon raqami</b> kifoya — parol kerak emas.
            </p>
            <div className="flex flex-wrap gap-sm mt-sm">
              <button className="btn btn-yellow" onClick={openLogin}>Kirish →</button>
              <Link to="/#bolimlar" className="btn">Avval bo'limlarga qarash</Link>
            </div>
          </div>
        </div>
      </Paper>

      <Paper variant="lined">
        <Heading sub="Kirgandan keyin profilda nimalar ko'rasiz.">Profilda nima bor? ✨</Heading>
        <div className="grid gap-sm md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card flex items-start gap-sm">
              <span className="text-3xl" aria-hidden>{f.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-display text-xl">{f.title}</span>
                <span className="block tertiary text-sm mt-1">{f.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </Paper>

      <Paper variant="grid">
        <Heading sub="Natijalaringiz shu yerda ko'rinadi.">Ko'rinishi qanday bo'ladi? 👀</Heading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm mb-md">
          <Stat label="Testlar" value="—" />
          <Stat label="O'rtacha" value="—" />
          <Stat label="Writing" value="—" />
          <Stat label="Kitoblar" value="—" />
        </div>
        <div className="grid gap-sm md:grid-cols-2">
          <div className="card tertiary flex items-center gap-sm">
            <span className="text-2xl" aria-hidden>📘</span>
            <span className="flex-1">Kitob natijalari — pasaj nomi va balli</span>
            <span className="font-mono">— / —</span>
          </div>
          <div className="card tertiary flex items-center gap-sm">
            <span className="text-2xl" aria-hidden>🎯</span>
            <span className="flex-1">Test natijasi — sarlavha va foiz</span>
            <span className="font-mono">— / —</span>
          </div>
        </div>
        <p className="tertiary text-sm mt-md">
          Hali natija yo'q — bu oddiy ko'rinish namunasi. Kiring va birinchi mashqni ishlang.
        </p>
      </Paper>
    </>
  )
}

export default function Profile() {
  const { user, ready, openLogin } = useAuth()
  const [data, setData] = useState(null)
  const [levelData, setLevelData] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [certLevel, setCertLevel] = useState('B1')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      api('/auth/history').then(setData).catch(setError)
      api('/auth/level').then(setLevelData).catch(() => {})
      api('/auth/certificate').then((c) => {
        setCertificate(c)
        setCertLevel(c.level)
      }).catch(() => {})
    }
  }, [user])

  if (!ready) return <Paper className="min-h-[60vh]"><Loader /></Paper>
  if (!user) return <GuestProfile openLogin={openLogin} />

  const avg = data?.attempts.length
    ? Math.round((data.attempts.reduce((s, a) => s + a.score / a.total, 0) / data.attempts.length) * 100)
    : 0

  return (
    <>
      <Paper variant="grid">
        <h1>Salom, <mark>{user.name}</mark>!</h1>
        {user.phone && <p className="tertiary m-0 font-mono">📱 {user.phone}</p>}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm mt-md">
            <Stat label="Testlar" value={data.attempts.length} />
            <Stat label="O'rtacha" value={`${avg}%`} />
            <Stat label="Writing" value={data.writings.length} />
            <Stat label="Kitoblar" value={data.book_attempts?.length || 0} />
          </div>
        )}
      </Paper>

      <Paper variant="lined">
        <Heading sub="Ball to'plaganingizda darajalar ochiladi.">Darajalarim 🏅</Heading>
        <div className="flex gap-lg flex-col md:flex-row items-center">
          <LevelAvatar level={levelData?.current || '—'} />
          <div className="flex-1 min-w-0 w-full">
            {!levelData ? <Loader /> : (
              <>
                <p className="text-lg m-0">Hozirgi darajangiz: <mark>{levelData.current}</mark></p>
                <p className="secondary m-0 text-sm">
                  {levelData.from_test
                    ? `Aniqlash testi sizni ${levelData.from_test} darajasiga qo'ydi.`
                    : 'Aniqlash testini topshirib, boshlang\'ich darajangizni aniqlang.'}
                </p>
                <p className="secondary m-0 mt-1">Umumiy XP: <b>{levelData.xp}</b></p>
                {levelData.next && (
                  <>
                    <div className="progress-track mt-2">
                      <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(levelData.xp * 100 / levelData.next_threshold))}%` }} />
                    </div>
                    <p className="tertiary text-sm mt-1">{levelData.next} gacha {Math.max(0, levelData.next_threshold - levelData.xp)} XP</p>
                  </>
                )}
                <div className="flex flex-wrap gap-2 mt-md">
                  {levelData.levels.map((l) => (
                    <div key={l.level}
                      className={`level-badge ${l.unlocked ? 'unlocked' : 'locked'} ${l.current ? 'current' : ''}`}
                      title={l.unlocked ? `${l.level} ochilgan` : `${l.threshold} XP kerak`}>
                      <span className="block text-xl">{l.unlocked ? '🏅' : '🔒'}</span>
                      <span className="font-display">{l.level}</span>
                      {l.from_test && <span className="block text-xs">test</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Paper>

      <Paper variant="grid">
        <Heading sub="Sertifikat PDF fayllari — yuklab olish.">Sertifikat PDFs 📥</Heading>
        <div className="flex flex-wrap gap-2 mb-md">
          {['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => (
            <a key={l} href={`/sertificate/sertifikat-${l}.pdf`} target="_blank" rel="noreferrer"
              className={`btn ${certLevel === l ? 'btn-primary' : ''}`}>
              📄 Sertifikat — {l}
            </a>
          ))}
        </div>
      </Paper>

      <Paper variant="grid">
        <Heading sub="Har bir daraja uchun alohida sertifikat.">Sertifikatlarim 🏆</Heading>
        <div className="flex flex-wrap gap-2 mb-md">
          {['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => (
            <button key={l} className={`btn !py-0.5 ${certLevel === l ? 'btn-primary' : ''}`}
              onClick={() => setCertLevel(l)}>
              {certificate?.unlocked?.includes(l) ? '🏅' : '🔒'} {l}
            </button>
          ))}
        </div>
        {!certificate ? <Loader /> : (
          <CertificateCard
            name={certificate.name}
            level={certLevel}
            scores={certificate.scores}
            number={certificate.number}
            date={certificate.unlocked?.includes(certLevel) ? certificate.date : ''}
            xp={certificate.xp}
            locked={!certificate.unlocked?.includes(certLevel)}
          />
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
        {data && (
          <div className="mt-lg">
            <Heading>Kitob natijalari</Heading>
            {(data.book_attempts?.length || 0) === 0 && (
              <p className="tertiary">Hali kitob mashqi ishlamadingiz. <Link to="/bolim/kitoblar">Kitoblarga o'tish →</Link></p>
            )}
            <div className="grid gap-2 md:grid-cols-2">
              {(data.book_attempts || []).map((a) => (
                <Link key={a.id} to={`/kitob/${a.lesson_id}/${a.unit ?? 0}`} className="card flex items-center gap-sm">
                  <span className="flex-1 min-w-0">
                    <span className="block truncate">📘 {a.title}</span>
                    <span className="tertiary text-sm">{BOOK_CHECK[a.check] || 'Kitob'} · {fmt(a.created_at)}</span>
                  </span>
                  <span className="font-mono">{a.score}/{a.total}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Paper>
    </>
  )
}
