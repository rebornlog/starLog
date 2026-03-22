'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePriceAlerts, PriceAlert } from '@/hooks/usePriceAlerts'

// 使用 Next.js 代理（自动转发到 8081 端口）
const API_BASE = ''

export default function PriceAlertsPage() {
  const { 
    alerts, 
    isLoaded, 
    addAlert, 
    removeAlert, 
    toggleAlert, 
    clearTriggered,
    clearAll,
    enabledCount,
    triggeredCount
  } = usePriceAlerts()

  const [showAddForm, setShowAddForm] = useState(false)
  const [fundCode, setFundCode] = useState('')
  const [fundName, setFundName] = useState('')
  const [alertType, setAlertType] = useState<'above' | 'below'>('above')
  const [targetPrice, setTargetPrice] = useState('')
  const [loading, setLoading] = useState(true)

  // 获取当前基金价格
  const fetchFundPrice = async (code: string): Promise<number | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/funds/${code}`)
      const data = await res.json()
      if (data.success) {
        return data.unitNetValue || data.netValue || 0
      }
    } catch (error) {
      console.error('获取基金价格失败:', error)
    }
    return null
  }

  // 加载时获取最新价格
  useEffect(() => {
    if (!isLoaded || alerts.length === 0) {
      setLoading(false)
      return
    }

    const updatePrices = async () => {
      for (const alert of alerts) {
        const price = await fetchFundPrice(alert.fundCode)
        if (price) {
          // usePriceAlerts 会自动检查是否触发
        }
      }
      setLoading(false)
    }

    updatePrices()
  }, [isLoaded, alerts.length])

  // 添加提醒
  const handleAddAlert = async () => {
    if (!fundCode || !targetPrice) {
      alert('请填写基金代码和目标价格')
      return
    }

    const price = await fetchFundPrice(fundCode)
    const currentPrice = price || 0

    addAlert(fundCode, fundName || fundCode, alertType, parseFloat(targetPrice), currentPrice)
    
    // 重置表单
    setFundCode('')
    setFundName('')
    setTargetPrice('')
    setShowAddForm(false)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/funds" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回基金列表
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🔔 价格提醒
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            设置基金净值涨跌提醒，不错过任何投资机会
          </p>
          <div className="mt-4 flex gap-4 justify-center">
            <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
              启用中：{enabledCount}
            </span>
            <span className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-sm">
              已触发：{triggeredCount}
            </span>
          </div>
        </div>

        {/* 添加提醒按钮 */}
        <div className="max-w-4xl mx-auto mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium text-lg shadow-lg"
            >
              ➕ 添加价格提醒
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                添加提醒
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    基金代码
                  </label>
                  <input
                    type="text"
                    value={fundCode}
                    onChange={(e) => setFundCode(e.target.value)}
                    placeholder="如：005827"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    基金名称（可选）
                  </label>
                  <input
                    type="text"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    placeholder="如：易方达蓝筹精选"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    提醒类型
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAlertType('above')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        alertType === 'above'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      📈 高于目标价
                    </button>
                    <button
                      onClick={() => setAlertType('below')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        alertType === 'below'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      📉 低于目标价
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    目标价格（元）
                  </label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="如：2.00"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddAlert}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  确认添加
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="max-w-4xl mx-auto text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">更新价格中...</p>
          </div>
        )}

        {/* 提醒列表 */}
        {!loading && alerts.length === 0 ? (
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">暂无价格提醒</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              点击上方按钮添加第一个价格提醒
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border-l-4 ${
                  alert.triggeredAt
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : alert.enabled
                    ? 'border-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {alert.fundName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{alert.fundCode}</p>
                  </div>
                  <div className="flex gap-2">
                    {alert.triggeredAt ? (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                        🔔 已触发
                      </span>
                    ) : alert.enabled ? (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                        启用中
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                        已禁用
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">当前净值</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ¥{alert.currentPrice.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">提醒条件</p>
                    <p className={`text-lg font-bold ${
                      alert.type === 'above' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {alert.type === 'above' ? '📈 ≥' : '📉 ≤'} ¥{alert.targetPrice.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">创建时间</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(alert.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>

                {alert.triggeredAt && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      ⏰ 触发时间：{new Date(alert.triggeredAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      alert.enabled && !alert.triggeredAt
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    }`}
                  >
                    {alert.enabled && !alert.triggeredAt ? '禁用' : '启用'}
                  </button>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm font-medium"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))}

            {/* 批量操作 */}
            {triggeredCount > 0 && (
              <div className="flex gap-4">
                <button
                  onClick={clearTriggered}
                  className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  🗑️ 清除已触发 ({triggeredCount})
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  🗑️ 清空所有
                </button>
              </div>
            )}
          </div>
        )}

        {/* 说明 */}
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            💡 <strong>使用说明：</strong>
            <span className="ml-2">
              设置价格提醒后，系统会在每次刷新基金数据时自动检查是否触发条件。
              触发的提醒会显示为红色，并记录触发时间。
            </span>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
            ⚠️ 注意：提醒数据存储在本地浏览器，清除缓存会丢失提醒设置。
          </p>
        </div>
      </div>
    </div>
  )
}
