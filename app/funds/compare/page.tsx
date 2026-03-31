'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'


export const metadata = {
  title: 'Compare | starLog',
  description: 'Compare 页面 - starLog 个人知识库',
  robots: {
    index: true,
    follow: true,
  },
}


interface Fund {
  code: string
  name: string
  type: string
  netValue: number
  change: number
  changePercent: number
  updateTime: string
}

export default function FundComparePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedFunds, setSelectedFunds] = useState<string[]>([])
  const [fundData, setFundData] = useState<Fund[]>([])
  const [historyData, setHistoryData] = useState<{[key: string]: any[]}>({})
  const [loading, setLoading] = useState(false)
  const [popularFunds, setPopularFunds] = useState<Fund[]>([])

  // 从 URL 参数加载预设的对比基金
  useEffect(() => {
    const codesParam = searchParams.get('codes')
    if (codesParam) {
      const codes = codesParam.split(',').filter(Boolean)
      if (codes.length > 0) {
        setSelectedFunds(codes)
        setTimeout(() => loadCompareData(codes), 500)
      }
    }
  }, [searchParams])

  // 加载热门基金列表（使用 Next.js 代理）
  useEffect(() => {
    fetch('/api/funds/list?fund_type=all&limit=20')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.funds) {
          setPopularFunds(data.funds.slice(0, 15))
        }
      })
      .catch(err => console.error('加载基金列表失败:', err))
  }, [])

  const toggleFund = (code: string) => {
    if (selectedFunds.includes(code)) {
      setSelectedFunds(selectedFunds.filter(c => c !== code))
    } else {
      if (selectedFunds.length >= 5) {
        alert('最多只能对比 5 只基金')
        return
      }
      setSelectedFunds([...selectedFunds, code])
    }
  }

  const loadCompareData = async (overrideSelectedFunds?: string[]) => {
    const fundsToCompare = overrideSelectedFunds || selectedFunds
    
    if (fundsToCompare.length < 2) {
      alert('请至少选择 2 只基金进行对比')
      return
    }

    setLoading(true)
    try {
      // 获取历史数据（使用 Next.js 代理）
      const promises = fundsToCompare.map(async (code) => {
        const res = await fetch(`/api/funds/${code}/history?page=1&size=30`)
        const data = await res.json()
        return { code, history: data.data || [] }
      })

      const results = await Promise.all(promises)
      const historyMap: {[key: string]: any[]} = {}
      results.forEach(({ code, history }) => {
        historyMap[code] = history
      })
      setHistoryData(historyMap)

      // 获取基金基本信息（从 API，使用 Next.js 代理）
      const fundsPromises = fundsToCompare.map(async (code) => {
        const res = await fetch(`/api/funds/${code}`)
        const data = await res.json()
        return data.success ? data : null
      })

      const fundsResults = await Promise.all(fundsPromises)
      const fundsData = fundsResults
        .filter(f => f !== null)
        .map(f => ({
          code: f.code,
          name: f.name,
          type: f.type || '混合型',
          netValue: f.netValue || 0,
          change: f.change || 0,
          changePercent: f.changePercent || 0,
          updateTime: f.updateTime
        }))
      
      setFundData(fundsData)
    } catch (error) {
      console.error('加载对比数据失败:', error)
      alert('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFunds([])
    setFundData([])
    setHistoryData({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/funds" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回基金列表
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          📊 基金对比
        </h1>

        {/* 基金选择区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            选择基金（最多 5 只）
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {popularFunds.map((fund) => (
              <div
                key={fund.code}
                onClick={() => toggleFund(fund.code)}
                className={`p-4 sm:p-5 rounded-lg border-2 cursor-pointer transition-all min-h-[44px] ${
                  selectedFunds.includes(fund.code)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{fund.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fund.code}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedFunds.includes(fund.code)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedFunds.includes(fund.code) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    {fund.type}
                  </span>
                  <span className={`text-sm font-medium ${
                    (fund.changePercent || 0) >= 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {(fund.changePercent || 0) >= 0 ? '+' : ''}{(fund.changePercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => loadCompareData()}
              disabled={selectedFunds.length < 2 || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '加载中...' : `开始对比 (${selectedFunds.length}只)`}
            </button>
            <button
              onClick={clearSelection}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              清空选择
            </button>
          </div>
        </div>

        {/* 对比结果 */}
        {fundData.length > 0 && (
          <>
            {/* 关键指标对比 - 桌面端表格，移动端卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📈 关键指标对比
              </h2>
              
              {/* 桌面端：表格布局 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">指标</th>
                      {fundData.map((fund) => (
                        <th key={fund.code} className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {fund.name}
                          <p className="text-xs text-gray-500 dark:text-gray-400">{fund.code}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">单位净值</td>
                      {fundData.map((fund) => (
                        <td key={fund.code} className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white font-medium">
                          {fund.netValue > 0 ? fund.netValue.toFixed(4) : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">日涨跌</td>
                      {fundData.map((fund) => (
                        <td key={fund.code} className={`px-4 py-3 text-center text-sm font-medium ${
                          (fund.changePercent || 0) > 0 ? 'text-red-500' : 
                          (fund.changePercent || 0) < 0 ? 'text-green-500' : 'text-gray-400'
                        }`}>
                          {(fund.changePercent || 0) !== 0 ? (
                            <>{(fund.changePercent || 0) > 0 ? '↑' : '↓'} {Math.abs(fund.changePercent || 0).toFixed(2)}%</>)
                          : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">基金类型</td>
                      {fundData.map((fund) => (
                        <td key={fund.code} className="px-4 py-3 text-center">
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {fund.type}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">更新时间</td>
                      {fundData.map((fund) => (
                        <td key={fund.code} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          {fund.updateTime || '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 移动端：卡片布局 */}
              <div className="md:hidden space-y-4">
                {fundData.map((fund) => (
                  <div
                    key={fund.code}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{fund.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{fund.code}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {fund.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-gray-800 rounded p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">单位净值</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {fund.netValue > 0 ? fund.netValue.toFixed(4) : '-'}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">日涨跌</p>
                        <p className={`text-lg font-bold ${
                          (fund.changePercent || 0) > 0 ? 'text-red-500' : 
                          (fund.changePercent || 0) < 0 ? 'text-green-500' : 'text-gray-400'
                        }`}>
                          {(fund.changePercent || 0) !== 0 ? (
                            <>{(fund.changePercent || 0) > 0 ? '↑' : '↓'} {Math.abs(fund.changePercent || 0).toFixed(2)}%</>)
                          : (
                            <span className="text-gray-400">--</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {fund.updateTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                        更新于 {fund.updateTime}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 历史业绩对比图 */}
            {Object.keys(historyData).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  📊 近 30 日业绩走势对比
                </h2>
                <div className="h-64 flex items-end gap-2">
                  {Object.entries(historyData).map(([code, history]) => {
                    const latestPoint = history[0]
                    const oldestPoint = history[history.length - 1]
                    // 修复：使用正确的字段名（API 返回 unitValue 或 value 或 netValue）
                    const latestValue = latestPoint?.unitValue || latestPoint?.value || latestPoint?.netValue || 0
                    const oldestValue = oldestPoint?.unitValue || oldestPoint?.value || oldestPoint?.netValue || 0
                    const growth = latestValue && oldestValue 
                      ? (((latestValue - oldestValue) / oldestValue) * 100).toFixed(2)
                      : '0.00'
                    
                    return (
                      <div key={code} className="flex-1 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {popularFunds.find(f => f.code === code)?.name || code}
                        </div>
                        <div className={`text-lg font-bold ${
                          parseFloat(growth as string) > 0 ? 'text-red-500' : 
                          parseFloat(growth as string) < 0 ? 'text-green-500' : 'text-gray-400'
                        }`}>
                          {growth}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          近 30 日涨幅
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
