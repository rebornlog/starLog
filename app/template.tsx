'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Loading from '@/components/Loading'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 页面切换时显示 loading
    setIsLoading(true)
    
    // 模拟加载时间，确保用户体验流畅
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  if (isLoading) {
    return <Loading />
  }

  return <>{children}</>
}
