import { NextRequest, NextResponse } from 'next/server'
import { getCache, setCache } from '@/lib/redis'

interface StockData {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  turnover: number
  timestamp: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  
  try {
    // 尝试从缓存获取
    const cached = await getCache<StockData>(`stock:${code}`)
    if (cached) {
      return NextResponse.json(cached)
    }

    // 从金融 API 获取
    const apiUrl = `${process.env.FINANCE_SERVICE_URL || 'http://localhost:8081'}/stocks/${code}`
    const res = await fetch(apiUrl, { timeout: 5000 })
    
    if (!res.ok) {
      throw new Error(`Stock API error: ${res.status}`)
    }

    const data = await res.json()
    
    // 缓存 60 秒
    await setCache({ key: `stock:${code}`, ttl: 60 }, data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Failed to fetch stock ${code}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}
