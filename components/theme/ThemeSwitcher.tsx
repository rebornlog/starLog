'use client'

import { useState } from 'react'
import { ThemeProvider, useTheme } from '@/lib/themes/ThemeProvider'
import { themes } from '@/lib/themes/themes'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function ThemeSwitcher() {
  const { currentTheme, setTheme, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <>
      {/* 主题切换按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
        style={{
          background: currentTheme.colors.primary,
          color: '#FFFFFF',
        }}
        aria-label="切换主题"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform duration-300 inline-block">
          {currentTheme.icon}
        </span>
        
        {/* Tooltip */}
        <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {currentTheme.name}
        </span>
      </button>

      {/* 主题选择器对话框 */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                  {/* 头部 */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold"
                        style={{ color: 'var(--theme-text)' }}
                      >
                        🎨 选择主题
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        当前主题：<span className="font-medium">{currentTheme.name}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* 视图切换 */}
                      <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {viewMode === 'grid' ? '📋' : '🔲'}
                      </button>
                      
                      {/* 明暗模式切换 */}
                      <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl"
                      >
                        🌙
                      </button>
                      
                      {/* 关闭按钮 */}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* 主题网格 */}
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'
                      : 'space-y-3'
                  }>
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id)
                          setIsOpen(false)
                        }}
                        className={`
                          relative overflow-hidden rounded-xl p-4 transition-all duration-300
                          hover:scale-105 hover:shadow-xl
                          ${currentTheme.id === theme.id ? 'ring-4 ring-offset-2 ring-' + theme.colors.primary.replace('#', '') : ''}
                        `}
                        style={{
                          background: theme.colors.background,
                          border: `2px solid ${currentTheme.id === theme.id ? theme.colors.primary : 'transparent'}`,
                        }}
                      >
                        {/* 预览色块 */}
                        <div 
                          className="h-20 rounded-lg mb-3 shadow-md"
                          style={{ background: theme.gradient }}
                        />
                        
                        {/* 主题信息 */}
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{theme.icon}</span>
                            <span 
                              className="font-semibold text-sm"
                              style={{ color: theme.colors.text }}
                            >
                              {theme.name}
                            </span>
                          </div>
                          <p 
                            className="text-xs opacity-70 line-clamp-2"
                            style={{ color: theme.colors.textMuted }}
                          >
                            {theme.description}
                          </p>
                        </div>

                        {/* 当前标记 */}
                        {currentTheme.id === theme.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                            <span className="text-green-500 text-lg">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 底部提示 */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 text-center">
                      💡 提示：主题会自动保存，下次访问时生效
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
