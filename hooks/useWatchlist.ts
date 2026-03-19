'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'starlog_fund_watchlist'

/**
 * 自选基金 Hook
 * 使用 localStorage 存储用户自选的基金列表
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 加载自选列表
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setWatchlist(parsed)
        }
      }
    } catch (error) {
      console.error('加载自选列表失败:', error)
    }
    setIsLoaded(true)
  }, [])

  // 保存自选列表
  const saveWatchlist = (newWatchlist: string[]) => {
    try {
      setWatchlist(newWatchlist)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlist))
    } catch (error) {
      console.error('保存自选列表失败:', error)
    }
  }

  // 添加到自选
  const addToWatchlist = (code: string) => {
    if (!watchlist.includes(code)) {
      saveWatchlist([...watchlist, code])
      return true
    }
    return false
  }

  // 从自选移除
  const removeFromWatchlist = (code: string) => {
    if (watchlist.includes(code)) {
      saveWatchlist(watchlist.filter(c => c !== code))
      return true
    }
    return false
  }

  // 切换自选状态
  const toggleWatchlist = (code: string) => {
    if (watchlist.includes(code)) {
      removeFromWatchlist(code)
      return false
    } else {
      addToWatchlist(code)
      return true
    }
  }

  // 是否在自选列表中
  const isInWatchlist = (code: string) => {
    return watchlist.includes(code)
  }

  // 清空自选列表
  const clearWatchlist = () => {
    saveWatchlist([])
  }

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    clearWatchlist,
    count: watchlist.length
  }
}
