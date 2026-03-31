import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { getCachedArticle, setCachedArticle } from '@/lib/redis'
import TableOfContents from '@/components/TableOfContents'
import MobileTableOfContentsToggle from '@/components/MobileTableOfContentsToggle'
import ArticleContent from '@/components/ArticleContent'
import ReadingProgress from '@/components/ReadingProgress'
import FavoriteButton from '@/components/FavoriteButton'
import WalineComments from '@/components/WalineComments'

const prisma = new PrismaClient({
  log: ['error'],
})

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
      return cached
    }

    // 2. 缓存未命中，查数据库（优化查询）
    console.log(`⏳ 文章 "${slug}": 查询数据库...`)
    const post = await prisma.post.findUnique({
      where: { slug, isPublished: true },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        content: true,
        coverImage: true,
        category: true,
        tags: true,
        publishedAt: true,
        readingTime: true,
        viewCount: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    if (!post) {
      return null
    }

    // 3. 异步增加阅读数（不阻塞）
    prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error)

    // 4. 获取相关文章（优化算法：同分类 + 同标签 + 阅读量）
    const relatedPosts = await prisma.post.findMany({
      where: {
        isPublished: true,
        id: { not: post.id },
        OR: [
          { category: post.category }, // 同分类
          { tags: { hasSome: post.tags || [] } }, // 同标签
        ],
      },
      take: 3,
      orderBy: [
        { viewCount: 'desc' }, // 按阅读量排序
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        tags: true,
        publishedAt: true,
        readingTime: true,
        viewCount: true,
      },
    })

    const data = { post, relatedPosts }

    // 5. 写入 Redis 缓存（10 分钟）
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

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getPost(slug)

  if (!data) {
    notFound()
  }

  const { post, relatedPosts } = data

  return (
    <>
      <ReadingProgress />
      <MobileTableOfContentsToggle />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* 导航栏 */}
        <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/blog/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← 返回博客列表
            </Link>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 文章主内容 */}
            <div className="lg:col-span-3">
              <article>
                <header className="mb-8">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">{post.title}</h1>
                  <div className="flex items-center gap-3 text-gray-400 flex-wrap text-sm sm:text-base">
                    <span className="whitespace-nowrap">📅 {new Date(post.publishedAt).toLocaleDateString('zh-CN')}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="whitespace-nowrap">⏱️ {post.readingTime} 分钟阅读</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="whitespace-nowrap">👁️ {post.viewCount} 次阅读</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm whitespace-nowrap">
                      {post.category}
                    </span>
                  </div>
                </header>
                <ArticleContent content={post.content} />
              </article>
              {/* 相关文章 */}
              {relatedPosts.length > 0 && (
                <section className="mt-16 pt-8 border-t border-gray-700">
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>📖</span> 相关文章
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/blog/${p.slug}`}
                        className="group block p-6 bg-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-700"
                      >
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">
                          {p.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                          {p.summary}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📅 {new Date(p.publishedAt).toLocaleDateString('zh-CN')}</span>
                          <span>·</span>
                          <span>👁️ {p.viewCount}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* 评论系统 */}
              <section className="mt-16">
                <WalineComments slug={post.slug} />
              </section>
            </div>

            {/* 侧边栏 - 目录导航 */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  )
}
