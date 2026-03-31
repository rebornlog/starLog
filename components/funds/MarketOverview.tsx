'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SimpleLineChart } from '@/components/ui/charts'
import { FadeIn } from '@/components/ui/animations'

interface MarketData {
  date: string
  shanghai: number
  shenzhen: number
}

interface SectorData {
  sector: string
  change: number
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMarketData() {
      try {
        // 获取沪深指数数据（从金融 API）
        const marketRes = await fetch('/api/finance/market/index')
        if (marketRes.ok) {
          const data = await marketRes.json()
          setMarketData(data)
        } else {
          // 降级：使用示例数据
          setMarketData([
            { date: '2026-03-01', shanghai: 3000, shenzhen: 9500 },
            { date: '2026-03-05', shanghai: 3050, shenzhen: 9600 },
            { date: '2026-03-10', shanghai: 3020, shenzhen: 9550 },
            { date: '2026-03-15', shanghai: 3080, shenzhen: 9700 },
            { date: '2026-03-20', shanghai: 3100, shenzhen: 9750 },
            { date: '2026-03-25', shanghai: 3120, shenzhen: 9800 },
            { date: '2026-03-28', shanghai: 3150, shenzhen: 9850 },
          ])
        }

        // 获取板块数据
        const sectorRes = await fetch('/api/finance/sectors')
        if (sectorRes.ok) {
          const data = await sectorRes.json()
          setSectorData(data)
        } else {
          // 降级：使用示例数据
          setSectorData([
            { sector: '科技', change: 2.5 },
            { sector: '金融', change: 1.2 },
            { sector: '医疗', change: -0.8 },
            { sector: '消费', change: 1.8 },
            { sector: '能源', change: -1.5 },
            { sector: '制造', change: 0.5 },
          ])
        }
      } catch (error) {
        console.error('获取市场数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-[300px] bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <FadeIn>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 沪深指数走势 */}
        <Card>
          <CardHeader>
            <CardTitle>📈 沪深指数走势</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={marketData}
              xKey="date"
              yKeys={['shanghai', 'shenzhen']}
              title="上证指数 vs 深证成指"
            />
          </CardContent>
        </Card>

        {/* 板块涨跌幅 */}
        <Card>
          <CardHeader>
            <CardTitle>📊 板块涨跌幅</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={sectorData}
              xKey="sector"
              yKeys={['change']}
              title="行业板块表现"
            />
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  )
}
