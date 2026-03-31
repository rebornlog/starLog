'use client'

import Link from 'next/link'
import { useWatchlist } from '@/hooks/useWatchlist'
import { Fund } from '@/types/fund'
import { useState, useEffect } from 'react'


export const metadata = {
  title: 'Watchlist | starLog',
  description: 'Watchlist 页面 - starLog 个人知识库',
  robots: {
    index: true,
    follow: true,
  },
}


// 使用 Next.js 代理（自动转发到 8081 端口）
const API_BASE = ''

export default function WatchlistPage() {
  const { watchlist, isLoaded, removeFromWatchlist, clearWatchlist } = useWatchlist()
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)

  // 获取自选基金数据
  useEffect(() => {
    if (!isLoaded || watchlist.length === 0) {
      setLoading(false)
      return
    }

    const fetchWatchlistData = async () => {
      setLoading(true)
      try {
        const promises = watchlist.map(code =>
          fetch(`${API_BASE}/api/funds/${code}`)
            .then(res => res.json())
            .then(data => data.success ? data : null)
            .catch(() => null)
        )

        const results = await Promise.all(promises)
        const validFunds = results
          .filter(r => r !== null)
          .map(r => ({
            code: r.code,
            name: r.name,
            type: r.type || '混合型',
            netValue: r.netValue || 0,
            change: r.change || 0,
            changePercent: r.changePercent || 0,
            riskLevel: '中' as const,
            tags: [],
            updateTime: r.updateTime
          }))

        setFunds(validFunds)
      } catch (error) {
        console.error('获取自选基金数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlistData()
  }, [watchlist, isLoaded])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">⭐ 我的自选</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">暂无自选基金</p>
            <Link
              href="/funds"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              去添加基金
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ⭐ 我的自选
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            共 {watchlist.length} 只基金
          </p>
          <div className="mt-4 flex gap-3 justify-center">
            <Link
              href="/funds"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              ➕ 添加基金
            </Link>
            <button
              onClick={() => {
                if (confirm('确定清空所有自选基金吗？')) {
                  clearWatchlist()
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              🗑️ 清空自选
            </button>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载基金数据...</p>
          </div>
        )}

        {/* 基金列表 */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {funds.map(fund => (
              <div
                key={fund.code}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <Link href={`/funds/${fund.code}`} className="block">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">
                        {fund.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fund.code}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">净值</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ¥{fund.netValue > 0 ? fund.netValue.toFixed(4) : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">涨跌</span>
                      <span className={`text-sm font-semibold ${
                        (fund.changePercent || 0) > 0 ? 'text-red-500' : 
                        (fund.changePercent || 0) < 0 ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {(fund.changePercent || 0) !== 0 ? (
                          <>{(fund.changePercent || 0) > 0 ? '↑' : '↓'} {Math.abs(fund.changePercent || 0).toFixed(2)}%</>
                        ) : (
                          '--'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">类型</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {fund.type}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* 移除按钮 */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeFromWatchlist(fund.code)
                    }}
                    className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    🗑️ 移除自选
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
