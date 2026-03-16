import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (!query.trim()) {
      return NextResponse.json({ posts: [], stocks: [] })
    }
    
    // 并行执行文章和股票搜索
    const [postsRes, stocksRes] = await Promise.all([
      fetch(new URL(`/api/search/posts?q=${encodeURIComponent(query)}`, request.url)),
      fetch(new URL(`/api/search/stocks?q=${encodeURIComponent(query)}`, request.url))
    ])
    
    const postsData = await postsRes.json()
    const stocksData = await stocksRes.json()
    
    return NextResponse.json({
      posts: postsData.results || [],
      stocks: stocksData.results || []
    })
  } catch (error) {
    console.error('Unified search error:', error)
    return NextResponse.json({ posts: [], stocks: [] }, { status: 500 })
  }
}
