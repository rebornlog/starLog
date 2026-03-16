'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'

interface StockChartProps {
  code: string
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y'
}

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export default function StockChart({ code, timeframe }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [data, setData] = useState<CandleData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [code, timeframe])

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      initChart()
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [data])

  async function fetchChartData() {
    setLoading(true)
    try {
      // 模拟 K 线数据（实际应从 API 获取）
      const mockData = generateMockCandleData(code, timeframe)
      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  function generateMockCandleData(code: string, timeframe: string): CandleData[] {
    // 生成模拟 K 线数据（实际应调用 API）
    const data: CandleData[] = []
    const now = Date.now()
    const intervals = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365
    
    let basePrice = 100 + Math.random() * 100
    
    for (let i = intervals; i >= 0; i--) {
      const time = now - i * (timeframe === '1D' ? 3600000 : 86400000)
      const change = (Math.random() - 0.5) * 10
      const open = basePrice
      const close = basePrice + change
      const high = Math.max(open, close) + Math.random() * 5
      const low = Math.min(open, close) - Math.random() * 5
      
      data.push({
        time: Math.floor(time / 1000),
        open,
        high,
        low,
        close,
      })
      
      basePrice = close
    }
    
    return data
  }

  function initChart() {
    if (!chartContainerRef.current) return

    // 创建图表
    const chart: IChartApi = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(75, 85, 99, 0.3)' },
        horzLines: { color: 'rgba(75, 85, 99, 0.3)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // 创建 K 线系列 - lightweight-charts 5.x API
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ef4444',
      downColor: '#22c55e',
      borderDownColor: '#22c55e',
      borderUpColor: '#ef4444',
      wickDownColor: '#22c55e',
      wickUpColor: '#ef4444',
    })

    // 设置数据
    candleSeries.setData(data)

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    // 响应式调整
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && chartRef.current) {
        chartRef.current.applyOptions({
          width: entries[0].contentRect.width,
        })
      }
    })

    resizeObserver.observe(chartContainerRef.current)
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="text-gray-500 dark:text-gray-400">加载 K 线图中...</div>
      </div>
    )
  }

  return (
    <div ref={chartContainerRef} className="w-full h-96" />
  )
}
