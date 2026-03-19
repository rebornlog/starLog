'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Fund, FundType, RiskLevel } from '@/types/fund'
import FundCardSkeleton from '@/components/funds/FundCardSkeleton'
import FundListSkeleton from '@/components/FundListSkeleton'

const FUND_TYPES: (FundType | '全部')[] = ['全部', '股票型', '混合型', '债券型', '货币型', 'QDII', '指数型']
const RISK_LEVELS: (RiskLevel | '全部')[] = ['全部', '低', '中低', '中', '中高', '高']

// API 基础 URL - 使用本地 8081 端口（实时数据）
const API_BASE = 'http://localhost:8081'

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [compareList, setCompareList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<FundType | '全部'>('全部')
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | '全部'>('全部')
  const [sortBy, setSortBy] = useState<'code' | 'netValue' | 'changePercent'>('code')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // 获取基金数据
  const [cacheHit, setCacheHit] = useState(false)
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef(0)
  const touchCurrentY = useRef(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const fetchFunds = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/funds/list?fund_type=all&limit=100`)
      
      if (!response.ok) {
        throw new Error('获取基金数据失败')
      }
      
      const result = await response.json()
      
      if (result.success && result.funds) {
        // 转换数据格式，添加风险等级映射
        const formattedFunds = result.funds.map((item: any) => {
          // 根据基金类型映射风险等级
          let riskLevel: RiskLevel = '中'
          const fundType = item.type || '混合型'
          
          if (fundType === '货币型') {
            riskLevel = '低'
          } else if (fundType === '债券型') {
            riskLevel = '中低'
          } else if (fundType === '混合型') {
            riskLevel = '中高'
          } else if (fundType === '股票型' || fundType === '指数型') {
            riskLevel = '高'
          } else if (fundType === 'QDII') {
            riskLevel = '高'
          }
          
          return {
            code: item.code,
            name: item.name,
            type: fundType,
            company: '',
            netValue: item.unitNetValue || 0,  // 修正字段名
            change: item.dailyGrowth || 0,     // 修正字段名
            changePercent: item.dailyGrowth || 0, // 修正字段名
            riskLevel: riskLevel,
            tags: [],
            updateTime: item.date || item.updateTime  // 支持两种字段名
          }
        })
        
        setFunds(formattedFunds)
        setCacheHit(result.cacheHit || false)
        // 优先使用 API 返回的时间戳，否则使用本地时间
        setLastUpdate(result.timestamp ? new Date(result.timestamp).toLocaleTimeString('zh-CN') : new Date().toLocaleTimeString('zh-CN'))
        setError(null)
      } else {
        throw new Error('数据格式错误')
      }
    } catch (err) {
      console.error('获取基金数据失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载和定时刷新
  useEffect(() => {
    fetchFunds()
    
    // 45 分钟自动刷新
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchFunds()
      }
    }, 45 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchFunds, autoRefresh])

  // 下拉刷新功能（移动端）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 只有在页面顶部时才允许下拉刷新
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    } else {
      touchStartY.current = 0
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === 0 || loading) return
    
    touchCurrentY.current = e.touches[0].clientY
    const distance = touchCurrentY.current - touchStartY.current
    
    // 只允许向下拉
    if (distance > 0) {
      e.preventDefault()
      setPulling(true)
      // 限制最大下拉距离
      setPullDistance(Math.min(distance, 150))
    }
  }, [loading])

  const handleTouchEnd = useCallback(() => {
    if (!pulling) return
    
    touchStartY.current = 0
    touchCurrentY.current = 0
    
    // 下拉距离超过 80px 触发刷新
    if (pullDistance > 80) {
      fetchFunds()
    }
    
    setPulling(false)
    setPullDistance(0)
  }, [pulling, pullDistance, fetchFunds])

  // 过滤和排序基金
  const filteredFunds = (() => {
    let result = [...funds]

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(fund => 
        fund.code.toLowerCase().includes(term) ||
        fund.name.toLowerCase().includes(term)
      )
    }

    // 类型过滤
    if (selectedType !== '全部') {
      result = result.filter(fund => fund.type === selectedType)
    }

    // 风险等级过滤
    if (selectedRisk !== '全部') {
      result = result.filter(fund => fund.riskLevel === selectedRisk)
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'code') {
        comparison = a.code.localeCompare(b.code)
      } else if (sortBy === 'netValue') {
        comparison = a.netValue - b.netValue
      } else if (sortBy === 'changePercent') {
        comparison = a.changePercent - b.changePercent
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  })()

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉刷新指示器 */}
      {pulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-blue-500/90 text-white text-sm py-2 transition-all duration-200"
          style={{ height: `${pullDistance}px`, opacity: pullDistance / 150 }}
        >
          {pullDistance > 80 ? (
            <span>🔄 释放刷新</span>
          ) : (
            <span>⬇️ 下拉刷新</span>
          )}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 基金市场
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              实时净值更新
            </span>
            {lastUpdate && (
              <>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600 dark:text-gray-300">
                  最后更新：{lastUpdate}
                </span>
              </>
            )}
            {cacheHit && (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                📦 缓存数据
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                compareMode
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              📊 {compareMode ? '取消对比' : '基金对比'}
            </button>
            {compareMode && compareList.length > 0 && (
              <Link
                href={`/funds/compare?${compareList.map(c => `codes=${c}`).join('&')}`}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                开始对比 ({compareList.length}只)
              </Link>
            )}
          </div>
          <div className="mt-2 flex items-center justify-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              自动刷新（45 分钟）
            </label>
            <button
              onClick={fetchFunds}
              disabled={loading}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {loading ? '🔄 刷新中...' : '🔄 刷新数据'}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl mb-3">😕</div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                数据加载失败
              </h3>
              <p className="text-sm text-red-600 dark:text-red-500 mb-4">
                网络开小差了，请稍后重试
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono">
                {error}
              </p>
              <button
                onClick={fetchFunds}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium min-h-[48px]"
              >
                🔄 点击重试
              </button>
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          {/* 搜索框 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 输入基金代码或名称查询..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-base min-h-[48px]"
            />
          </div>

          {/* 类型筛选 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FUND_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-3 rounded-lg transition-all text-sm sm:text-base min-h-[48px] touch-manipulation ${
                  selectedType === type
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 风险等级筛选 */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">风险等级：</span>
            {RISK_LEVELS.map(risk => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`px-3 py-2 rounded-full text-sm transition-all min-h-[44px] min-w-[44px] ${
                  selectedRisk === risk
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>

          {/* 排序按钮 */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">排序：</span>
            <button
              onClick={() => handleSort('code')}
              className={`px-3 py-1 rounded text-sm ${
                sortBy === 'code' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
              }`}
            >
              代码 {sortBy === 'code' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => handleSort('netValue')}
              className={`px-3 py-1 rounded text-sm ${
                sortBy === 'netValue' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
              }`}
            >
              净值 {sortBy === 'netValue' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => handleSort('changePercent')}
              className={`px-3 py-1 rounded text-sm ${
                sortBy === 'changePercent' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
              }`}
            >
              涨跌幅 {sortBy === 'changePercent' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            共 <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredFunds.length}</span> 只基金
          </p>
          <div className="flex gap-2">
            <Link
              href="/funds/import"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              📥 导入
            </Link>
            <Link
              href="/funds/export"
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              📤 导出
            </Link>
            <Link
              href="/funds/alerts"
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
            >
              🔔 价格提醒
            </Link>
            <Link
              href="/funds/sip-calculator"
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              💰 定投计算器
            </Link>
          </div>
        </div>

        {/* 基金列表 */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && funds.length === 0 ? (
            <>
              <FundListSkeleton />
            </>
          ) : filteredFunds.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-4xl mb-4">😕</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                未找到符合条件的基金
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                试试调整筛选条件或搜索其他关键词
              </p>
            </div>
          ) : (
            filteredFunds.map(fund => (
              <div
                key={fund.code}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all p-5 border border-gray-200 dark:border-gray-700 ${
                  compareMode ? 'cursor-pointer' : ''
                }`}
                onClick={(e) => {
                  if (compareMode) {
                    e.preventDefault()
                    if (compareList.includes(fund.code)) {
                      setCompareList(compareList.filter(c => c !== fund.code))
                    } else {
                      if (compareList.length >= 5) {
                        alert('最多只能对比 5 只基金')
                        return
                      }
                      setCompareList([...compareList, fund.code])
                    }
                  }
                }}
              >
                <Link
                  href={`/funds/${fund.code}`}
                  onClick={(e) => compareMode && e.preventDefault()}
                  className="block"
                >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">
                      {fund.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fund.code}</p>
                  </div>
                  {fund.tags?.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">净值</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ¥{fund.netValue > 0 ? fund.netValue.toFixed(4) : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">涨跌</span>
                    <span className={`text-sm font-semibold ${
                      (fund.changePercent || 0) > 0 ? 'text-red-500' : 
                      (fund.changePercent || 0) < 0 ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {(fund.changePercent || 0) !== 0 ? (
                        <>{(fund.changePercent || 0) > 0 ? '↑' : '↓'} {Math.abs(fund.changePercent || 0).toFixed(2)}%</>
                      ) : (
                        '--'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">类型</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                      {fund.type}
                    </span>
                  </div>
                  {/* 数据更新时间 */}
                  {fund.updateTime && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-400 dark:text-gray-500">更新于</span>
                      <span className={`text-xs ${
                        // 检查是否是今天的数据
                        fund.updateTime.includes(new Date().toISOString().split('T')[0].replace(/-/g, '')) ||
                        fund.updateTime.includes(new Date().toLocaleDateString('zh-CN'))
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-500 dark:text-orange-400'
                      }`}>
                        {fund.updateTime}
                      </span>
                    </div>
                  )}
                </div>
                </Link>
                
                {/* 对比模式复选框 */}
                {compareMode && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (compareList.includes(fund.code)) {
                          setCompareList(compareList.filter(c => c !== fund.code))
                        } else {
                          if (compareList.length >= 5) {
                            alert('最多只能对比 5 只基金')
                            return
                          }
                          setCompareList([...compareList, fund.code])
                        }
                      }}
                      className={`w-full py-2 rounded-lg transition-colors text-sm font-medium ${
                        compareList.includes(fund.code)
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {compareList.includes(fund.code) ? '✓ 已选择' : '+ 添加对比'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
