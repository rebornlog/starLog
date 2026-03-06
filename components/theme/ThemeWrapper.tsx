'use client'
import { useEffect, useState, ReactNode } from 'react'
import { ThemeProvider } from '@/lib/themes/ThemeProvider'

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 只在客户端渲染主题相关组件，避免 SSR hydration 问题
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <>
      <ThemeProvider>{children}</ThemeProvider>
    </>
  )
}
