'use client'

import { useState, useEffect } from 'react'

interface TechnicalIndicatorsProps {
  code: string
}

interface IndicatorData {
  ma5: number
  ma10: number
  ma20: number
  macd: {
    value: number
    signal: number
    histogram: number
  }
  rsi: number
  kdj: {
    k: number
    d: number
    j: number
  }
}

export default function TechnicalIndicators({ code }: TechnicalIndicatorsProps) {
  const [indicators, setIndicators] = useState<IndicatorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIndicators()
  }, [code])

  async function fetchIndicators() {
    setLoading(true)
    try {
      // 模拟技术指标数据（实际应从 API 计算）
      const mockData: IndicatorData = {
        ma5: 142.5,
        ma10: 140.2,
        ma20: 138.8,
        macd: {
          value: 2.34,
          signal: 1.89,
          histogram: 0.45,
        },
        rsi: 58.5,
        kdj: {
          k: 65.2,
          d: 60.8,
          j: 73.0,
        },
      }
      setIndicators(mockData)
    } catch (error) {
      console.error('Failed to fetch indicators:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
  }

  if (!indicators) return null

  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { text: '超买', color: 'text-amber-500' }
    if (rsi < 30) return { text: '超卖', color: 'text-green-500' }
    return { text: '中性', color: 'text-gray-500' }
  }

  const getMACDSignal = (histogram: number) => {
    return histogram > 0 
      ? { text: '金叉', color: 'text-amber-500' }
      : { text: '死叉', color: 'text-green-500' }
  }

  const rsiSignal = getRSISignal(indicators.rsi)
  const macdSignal = getMACDSignal(indicators.macd.histogram)

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* 均线 */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">📊 均线</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">MA5:</span>
            <span className="font-bold text-blue-500">¥{indicators.ma5.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">MA10:</span>
            <span className="font-bold text-purple-500">¥{indicators.ma10.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">MA20:</span>
            <span className="font-bold text-orange-500">¥{indicators.ma20.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* MACD */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">📈 MACD</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">DIF:</span>
            <span className="font-bold">¥{indicators.macd.value.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DEA:</span>
            <span className="font-bold">¥{indicators.macd.signal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">信号:</span>
            <span className={`font-bold ${macdSignal.color}`}>{macdSignal.text}</span>
          </div>
        </div>
      </div>

      {/* RSI & KDJ */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">📉 RSI & KDJ</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">RSI:</span>
            <span className={`font-bold ${rsiSignal.color}`}>
              {indicators.rsi.toFixed(1)} ({rsiSignal.text})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">KDJ:</span>
            <span className="font-bold">
              K:{indicators.kdj.k.toFixed(0)} D:{indicators.kdj.d.toFixed(0)} J:{indicators.kdj.j.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
