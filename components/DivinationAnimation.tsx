'use client'

import { useState, useEffect, useRef } from 'react'
import Coin from './Coin'

interface DivinationAnimationProps {
  onComplete?: () => void
}

export default function DivinationAnimation({ onComplete }: DivinationAnimationProps) {
  const [isFlipping, setIsFlipping] = useState(false)
  const [shakeCount, setShakeCount] = useState(0)
  const maxShakes = 6 // 摇卦 6 次
  const completedRef = useRef(false)

  useEffect(() => {
    // 如果已经完成，不再执行
    if (completedRef.current) return

    // 开始摇卦动画
    setIsFlipping(true)
    
    const timer = setTimeout(() => {
      setIsFlipping(false)
      
      setShakeCount(prev => {
        const newCount = prev + 1
        
        // 检查是否完成
        if (newCount >= maxShakes) {
          completedRef.current = true
          // 完成动画
          setTimeout(() => {
            onComplete?.()
          }, 500)
        } else {
          // 继续下一次摇卦
          setTimeout(() => {
            setIsFlipping(true)
          }, 300)
        }
        
        return newCount
      })
    }, 1500) // 每次摇卦 1.5 秒

    return () => clearTimeout(timer)
  }, [shakeCount, onComplete])

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* 标题 */}
      <h3 className="mb-8 text-2xl font-bold text-amber-900 dark:text-amber-100 animate-pulse">
        🔮 正在摇卦...
      </h3>
      
      {/* 进度指示 */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: maxShakes }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < shakeCount
                ? 'bg-amber-500 scale-110'
                : i === shakeCount
                ? 'bg-amber-300 animate-pulse'
                : 'bg-amber-100 dark:bg-amber-900/30'
            }`}
          />
        ))}
      </div>

      {/* 三枚铜钱 */}
      <div className="flex gap-4 md:gap-6 mb-8">
        <Coin isFlipping={isFlipping} delay={0} />
        <Coin isFlipping={isFlipping} delay={100} />
        <Coin isFlipping={isFlipping} delay={200} />
      </div>

      {/* 进度文字 */}
      <p className="text-amber-700 dark:text-amber-300 animate-bounce">
        第 {shakeCount + 1} 爻 · {isFlipping ? '摇卦中...' : '确定'}
      </p>

      {/* 装饰性卦象 */}
      <div className="mt-8 text-6xl opacity-20 animate-pulse">
        ☯
      </div>
    </div>
  )
}
