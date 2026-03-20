'use client'

import { useState, useEffect } from 'react'

interface DivinationGuideProps {
  onComplete: () => void
  onSkip?: () => void
}

export default function DivinationGuide({ onComplete, onSkip }: DivinationGuideProps) {
  const [countdown, setCountdown] = useState(10)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: '静心准备',
      icon: '🧘',
      description: '请找一个安静的地方，深呼吸，让心静下来',
      tip: '心诚则灵，专注当下',
    },
    {
      title: '默念问题',
      icon: '💭',
      description: '在心中默念你想要询问的问题',
      tip: '问题要具体明确，专注一个主题',
    },
    {
      title: '选择方式',
      icon: '🎲',
      description: '选择你喜欢的起卦方式',
      tip: '随机、时间、数字，三种方式皆可',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete])

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 3000)

    return () => clearInterval(stepTimer)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 装饰背景 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 text-9xl">☯</div>
        <div className="absolute right-10 bottom-20 text-9xl">☯</div>
        <div className="absolute top-1/2 left-1/4 text-6xl">䷀</div>
        <div className="absolute top-1/3 right-1/4 text-6xl">䷁</div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        {/* 标题 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-amber-900 md:text-5xl dark:text-amber-100">
            ☯ 易经问卦 ☯
          </h1>
          <p className="text-lg text-amber-700 dark:text-amber-300">心诚则灵 · 探索易经智慧</p>
        </div>

        {/* 倒计时 */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl font-bold text-white shadow-lg">
            {countdown}
          </div>
          <p className="mt-4 text-amber-600 dark:text-amber-400">秒后进入起卦页面</p>
        </div>

        {/* 引导步骤 */}
        <div className="mb-8 rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-slate-800/80">
          <div className="mb-6 flex items-start gap-4">
            <div className="text-4xl">{steps[currentStep].icon}</div>
            <div className="flex-1">
              <h3 className="mb-2 text-2xl font-bold text-amber-900 dark:text-amber-100">
                {steps[currentStep].title}
              </h3>
              <p className="mb-3 text-lg text-amber-700 dark:text-amber-300">
                {steps[currentStep].description}
              </p>
              <div className="inline-block rounded-lg bg-amber-100 px-4 py-2 dark:bg-slate-700">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  💡 {steps[currentStep].tip}
                </p>
              </div>
            </div>
          </div>

          {/* 步骤指示器 */}
          <div className="mt-6 flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-amber-500'
                    : index < currentStep
                      ? 'w-4 bg-amber-300'
                      : 'w-4 bg-gray-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 跳过按钮 */}
        <div className="text-center">
          <button
            onClick={() => {
              if (onSkip) onSkip()
              else onComplete()
            }}
            className="rounded-full border-2 border-amber-300 bg-white px-8 py-3 font-medium text-amber-700 transition-all hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
          >
            跳过引导
          </button>
        </div>

        {/* 底部说明 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-amber-600 dark:text-amber-400">易经，群经之首，大道之源</p>
        </div>
      </div>
    </div>
  )
}
