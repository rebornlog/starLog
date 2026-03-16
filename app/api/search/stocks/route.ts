import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }
    
    // 调用金融 API 获取股票数据
    const res = await fetch('http://localhost:8081/api/stocks/popular')
    const stocks = await res.json()
    
    // 搜索匹配（代码或名称）
    const queryLower = query.toLowerCase()
    const results = stocks
      .filter((stock: any) => 
        stock.code.includes(query) || 
        stock.name.toLowerCase().includes(queryLower) ||
        stock.name.includes(query)
      )
      .slice(0, 10)
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search stocks error:', error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
