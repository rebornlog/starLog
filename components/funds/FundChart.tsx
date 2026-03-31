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
    console.log('FundChart: 渲染，data 长度=', data?.length)
    console.log('FundChart: 第一条数据=', data?.[0])
    
    if (!chartContainerRef.current || !data || data.length === 0) {
      console.log('FundChart: 提前返回（container 或 data 为空）')
      return
    }

    // 只在未初始化时创建图表
    if (!chartRef.current) {
      console.log('FundChart: 创建新图表')
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

      // 创建线系列
      const lineSeries = chart.addLineSeries({
        color: '#3B82F6',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
      })

      seriesRef.current = lineSeries
      console.log('FundChart: 图表创建成功')

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
        console.log('FundChart: 清理图表')
        window.removeEventListener('resize', handleResize)
        if (chartRef.current) {
          chartRef.current.remove()
          chartRef.current = null
        }
      }
    } else {
      console.log('FundChart: 图表已存在，更新数据')
    }

    // 图表已存在，只更新数据
    if (seriesRef.current && data && data.length > 0) {
      try {
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
        console.log('FundChart: 设置数据，第一条=', chartData[0])
        seriesRef.current.setData(chartData)
        console.log('FundChart: 数据设置成功')
      } catch (err) {
        console.error('FundChart: 设置数据失败:', err)
        throw err
      }
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
