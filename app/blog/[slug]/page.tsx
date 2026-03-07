'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  viewCount: number
  likeCount: number
  metaDesc: string
  author: {
    id: string
    name: string
    avatar: string | null
    bio: string | null
  }
}

interface RelatedPost {
  id: string
  slug: string
  title: string
  summary: string
  publishedAt: string
  readingTime: number
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug as string || ''
  
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  async function fetchPost() {
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${slug}`)
      const data = await res.json()
      
      if (data.post) {
        setPost(data.post)
        setRelatedPosts(data.relatedPosts || [])
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const categories: Record<string, { name: string; icon: string }> = {
    tech: { name: '技术', icon: '💻' },
    finance: { name: '金融', icon: '📈' },
    fengshui: { name: '风水', icon: '🧭' },
    business: { name: '商业', icon: '🔮' },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📚</div>
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
          <Link href="/blog" className="text-emerald-500 hover:underline">
            返回博客列表 →
          </Link>
        </div>
      </div>
    )
  }

  const category = categories[post.category] || { name: post.category, icon: '📄' }

  return (
    <div className="px-4 py-12 max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline mb-8"
      >
        ← 返回博客列表
      </Link>

      {/* 文章头部 */}
      <article className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
        {/* 分类和元信息 */}
        <div className="flex items-center gap-3 mb-6">
          <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
            {category.icon} {category.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(post.publishedAt)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            · {post.readingTime} 分钟阅读
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            · 👁️ {post.viewCount}
          </span>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        {/* 摘要 */}
        {post.summary && (
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {post.summary}
          </p>
        )}

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 作者信息 */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-lg">
            {post.author.name[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{post.author.name}</p>
            {post.author.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{post.author.bio}</p>
            )}
          </div>
        </div>

        {/* 文章内容 */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
            {post.content}
          </div>
        </div>

        {/* 底部标签 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </article>

      {/* 相关文章 */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-3xl">📖</span>
            相关文章
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white line-clamp-2">
                  {related.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {related.summary}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {related.readingTime} 分钟阅读
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
