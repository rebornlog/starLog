'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { themes, Theme, getThemeById } from './themes'

interface ThemeProviderContextType {
  currentTheme: Theme
  setTheme: (themeId: string) => void
  toggleDarkMode: () => void
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultThemeId?: string
}

export function ThemeProvider({ children, defaultThemeId = 'totoro' }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeById(defaultThemeId))

  // 从 localStorage 加载主题（仅在客户端）
  useEffect(() => {
    const savedTheme = localStorage.getItem('starlog-theme')
    if (savedTheme && savedTheme !== 'null') {
      const theme = getThemeById(savedTheme)
      if (theme) {
        setCurrentTheme(theme)
        applyThemeToDocument(theme)
      }
    } else {
      applyThemeToDocument(getThemeById(defaultThemeId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 应用主题到全局
  const applyThemeToDocument = (theme: Theme) => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    const colors = theme.colors

    root.style.setProperty('--theme-primary', colors.primary)
    root.style.setProperty('--theme-primary-dark', colors.primaryDark)
    root.style.setProperty('--theme-primary-light', colors.primaryLight)
    root.style.setProperty('--theme-secondary', colors.secondary)
    root.style.setProperty('--theme-accent', colors.accent)
    root.style.setProperty('--theme-background', colors.background)
    root.style.setProperty('--theme-background-dark', colors.backgroundDark)
    root.style.setProperty('--theme-surface', colors.surface)
    root.style.setProperty('--theme-surface-dark', colors.surfaceDark)
    root.style.setProperty('--theme-text', colors.text)
    root.style.setProperty('--theme-text-dark', colors.textDark)
    root.style.setProperty('--theme-text-muted', colors.textMuted)
    root.style.setProperty('--theme-gradient', theme.gradient)
    root.style.setProperty('--theme-font', theme.fontFamily)
    root.style.setProperty('--theme-radius', theme.borderRadius)
    root.style.setProperty('--theme-shadow', theme.shadow)

    try {
      localStorage.setItem('starlog-theme', theme.id)
    } catch (e) {
      console.warn('Failed to save theme:', e)
    }

    root.setAttribute('data-theme', theme.id)
  }

  // 切换主题
  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId)
    setCurrentTheme(theme)
    applyThemeToDocument(theme)
  }

  // 切换明暗模式
  const toggleDarkMode = () => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    const isDark = root.classList.contains('dark')
    
    if (isDark) {
      root.classList.remove('dark')
      try {
        localStorage.setItem('starlog-dark', 'false')
      } catch (e) {}
    } else {
      root.classList.add('dark')
      try {
        localStorage.setItem('starlog-dark', 'true')
      } catch (e) {}
    }
  }

  return (
    <ThemeProviderContext.Provider value={{ currentTheme, setTheme, toggleDarkMode }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
