import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }
    
    const postsDir = path.join(process.cwd(), 'blog', 'posts')
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.mdx'))
    
    const results: any[] = []
    
    for (const file of files) {
      const slug = file.replace('.mdx', '')
      const filePath = path.join(postsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContent)
      
      // 从内容中提取标题
      let title = data.title || slug
      const titleMatch = content.match(/^#\s+(.+)$/m)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }
      
      // 提取摘要
      let summary = data.summary || data.description || ''
      if (!summary) {
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('>'))
        summary = lines.slice(0, 2).join(' ').slice(0, 150) + '...'
      }
      
      // 搜索匹配（标题、摘要、标签）
      const queryLower = query.toLowerCase()
      const titleMatch_search = title.toLowerCase().includes(queryLower)
      const summaryMatch = summary.toLowerCase().includes(queryLower)
      const tagsMatch = (data.tags || []).some((tag: string) => tag.toLowerCase().includes(queryLower))
      const categoryMatch = (data.category || '').toLowerCase().includes(queryLower)
      
      if (titleMatch_search || summaryMatch || tagsMatch || categoryMatch) {
        results.push({
          id: slug,
          slug: slug,
          title: title,
          summary: summary,
          category: data.category || 'tech',
          tags: data.tags || [],
          relevance: titleMatch_search ? 3 : (tagsMatch ? 2 : 1)
        })
      }
    }
    
    // 按相关性排序
    results.sort((a, b) => b.relevance - a.relevance)
    
    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (error) {
    console.error('Search posts error:', error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
