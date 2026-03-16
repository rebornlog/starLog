'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FundImportData } from '@/types/fund'

export default function FundImportPage() {
  const [inputText, setInputText] = useState('')
  const [importResult, setImportResult] = useState<{success: number, failed: number, details: any[]} | null>(null)

  const handleImport = () => {
    const lines = inputText.trim().split('\n')
    const results = {
      success: 0,
      failed: 0,
      details: [] as any[]
    }

    lines.forEach((line, index) => {
      const parts = line.split(/[,，\t\s]+/).filter(Boolean)
      if (parts.length >= 1) {
        const code = parts[0].trim()
        const name = parts[1]?.trim() || ''
        const notes = parts[2]?.trim() || ''
        
        // 简单验证基金代码格式（6 位数字）
        if (/^\d{6}$/.test(code)) {
          results.success++
          results.details.push({ line: index + 1, code, name, notes, status: 'success' })
        } else {
          results.failed++
          results.details.push({ line: index + 1, code, status: 'failed', reason: '代码格式不正确' })
        }
      }
    })

    setImportResult(results)
  }

  const handleClear = () => {
    setInputText('')
    setImportResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/funds" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← 返回基金列表
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📥 导入基金
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            批量导入基金代码，支持 Excel/CSV 格式
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              导入格式说明
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">每行一个基金，支持以下格式：</p>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>• 仅代码：<code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">005827</code></li>
                <li>• 代码 + 名称：<code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">005827,易方达蓝筹</code></li>
                <li>• 代码 + 名称 + 备注：<code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">005827,易方达蓝筹，张坤管理</code></li>
              </ul>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                分隔符支持：逗号、制表符、空格
              </p>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`示例：
005827,易方达蓝筹精选混合，张坤管理
003096,中欧医疗健康混合 A
161725,招商中证白酒指数，热门`}
              className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         font-mono text-sm
                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleImport}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                🚀 开始导入
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          {importResult && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                导入结果
              </h2>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {importResult.success}
                  </div>
                  <div className="text-green-700 dark:text-green-300">成功</div>
                </div>
                <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {importResult.failed}
                  </div>
                  <div className="text-red-700 dark:text-red-300">失败</div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">行号</th>
                      <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">代码</th>
                      <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">名称</th>
                      <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.details.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{item.line}</td>
                        <td className="px-4 py-2 font-mono text-gray-900 dark:text-white">{item.code}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{item.name || '-'}</td>
                        <td className="px-4 py-2">
                          {item.status === 'success' ? (
                            <span className="text-green-600 dark:text-green-400">✅ 成功</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">❌ {item.reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importResult.success > 0 && (
                <div className="mt-4 text-center">
                  <Link
                    href="/funds"
                    className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    查看基金列表 →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
