// app/api/finance/candles/route.ts - K 线数据 API

import { NextRequest, NextResponse } from 'next/server'

const FINANCE_SERVICE_URL = process.env.FINANCE_SERVICE_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbol = searchParams.get('symbol')
    const period = searchParams.get('period') || 'daily'
    const limit = searchParams.get('limit') || '100'
    
    if (!symbol) {
      return NextResponse.json(
        { error: '缺少股票代码参数' },
        { status: 400 }
      )
    }
    
    // 调用 Python 金融服务获取 K 线数据
    const url = new URL(`${FINANCE_SERVICE_URL}/stock/${symbol}/candles`)
    url.searchParams.set('period', period)
    url.searchParams.set('limit', limit)
    
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 }, // 5 分钟缓存
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: '服务不可用' }))
      return NextResponse.json(
        { error: error.detail || '获取 K 线数据失败' },
        { status: res.status }
      )
    }
    
    const candles = await res.json()
    
    return NextResponse.json({
      symbol,
      period,
      candles,
      source: 'AkShare',
    })
  } catch (error) {
    console.error('获取 K 线数据失败:', error)
    return NextResponse.json(
      { error: '获取 K 线数据失败' },
      { status: 500 }
    )
  }
}
