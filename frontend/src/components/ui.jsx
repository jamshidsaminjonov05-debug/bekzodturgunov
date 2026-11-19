import { Link } from 'react-router-dom'

/** Sahifa bo'limi. Fon butun sahifada bitta (foydalanuvchi tanlaydi), shuning uchun bu yerda fon yo'q. */
// eslint-disable-next-line no-unused-vars
export function Paper({ variant, id, className = '', inner = '', children }) {
  return (
    <section id={id} className={`px-md py-lg scroll-mt-4 ${className}`}>
      <div className={`max-w-4xl mx-auto ${inner}`}>{children}</div>
    </section>
  )
}

export function Heading({ children, sub, as: H = 'h2', className = '' }) {
  return (
    <div className={`mb-md ${className}`}>
      <H>{children}</H>
      {sub && <p className="secondary m-0 mt-1">{sub}</p>}
    </div>
  )
}

export function Loader({ text = 'Yuklanmoqda…' }) {
  return <p className="tertiary animate-pulse">✏️ {text}</p>
}

export function ErrorBox({ error }) {
  if (!error) return null
  return <p className="card pop border-l-4 border-bad m-0">⚠️ {String(error.message ?? error)}</p>
}

export function Back({ to, children = 'Orqaga' }) {
  return (
    <Link to={to} className="secondary no-underline hover:underline inline-block mb-sm">
      ← {children}
    </Link>
  )
}

export function LevelTag({ level }) {
  if (!level) return null
  const cls = ['C1', 'C2'].includes(level) ? 'tag-yellow' : ['B2'].includes(level) ? 'tag-blue' : ''
  return <span className={`tag ${cls}`}>{level}</span>
}

export function Stat({ label, value }) {
  return (
    <div className="card text-center">
      <div className="font-display text-3xl">{value}</div>
      <div className="tertiary text-sm">{label}</div>
    </div>
  )
}
