import { NextResponse } from 'next/server'

// 使用环境变量配置 API 地址，生产环境使用相对路径通过 Next.js 代理
const FINANCE_API_URL = process.env.FINANCE_API_URL || 'http://localhost:8081'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }
    
    // 调用金融 API 获取股票数据
    const res = await fetch(`${FINANCE_API_URL}/api/stocks/popular`)
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
