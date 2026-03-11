'use client'

import { useState, useEffect } from 'react'
import TimelineEvent from './TimelineEvent'

interface TimelineEventData {
  date: string
  title: string
  description: string
  type: 'feature' | 'fix' | 'docs' | 'refactor' | 'other'
  commit: string
  author: string
}

interface TimelineResponse {
  success: boolean
  count: number
  total: number
  hasMore: boolean
  events: TimelineEventData[]
  error?: string
}

type FilterType = 'all' | 'feature' | 'fix' | 'docs' | 'refactor' | 'other'

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEventData[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const loadEvents = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      }
      const currentOffset = isLoadMore ? offset : 0
      const res = await fetch(`/api/timeline?limit=50&offset=${currentOffset}`)
      const data: TimelineResponse = await res.json()
      
      if (data.success) {
        if (isLoadMore) {
          setEvents(prev => [...prev, ...data.events])
        } else {
          setEvents(data.events)
        }
        setHasMore(data.hasMore)
        setOffset(currentOffset + data.count)
      } else {
        setError(data.error || '加载失败')
      }
    } catch (err) {
      console.error('Failed to fetch timeline:', err)
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // 筛选 + 搜索
  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.type === filter
    const matchesSearch = search === '' || 
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.author.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // 统计信息
  const stats = {
    total: events.length,
    feature: events.filter(e => e.type === 'feature').length,
    fix: events.filter(e => e.type === 'fix').length,
    docs: events.filter(e => e.type === 'docs').length,
    refactor: events.filter(e => e.type === 'refactor').length,
    other: events.filter(e => e.type === 'other').length,
  }

  const filterButtons: { key: FilterType; label: string; icon: string; count: number }[] = [
    { key: 'all', label: '全部', icon: '📅', count: stats.total },
    { key: 'feature', label: '功能', icon: '✨', count: stats.feature },
    { key: 'fix', label: '修复', icon: '🐛', count: stats.fix },
    { key: 'docs', label: '文档', icon: '📝', count: stats.docs },
    { key: 'refactor', label: '重构', icon: '♻️', count: stats.refactor },
    { key: 'other', label: '其他', icon: '📌', count: stats.other },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 animate-pulse">📅</div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载项目历程...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={() => loadEvents()}
            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-900 dark:text-green-100 mb-4">
            📅 starLog 大事纪
          </h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            记录项目成长的每一步
          </p>
        </div>

        {/* 统计面板 */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {filterButtons.map(({ key, icon, count }) => (
            <div
              key={key}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{count}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {key === 'all' ? '总计' : key === 'feature' ? '功能' : key === 'fix' ? '修复' : key === 'docs' ? '文档' : key === 'refactor' ? '重构' : '其他'}
              </div>
            </div>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="mb-8 sm:mb-12">
          <input
            type="text"
            placeholder="🔍 搜索提交记录、作者..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-green-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {filterButtons.map(({ key, label, icon, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-300 min-h-[44px] touch-manipulation active:scale-95 ${
                filter === key
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-slate-700 shadow-md'
              }`}
            >
              <span className="text-base sm:inline">{icon}</span>
              <span className="ml-1.5 text-sm sm:text-base">{label}</span>
              <span className="ml-1 text-xs opacity-75">({count})</span>
            </button>
          ))}
        </div>

        {/* 时间线 */}
        <div className="relative">
          {/* 时间线线条 */}
          <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-emerald-500 to-teal-600" />
          
          {/* 事件列表 */}
          <div className="space-y-6 sm:space-y-8">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {search || filter !== 'all' ? '没有找到匹配的事件' : '暂无事件'}
                </p>
              </div>
            ) : (
              <>
                {filteredEvents.map((event, index) => (
                  <TimelineEvent key={`${event.commit}-${index}`} event={event} index={index} />
                ))}
                
                {/* 加载更多 */}
                {hasMore && filter === 'all' && search === '' && (
                  <div className="text-center py-8">
                    <button
                      onClick={() => loadEvents(true)}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? '加载中...' : '加载更多'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 底部导航 */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-green-700 dark:text-green-300 rounded-full shadow-md hover:shadow-lg transition-all font-medium"
          >
            <span>🏠</span>
            <span>返回首页</span>
          </a>
        </div>
      </div>

      {/* 自定义动画 */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
