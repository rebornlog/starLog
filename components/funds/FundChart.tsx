'use client'

import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts'

interface HistoryData {
  date: string
  netValue: number
  accNetValue: number
  change: number
  changePercent: number
}

interface FundChartProps {
  data: HistoryData[]
  height?: number
  showVolume?: boolean
}

export default function FundChart({ data, height = 300, showVolume = false }: FundChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Line'>>()

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(192, 196, 204, 0.2)' },
        horzLines: { color: 'rgba(192, 196, 204, 0.2)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(192, 196, 204, 0.4)',
      },
      timeScale: {
        borderColor: 'rgba(192, 196, 204, 0.4)',
        timeVisible: false,
        dateFormat: 'MM-dd',
      },
    })

    chartRef.current = chart

    // 准备数据
    const chartData = data
      .slice()
      .reverse()
      .map(item => {
        // 转换日期为时间戳（毫秒）
        const timestamp = new Date(item.date).getTime() / 1000
        return {
          time: timestamp as Time,
          value: item.netValue,
        }
      })

    // 创建线系列
    const lineSeries = chart.addLineSeries({
      color: '#3B82F6',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    })

    seriesRef.current = lineSeries
    lineSeries.setData(chartData)

    // 自适应大小
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, height])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500 dark:text-gray-400">暂无历史数据</p>
      </div>
    )
  }

  return <div ref={chartContainerRef} className="w-full" />
}
