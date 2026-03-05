'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { themes, Theme, getThemeById } from './themes'

interface ThemeContextValue {
  currentTheme: Theme
  setTheme: (id: string) => void
  toggleDarkMode: () => void
}

// 创建 context，默认值为 null
const ThemeContext = createContext<ThemeContextValue | null>(null)

// 自定义 hook，安全地获取 context
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    // 返回默认值而不是抛出错误，避免组件崩溃
    return {
      currentTheme: themes[0],
      setTheme: () => {},
      toggleDarkMode: () => {}
    }
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // 服务端渲染时不初始化主题
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0])
  const [isClient, setIsClient] = useState(false)

  // 客户端初始化
  useEffect(() => {
    setIsClient(true)
    
    try {
      const savedThemeId = localStorage.getItem('starlog-theme')
      if (savedThemeId && savedThemeId !== 'null') {
        const savedTheme = getThemeById(savedThemeId)
        if (savedTheme) {
          setCurrentTheme(savedTheme)
          applyThemeToDocument(savedTheme)
          return
        }
      }
      // 默认主题
      applyThemeToDocument(themes[0])
    } catch (error) {
      console.warn('Failed to load theme:', error)
      applyThemeToDocument(themes[0])
    }
  }, [])

  // 应用主题到 document
  const applyThemeToDocument = useCallback((theme: Theme) => {
    if (typeof document === 'undefined') return
    
    try {
      const root = document.documentElement
      const c = theme.colors
      
      root.style.setProperty('--theme-primary', c.primary)
      root.style.setProperty('--theme-primary-dark', c.primaryDark)
      root.style.setProperty('--theme-primary-light', c.primaryLight)
      root.style.setProperty('--theme-secondary', c.secondary)
      root.style.setProperty('--theme-accent', c.accent)
      root.style.setProperty('--theme-background', c.background)
      root.style.setProperty('--theme-text', c.text)
      root.style.setProperty('--theme-text-muted', c.textMuted)
      root.style.setProperty('--theme-gradient', theme.gradient)
      root.style.setProperty('--theme-font', theme.fontFamily)
      
      root.setAttribute('data-theme', theme.id)
      
      try {
        localStorage.setItem('starlog-theme', theme.id)
      } catch (e) {
        // 忽略 localStorage 错误
      }
    } catch (error) {
      console.warn('Failed to apply theme:', error)
    }
  }, [])

  // 切换主题
  const setTheme = useCallback((themeId: string) => {
    const theme = getThemeById(themeId)
    if (theme) {
      setCurrentTheme(theme)
      applyThemeToDocument(theme)
    }
  }, [applyThemeToDocument])

  // 切换明暗模式
  const toggleDarkMode = useCallback(() => {
    if (typeof document === 'undefined') return
    try {
      document.documentElement.classList.toggle('dark')
    } catch (error) {
      console.warn('Failed to toggle dark mode:', error)
    }
  }, [])

  const value: ThemeContextValue = {
    currentTheme,
    setTheme,
    toggleDarkMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
