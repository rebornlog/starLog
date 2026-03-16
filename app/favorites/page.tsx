'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'

interface FavoritePost {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  viewCount: number
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [posts, setPosts] = useState<FavoritePost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {
    try {
      // 从 localStorage 加载收藏的文章 ID
      const favIds = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavorites(favIds)

      if (favIds.length === 0) {
        setLoading(false)
        return
      }

      // 获取文章详情（调用 API）
      const res = await fetch(`/api/favorites?ids=${favIds.join(',')}`)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  function removeFavorite(postId: string) {
    const newFavorites = favorites.filter(id => id !== postId)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setFavorites(newFavorites)
    setPosts(posts.filter(p => p.id !== postId))
    
    window.dispatchEvent(new CustomEvent('toast', {
      detail: {
        message: '已取消收藏',
        type: 'info',
        duration: 2000
      }
    }))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 面包屑导航 */}
        <Breadcrumb />
        
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">⭐</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              我的收藏
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            珍藏的好文章，共 {favorites.length} 篇
          </p>
        </div>

        {/* 收藏列表 */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              还没有收藏任何文章
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              遇到好文章时点击"收藏"按钮，它们会出现在这里
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:-translate-y-1"
            >
              去浏览文章
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* 移除按钮 */}
                <button
                  onClick={() => removeFavorite(post.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="取消收藏"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <Link href={`/blog/${post.slug}`}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform">⭐</div>
                    <div className="flex-1 min-w-0 pr-12">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {post.summary}
                      </p>
                      
                      {/* 标签显示 */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(post.publishedAt).toLocaleDateString('zh-CN')}</span>
                        <span>·</span>
                        <span>{post.readingTime} 分钟阅读</span>
                        <span>·</span>
                        <span>👁️ {post.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
