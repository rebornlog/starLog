'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/themes/ThemeProvider'
import { themes } from '@/lib/themes/themes'

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // 安全获取 theme context，即使 context 不存在也不会崩溃
  const { currentTheme, setTheme } = useTheme()

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 服务端不渲染
  if (!isMounted) {
    return null
  }

  // 确保 theme 有值
  const theme = currentTheme || themes[0]

  return (
    <>
      {/* 右下角浮动按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
        style={{
          background: theme.colors?.primary || '#4F836B',
          color: '#FFFFFF',
        }}
        aria-label="切换主题"
        type="button"
      >
        <span className="text-2xl inline-block">
          {theme.icon || '🌿'}
        </span>
      </button>

      {/* 主题选择对话框 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                🎨 选择主题
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xl transition-colors"
                type="button"
                aria-label="关闭对话框"
              >
                ✕
              </button>
            </div>

            {/* 主题网格 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setIsOpen(false)
                  }}
                  className="relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer text-left"
                  style={{
                    background: t.colors?.background || '#FFFFFF',
                    border: theme.id === t.id ? `2px solid ${t.colors?.primary}` : '2px solid transparent',
                  }}
                  type="button"
                  aria-label={`选择 ${t.name} 主题`}
                >
                  {/* 预览色块 */}
                  <div 
                    className="h-20 rounded-lg mb-3 shadow-md"
                    style={{ background: t.gradient }}
                  />
                  
                  {/* 主题信息 */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl" role="img" aria-label={t.name}>
                        {t.icon}
                      </span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {t.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                  
                  {/* 当前标记 */}
                  {theme.id === t.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                      <span className="text-green-500 text-lg">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* 底部提示 */}
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              💡 提示：主题会自动保存，下次访问时生效
            </p>
          </div>
        </div>
      )}
    </>
  )
}
