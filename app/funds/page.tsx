'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Fund, FundType, RiskLevel } from '@/types/fund'

const FUND_TYPES: (FundType | '全部')[] = ['全部', '股票型', '混合型', '债券型', '货币型', 'QDII', '指数型']
const RISK_LEVELS: (RiskLevel | '全部')[] = ['全部', '低', '中低', '中', '中高', '高']

// API 基础 URL
const API_BASE = 'http://47.79.20.10:8082'

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
  const fetchFunds = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/funds/list?fund_type=all&limit=100`)
      
      if (!response.ok) {
        throw new Error('获取基金数据失败')
      }
      
      const result = await response.json()
      
      if (result.success && result.funds) {
        // 转换数据格式
        const formattedFunds = result.funds.map((item: any) => ({
          code: item.code,
          name: item.name,
          type: item.type || '混合型',
          company: '',
          netValue: item.netValue || 0,
          change: item.change || 0,
          changePercent: item.changePercent || 0,
          riskLevel: '中' as RiskLevel,
          tags: [],
          updateTime: item.updateTime
        }))
        
        setFunds(formattedFunds)
        setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
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

    // 风险等级过滤（暂时简化）
    if (selectedRisk !== '全部') {
      // TODO: 添加风险等级数据
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 基金市场
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            实时净值更新 {lastUpdate && `· 最后更新：${lastUpdate}`}
          </p>
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
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '刷新中...' : '🔄 刷新'}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchFunds}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              重试
            </button>
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 类型筛选 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FUND_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-all ${
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
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 self-center">风险等级：</span>
            {RISK_LEVELS.map(risk => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
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
              href="/funds/sip-calculator"
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              💰 定投计算器
            </Link>
          </div>
        </div>

        {/* 基金列表 */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && funds.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600 dark:text-gray-400">正在加载基金数据...</p>
            </div>
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
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {fund.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fund.code}</p>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">净值</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ¥{fund.netValue?.toFixed(4) || '0.0000'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">涨跌</span>
                    <span className={`font-semibold ${
                      (fund.changePercent || 0) >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {(fund.change || 0) >= 0 ? '↑' : '↓'} {Math.abs(fund.change || 0).toFixed(4)} ({Math.abs(fund.changePercent || 0).toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">类型</span>
                    <span className="text-gray-900 dark:text-white">{fund.type}</span>
                  </div>
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
