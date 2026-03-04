// app/api/finance/market/route.ts - 市场概览 API

import { NextRequest, NextResponse } from 'next/server'

const FINANCE_SERVICE_URL = process.env.FINANCE_SERVICE_URL || 'http://localhost:8000'

export async function GET() {
  try {
    // 调用 Python 金融服务获取市场概览
    const res = await fetch(`${FINANCE_SERVICE_URL}/market/overview`, {
      next: { revalidate: 120 }, // 2 分钟缓存
    })
    
    if (!res.ok) {
      return NextResponse.json(
        { error: '获取市场数据失败' },
        { status: res.status }
      )
    }
    
    const data = await res.json()
    
    return NextResponse.json({
      indices: data,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('获取市场数据失败:', error)
    return NextResponse.json(
      { error: '获取市场数据失败' },
      { status: 500 }
    )
  }
}
