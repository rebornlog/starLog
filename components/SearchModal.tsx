'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'page' | 'post' | 'tag'
  title: string
  href: string
  description?: string
}

const searchResults: SearchResult[] = [
  { type: 'page', title: '首页', href: '/', description: 'starLog 个人知识库' },
  { type: 'page', title: '技术博客', href: '/blog', description: '技术文章列表' },
  { type: 'page', title: '星座运势', href: '/zodiac', description: '十二星座每日运势' },
  { type: 'page', title: '易经问卦', href: '/iching', description: '六十四卦智慧' },
  { type: 'page', title: '能量饮食', href: '/diet', description: '八字五行饮食方案' },
  { type: 'page', title: '股票行情', href: '/stocks', description: 'A 股实时行情' },
  { type: 'page', title: '大事纪', href: '/timeline', description: '项目发展历程' },
  { type: 'page', title: '标签', href: '/tags', description: '文章标签云' },
  { type: 'page', title: '项目', href: '/projects', description: '个人项目展示' },
  { type: 'page', title: '关于', href: '/about', description: '关于我' },
]

export default function SearchModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredResults = searchResults.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.description?.toLowerCase().includes(query.toLowerCase())
  )

  const openModal = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  const handleSelect = useCallback((href: string) => {
    router.push(href)
    closeModal()
  }, [router, closeModal])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K 打开搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openModal()
      }
      // Escape 关闭搜索
      if (e.key === 'Escape') {
        closeModal()
      }
      // 方向键导航
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
        }
        if (e.key === 'Enter' && filteredResults[selectedIndex]) {
          e.preventDefault()
          handleSelect(filteredResults[selectedIndex].href)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredResults, selectedIndex, handleSelect, openModal, closeModal])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* 搜索框 */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="搜索页面、文章、标签..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded">
            ESC 关闭
          </kbd>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🔍</div>
              <p>未找到匹配结果</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((result, index) => (
                <button
                  key={result.href}
                  onClick={() => handleSelect(result.href)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === selectedIndex
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {result.type === 'page' && '📄'}
                      {result.type === 'post' && '📝'}
                      {result.type === 'tag' && '🏷️'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    {index === selectedIndex && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        回车选择
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
              选择
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {filteredResults.length} 个结果
          </div>
        </div>
      </div>
    </div>
  )
}
