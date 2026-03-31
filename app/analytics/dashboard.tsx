'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Users, TrendingUp, Eye, Clock, AlertTriangle } from 'lucide-react'

// Umami API 配置
const UMAMI_API_URL = process.env.NEXT_PUBLIC_UMAMI_API_URL || 'https://umami.starlog.dev'
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || ''

interface UmamiStats {
  pageviews: number
  visitors: number
  bounces: number
  totaltime: number
}

interface UmamiPageStats {
  pathname: string
  pageviews: number
  visitors: number
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UmamiStats | null>(null)
  const [pageStats, setPageStats] = useState<UmamiPageStats[]>([])
  const [error, setError] = useState<string | null>(null)

  // 获取统计数据
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        
        // 获取汇总统计（最近 7 天）
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 7)
        
        const params = new URLSearchParams({
          start: start.toISOString(),
          end: end.toISOString(),
        })
        
        const statsRes = await fetch(
          `${UMAMI_API_URL}/websites/${UMAMI_WEBSITE_ID}/stats?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_UMAMI_API_KEY || ''}`
            }
          }
        )
        
        if (!statsRes.ok) throw new Error('获取统计数据失败')
        const statsData = await statsRes.json()
        setStats(statsData)
        
        // 获取页面统计
        const pagesRes = await fetch(
          `${UMAMI_API_URL}/websites/${UMAMI_WEBSITE_ID}/pages?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_UMAMI_API_KEY || ''}`
            }
          }
        )
        
        if (!pagesRes.ok) throw new Error('获取页面统计失败')
        const pagesData = await pagesRes.json()
        setPageStats(pagesData)
        
        setError(null)
      } catch (err) {
        console.error('获取统计失败:', err)
        setError('无法加载统计数据，请检查 Umami 配置')
      } finally {
        setLoading(false)
      }
    }
    
    if (UMAMI_WEBSITE_ID) {
      fetchStats()
    } else {
      setError('Umami 网站 ID 未配置')
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 业务指标仪表盘</h1>
        <div className="text-sm text-muted-foreground">
          数据周期：最近 7 天
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              错误
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!error && stats && (
        <>
          {/* 核心指标 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总访问量</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pageviews?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  过去 7 天
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">独立访客</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.visitors?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  过去 7 天
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">跳出率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.bounces && stats.pageviews 
                    ? ((stats.bounces / stats.pageviews) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.bounces?.toLocaleString() || 0} 次跳出
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均停留时间</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totaltime && stats.visitors
                    ? Math.round(stats.totaltime / stats.visitors)
                    : 0}s
                </div>
                <p className="text-xs text-muted-foreground">
                  每访客
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 页面排行 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                热门页面 Top 10
              </CardTitle>
              <CardDescription>过去 7 天访问量最高的页面</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageStats.slice(0, 10).map((page, index) => (
                  <div key={page.pathname} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="font-medium">{page.pathname}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {page.pageviews.toLocaleString()} 次浏览
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 基金/股票功能使用统计 */}
          <Card>
            <CardHeader>
              <CardTitle>📈 功能使用统计</CardTitle>
              <CardDescription>核心功能的使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageStats.filter(p => 
                  p.pathname.includes('/funds') || p.pathname.includes('/stocks')
                ).map(page => (
                  <div key={page.pathname} className="flex items-center justify-between">
                    <div className="font-medium">
                      {page.pathname.includes('/funds') ? '💰 基金' : '📊 股票'} 
                      {' - '}
                      {page.pathname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {page.pageviews.toLocaleString()} 次浏览
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
