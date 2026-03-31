'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  overscan?: number
  children: (item: T, index: number) => React.ReactNode
  className?: string
  loading?: boolean
  onLoadMore?: () => void
}

/**
 * 虚拟滚动列表组件
 * 只渲染可见区域的 item，提升大数据列表性能
 */
export default function VirtualList<T>({
  items,
  itemHeight,
  overscan = 5,
  children,
  className = '',
  loading = false,
  onLoadMore,
}: VirtualListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const containerRef = useRef<HTMLDivElement>(null)
  const isLoadingMore = useRef(false)

  const totalHeight = items.length * itemHeight

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const containerHeight = containerRef.current.clientHeight

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    setVisibleRange({ start: startIndex, end: endIndex })

    // 触发加载更多
    if (onLoadMore && !isLoadingMore.current) {
      const threshold = totalHeight * 0.8
      if (scrollTop + containerHeight >= threshold) {
        isLoadingMore.current = true
        onLoadMore()
      }
    }
  }, [itemHeight, overscan, items.length, totalHeight, onLoadMore])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', updateVisibleRange)
    updateVisibleRange()

    return () => {
      container.removeEventListener('scroll', updateVisibleRange)
    }
  }, [updateVisibleRange])

  // 重置加载状态
  useEffect(() => {
    isLoadingMore.current = false
  }, [items.length])

  const visibleItems = items.slice(visibleRange.start, visibleRange.end)

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{
        height: '100%',
        overflowY: 'auto',
        contain: 'strict',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                marginBottom: index < visibleItems.length - 1 ? '0.5rem' : '0',
              }}
            >
              {children(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <span className="animate-spin text-xl">🔄</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
        </div>
      )}

      <style jsx>{`
        .virtual-list {
          will-change: scroll-position;
        }
        
        .virtual-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .virtual-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        .virtual-list::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        
        .virtual-list::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
