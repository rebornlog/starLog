'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface CalculationResult {
  month: number
  invested: number
  value: number
  profit: number
  profitRate: number
}

export default function SipCalculatorPage() {
  const [monthlyAmount, setMonthlyAmount] = useState(1000)
  const [years, setYears] = useState(3)
  const [annualRate, setAnnualRate] = useState(8)
  const [results, setResults] = useState<CalculationResult[]>([])

  // 计算定投收益
  const calculate = () => {
    const monthlyRate = annualRate / 100 / 12
    const totalMonths = years * 12
    const newResults: CalculationResult[] = []

    let totalValue = 0
    let totalInvested = 0

    for (let month = 1; month <= totalMonths; month++) {
      totalInvested += monthlyAmount
      totalValue = (totalValue + monthlyAmount) * (1 + monthlyRate)
      
      newResults.push({
        month,
        invested: totalInvested,
        value: totalValue,
        profit: totalValue - totalInvested,
        profitRate: ((totalValue - totalInvested) / totalInvested) * 100
      })
    }

    setResults(newResults)
  }



  // 自动计算
  useEffect(() => {
    calculate()
  }, [monthlyAmount, years, annualRate])

  const finalResult = results[results.length - 1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/funds" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回基金列表
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          💰 定投计算器
        </h1>

        {/* 参数设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            定投参数
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 每月定投金额 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💵 每月定投金额（元）
              </label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="w-full px-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           text-base min-h-[48px]"
                min="100"
                step="100"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setMonthlyAmount(amount)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[44px]"
                  >
                    ¥{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* 定投年限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 定投年限（年）
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full px-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           text-base min-h-[48px]"
                min="1"
                max="30"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 3, 5, 10].map(year => (
                  <button
                    key={year}
                    onClick={() => setYears(year)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[44px]"
                  >
                    {year}年
                  </button>
                ))}
              </div>
            </div>

            {/* 年化收益率 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📈 预期年化收益率（%）
              </label>
              <input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full px-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           text-base min-h-[48px]"
                min="1"
                max="30"
                step="0.5"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 8, 10, 15].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setAnnualRate(rate)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[44px]"
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 参考收益率说明 */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              💡 <strong>参考收益率：</strong>
              <span className="ml-2">货币基金 2-3% · 债券基金 4-6% · 混合基金 8-12% · 股票基金 10-15%</span>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              ⚠️ 历史收益不代表未来表现，投资需谨慎
            </p>
          </div>
        </div>

        {/* 结果汇总 */}
        {finalResult && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">💰 总投入本金</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                ¥{finalResult.invested.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">📊 总资产价值</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                ¥{finalResult.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">💵 累计收益</p>
              <p className={`text-lg sm:text-2xl font-bold ${
                finalResult.profit >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {finalResult.profit >= 0 ? '+' : ''}¥{finalResult.profit.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">📈 收益率</p>
              <p className={`text-lg sm:text-2xl font-bold ${
                finalResult.profitRate >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {finalResult.profitRate >= 0 ? '+' : ''}{finalResult.profitRate.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* 图表展示 - 简化版 CSS 图表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📈 收益走势（简化版）
          </h2>
          <div className="h-64 flex items-end gap-1 border-b border-l border-gray-300 dark:border-gray-600 pb-2">
            {results.filter((_, i) => i % Math.ceil(results.length / 24) === 0).map((result, idx, arr) => {
              const maxValue = Math.max(...results.map(r => r.value))
              const heightPercent = (result.value / maxValue) * 100
              const investedHeightPercent = (result.invested / maxValue) * 100
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: `${heightPercent}%` }}>
                    <div 
                      className="w-full bg-blue-500/30 rounded-t"
                      style={{ height: `${investedHeightPercent}%` }}
                      title={`本金：¥${result.invested.toFixed(0)}`}
                    />
                    <div 
                      className="w-full bg-blue-500 rounded-b"
                      style={{ height: `calc(100% - ${investedHeightPercent}%)` }}
                      title={`收益：¥${result.profit.toFixed(0)}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/30 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">投入本金</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">累计收益</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            💡 柱状图高度表示总资产，浅色部分为本金，深色部分为收益
          </p>
        </div>

        {/* 详细数据表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📋 详细数据（按年）
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">年份</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">投入本金</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">总资产</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">累计收益</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">收益率</th>
                </tr>
              </thead>
              <tbody>
                {results.filter((_, idx) => (idx + 1) % 12 === 0).map((result, idx) => (
                  <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">第 {idx + 1} 年</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                      ¥{result.invested.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-blue-600 dark:text-blue-400 font-medium">
                      ¥{result.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${
                      result.profit >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {result.profit >= 0 ? '+' : ''}¥{result.profit.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${
                      result.profitRate >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {result.profitRate >= 0 ? '+' : ''}{result.profitRate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 风险提示 */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            ⚠️ <strong>风险提示：</strong>
            <span className="ml-2">
              定投计算器仅供参考，不构成投资建议。基金投资有风险，过往业绩不代表未来表现。
              市场有风险，投资需谨慎。请根据自身风险承受能力理性投资。
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
