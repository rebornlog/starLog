'use client'

import { useState, useEffect } from 'react'
import { themes, Theme, getThemeById } from '@/lib/themes/themes'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultThemeId?: string
}

export function ThemeProvider({ children, defaultThemeId = 'totoro' }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getThemeById(defaultThemeId))
  const [isLoaded, setIsLoaded] = useState(false)

  // 从 localStorage 加载主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('starlog-theme')
    if (savedTheme) {
      const theme = getThemeById(savedTheme)
      setCurrentTheme(theme)
      applyTheme(theme)
    } else {
      applyTheme(getThemeById(defaultThemeId))
    }
    setIsLoaded(true)
  }, [defaultThemeId])

  // 应用主题到全局
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    const colors = theme.colors

    // 设置 CSS 变量
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

    // 保存主题 ID
    localStorage.setItem('starlog-theme', theme.id)

    // 更新 data-theme 属性
    root.setAttribute('data-theme', theme.id)
  }

  // 切换主题
  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId)
    setCurrentTheme(theme)
    applyTheme(theme)
  }

  // 切换明暗模式
  const toggleDarkMode = () => {
    const root = document.documentElement
    const isDark = root.classList.contains('dark')
    
    if (isDark) {
      root.classList.remove('dark')
      localStorage.setItem('starlog-dark', 'false')
    } else {
      root.classList.add('dark')
      localStorage.setItem('starlog-dark', 'true')
    }
  }

  if (!isLoaded) {
    return null
  }

  return (
    <ThemeProviderContext.Provider value={{ currentTheme, setTheme, toggleDarkMode }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Context
import { createContext, useContext } from 'react'

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
