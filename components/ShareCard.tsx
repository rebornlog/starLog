'use client'

import { useState } from 'react'

interface ShareCardProps {
  hexagram: {
    number: number
    name: string
  }
  judgment: string
}

export default function ShareCard({ hexagram, judgment }: ShareCardProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `【易经问卦】第${hexagram.number}卦 - ${hexagram.name}\n\n${judgment}\n\n来自 starLog 问卦`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `第${hexagram.number}卦 - ${hexagram.name}`,
          text: shareText,
        })
      } catch (err) {
        console.error('分享失败:', err)
      }
    } else {
      // 降级：复制到剪贴板
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:from-slate-800 dark:to-slate-900">
      {/* 卦象 */}
      <div className="mb-4 text-center text-6xl">☯</div>
      
      {/* 卦名 */}
      <h3 className="mb-2 text-center text-2xl font-bold text-amber-900 dark:text-amber-100">
        第{hexagram.number}卦 · {hexagram.name}
      </h3>

      {/* 卦辞 */}
      <p className="mb-6 text-center text-sm text-amber-700 dark:text-amber-300">
        {judgment}
      </p>

      {/* 分享按钮 */}
      <div className="flex justify-center gap-2">
        <button
          onClick={handleShare}
          className="rounded-full bg-amber-500 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-amber-600"
        >
          {copied ? '✓ 已复制' : '📤 分享'}
        </button>
      </div>

      {/* 底部 */}
      <div className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400">
        来自 starLog 问卦
      </div>
    </div>
  )
}
