'use client'

import { useCallback } from 'react'

interface SearchButtonProps {
  onClick?: () => void
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    } else {
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('open-search'))
    }
  }, [onClick])

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="搜索"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <span className="hidden sm:inline-flex items-center gap-1 text-sm">
        搜索
        <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
          ⌘K
        </kbd>
      </span>
    </button>
  )
}
