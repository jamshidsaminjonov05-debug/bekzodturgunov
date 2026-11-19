import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/auth'
import { Svg } from './Navbar'

export default function LoginModal() {
  const { loginOpen, closeLogin, login } = useAuth()
  const [name, setName] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (loginOpen) {
      setErr(null)
      setTimeout(() => ref.current?.focus(), 30)
    }
  }, [loginOpen])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeLogin()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeLogin])

  if (!loginOpen) return null

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      await login(name)
    } catch (e2) {
      setErr(e2)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/35 backdrop-blur-[2px]" onMouseDown={closeLogin}>
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="paper-sheet login-card pop relative w-full max-w-[28rem] pt-8 pb-6 pr-6 pl-14 sm:pl-16 border-2 border-fg-primary shadow-[6px_6px_0_var(--fg-primary)] rotate-[-0.6deg]"
      >
        <span className="tape" aria-hidden />
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Yopish"
          className="icon-btn absolute top-2 right-2"
        >
          <Svg name="close" size={20} />
        </button>

        <h2 id="login-title" className="mb-1">Kirish <span className="wave">👋</span></h2>
        <p className="secondary mt-0 mb-4 leading-8">Ismingizni yozing — natijalaringiz shu ism bilan saqlanadi.</p>

        <label htmlFor="login-name" className="block secondary text-sm mb-1">Ism va familiya</label>
        <input
          id="login-name"
          ref={ref}
          className="input login-input mb-2"
          placeholder="Masalan: Aziz Karimov"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={40}
          autoComplete="name"
          required
        />
        <p className={`m-0 mb-4 text-sm min-h-[1.5rem] ${err ? 'text-bad' : 'tertiary'}`}>
          {err ? `⚠️ ${err.message}` : 'Parol kerak emas.'}
        </p>

        <div className="flex gap-sm justify-end items-center flex-wrap">
          <button type="button" className="btn btn-ghost" onClick={closeLogin}>Bekor qilish</button>
          <button className="btn btn-primary" disabled={busy || name.trim().length < 2}>
            {busy ? 'Kirilmoqda…' : 'Kirish →'}
          </button>
        </div>
      </form>
    </div>
  )
}
