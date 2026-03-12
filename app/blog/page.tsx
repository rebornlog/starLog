'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SkeletonCard } from '@/components/Skeleton'
import Breadcrumb from '@/components/Breadcrumb'

interface Post {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  viewCount: number
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: 'tech', name: '技术', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { id: 'finance', name: '金融', icon: '📈', color: 'from-green-500 to-emerald-500' },
    { id: 'fengshui', name: '风水', icon: '🧭', color: 'from-purple-500 to-pink-500' },
    { id: 'business', name: '商业', icon: '🔮', color: 'from-amber-500 to-orange-500' },
  ]

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory])

  async function fetchPosts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        ...(selectedCategory ? { category: selectedCategory } : {}),
      })
      
      const res = await fetch(`/api/posts?${params}`)
      const data = await res.json()
      
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 面包屑导航 */}
        <Breadcrumb />
        
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            📚 技术博客
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            记录开发路上的点点滴滴，分享实战经验与技术思考
          </p>
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              !selectedCategory
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 文章列表 */}
        {loading ? (
          <SkeletonCard count={5} />
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block group p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">📄</div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {post.summary}
                    </p>
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
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
