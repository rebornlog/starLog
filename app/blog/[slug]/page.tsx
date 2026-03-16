import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { getCachedArticle, setCachedArticle } from '@/lib/redis'
import TableOfContents from '@/components/TableOfContents'
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
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/blog/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← 返回博客列表
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                <span>{new Date(post.publishedAt).toLocaleDateString('zh-CN')}</span>
                <span>·</span>
                <span>{post.readingTime} 分钟阅读</span>
                <span>·</span>
                <span>👁️ {post.viewCount}</span>
              </div>
            </div>
            {/* 收藏按钮 */}
            <div className="flex-shrink-0">
              <FavoriteButton
                postId={post.id}
                postTitle={post.title}
                postSlug={post.slug}
              />
            </div>
          </div>
        </header>
        <TableOfContents />
        <ArticleContent content={post.content} />
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <span>📖</span> 相关文章
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {p.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
        <WalineComments slug={post.slug} />
      </article>
    </>
  )
}
