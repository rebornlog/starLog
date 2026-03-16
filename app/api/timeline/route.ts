import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 获取最新文章（作为时间线事件）
    const recentPosts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        publishedAt: true,
        viewCount: true,
      },
    })

    // 转换为时间线格式
    const timelineEvents = recentPosts.map(post => ({
      id: post.id,
      date: new Date(post.publishedAt).toISOString().split('T')[0],
      title: post.title,
      description: post.summary,
      type: 'article',
      category: post.category,
      slug: post.slug,
      viewCount: post.viewCount,
      emoji: getCategoryEmoji(post.category),
    }))

    return NextResponse.json({ events: timelineEvents })
  } catch (error) {
    console.error('Failed to fetch timeline:', error)
    return NextResponse.json({ events: [] }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    tech: '💻',
    finance: '📈',
    fengshui: '🧭',
    business: '🔮',
  }
  return emojis[category] || '📝'
}
