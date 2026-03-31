'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getHistory, removeHistory, clearHistory, getHistoryStats, type DivinationHistory } from '@/lib/iching/history'
import { getHexagramById } from '@/lib/iching/data'
import HexagramVisual from '@/components/HexagramVisual'
import { useToast } from '@/components/Toast'

export default function DivinationHistoryPage() {
  const { showToast } = useToast()
  const [history, setHistory] = useState<DivinationHistory[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [filter])

  const loadHistory = () => {
    setLoading(true)
    const now = Date.now()
    const options = filter === 'week' 
      ? { startDate: now - 7 * 24 * 60 * 60 * 1000 }
      : filter === 'month'
      ? { startDate: now - 30 * 24 * 60 * 60 * 1000 }
      : {}
    
    const historyData = getHistory()
    setHistory(historyData)
    setStats(getHistoryStats())
    setLoading(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      removeHistory(id)
      loadHistory()
      showToast('删除成功', 'success')
    }
  }

  const handleClearAll = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
      clearHistory()
      loadHistory()
      showToast('已清空所有记录', 'info')
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  const getMethodText = (method: string) => {
    const map: Record<string, string> = {
      random: '🎲 随机',
      time: '🕐 时间',
      number: '🔢 数字',
    }
    return map[method] || method
  }

  const getTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      career: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      love: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      health: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      wealth: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      study: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      relationship: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    }
    return colors[type || 'other'] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-4 py-12 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* 标题 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
              📜 问卦历史
            </h1>
            <p className="text-amber-700 dark:text-amber-300">回顾过往卦象，洞察变化规律</p>
          </div>
          <Link
            href="/iching"
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white transition-all hover:shadow-lg"
          >
            开始问卦 →
          </Link>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white p-4 shadow-md dark:bg-slate-800">
              <div className="text-sm text-amber-600 dark:text-amber-400">总记录数</div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.total}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-md dark:bg-slate-800">
              <div className="text-sm text-amber-600 dark:text-amber-400">最近 7 天</div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.recentDays}</div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-md dark:bg-slate-800">
              <div className="text-sm text-amber-600 dark:text-amber-400">最常用方式</div>
              <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {Object.entries(stats.byMethod).sort((a, b) => b[1] - a[1])[0]?.[0] === 'random' 
                  ? '🎲 随机' 
                  : Object.entries(stats.byMethod).sort((a, b) => b[1] - a[1])[0]?.[0] === 'time'
                  ? '🕐 时间'
                  : '🔢 数字'}
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-md dark:bg-slate-800">
              <div className="text-sm text-amber-600 dark:text-amber-400">最常问类型</div>
              <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                {Object.entries(stats.byQuestionType).sort((a, b) => b[1] - a[1])[0]?.[0] === 'career'
                  ? '💼 事业'
                  : Object.entries(stats.byQuestionType).sort((a, b) => b[1] - a[1])[0]?.[0] === 'love'
                  ? '❤️ 感情'
                  : '其他'}
              </div>
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === 'week'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300'
              }`}
            >
              最近 7 天
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === 'month'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300'
              }`}
            >
              最近 30 天
            </button>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              清空全部
            </button>
          )}
        </div>

        {/* 历史记录列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-amber-700 dark:text-amber-300">加载中...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-xl dark:bg-slate-800">
            <div className="mb-4 text-6xl">📜</div>
            <h3 className="mb-2 text-xl font-bold text-amber-900 dark:text-amber-100">暂无历史记录</h3>
            <p className="mb-6 text-amber-700 dark:text-amber-300">开始第一次问卦，记录你的探索之旅</p>
            <Link
              href="/iching"
              className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
            >
              开始问卦
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => {
              const hexagram = getHexagramById(record.hexagramId)
              return (
                <div
                  key={record.id}
                  className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-slate-800"
                >
                  <div className="flex items-start gap-4">
                    {/* 卦象可视化 */}
                    <div className="flex-shrink-0">
                      <HexagramVisual structure={hexagram?.structure || []} size="sm" />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                          {hexagram?.name}卦
                        </h3>
                        {record.questionType && (
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(record.questionType)}`}>
                            {record.questionType === 'career' && '💼 事业'}
                            {record.questionType === 'love' && '❤️ 感情'}
                            {record.questionType === 'health' && '🏥 健康'}
                            {record.questionType === 'wealth' && '💰 财运'}
                            {record.questionType === 'study' && '📚 学业'}
                            {record.questionType === 'relationship' && '👥 人际'}
                          </span>
                        )}
                      </div>

                      <div className="mb-2 text-sm text-amber-600 dark:text-amber-400">
                        {hexagram?.judgment}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>{getMethodText(record.method)}</span>
                        <span>·</span>
                        <span>{formatDate(record.timestamp)}</span>
                        {record.changingLines && record.changingLines.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-red-600 dark:text-red-400">
                              变爻：{record.changingLines.map(pos => `第${pos}爻`).join('、')}
                            </span>
                          </>
                        )}
                        {record.transformedHexagramId && (
                          <>
                            <span>·</span>
                            <span className="text-orange-600 dark:text-orange-400">
                              变卦：{getHexagramById(record.transformedHexagramId)?.name}
                            </span>
                          </>
                        )}
                      </div>

                      {record.note && (
                        <div className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-700 dark:bg-slate-700 dark:text-gray-300">
                          📝 {record.note}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/iching?replay=${record.id}`}
                        className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50"
                      >
                        查看
                      </Link>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
