import { useEffect, useState } from 'react'

function systemDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

function save(key, value) {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || (systemDark() ? 'dark' : 'light'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    save('theme', theme)
  }, [theme])

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

// Sahifa foni variantlari
export const PAPERS = [
  { id: 'grid', label: 'Katak', hint: 'Matematika daftari' },
  { id: 'lined', label: "Yo'l-yo'l", hint: 'Qizil hoshiyali daftar' },
  { id: 'dots', label: 'Nuqtali', hint: 'Bullet journal' },
  { id: 'graph', label: 'Millimetrovka', hint: 'Chizmachilik qog\'ozi' },
  { id: 'plain', label: 'Toza', hint: 'Chiziqsiz, sokin' },
]

export function usePaper() {
  const [paper, setPaper] = useState(() => document.documentElement.dataset.paper || 'grid')

  useEffect(() => {
    document.documentElement.dataset.paper = paper
    save('paper', paper)
  }, [paper])

  return [paper, setPaper]
}
