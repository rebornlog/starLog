'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import StockChart from '@/components/StockChart'
import TechnicalIndicators from '@/components/TechnicalIndicators'
import { useToast } from '@/components/Toast'

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

export default function StockDetailPage() {
  const params = useParams()
  const code = params.code as string
  const { showToast } = useToast()
  
  const [stock, setStock] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D')

  useEffect(() => {
    fetchStockData()
    checkFavorite()
  }, [code])

  async function fetchStockData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/stocks/${code}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setStock(data)
    } catch (error) {
      console.error('Failed to fetch stock data:', error)
      showToast('获取股票数据失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  function checkFavorite() {
    const favorites = JSON.parse(localStorage.getItem('stockFavorites') || '[]')
    setIsFavorite(favorites.includes(code))
  }

  function toggleFavorite() {
    const favorites = JSON.parse(localStorage.getItem('stockFavorites') || '[]')
    if (isFavorite) {
      const updated = favorites.filter((c: string) => c !== code)
      localStorage.setItem('stockFavorites', JSON.stringify(updated))
      showToast('已取消自选', 'info')
    } else {
      favorites.push(code)
      localStorage.setItem('stockFavorites', JSON.stringify(favorites))
      showToast('已添加到自选 ⭐', 'success')
    }
    setIsFavorite(!isFavorite)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">股票未找到</h1>
          <Link href="/stocks" className="text-blue-600 hover:underline">返回股票列表 →</Link>
        </div>
      </div>
    )
  }

  const isUp = stock.change >= 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/stocks" className="text-blue-600 hover:underline mb-2 inline-block">
              ← 返回股票列表
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {stock.name} ({stock.code})
            </h1>
          </div>
          <button
            onClick={toggleFavorite}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              isFavorite
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            }`}
          >
            {isFavorite ? '⭐ 已自选' : '☆ 加自选'}
          </button>
        </div>

        {/* 价格卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                ¥{stock.price.toFixed(2)}
              </div>
              <div className={`text-2xl font-bold ${isUp ? 'text-red-500' : 'text-green-500'}`}>
                {isUp ? '↑' : '↓'} {Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
              </div>
            </div>
            <div className="text-right text-gray-500 dark:text-gray-400">
              <div>今开：¥{stock.open.toFixed(2)}</div>
              <div>最高：¥{stock.high.toFixed(2)}</div>
              <div>最低：¥{stock.low.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* K 线图 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">📊 K 线图</h2>
            <div className="flex gap-2">
              {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <StockChart code={code} timeframe={timeframe} />
        </div>

        {/* 技术指标 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 技术指标</h2>
          <TechnicalIndicators code={code} />
        </div>

        {/* 温馨提示 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            ⚠️ 股市有风险，投资需谨慎。数据仅供参考，不构成投资建议。
          </p>
        </div>
      </div>
    </div>
  )
}
