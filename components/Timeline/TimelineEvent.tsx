'use client'

import { useState } from 'react'

interface TimelineEventProps {
  event: {
    date: string
    title: string
    description: string
    type: 'feature' | 'fix' | 'docs' | 'refactor' | 'other'
    commit: string
    author: string
  }
  index: number
}

export default function TimelineEvent({ event, index }: TimelineEventProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const typeConfig = {
    feature: { emoji: '✨', color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'border-purple-200 dark:border-purple-800' },
    fix: { emoji: '🐛', color: 'from-red-500 to-rose-500', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' },
    docs: { emoji: '📝', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' },
    refactor: { emoji: '♻️', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800' },
    other: { emoji: '📌', color: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-50 dark:bg-gray-900/20', borderColor: 'border-gray-200 dark:border-gray-800' },
  }

  const config = typeConfig[event.type as keyof typeof typeConfig] || typeConfig.other

  return (
    <div 
      className="relative pl-8 sm:pl-12 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 时间线节点 */}
      <div className={`absolute left-0 sm:left-2 top-6 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br ${config.color} border-4 border-white dark:border-slate-800 shadow-lg z-10`} />
      
      {/* 内容卡片 */}
      <div className={`ml-6 sm:ml-10 ${config.bgColor} ${config.borderColor} border rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer`}
           onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
          <span className="text-xl sm:text-2xl">{config.emoji}</span>
          <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
            {event.date}
          </span>
          <span className="text-xs px-2 py-1 bg-white dark:bg-slate-800 rounded-full font-mono text-gray-600 dark:text-gray-400">
            {event.commit}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.bgColor} ${config.borderColor} border`}>
            {getTypeLabel(event.type)}
          </span>
        </div>
        
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
          {event.title}
        </h3>
        
        {event.description && (
          <div className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
            {event.description}
          </div>
        )}
        
        {event.description && event.description.length > 100 && (
          <button 
            className="mt-2 text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? '收起' : '展开更多'}
          </button>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            👤 {event.author}
          </span>
        </div>
      </div>
    </div>
  )
}

function getTypeLabel(type: string): string {
  const labels = {
    feature: '功能',
    fix: '修复',
    docs: '文档',
    refactor: '重构',
    other: '其他',
  }
  return labels[type as keyof typeof labels] || '其他'
}
