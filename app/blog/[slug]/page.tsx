import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { getCachedArticle, setCachedArticle } from '@/lib/redis'
import TableOfContents from '@/components/TableOfContents'
import ArticleContent from '@/components/ArticleContent'
import ReadingProgress from '@/components/ReadingProgress'

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

    // 4. 获取相关文章（简化查询）
    const relatedPosts = await prisma.post.findMany({
      where: {
        category: post.category,
        isPublished: true,
        id: { not: post.id },
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        publishedAt: true,
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
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>{new Date(post.publishedAt).toLocaleDateString('zh-CN')}</span>
            <span>·</span>
            <span>{post.readingTime} 分钟阅读</span>
            <span>·</span>
            <span>👁️ {post.viewCount}</span>
          </div>
        </header>
        <TableOfContents />
        <ArticleContent content={post.content} />
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-4">相关文章</h2>
            <ul className="space-y-2">
              {relatedPosts.map((p) => (
                <li key={p.id}>
                  <Link href={`/blog/${p.slug}`} className="text-blue-600 hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  )
}
