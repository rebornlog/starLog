'use client'

import { useState, useEffect } from 'react'

interface DivinationGuideProps {
  onComplete: () => void
}

const steps = [
  {
    title: '静心凝神',
    icon: '🧘',
    content: '深呼吸，让心静下来，专注于您的问题',
    tip: '建议闭眼 10 秒钟，排除杂念',
  },
  {
    title: '默念问题',
    icon: '🙏',
    content: '在心中清晰地默念您想询问的问题',
    tip: '问题要具体明确，心诚则灵',
  },
  {
    title: '开始起卦',
    icon: '☯',
    content: '选择起卦方式，让易经为您揭示答案',
    tip: '三种方式皆可，随心选择',
  },
]

export default function DivinationGuide({ onComplete }: DivinationGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  // 自动下一步（10 秒后）
  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      if (dontShowAgain) {
        localStorage.setItem('iching_skip_guide', 'true')
      }
      onComplete()
    }
  }

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('iching_skip_guide', 'true')
    }
    onComplete()
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="mx-auto max-w-2xl">
      {/* 进度条 */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-amber-700 dark:text-amber-300">
          <span>准备起卦</span>
          <span>步骤 {currentStep + 1}/{steps.length}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 当前步骤内容 */}
      <div className="mb-8 rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-slate-800">
        {/* 图标动画 */}
        <div className="mb-6 text-8xl animate-bounce">
          {steps[currentStep].icon}
        </div>

        {/* 标题 */}
        <h2 className="mb-4 text-3xl font-bold text-amber-900 dark:text-amber-100">
          {steps[currentStep].title}
        </h2>

        {/* 内容 */}
        <p className="mb-6 text-lg text-amber-700 dark:text-amber-300">
          {steps[currentStep].content}
        </p>

        {/* 提示 */}
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          💡 {steps[currentStep].tip}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={handleSkip}
          className="rounded-full bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        >
          跳过引导
        </button>
        <button
          onClick={handleNext}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
        >
          {currentStep === steps.length - 1 ? '开始起卦 →' : '下一步 →'}
        </button>
      </div>

      {/* 不再显示选项 */}
      <div className="text-center">
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          下次不再显示引导
        </label>
      </div>

      {/* 步骤指示器 */}
      <div className="mt-8 flex justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentStep
                ? 'w-8 bg-amber-500'
                : i < currentStep
                ? 'bg-amber-300 dark:bg-amber-700'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
