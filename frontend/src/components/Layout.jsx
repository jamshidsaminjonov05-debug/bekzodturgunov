import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { TELEGRAM } from '../lib/sections'
import LoginModal from './LoginModal'
import Onboarding from './Onboarding'
import Navbar from './Navbar'

export { Avatar } from './Navbar'

export default function Layout() {
  const loc = useLocation()

  useEffect(() => {
    if (loc.hash) {
      setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView(), 50)
    } else {
      window.scrollTo(0, 0)
    }
  }, [loc.pathname, loc.hash])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>

      <footer className="border-t-2 border-dotted border-bg-tertiary px-md py-lg">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-sm justify-between secondary">
          <span>© {new Date().getFullYear()} Bekzod Turg'unov · Multilevel C1</span>
          <span className="flex gap-md">
            <a href={TELEGRAM} target="_blank" rel="noreferrer">Telegram</a>
            <Link to="/musobaqa">Musobaqa</Link>
            <Link to="/admin">Admin</Link>
          </span>
        </div>
      </footer>
      <LoginModal />
      <Onboarding />
    </div>
  )
}
