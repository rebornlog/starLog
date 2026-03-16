'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  SectorIcon, BankIcon, TechIcon, ConsumerIcon, 
  MedicineIcon, EnergyIcon, ManufacturingIcon 
} from '@/components/icons'

interface Stock {
  code: string
  name: string
  price?: number
  change?: number
  changePercent?: number
  sector?: string // 板块
}

// 股票板块定义
const SECTORS = [
  { id: 'all', name: '全部', icon: SectorIcon },
  { id: 'finance', name: '金融', icon: BankIcon },
  { id: 'tech', name: '科技', icon: TechIcon },
  { id: 'consumer', name: '消费', icon: ConsumerIcon },
  { id: 'medicine', name: '医药', icon: MedicineIcon },
  { id: 'energy', name: '能源', icon: EnergyIcon },
  { id: 'manufacturing', name: '制造', icon: ManufacturingIcon },
]

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchStocks()
    loadFavorites()
    
    // 每 60 秒自动更新
    const interval = setInterval(() => {
      fetchStocks()
      setLastUpdate(new Date())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  async function fetchStocks() {
    try {
      const res = await fetch('/api/stocks/popular')
      const data = await res.json()
      setStocks(data)
      setLastUpdate(new Date())
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

  // 股票板块映射（根据股票代码或名称）
  function getStockSector(stock: Stock): string {
    const code = stock.code
    const name = stock.name
    
    // 金融板块
    if (code.startsWith('601') || code.startsWith('600036') || code.startsWith('600016') || 
        code.startsWith('601398') || code.startsWith('601288') || name.includes('银行') || 
        name.includes('保险') || name.includes('证券')) {
      return 'finance'
    }
    // 科技板块
    if (code.startsWith('002') || code.startsWith('300') || name.includes('科技') || 
        name.includes('电子') || name.includes('信息') || name.includes('软件')) {
      return 'tech'
    }
    // 消费板块
    if (name.includes('食品') || name.includes('饮料') || name.includes('酒') || 
        name.includes('零售') || name.includes('旅游') || code.startsWith('600887') || 
        code.startsWith('000858') || code.startsWith('000568')) {
      return 'consumer'
    }
    // 医药板块
    if (name.includes('药') || name.includes('医疗') || name.includes('生物') || 
        code.startsWith('600276') || code.startsWith('000538')) {
      return 'medicine'
    }
    // 能源板块
    if (name.includes('石油') || name.includes('石化') || name.includes('能源') || 
        name.includes('电力') || code.startsWith('601857') || code.startsWith('600028')) {
      return 'energy'
    }
    // 制造板块
    if (name.includes('制造') || name.includes('机械') || name.includes('汽车') || 
        name.includes('重工') || code.startsWith('600104') || code.startsWith('000338')) {
      return 'manufacturing'
    }
    
    return 'other' // 其他
  }

  // 搜索、板块筛选和排序
  const filteredStocks = stocks
    .map(stock => ({ ...stock, sector: getStockSector(stock) })) // 添加板块信息
    .filter(stock => {
      // 板块筛选
      if (selectedSector !== 'all' && stock.sector !== selectedSector) {
        return false
      }
      // 搜索筛选
      return (
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.code.includes(searchQuery)
      )
    })
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
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          实时行情数据 · 最后更新：{lastUpdate.toLocaleTimeString('zh-CN')}
        </p>

        {/* 板块筛选 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SECTORS.map((sector) => {
            const IconComponent = sector.icon
            return (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedSector === sector.id
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{sector.name}</span>
                {sector.id !== 'all' && (
                  <span className="text-xs opacity-75">
                    ({filteredStocks.filter(s => s.sector === sector.id).length})
                  </span>
                )}
              </button>
            )
          })}
        </div>

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
            {filteredStocks.map((stock, index) => (
              <StockCard 
                key={stock.code} 
                stock={stock} 
                isFavorite={favorites.includes(stock.code)}
                isHot={index < 5}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StockCard({ stock, isFavorite, isHot }: { stock: Stock; isFavorite: boolean; isHot?: boolean }) {
  return (
    <Link
      href={`/stocks/${stock.code}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:-translate-y-1 relative"
    >
      {/* 热门标记 */}
      {isHot && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          🔥 热门
        </span>
      )}
      
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
