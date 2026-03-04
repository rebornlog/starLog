// app/api/finance/quote/route.ts - A 股行情 API (调用 Python 服务)

import { NextRequest, NextResponse } from 'next/server'

const FINANCE_SERVICE_URL = process.env.FINANCE_SERVICE_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')
    
    if (!symbol) {
      return NextResponse.json(
        { error: '缺少股票代码参数' },
        { status: 400 }
      )
    }
    
    // 调用 Python 金融服务
    const res = await fetch(
      `${FINANCE_SERVICE_URL}/stock/${symbol}/detail`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 300 }, // 5 分钟缓存
      }
    )
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: '服务不可用' }))
      return NextResponse.json(
        { error: error.detail || '获取股票数据失败' },
        { status: res.status }
      )
    }
    
    const data = await res.json()
    
    return NextResponse.json({
      symbol: data.symbol,
      name: data.name,
      quote: data.quote,
      fundamentals: {
        peRatio: data.pe,
        pbRatio: data.pb,
        totalShares: data.totalShares,
        totalMarketCap: data.totalMarketCap,
      },
      source: '新浪财经 + AkShare',
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('获取股票数据失败:', error)
    return NextResponse.json(
      { error: '获取股票数据失败，请检查 Python 服务是否运行' },
      { status: 500 }
    )
  }
}
