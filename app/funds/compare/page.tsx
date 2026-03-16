'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FundChart from './FundChart'

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
  const [selectedFunds, setSelectedFunds] = useState<string[]>([])
  const [fundData, setFundData] = useState<Fund[]>([])
  const [historyData, setHistoryData] = useState<{[key: string]: any[]}>({})
  const [loading, setLoading] = useState(false)

  // 热门基金列表
  const popularFunds: Fund[] = [
    { code: '005827', name: '易方达蓝筹精选混合', type: '股票型', netValue: 1.8737, change: 1.09, changePercent: 1.09, updateTime: '2026-03-16' },
    { code: '003096', name: '中欧医疗健康混合 C', type: '股票型', netValue: 1.6454, change: 0.88, changePercent: 0.88, updateTime: '2026-03-16' },
    { code: '260108', name: '景顺长城新兴成长混合 A', type: '股票型', netValue: 1.6444, change: 1.07, changePercent: 1.07, updateTime: '2026-03-16' },
    { code: '161725', name: '招商中证白酒指数', type: '指数型', netValue: 0, change: 0, changePercent: 0, updateTime: '' },
    { code: '007119', name: '睿远成长价值混合 A', type: '股票型', netValue: 2.0202, change: 1.95, changePercent: 1.95, updateTime: '2026-03-16' },
    { code: '001938', name: '中欧时代先锋股票 A', type: '股票型', netValue: 2.059, change: -0.41, changePercent: -0.41, updateTime: '2026-03-16' },
    { code: '000171', name: '易方达裕丰回报债券 A', type: '债券型', netValue: 1.9558, change: 0.04, changePercent: 0.04, updateTime: '2026-03-16' },
    { code: '000055', name: '广发纳斯达克 100ETF 联接', type: 'QDII', netValue: 0, change: 0, changePercent: 0, updateTime: '' },
    { code: '510300', name: '华泰柏瑞沪深 300ETF', type: '指数型', netValue: 4.6812, change: 0.05, changePercent: 0.05, updateTime: '2026-03-16' },
    { code: '159915', name: '易方达创业板 ETF', type: '指数型', netValue: 3.3477, change: 1.41, changePercent: 1.41, updateTime: '2026-03-16' },
  ]

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

  const loadCompareData = async () => {
    if (selectedFunds.length < 2) {
      alert('请至少选择 2 只基金进行对比')
      return
    }

    setLoading(true)
    try {
      // 获取历史数据
      const promises = selectedFunds.map(async (code) => {
        const res = await fetch(`http://47.79.20.10:8082/api/funds/${code}/history?page=1&size=30`)
        const data = await res.json()
        return { code, history: data.data || [] }
      })

      const results = await Promise.all(promises)
      const historyMap: {[key: string]: any[]} = {}
      results.forEach(({ code, history }) => {
        historyMap[code] = history
      })
      setHistoryData(historyMap)

      // 获取基金基本信息
      const fundsData = popularFunds.filter(f => selectedFunds.includes(f.code))
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
        {/* 返回按钮 */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {popularFunds.map((fund) => (
              <div
                key={fund.code}
                onClick={() => toggleFund(fund.code)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                    fund.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {fund.changePercent >= 0 ? '+' : ''}{fund.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={loadCompareData}
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
            {/* 关键指标对比表 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📈 关键指标对比
              </h2>
              <div className="overflow-x-auto">
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
                          fund.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {fund.changePercent > 0 ? '+' : ''}{fund.changePercent.toFixed(2)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">基金类型</td>
                      {fundData.map((fund) => (
                        <td key={fund.code} className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {fund.type}
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
            </div>

            {/* 业绩走势对比图 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📉 近 30 日业绩走势对比
              </h2>
              <div className="space-y-6">
                {fundData.map((fund) => (
                  <div key={fund.code} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {fund.name} ({fund.code})
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      {historyData[fund.code] && historyData[fund.code].length > 0 ? (
                        <FundChart data={historyData[fund.code]} height={200} />
                      ) : (
                        <div className="flex items-center justify-center" style={{ height: 200 }}>
                          <p className="text-gray-500 dark:text-gray-400">暂无历史数据</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
