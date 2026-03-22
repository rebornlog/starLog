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
    // 确保容器已渲染且有数据
    if (!chartContainerRef.current || data.length === 0) return

    // 延迟初始化，确保容器尺寸已确定
    const timer = setTimeout(() => {
      if (!chartRef.current) {
        initChart()
      } else if (candleSeriesRef.current) {
        candleSeriesRef.current.setData(data)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [data])

  async function fetchChartData() {
    setLoading(true)
    try {
      // 映射 timeframe 到 API 参数
      const periodMap = {
        '1D': 'day',
        '1W': 'week',
        '1M': 'month',
        '3M': 'month',
        '1Y': 'month'
      }
      const period = periodMap[timeframe] || 'day'
      
      // 调用真实 K 线 API
      const res = await fetch(`/api/stocks/${code}/kline?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch kline data')
      
      const result = await res.json()
      
      if (result.success && result.klines && result.klines.length > 0) {
        // 转换 API 数据格式
        const chartData: CandleData[] = result.klines.map((k: any) => ({
          time: k.time,
          open: k.open,
          high: k.high,
          low: k.low,
          close: k.close
        }))
        setData(chartData)
        console.log(`✅ K 线数据加载成功：${chartData.length}条，数据源：${result.source}`)
      } else {
        // API 返回失败时使用模拟数据
        console.warn('⚠️ K 线 API 返回数据为空，使用模拟数据')
        setData(generateMockCandleData(code, timeframe))
      }
    } catch (error) {
      console.error('❌ K 线数据加载失败:', error)
      // 出错时使用模拟数据
      setData(generateMockCandleData(code, timeframe))
    } finally {
      setLoading(false)
    }
  }

  function generateMockCandleData(code: string, timeframe: string): CandleData[] {
    // 生成模拟 K 线数据（备用方案）
    const data: CandleData[] = []
    const now = Date.now()
    const intervals = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365
    
    let basePrice = 10 + Math.random() * 100
    
    for (let i = intervals; i >= 0; i--) {
      const time = now - i * (timeframe === '1D' ? 3600000 : 86400000)
      const change = (Math.random() - 0.5) * 5
      const open = basePrice
      const close = basePrice + change
      const high = Math.max(open, close) + Math.random() * 2
      const low = Math.min(open, close) - Math.random() * 2
      
      data.push({
        time: Math.floor(time / 1000),
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
      })
      
      basePrice = close
    }
    
    return data
  }

  function initChart() {
    try {
      if (!chartContainerRef.current) {
        console.error('❌ Chart container not found')
        return
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No data to display')
        return
      }

      // 销毁旧图表（如果有）
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        candleSeriesRef.current = null
      }

      // 获取容器尺寸
      const width = chartContainerRef.current.clientWidth || 800
      const height = chartContainerRef.current.clientHeight || 400

      // 创建图表
      const chart: IChartApi = createChart(chartContainerRef.current, {
        width: width,
        height: height,
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
          fixLeftEdge: true,
          fixRightEdge: true,
        },
        rightPriceScale: {
          autoScale: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
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

      console.log(`✅ K 线图初始化成功，${data.length}条数据`)

      // 响应式调整
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0 && chartRef.current) {
          chartRef.current.applyOptions({
            width: entries[0].contentRect.width,
          })
        }
      })

      resizeObserver.observe(chartContainerRef.current)
    } catch (error) {
      console.error('❌ 初始化 K 线图失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="text-gray-500 dark:text-gray-400">加载 K 线图中...</div>
      </div>
    )
  }

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-96 overflow-hidden"
      style={{ minHeight: '400px', position: 'relative' }}
    />
  )
}
