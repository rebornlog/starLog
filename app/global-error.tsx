'use client'

import { useEffect } from 'react'
import { logError, getFriendlyMessage } from '@/lib/error-handler'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录全局错误日志
    logError(error, { component: 'global-error.tsx' })
  }, [error])
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center max-w-lg">
            {/* 装饰性背景 */}
            <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">☁️</div>
            <div className="absolute bottom-20 right-10 text-5xl opacity-20 animate-pulse delay-300">☁️</div>
            
            {/* 错误图标 */}
            <div className="relative mb-8">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-16 h-16 text-red-500 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* 标题 */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              出错了！
            </h1>
            
            {/* 错误信息 */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
              {getFriendlyMessage(error)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
              别担心，我们已经记录了这个问题
            </p>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={reset}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重试
              </button>
              
              <a
                href="/"
                className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                返回首页
              </a>
            </div>

            {/* 帮助提示 */}
            <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                温馨提示
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>请检查网络连接是否正常</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>清除浏览器缓存后重试</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>如果问题持续，请联系管理员</span>
                </li>
              </ul>
            </div>

            {/* 技术信息（仅开发环境） */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  🔧 技术详情（开发环境）
                </summary>
                <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-auto max-h-96 shadow-inner">
                  <p className="mb-2 font-semibold text-emerald-400">Error Details:</p>
                  <p className="mb-2">{error.message}</p>
                  {error.stack && (
                    <pre className="mt-2 whitespace-pre-wrap text-gray-300">{error.stack}</pre>
                  )}
                  {error.digest && (
                    <p className="mt-2 text-gray-500">Digest: {error.digest}</p>
                  )}
                </div>
              </details>
            )}

            {/* 底部装饰 */}
            <div className="mt-12 flex justify-center gap-3 text-3xl opacity-60">
              <span className="animate-bounce delay-100">🌱</span>
              <span className="animate-bounce delay-200">🌿</span>
              <span className="animate-bounce delay-300">🍃</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
