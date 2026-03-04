// app/api/documents/route.ts - 文档管理 API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - 获取文档列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit
    
    // 构建查询条件
    const where: any = { isPublished: true }
    
    if (category) {
      where.category = category
    }
    
    if (tag) {
      where.tags = { has: tag }
    }
    
    // 全文搜索
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          category: true,
          viewCount: true,
          createdAt: true,
          publishedAt: true,
        },
      }),
      prisma.document.count({ where }),
    ])
    
    return NextResponse.json({
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取文档列表失败:', error)
    return NextResponse.json(
      { error: '获取文档失败' },
      { status: 500 }
    )
  }
}

// POST - 创建文档
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const document = await prisma.document.create({
      data: {
        title: body.title,
        slug: body.slug,
        summary: body.summary,
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        tags: body.tags || [],
        category: body.category,
        isPublished: body.isPublished ?? false,
        filePath: body.filePath,
        fileSize: body.fileSize,
        fileType: body.fileType,
        metaTitle: body.metaTitle,
        metaDesc: body.metaDesc,
        keywords: body.keywords || [],
      },
    })
    
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('创建文档失败:', error)
    return NextResponse.json(
      { error: '创建文档失败' },
      { status: 500 }
    )
  }
}
