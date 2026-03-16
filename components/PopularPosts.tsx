import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PopularPostsProps {
  limit?: number
}

interface Post {
  id: string
  slug: string
  title: string
  viewCount: number
  publishedAt: string
}

async function getPopularPosts(limit: number = 10) {
  try {
    console.log('⏳ 热门文章：查询数据库...')
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        publishedAt: true,
      },
    })

    console.log(`✅ 热门文章：获取到 ${posts.length} 篇文章`)
    return posts
  } catch (error) {
    console.error('Error fetching popular posts:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function PopularPosts({ limit = 10 }: PopularPostsProps) {
  const popularPosts = await getPopularPosts(limit)

  if (popularPosts.length === 0) {
    return null
  }

  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔥</span>
            <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200">
              热门文章
            </h3>
          </div>
          
          <div className="space-y-3">
            {popularPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-all"
              >
                {/* 排名标记 */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < 3
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>
                
                {/* 文章信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>👁️ {formatViewCount(post.viewCount)}</span>
                    <span>·</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800 text-center">
            <Link
              href="/blog"
              className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              查看更多文章 →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}

function formatViewCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}
