import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { getCachedArticle, setCachedArticle, invalidateArticleCache } from '@/lib/redis'

const prisma = new PrismaClient()

interface PageProps {
  params: Promise<{ slug: string }>
}

// 服务端获取文章详情（带 Redis 缓存）
async function getPost(slug: string) {
  try {
    // 1. 先查 Redis 缓存
    const cached = await getCachedArticle(slug)
    if (cached) {
      console.log(`✅ 文章 "${slug}": Redis 缓存命中`)
      
      // 异步增加阅读数
      prisma.post.update({
        where: { id: cached.post.id },
        data: { viewCount: { increment: 1 } },
      }).catch(console.error)
      
      return cached
    }

    // 2. 缓存未命中，查数据库
    console.log(`⏳ 文章 "${slug}": 查询数据库...`)
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
    })

    if (!post || !post.isPublished) {
      return null
    }

    // 增加阅读数（异步，不阻塞渲染）
    prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error)

    // 获取相关文章（同分类）
    const relatedPosts = await prisma.post.findMany({
      where: {
        AND: [
          { id: { not: post.id } },
          { category: post.category },
          { isPublished: true },
        ],
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        publishedAt: true,
        readingTime: true,
      },
    })

    const data = { post, relatedPosts }

    // 3. 写入 Redis 缓存（5 分钟）
    await setCachedArticle(slug, data)
    console.log(`✅ 文章 "${slug}": 已缓存到 Redis`)

    return data
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

// 生成页面元数据
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const data = await getPost(slug)
  
  if (!data) {
    return {
      title: '文章未找到',
    }
  }

  const { post } = data
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.summary,
    keywords: post.keywords.join(', '),
  }
}

// 格式化日期
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 分类映射
const categories: Record<string, { name: string; icon: string }> = {
  tech: { name: '技术', icon: '💻' },
  finance: { name: '金融', icon: '📈' },
  fengshui: { name: '风水', icon: '🧭' },
  business: { name: '商业', icon: '🔮' },
}

// 服务端渲染文章详情页
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getPost(slug)

  if (!data) {
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

  const { post, relatedPosts } = data
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
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
            {category.icon} {category.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(post.publishedAt)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            · ⏱️ {post.readingTime} 分钟阅读
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

        {/* 文章内容 - Markdown 渲染 */}
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
                  ⏱️ {related.readingTime} 分钟阅读
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
