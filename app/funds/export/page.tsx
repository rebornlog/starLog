'use client'

import { useState } from 'react'
import Link from 'next/link'
import { funds } from '@/data/funds'
import { Fund } from '@/types/fund'

export default function FundExportPage() {
  const [selectedFunds, setSelectedFunds] = useState<Set<string>>(new Set())
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'txt'>('csv')
  const [exportedData, setExportedData] = useState('')

  const toggleFund = (code: string) => {
    const newSet = new Set(selectedFunds)
    if (newSet.has(code)) {
      newSet.delete(code)
    } else {
      newSet.add(code)
    }
    setSelectedFunds(newSet)
  }

  const selectAll = () => {
    setSelectedFunds(new Set(funds.map(f => f.code)))
  }

  const deselectAll = () => {
    setSelectedFunds(new Set())
  }

  const handleExport = () => {
    const selected = funds.filter(f => selectedFunds.has(f.code))
    
    if (selected.length === 0) {
      alert('请至少选择一只基金')
      return
    }

    let data = ''
    
    if (exportFormat === 'csv') {
      data = '代码，名称，类型，公司，净值，涨跌幅，风险等级\n'
      selected.forEach(fund => {
        data += `${fund.code},${fund.name},${fund.type},${fund.company},${fund.netValue},${fund.changePercent}%,${fund.riskLevel}\n`
      })
    } else if (exportFormat === 'json') {
      data = JSON.stringify(selected, null, 2)
    } else if (exportFormat === 'txt') {
      selected.forEach(fund => {
        data += `${fund.code}\t${fund.name}\t${fund.type}\t${fund.netValue}\n`
      })
    }

    setExportedData(data)
  }

  const handleDownload = () => {
    if (!exportedData) return
    
    const blob = new Blob([exportedData], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fund-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!exportedData) return
    navigator.clipboard.writeText(exportedData)
    alert('已复制到剪贴板')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/funds" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回基金列表
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📤 导出基金
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            选择要导出的基金，支持多种格式
          </p>

          {/* 导出设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              导出设置
            </h2>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">格式：</span>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="csv">CSV (Excel 可用)</option>
                  <option value="json">JSON (程序可用)</option>
                  <option value="txt">TXT (纯文本)</option>
                </select>
              </div>
              
              <div className="text-gray-600 dark:text-gray-400">
                已选择 <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedFunds.size}</span> 只基金
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                全选
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                取消全选
              </button>
              <button
                onClick={handleExport}
                className="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                🚀 生成导出数据
              </button>
            </div>
          </div>

          {/* 基金选择列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              选择基金
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {funds.map(fund => (
                <label
                  key={fund.code}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedFunds.has(fund.code)
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFunds.has(fund.code)}
                    onChange={() => toggleFund(fund.code)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {fund.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {fund.code} · {fund.type}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 导出结果 */}
          {exportedData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                导出预览
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-900 dark:text-white font-mono whitespace-pre-wrap">
                  {exportedData}
                </pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  💾 下载文件
                </button>
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  📋 复制
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
