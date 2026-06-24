'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'hinchada' | 'negro' | 'noche'

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
}

const Ctx = createContext<ThemeCtx>({ theme: 'hinchada', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('hinchada')

  useEffect(() => {
    const saved = (localStorage.getItem('prode_theme') as Theme) || 'hinchada'
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('prode_theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
