import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []
    
    if (ids.length === 0) {
      return NextResponse.json({ posts: [] })
    }

    const posts = await prisma.post.findMany({
      where: {
        id: { in: ids },
        isPublished: true,
      },
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

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch favorites:', error)
    return NextResponse.json({ posts: [] }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
