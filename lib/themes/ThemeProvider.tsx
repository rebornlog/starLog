'use client'
import { useEffect, useState, ReactNode } from 'react'
import { themes, getThemeById, Theme } from './themes'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 初始化主题 - 固定使用龙猫主题
    const theme = themes[0]
    applyTheme(theme)
  }, [])

  const applyTheme = (theme: Theme) => {
    if (!theme) return
    const root = document.documentElement
    const c = theme.colors
    root.style.setProperty('--theme-primary', c.primary)
    root.style.setProperty('--theme-primary-dark', c.primaryDark)
    root.style.setProperty('--theme-primary-light', c.primaryLight)
    root.style.setProperty('--theme-secondary', c.secondary)
    root.style.setProperty('--theme-accent', c.accent)
    root.style.setProperty('--theme-background', c.background)
    root.style.setProperty('--theme-surface', c.surface)
    root.style.setProperty('--theme-text', c.text)
    root.style.setProperty('--theme-text-muted', c.textMuted)
    root.style.setProperty('--theme-gradient', theme.gradient)
    root.style.setProperty('--theme-font', theme.fontFamily)
    root.style.setProperty('--theme-radius', theme.borderRadius)
    root.setAttribute('data-theme', theme.id)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
