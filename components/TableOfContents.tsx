'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  isMobile?: boolean
  onClose?: () => void
}

export default function TableOfContents({ isMobile = false, onClose }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // 提取所有标题
    const elements = Array.from(document.querySelectorAll('h2, h3'))
    const items: Heading[] = elements.map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))
    setHeadings(items)

    // 监听滚动，高亮当前章节
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveId(id)
      // 移动端点击后关闭目录
      if (isMobile && onClose) {
        onClose()
      }
    }
  }

  // 移动端样式
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div 
          className="absolute right-0 top-0 h-full w-80 bg-gray-900 shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              目录
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="关闭目录"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="p-4 space-y-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={`
                  text-sm transition-all cursor-pointer rounded px-3 py-2
                  ${heading.level === 3 ? 'ml-4' : ''}
                  ${activeId === heading.id
                    ? 'bg-blue-500/20 text-blue-400 font-medium border-l-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }
                `}
                onClick={() => handleClick(heading.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClick(heading.id)
                  }
                }}
              >
                {heading.text}
              </li>
            ))}
            {headings.length === 0 && (
              <li className="text-gray-500 text-center py-8">
                暂无目录
              </li>
            )}
          </ul>
        </div>
      </div>
    )
  }

  // 桌面端样式（原有样式）
  return (
    <nav className="sticky top-20 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        目录
      </h3>
      <ul className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`
              text-sm transition-all cursor-pointer rounded px-2 py-1.5
              ${heading.level === 3 ? 'ml-4' : ''}
              ${activeId === heading.id
                ? 'bg-blue-500/20 text-blue-400 font-medium border-l-2 border-blue-400 pl-3'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }
            `}
            onClick={() => handleClick(heading.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(heading.id)
              }
            }}
          >
            {heading.text}
          </li>
        ))}
        {headings.length === 0 && (
          <li className="text-gray-500 text-center py-8">
            暂无目录
          </li>
        )}
      </ul>
    </nav>
  )
}
