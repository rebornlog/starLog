'use client'

import { useState } from 'react'
import { DIVINATION_GUIDE, QUESTION_TYPES, DIVINATION_TABOOS } from '@/lib/iching/guide'

interface DivinationGuideProps {
  onComplete: () => void
}

export default function EnhancedDivinationGuide({ onComplete }: DivinationGuideProps) {
  const [step, setStep] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)

  const handleComplete = () => {
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-4 py-12 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-3xl">
        {/* 标题 */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-amber-900 md:text-5xl dark:text-amber-100">
            ☯ 易经问卦指引
          </h1>
          <p className="text-lg text-amber-700 dark:text-amber-300">
            心诚则灵 · 探索易经智慧
          </p>
        </div>

        {/* 引导步骤 */}
        {step < DIVINATION_GUIDE.steps.length ? (
          <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                <span>步骤 {step + 1} / {DIVINATION_GUIDE.steps.length}</span>
                <span>{Math.round(((step + 1) / DIVINATION_GUIDE.steps.length) * 100)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${((step + 1) / DIVINATION_GUIDE.steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 步骤内容 */}
            <div className="mb-8 text-center">
              <div className="mb-6 text-7xl">{DIVINATION_GUIDE.steps[step].icon}</div>
              <h2 className="mb-4 text-2xl font-bold text-amber-900 dark:text-amber-100">
                {DIVINATION_GUIDE.steps[step].title}
              </h2>
              <p className="text-lg leading-relaxed text-amber-700 dark:text-amber-300">
                {DIVINATION_GUIDE.steps[step].content}
              </p>
            </div>

            {/* 呼吸练习（第一步） */}
            {step === 0 && (
              <div className="mb-8 flex justify-center">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 animate-ping rounded-full bg-amber-200 opacity-75 dark:bg-amber-800"></div>
                  <div className="absolute inset-4 animate-pulse rounded-full bg-amber-300 opacity-75 dark:bg-amber-700"></div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">深呼吸</span>
                  </div>
                </div>
              </div>
            )}

            {/* 问题选择（第二步） */}
            {step === 1 && (
              <div className="mb-8">
                <p className="mb-4 text-center text-amber-700 dark:text-amber-300">
                  请选择您想问的问题类型（可选）：
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type.category}
                      onClick={() => setSelectedQuestion(type.category)}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        selectedQuestion === type.category
                          ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900/30'
                          : 'border-amber-200 bg-white hover:border-amber-300 dark:border-amber-800 dark:bg-slate-700 dark:hover:border-amber-700'
                      }`}
                    >
                      <div className="mb-2 text-2xl">{type.icon}</div>
                      <div className="font-medium text-amber-900 dark:text-amber-100">{type.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="rounded-full bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-300 disabled:opacity-50 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
              >
                ← 上一步
              </button>
              {step < DIVINATION_GUIDE.steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
                >
                  下一步 →
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
                >
                  开始起卦 ✨
                </button>
              )}
            </div>
          </div>
        ) : (
          /* 问卦禁忌 */
          <div className="space-y-8">
            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
              <h2 className="mb-6 text-2xl font-bold text-amber-900 dark:text-amber-100">
                ⚠️ 问卦禁忌
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {DIVINATION_TABOOS.map((taboo, i) => (
                  <div key={i} className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="mb-2 text-3xl">{taboo.icon}</div>
                    <h3 className="mb-2 font-bold text-red-900 dark:text-red-100">{taboo.title}</h3>
                    <p className="text-sm text-red-700 dark:text-red-300">{taboo.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
              <h2 className="mb-4 text-2xl font-bold text-amber-900 dark:text-amber-100">
                💡 温馨提示
              </h2>
              <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                {DIVINATION_GUIDE.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 text-amber-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSkip}
                className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-12 py-4 text-lg font-bold text-white transition-all hover:shadow-lg"
              >
                我明白了，开始起卦 ✨
              </button>
            </div>
          </div>
        )}

        {/* 底部装饰 */}
        <div className="mt-12 text-center">
          <div className="mx-auto max-w-2xl rounded-xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-800/60">
            <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-300">
              {DIVINATION_GUIDE.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
