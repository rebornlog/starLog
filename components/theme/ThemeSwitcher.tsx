'use client'
import { useState, useEffect } from 'react'
import { themes, Theme } from '@/lib/themes/themes'

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>('totoro')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('selectedTheme')
    if (saved) setCurrentTheme(saved)
  }, [])

  const applyTheme = (theme: Theme) => {
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
    localStorage.setItem('selectedTheme', theme.id)
    setCurrentTheme(theme.id)
  }

  const handleSelect = (theme: Theme) => {
    applyTheme(theme)
    setIsOpen(false)
  }

  if (!mounted) return null

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[var(--theme-primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2"
        aria-label="Switch theme"
      >
        <span className="text-2xl">🌿</span>
      </button>

      {/* Dialog Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">选择主题</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme)}
                  className={`flex flex-col items-center rounded-xl p-4 transition-all hover:scale-105 ${
                    currentTheme === theme.id
                      ? 'ring-2 ring-[var(--theme-primary)] bg-gray-100 dark:bg-gray-800'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <span className="mb-2 text-3xl">{theme.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{theme.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{theme.nameEn}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
