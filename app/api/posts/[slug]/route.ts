import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  try {
    // 获取文章详情
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

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 增加阅读数
    await prisma.post.update({
      where: { id: post.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

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
      orderBy: {
        publishedAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        publishedAt: true,
        readingTime: true,
      },
    })

    return NextResponse.json({
      post,
      relatedPosts,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
