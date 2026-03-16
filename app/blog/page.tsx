'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SkeletonCard } from '@/components/Skeleton'
import Breadcrumb from '@/components/Breadcrumb'
import PopularPosts from '@/components/PopularPosts'
import { TechIcon, FinanceIcon, FengshuiIcon, BusinessIcon } from '@/components/icons'

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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  // 阅读数格式化
  function formatViewCount(count: number): string {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}w`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  const categories = [
    { id: 'tech', name: '技术', icon: TechIcon, color: 'from-blue-500 to-cyan-500' },
    { id: 'finance', name: '金融', icon: FinanceIcon, color: 'from-green-500 to-emerald-500' },
    { id: 'fengshui', name: '风水', icon: FengshuiIcon, color: 'from-purple-500 to-pink-500' },
    { id: 'business', name: '商业', icon: BusinessIcon, color: 'from-amber-500 to-orange-500' },
  ]

  // 提取所有标签
  useEffect(() => {
    if (posts.length > 0) {
      const tags = Array.from(new Set(posts.flatMap(post => post.tags)))
      setAllTags(tags.slice(0, 20)) // 限制显示 20 个标签
    }
  }, [posts])

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory, selectedTags])

  async function fetchPosts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...(selectedTags.length > 0 ? { tags: selectedTags.join(',') } : {}),
      })
      
      console.log('Fetching posts with params:', params.toString())
      const res = await fetch(`/api/posts?${params}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      console.log('Posts API response:', data)
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  // 标签切换
  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  function clearTags() {
    setSelectedTags([])
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
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
        <div className="flex flex-wrap justify-center gap-3 mb-6">
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
          {categories.map((cat) => {
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span>🏷️</span> 筛选标签
              </h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearTags}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                >
                  清除已选
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                已选标签：{selectedTags.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* 主要内容区：文章列表 + 热门侧边栏 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 文章列表 */}
          <div className="flex-1">
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
                    
                    {/* 标签显示 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
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
                      <span>👁️ {formatViewCount(post.viewCount)}</span>
                    </div>
                    
                    {/* 作者信息 */}
                    <div className="flex items-center gap-2 mt-2">
                      <Image
                        src="/avatar.jpg"
                        alt="老柱子"
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full bg-gray-200"
                        loading="lazy"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">老柱子</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
            )}
          </div>
          
          {/* 热门侧边栏 */}
          <PopularPosts limit={10} />
        </div>
      </div>
    </main>
  )
}
