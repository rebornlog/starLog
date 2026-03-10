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
  events: TimelineEventData[]
  error?: string
}

type FilterType = 'all' | 'feature' | 'fix' | 'docs' | 'refactor' | 'other'

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEventData[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then((data: TimelineResponse) => {
        if (data.success) {
          setEvents(data.events)
        } else {
          setError(data.error || '加载失败')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch timeline:', err)
        setError('加载失败，请稍后重试')
        setLoading(false)
      })
  }, [])

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.type === filter)

  const filterButtons: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '📅' },
    { key: 'feature', label: '功能', icon: '✨' },
    { key: 'fix', label: '修复', icon: '🐛' },
    { key: 'docs', label: '文档', icon: '📝' },
    { key: 'refactor', label: '重构', icon: '♻️' },
    { key: 'other', label: '其他', icon: '📌' },
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
            onClick={() => window.location.reload()}
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
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            共 {events.length} 个历史节点
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {filterButtons.map(({ key, label, icon }) => (
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
                <p className="text-gray-600 dark:text-gray-400">暂无事件</p>
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <TimelineEvent key={`${event.commit}-${index}`} event={event} index={index} />
              ))
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
