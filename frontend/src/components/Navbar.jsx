import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import PaperPicker from './PaperPicker'

const NAV = [
  { id: 'bolimlar', to: '/#bolimlar', label: "Bo'limlar" },
  { to: '/musobaqa', label: 'Musobaqa', live: true },
  { id: 'kurs', to: '/#kurs', label: 'Kurs' },
  { id: 'natijalar', to: '/#natijalar', label: 'Natijalar' },
]
const SECTION_PATHS = ['/bolim', '/test', '/dars']

/* Bir xil uslubdagi ingichka chiziqli ikonkalar */
const Icon = {
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
}
export function Svg({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {Icon[name]}
    </svg>
  )
}

export function Avatar({ size = 40 }) {
  const [broken, setBroken] = useState(false)
  if (broken) {
    return (
      <span className="rounded-full bg-accent-secondary text-[#333] font-display flex items-center justify-center shrink-0" style={{ width: size, height: size, fontSize: size * 0.45 }}>
        BT
      </span>
    )
  }
  return (
    <img src="/avatar.jpg" alt="" width={size} height={size} className="rounded-full object-cover object-top shrink-0"
      style={{ width: size, height: size }} onError={() => setBroken(true)} />
  )
}

function useDismiss(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen, ref])
}

function Account({ inline = false }) {
  const { user, openLogin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(open, setOpen, ref)

  if (!user) {
    return <button className="btn btn-yellow nav-login" onClick={openLogin}>Kirish →</button>
  }
  if (inline) {
    // mobil menyuda: ochiladigan menyusiz, oddiy havolalar
    return (
      <div className="flex flex-col border-t border-bg-tertiary mt-1 pt-1">
        <Link to="/profil" className="nav-link">Natijalarim · <span className="tertiary">{user.name}</span></Link>
        {user.is_admin && <Link to="/admin" className="nav-link">Admin panel</Link>}
        <button className="nav-link text-left" onClick={logout}>Chiqish</button>
      </div>
    )
  }
  return (
    <div className="relative" ref={ref}>
      <button className="avatar-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={`Hisob: ${user.name}`} title={user.name}>
        {user.name.trim()[0]?.toUpperCase()}
      </button>
      {open && (
        <div role="menu" className="menu-pop right-0 w-52">
          <div className="px-3 py-2 tertiary text-sm truncate">{user.name}</div>
          <Link role="menuitem" to="/profil" className="menu-item" onClick={() => setOpen(false)}>Natijalarim</Link>
          {user.is_admin && <Link role="menuitem" to="/admin" className="menu-item" onClick={() => setOpen(false)}>Admin panel</Link>}
          <button role="menuitem" className="menu-item tertiary" onClick={() => { setOpen(false); logout() }}>Chiqish</button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [theme, toggleTheme] = useTheme()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const [spy, setSpy] = useState(null)
  const [live, setLive] = useState(false)
  const ref = useRef(null)
  useDismiss(open, setOpen, ref)

  useEffect(() => {
    const on = () => {
      if (window.scrollY < 200) setSpy(null)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (loc.pathname !== '/') { setSpy(null); return }
    const els = NAV.filter((n) => n.id).map((n) => document.getElementById(n.id)).filter(Boolean)
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSpy(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [loc.pathname])

  useEffect(() => {
    const check = () => api('/contest').then((c) => setLive(c.phase === 'open' || c.phase === 'running')).catch(() => {})
    check()
    const t = setInterval(check, 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => setOpen(false), [loc.pathname, loc.hash])

  const isActive = (n) =>
    n.id
      ? (loc.pathname === '/' && spy === n.id) || (n.id === 'bolimlar' && SECTION_PATHS.some((p) => loc.pathname.startsWith(p)))
      : loc.pathname.startsWith(n.to)

  const links = NAV.map((n) => (
    <Link key={n.to} to={n.to} className={`nav-link ${isActive(n) ? 'is-active' : ''}`} aria-current={isActive(n) ? 'page' : undefined}>
      {n.label}
      {n.live && live && <span className="live-dot !w-1.5 !h-1.5 ml-1 align-middle" aria-label="jonli" />}
    </Link>
  ))

  return (
    <>
      <a href="#main" className="skip-link">Asosiy kontentga o'tish</a>
      <header ref={ref} className="site-header">
        <div className="max-w-4xl mx-auto px-md h-20 flex items-center gap-1">
          <Link to="/" className="flex items-center gap-2.5 no-underline mr-auto min-w-0" aria-label="Bosh sahifa">
            <Avatar size={44} />
            <span className="font-display text-2xl sm:text-3xl truncate">Bekzod Turg'unov</span>
          </Link>

          <nav aria-label="Asosiy menyu" className="hidden md:flex items-center gap-2">{links}</nav>
          <span className="hidden md:block w-px h-7 bg-bg-tertiary mx-3" aria-hidden />

          <PaperPicker />
          <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'} title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}>
            <span className="text-xl leading-none" aria-hidden>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <div className="hidden md:block ml-3"><Account /></div>
          <button className="icon-btn md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={open} aria-controls="mobile-menu">
            <Svg name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>

        {open && (
          <nav id="mobile-menu" aria-label="Mobil menyu" className="md:hidden max-w-4xl mx-auto px-md pb-3 flex flex-col">
            {links}
            <Account inline />
          </nav>
        )}
      </header>
    </>
  )
}
