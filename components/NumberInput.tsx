'use client'

import { useState } from 'react'

interface NumberInputProps {
  onSubmit: (numbers: [number, number, number]) => void
  onBack: () => void
}

export default function NumberInput({ onSubmit, onBack }: NumberInputProps) {
  const [numbers, setNumbers] = useState(['', '', ''])
  const [errors, setErrors] = useState(['', '', ''])
  const [isValid, setIsValid] = useState(false)

  // 验证单个数字
  const validateNumber = (value: string, index: number): string => {
    if (!value) return '请输入数字'
    
    const num = parseInt(value)
    if (isNaN(num)) return '请输入有效数字'
    if (num < 1 || num > 999) return '数字范围 1-999'
    
    return ''
  }

  // 处理输入变化
  const handleChange = (index: number, value: string) => {
    // 只允许输入数字
    const filtered = value.replace(/[^0-9]/g, '')
    
    const newNumbers = [...numbers]
    newNumbers[index] = filtered
    setNumbers(newNumbers as [string, string, string])

    // 实时验证
    const error = validateNumber(filtered, index)
    const newErrors = [...errors]
    newErrors[index] = error
    setErrors(newErrors)

    // 检查所有输入是否有效
    const allValid = newNumbers.every((num, i) => !validateNumber(num, i))
    setIsValid(allValid)
  }

  // 随机生成
  const generateRandom = () => {
    const randomNumbers = Array(3).fill(0).map(() => 
      Math.floor(Math.random() * 999) + 1
    )
    setNumbers(randomNumbers.map(String) as [string, string, string])
    setErrors(['', '', ''])
    setIsValid(true)
  }

  // 提交
  const handleSubmit = () => {
    if (!isValid) return
    
    const nums = numbers.map(Number) as [number, number, number]
    onSubmit(nums)
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
      {/* 标题 */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-amber-900 dark:text-amber-100">
          🔢 数字起卦
        </h2>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          心中默念问题，输入 3 个数字
        </p>
      </div>

      {/* 输入框 */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        {numbers.map((num, i) => (
          <div key={i} className="text-center">
            <label className="mb-2 block text-sm font-medium text-amber-800 dark:text-amber-200">
              第{i + 1}个数字
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={num}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder="1-999"
              className={`w-full rounded-xl border-2 p-4 text-center text-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors[i]
                  ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-700 dark:bg-red-900/20'
                  : num
                  ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100'
                  : 'border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-slate-700 dark:text-white'
              }`}
              maxLength={3}
            />
            {errors[i] && (
              <p className="mt-1 text-xs text-red-500">{errors[i]}</p>
            )}
            {num && !errors[i] && (
              <p className="mt-1 text-xs text-green-500">✓ 有效</p>
            )}
          </div>
        ))}
      </div>

      {/* 随机生成按钮 */}
      <div className="mb-6 text-center">
        <button
          type="button"
          onClick={generateRandom}
          className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        >
          🎲 随机生成
        </button>
      </div>

      {/* 提示信息 */}
      <div className="mb-8 rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <p>✨ 请输入 1-999 之间的正整数</p>
        <p className="mt-1 text-xs opacity-80">例如：3, 7, 9 或 123, 456, 789</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-gray-200 px-8 py-3 font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        >
          ← 返回
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          确认起卦 →
        </button>
      </div>
    </div>
  )
}
