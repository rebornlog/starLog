'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SkeletonCard } from '@/components/Skeleton'

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

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [popularTags, setPopularTags] = useState<string[]>([])

  const categories = [
    { id: 'tech', name: '技术', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { id: 'finance', name: '金融', icon: '📈', color: 'from-green-500 to-emerald-500' },
    { id: 'fengshui', name: '风水', icon: '🧭', color: 'from-purple-500 to-pink-500' },
    { id: 'business', name: '商业', icon: '🔮', color: 'from-amber-500 to-orange-500' },
  ]

  useEffect(() => {
    fetchPosts()
    fetchPopularTags()
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
      
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPopularTags() {
    try {
      const res = await fetch('/api/posts?tags=popular')
      const data = await res.json()
      setPopularTags(data.tags || ['React', 'TypeScript', 'Next.js', 'Redis', '性能优化'])
    } catch (error) {
      console.error('Failed to fetch popular tags:', error)
      setPopularTags(['React', 'TypeScript', 'Next.js', 'Redis', '性能优化'])
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="px-4 py-12 max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 bg-clip-text text-transparent">
            📝 博客文章
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          记录技术成长，分享实战经验
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
            !selectedCategory
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span>📚</span>
          <span>全部</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
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

      {/* 热门标签云 */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <span className="text-sm text-gray-500 dark:text-gray-400 py-2">热门标签：</span>
        {popularTags.map((tag, index) => (
          <Link
            key={tag}
            href={`/blog?tag=${tag}`}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* 文章列表 */}
      {loading ? (
        <div className="space-y-6">
          <SkeletonCard count={5} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 内容区域 */}
                  <div className="flex-1">
                    {/* 分类标签 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                        {categories.find(c => c.id === post.category)?.icon} {categories.find(c => c.id === post.category)?.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        · {post.readingTime} 分钟阅读
                      </span>
                    </div>

                    {/* 标题 */}
                    <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {post.title}
                    </h2>

                    {/* 摘要 */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {post.summary}
                    </p>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 作者信息 */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                        {post.author.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {post.author.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        · 👁️ {post.viewCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button
            onClick={() => {}}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            上一页
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
            第 {pagination.page} / {pagination.totalPages} 页
          </span>
          <button
            onClick={() => {}}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            下一页
          </button>
        </div>
      )}

      {/* 统计信息 */}
      <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
        共 {pagination.total} 篇文章
      </div>
    </div>
  )
}
