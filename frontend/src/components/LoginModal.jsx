import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/auth'
import { Svg } from './Navbar'

/** Faqat 9 ta raqam saqlanadi — +998, (), bo'sh joylar faqat ko'rinish uchun */
function cleanDigits(value) {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  return digits.slice(0, 9)
}

function formatDigits(digits) {
  let out = '+998'
  if (digits.length >= 1) out += `(${digits.slice(0, 2)}`
  if (digits.length >= 2) out += ') '
  if (digits.length >= 3) out += digits.slice(2, 5)
  if (digits.length >= 5) out += ' '
  if (digits.length >= 6) out += digits.slice(5, 7)
  if (digits.length >= 7) out += ' '
  if (digits.length >= 8) out += digits.slice(7, 9)
  return out
}

/** Kursorni raqamlar soniga qarab to'g'ri joyga qaytarish */
function caretFor(text, digitCount) {
  if (digitCount <= 0) return 4
  let count = 0
  for (let i = 4; i < text.length; i++) {
    if (/\d/.test(text[i])) {
      count++
      if (count === digitCount) return i + 1
    }
  }
  return text.length
}

export default function LoginModal() {
  const { loginOpen, closeLogin, login } = useAuth()
  const [name, setName] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)
  const phoneRef = useRef(null)
  const caretRef = useRef(null)

  useLayoutEffect(() => {
    if (caretRef.current == null || !phoneRef.current) return
    const pos = caretRef.current
    phoneRef.current.setSelectionRange(pos, pos)
    caretRef.current = null
  }, [phoneDigits])

  const phoneReady = phoneDigits.length === 9
  const phoneFormatted = formatDigits(phoneDigits)

  const onPhoneChange = (e) => {
    const el = e.target
    const raw = el.value
    const caret = el.selectionStart ?? raw.length
    const before = raw.slice(0, caret).replace(/\D/g, '').replace(/^998/, '')
    const digits = cleanDigits(raw)
    caretRef.current = caretFor(formatDigits(digits), before.length)
    setPhoneDigits(digits)
  }

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
      await login(name, `+998${phoneDigits}`)
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
        <p className="secondary mt-0 mb-4 leading-8">Ism va telefon raqamingizni yozing — natijalaringiz shu ma'lumotlar bilan saqlanadi.</p>

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
        <label htmlFor="login-phone" className="block secondary text-sm mb-1">Telefon raqami <span className="text-bad">*</span></label>
        <input
          id="login-phone"
          ref={phoneRef}
          className="input login-input mb-2"
          placeholder="+998(__) ___ __ __"
          value={phoneFormatted}
          onChange={onPhoneChange}
          inputMode="tel"
          autoComplete="off"
          required
        />
        <p className={`m-0 mb-4 text-sm min-h-[1.5rem] ${err ? 'text-bad' : 'tertiary'}`}>
          {err ? `⚠️ ${err.message}` : 'Parol kerak emas — raqam faqat hisobni aniqlash uchun.'}
        </p>

        <div className="flex gap-sm justify-end items-center flex-wrap">
          <button type="button" className="btn btn-ghost" onClick={closeLogin}>Bekor qilish</button>
          <button className="btn btn-primary" disabled={busy || name.trim().length < 2 || !phoneReady}>
            {busy ? 'Kirilmoqda…' : 'Kirish →'}
          </button>
        </div>
      </form>
    </div>
  )
}
