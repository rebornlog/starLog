import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    
    const postsDir = path.join(process.cwd(), 'blog', 'posts')
    
    // 读取所有 MDX 文件
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'))
    
    const posts: any[] = []
    
    for (const file of files) {
      const slug = file.replace('.mdx', '')
      const filePath = path.join(postsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContent)
      
      // 简单分类过滤
      if (category && data.category !== category) {
        continue
      }
      
      // 从内容中提取标题（第一个 # 标题）
      let title = data.title || slug
      const titleMatch = content.match(/^#\s+(.+)$/m)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }
      
      // 估算阅读时间（约 200 字/分钟）
      const wordCount = content.split(/\s+/).length
      const readingTimeMinutes = Math.ceil(wordCount / 200)
      
      // 从内容中提取摘要
      let summary = data.summary || data.description || ''
      if (!summary) {
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('>'))
        summary = lines.slice(0, 3).join(' ').slice(0, 200) + '...'
      }
      
      posts.push({
        id: slug,
        slug: slug,
        title: title,
        summary: summary,
        category: data.category || 'tech',
        tags: data.tags || [],
        publishedAt: data.date || data.publishedAt || new Date().toISOString(),
        readingTime: readingTimeMinutes,
        viewCount: data.viewCount || Math.floor(Math.random() * 100),
        author: {
          id: '1',
          name: '老柱子',
          avatar: null
        }
      })
    }
    
    // 按日期排序
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    // 分页
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedPosts = posts.slice(start, end)
    
    return NextResponse.json({
      posts: paginatedPosts,
      total: posts.length,
      page: page,
      limit: limit
    })
  } catch (error) {
    console.error('Posts API Error:', error)
    return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 })
  }
}
