'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // 提取文章中的所有标题
    const elements = Array.from(document.querySelectorAll('h2, h3'))
    const headingList: Heading[] = elements
      .map((el) => ({
        id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      }))
      .filter((h) => h.id !== '')

    setHeadings(headingList)

    // 设置元素 ID（如果原本没有）
    elements.forEach((el, index) => {
      if (!el.id) {
        el.id = `heading-${index}`
      }
    })
  }, [pathname])

  useEffect(() => {
    // 监听滚动，高亮当前章节
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveId(heading.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  // 平滑滚动到指定位置
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      })
      setActiveId(id)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      {/* 折叠按钮 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        title={isCollapsed ? '展开目录' : '收起目录'}
      >
        <svg
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 目录面板 */}
      {!isCollapsed && (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-h-[70vh] overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            目录
          </h3>
          
          <nav className="space-y-1">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-all duration-200 ${
                  heading.level === 3 ? 'ml-4' : ''
                } ${
                  activeId === heading.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {heading.text}
              </button>
            ))}
          </nav>

          {/* 底部提示 */}
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 text-center">
            点击跳转 · 滚动高亮
          </p>
        </div>
      )}
    </div>
  )
}
