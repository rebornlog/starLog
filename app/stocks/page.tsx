'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stock {
  code: string
  name: string
  price?: number
  change?: number
  changePercent?: number
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchStocks()
    loadFavorites()
  }, [])

  async function fetchStocks() {
    try {
      const res = await fetch('/api/stocks/popular')
      const data = await res.json()
      setStocks(data)
    } catch (error) {
      console.error('Failed to fetch stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  function loadFavorites() {
    const favs = JSON.parse(localStorage.getItem('stockFavorites') || '[]')
    setFavorites(favs)
  }

  // 搜索和排序
  const filteredStocks = stocks
    .filter(stock => 
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.code.includes(searchQuery)
    )
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'zh-CN')
          break
        case 'price':
          comparison = (a.price || 0) - (b.price || 0)
          break
        case 'change':
          comparison = (a.changePercent || 0) - (b.changePercent || 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📈 股票行情</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">实时行情数据 · 每 60 秒更新</p>

        {/* 搜索和排序 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="搜索股票名称或代码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="name">按名称</option>
            <option value="price">按价格</option>
            <option value="change">按涨跌幅</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* 自选股 */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⭐ 我的自选</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks
                .filter((s) => favorites.includes(s.code))
                .map((stock) => (
                  <StockCard key={stock.code} stock={stock} isFavorite={true} />
                ))}
            </div>
          </div>
        )}

        {/* 全部股票 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🔥 全部热门</h2>
            <span className="text-sm text-gray-500">{filteredStocks.length} 只股票</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stock) => (
              <StockCard key={stock.code} stock={stock} isFavorite={favorites.includes(stock.code)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StockCard({ stock, isFavorite }: { stock: Stock; isFavorite: boolean }) {
  return (
    <Link
      href={`/stocks/${stock.code}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{stock.name}</h3>
          <p className="text-sm text-gray-500">{stock.code}</p>
        </div>
        {isFavorite && <span className="text-yellow-500">⭐</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        ¥{stock.price?.toFixed(2) || '---'}
      </div>
      <div className={`text-sm font-bold ${stock.change && stock.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
        {stock.change && stock.change >= 0 ? '↑' : '↓'} {stock.change?.toFixed(2) || '---'} ({stock.changePercent?.toFixed(2) || '---'}%)
      </div>
    </Link>
  )
}
