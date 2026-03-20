'use client'

import { useState, useCallback } from 'react'

interface NumberInputProps {
  onSubmit: (nums: [number, number, number]) => void
  onBack: () => void
}

export default function NumberInput({ onSubmit, onBack }: NumberInputProps) {
  const [nums, setNums] = useState(['', '', ''])
  const [errors, setErrors] = useState(['', '', ''])

  // 生成随机数
  const generateRandom = useCallback(() => {
    const randomNums = Array(3)
      .fill(0)
      .map(() => Math.floor(Math.random() * 100) + 1)
      .map(String)
    setNums(randomNums as [string, string, string])
    setErrors(['', '', ''])
  }, [])

  // 清空输入
  const handleClear = useCallback(() => {
    setNums(['', '', ''])
    setErrors(['', '', ''])
  }, [])

  // 验证单个数字
  const validateNumber = useCallback((value: string, index: number): string => {
    if (value === '') return ''
    const num = parseInt(value, 10)
    if (isNaN(num)) return '请输入数字'
    if (num <= 0) return '请输入正整数'
    if (num > 999) return '数字过大'
    return ''
  }, [])

  // 处理输入变化
  const handleInputChange = useCallback(
    (index: number, value: string) => {
      // 只允许输入数字
      if (value !== '' && !/^\d+$/.test(value)) return

      const newNums = [...nums]
      newNums[index] = value
      setNums(newNums as [string, string, string])

      // 实时验证
      const error = validateNumber(value, index)
      const newErrors = [...errors]
      newErrors[index] = error
      setErrors(newErrors as [string, string, string])
    },
    [nums, errors, validateNumber]
  )

  // 提交
  const handleSubmit = useCallback(() => {
    // 验证所有数字
    const newErrors = nums.map((num, i) => validateNumber(num, i))
    setErrors(newErrors as [string, string, string])

    const hasError = newErrors.some((error) => error !== '')
    if (hasError) return

    const hasEmpty = nums.some((num) => num === '')
    if (hasEmpty) {
      showToast('请输入完整的 3 个数字')
      return
    }

    const parsed = nums.map((n) => parseInt(n, 10)) as [number, number, number]
    onSubmit(parsed)
  }, [nums, validateNumber, onSubmit])

  // 显示提示
  const showToast = (message: string) => {
    // 简单的 alert 替代，实际项目中可以用 toast 组件
    console.log('Toast:', message)
  }

  // 判断是否可以提交
  const canSubmit = nums.every((num) => num !== '' && /^\d+$/.test(num) && parseInt(num, 10) > 0)

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
      <h3 className="mb-6 text-center text-xl font-bold text-amber-900 dark:text-amber-100">
        请输入 3 个数字
      </h3>

      {/* 快捷操作 */}
      <div className="mb-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={generateRandom}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
        >
          <span>🎲</span>
          <span>随机生成</span>
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        >
          <span>🗑️</span>
          <span>清空</span>
        </button>
      </div>

      {/* 输入框 */}
      <div className="mb-6 flex justify-center gap-4">
        {nums.map((num, i) => (
          <div key={i} className="flex flex-col items-center">
            <input
              type="text"
              inputMode="numeric"
              value={num}
              onChange={(e) => handleInputChange(i, e.target.value)}
              placeholder={`数字${i + 1}`}
              maxLength={3}
              className={`w-24 rounded-xl border-2 px-4 py-3 text-center text-2xl transition-all focus:ring-2 focus:outline-none dark:bg-slate-700 dark:text-white ${
                errors[i]
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : num
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                    : 'border-amber-300 focus:border-amber-500 focus:ring-amber-200 dark:border-amber-700'
              }`}
            />
            {errors[i] && <span className="mt-1 text-xs text-red-500">{errors[i]}</span>}
            {num && !errors[i] && <span className="mt-1 text-xs text-green-500">✓</span>}
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          确认起卦
        </button>
        <button
          onClick={onBack}
          className="rounded-full bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        >
          返回
        </button>
      </div>

      {/* 提示信息 */}
      <div className="mt-6 rounded-xl bg-amber-50 p-4 dark:bg-slate-700">
        <p className="text-center text-sm leading-relaxed text-amber-700 dark:text-amber-300">
          💡 <strong>心诚则灵</strong>：心中默念问题，随意输入 3 个数字
          <br />
          <span className="text-amber-600 dark:text-amber-400">或使用随机生成，让天意为您指引</span>
        </p>
      </div>
    </div>
  )
}
