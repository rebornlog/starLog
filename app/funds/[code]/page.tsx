'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { funds } from '@/data/funds'
import { FundDetail } from '@/types/fund'
import FundChart from '@/components/funds/FundChart'

export default function FundDetailPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [activeTab, setActiveTab] = useState<'info' | 'performance' | 'holdings'>('info')
  const [historyData, setHistoryData] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fund = useMemo(() => {
    return funds.find(f => f.code === code)
  }, [code])

  // 获取历史净值数据
  useEffect(() => {
    if (activeTab === 'performance' && historyData.length === 0 && !loadingHistory) {
      setLoadingHistory(true)
      fetch(`http://47.79.20.10:8082/api/funds/${code}/history?page=1&size=60`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setHistoryData(data.data)
          }
        })
        .catch(err => console.error('获取历史数据失败:', err))
        .finally(() => setLoadingHistory(false))
    }
  }, [activeTab, code])

  if (!fund) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">😕 基金未找到</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">代码 {code} 对应的基金不存在</p>
          <Link href="/funds" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回基金列表
          </Link>
        </div>
      </div>
    )
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

        {/* 基金基本信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {fund.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{fund.code}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ¥{fund.netValue.toFixed(4)}
              </div>
              <div className={`text-xl font-semibold ${
                fund.changePercent >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {fund.change >= 0 ? '↑' : '↓'} {Math.abs(fund.change).toFixed(4)} ({Math.abs(fund.changePercent).toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              {fund.type}
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              {fund.company}
            </span>
            {fund.manager && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                👨‍ {fund.manager}
              </span>
            )}
            {fund.scale && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                💰 {fund.scale}亿
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm ${
              fund.riskLevel === '低' ? 'bg-green-100 text-green-700' :
              fund.riskLevel === '中低' ? 'bg-lime-100 text-lime-700' :
              fund.riskLevel === '中' ? 'bg-yellow-100 text-yellow-700' :
              fund.riskLevel === '中高' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {fund.riskLevel}风险
            </span>
          </div>

          {fund.tags && (
            <div className="flex flex-wrap gap-2">
              {fund.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 选项卡 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📊 基本信息
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'performance'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📈 历史业绩
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'holdings'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              💼 持仓分布
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">基金类型</p>
                    <p className="text-gray-900 dark:text-white font-medium">{fund.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">基金公司</p>
                    <p className="text-gray-900 dark:text-white font-medium">{fund.company}</p>
                  </div>
                  {fund.manager && (
                    <>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">基金经理</p>
                        <p className="text-gray-900 dark:text-white font-medium">{fund.manager}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">基金规模</p>
                        <p className="text-gray-900 dark:text-white font-medium">{fund.scale ? `${fund.scale}亿` : '-'}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">风险等级</p>
                    <p className="text-gray-900 dark:text-white font-medium">{fund.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">成立日期</p>
                    <p className="text-gray-900 dark:text-white font-medium">{fund.establishDate || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-4">
                {/* 时间范围选择 */}
                <div className="flex gap-2 mb-4">
                  {['1 月', '3 月', '6 月', '1 年', '全部'].map((range) => (
                    <button
                      key={range}
                      className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {range}
                    </button>
                  ))}
                </div>

                {/* 图表区域 */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center" style={{ height: 300 }}>
                      <p className="text-gray-500 dark:text-gray-400">加载中...</p>
                    </div>
                  ) : historyData.length > 0 ? (
                    <>
                      <FundChart data={historyData} height={300} />
                      {/* 数据表格 */}
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">日期</th>
                              <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">单位净值</th>
                              <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">累计净值</th>
                              <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">涨跌幅</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyData.slice(0, 10).map((item, idx) => (
                              <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-4 py-2 text-gray-900 dark:text-white">{item.date}</td>
                                <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{item.netValue.toFixed(4)}</td>
                                <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{item.accNetValue.toFixed(4)}</td>
                                <td className={`px-4 py-2 text-right ${item.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center" style={{ height: 300 }}>
                      <p className="text-gray-500 dark:text-gray-400">暂无历史数据</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'holdings' && (
              <div className="space-y-6">
                {/* 资产配置 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">💼 资产配置</h3>
                  <div className="space-y-2">
                    {[
                      { name: '股票', percent: 85.5, color: 'bg-blue-500' },
                      { name: '债券', percent: 5.2, color: 'bg-green-500' },
                      { name: '现金', percent: 8.3, color: 'bg-yellow-500' },
                      { name: '其他', percent: 1.0, color: 'bg-gray-400' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <span className="w-16 text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className={`${item.color} h-4 rounded-full transition-all`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-sm text-gray-900 dark:text-white">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 前十大持仓 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📊 前十大持仓</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">股票名称</th>
                          <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">代码</th>
                          <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">占比</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: '贵州茅台', code: '600519', percent: 8.5 },
                          { name: '五粮液', code: '000858', percent: 6.2 },
                          { name: '泸州老窖', code: '000568', percent: 5.8 },
                          { name: '山西汾酒', code: '600809', percent: 4.5 },
                          { name: '洋河股份', code: '002304', percent: 3.9 },
                          { name: '古井贡酒', code: '000596', percent: 3.2 },
                          { name: '今世缘', code: '603369', percent: 2.8 },
                          { name: '口子窖', code: '603589', percent: 2.5 },
                          { name: '迎驾贡酒', code: '603198', percent: 2.1 },
                          { name: '老白干酒', code: '600559', percent: 1.8 },
                        ].map((stock, idx) => (
                          <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{stock.name}</td>
                            <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{stock.code}</td>
                            <td className="px-4 py-2 text-right text-gray-900 dark:text-white">{stock.percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    * 持仓数据仅供参考，具体以基金公告为准
                  </p>
                </div>

                {/* 行业分布 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🏭 行业分布</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: '食品饮料', percent: 45.2 },
                      { name: '医药生物', percent: 18.5 },
                      { name: '家用电器', percent: 12.3 },
                      { name: '农林牧渔', percent: 8.7 },
                      { name: '其他', percent: 15.3 },
                    ].map((industry) => (
                      <div key={industry.name} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{industry.name}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{industry.percent}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
            ➕ 加入自选
          </button>
          <button className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium">
            📊 基金对比
          </button>
        </div>
      </div>
    </div>
  )
}
