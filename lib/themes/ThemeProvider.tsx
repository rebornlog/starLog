'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import { themes, getThemeById } from './themes'

const ThemeContext = createContext(null)

export function useTheme() {
  return useContext(ThemeContext) || {
    currentTheme: themes[0],
    setTheme: () => {},
    toggleDarkMode: () => {}
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(themes[0])

  useEffect(() => {
    const saved = localStorage.getItem('starlog-theme')
    const t = saved ? getThemeById(saved) : themes[0]
    setThemeState(t || themes[0])
    applyTheme(t || themes[0])
  }, [])

  const applyTheme = (t) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const c = t.colors
    root.style.setProperty('--theme-primary', c.primary)
    root.style.setProperty('--theme-background', c.background)
    root.style.setProperty('--theme-text', c.text)
    root.style.setProperty('--theme-gradient', t.gradient)
    root.style.setProperty('--theme-font', t.fontFamily)
    localStorage.setItem('starlog-theme', t.id)
  }

  const setTheme = (id) => {
    const t = getThemeById(id)
    setThemeState(t)
    applyTheme(t)
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
  }

  return (
    <ThemeContext.Provider value={{ currentTheme: theme, setTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
