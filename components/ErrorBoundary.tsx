'use client'

import { Component, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
          <div className="text-center max-w-2xl">
            {/* 装饰元素 */}
            <div className="mb-8">
              <div className="text-8xl mb-4 animate-bounce">🌿</div>
              <div className="flex justify-center gap-2 text-4xl">
                <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🍄</span>
                <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🌻</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🦋</span>
              </div>
            </div>

            {/* 错误信息 */}
            <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              哎呀！
            </h1>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              页面遇到了一点小问题
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              别担心，我们已经记录了这个问题，正在努力修复中
            </p>

            {/* 分隔线 */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              <span className="text-2xl">🌱</span>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105"
              >
                🔄 重试
              </button>
              <Link
                href="/"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105 border-2 border-emerald-500"
              >
                🏠 返回首页
              </Link>
            </div>

            {/* 技术信息（开发环境） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  技术详情（仅开发环境可见）
                </summary>
                <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
