'use client'

import { useEffect, useState } from 'react'

interface LoadingProps {
  text?: string
}

export default function Loading({ text = '加载中...' }: LoadingProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* 宫崎骏风格加载动画 */}
        <div className="relative mb-8">
          {/* 外圈 */}
          <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full animate-spin" />
          {/* 内圈 */}
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          {/* 中心图标 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-bounce">
            🌿
          </div>
        </div>

        {/* 加载文字 */}
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {text}{dots}
        </p>

        {/* 装饰元素 */}
        <div className="flex justify-center gap-2 mt-4">
          <span className="text-xl animate-bounce" style={{ animationDelay: '0ms' }}>🌱</span>
          <span className="text-xl animate-bounce" style={{ animationDelay: '100ms' }}>🌿</span>
          <span className="text-xl animate-bounce" style={{ animationDelay: '200ms' }}>🍃</span>
        </div>

        {/* 进度提示 */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          正在为您准备最佳体验
        </p>
      </div>

      {/* 自定义动画 */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
    </div>
  )
}
