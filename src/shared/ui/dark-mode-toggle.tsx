import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './button'

const STORAGE_KEY = 'crew.theme'

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

/**
 * 헤더용 다크모드 토글. document.documentElement 의 .dark 클래스를 토글.
 * Tailwind v3의 darkMode: 'class' 와 globals.css 의 :root vs .dark 토큰
 * 양쪽 정의에 의존.
 */
export function DarkModeToggle() {
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }, [dark])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? '라이트모드로 전환' : '다크모드로 전환'}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
