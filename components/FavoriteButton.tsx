'use client'

import { useState, useEffect } from 'react'

interface FavoriteButtonProps {
  postId: string
  postTitle: string
  postSlug: string
}

export default function FavoriteButton({ postId, postTitle, postSlug }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    // 从 localStorage 加载收藏状态
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.includes(postId))
    
    // 获取收藏总数
    setCount(favorites.length)
  }, [postId])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    
    if (isFavorite) {
      // 取消收藏
      const newFavorites = favorites.filter((id: string) => id !== postId)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorite(false)
      setCount(newFavorites.length)
      
      // 触发 toast 提示
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          message: '已取消收藏',
          type: 'info',
          duration: 2000
        }
      }))
    } else {
      // 添加收藏
      const newFavorites = [...favorites, postId]
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorite(true)
      setCount(newFavorites.length)
      
      // 触发 toast 提示
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          message: '已加入收藏夹 ✨',
          type: 'success',
          duration: 2000
        }
      }))
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isFavorite
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
      }`}
      aria-label={isFavorite ? '取消收藏' : '收藏文章'}
    >
      <span className={`text-lg ${isFavorite ? 'animate-bounce' : ''}`}>
        {isFavorite ? '⭐' : '☆'}
      </span>
      <span className="text-sm font-medium hidden sm:inline">
        {isFavorite ? '已收藏' : '收藏'}
      </span>
      {count > 0 && (
        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}
