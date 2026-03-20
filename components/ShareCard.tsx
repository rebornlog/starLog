'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'

interface ShareCardProps {
  hexagramNumber: number
  hexagramName: string
  character: string
  judgment: string
}

export default function ShareCard({ 
  hexagramNumber, 
  hexagramName, 
  character,
  judgment 
}: ShareCardProps) {
  const { showToast } = useToast()
  const [generating, setGenerating] = useState(false)

  const handleShare = async () => {
    setGenerating(true)
    
    try {
      // 生成分享文本
      const shareText = `🔮 易经问卦 - 第${hexagramNumber}卦 ${hexagramName}\n\n${character}\n\n卦辞：${judgment}\n\n✨ 问卦仅供参考，决策还需理性`
      
      // 尝试使用 Web Share API
      if (navigator.share) {
        await navigator.share({
          title: `易经问卦 - ${hexagramName}`,
          text: shareText,
        })
        showToast('分享成功！', 'success')
      } else {
        // 降级：复制到剪贴板
        await navigator.clipboard.writeText(shareText)
        showToast('已复制到剪贴板！', 'success')
      }
    } catch (error) {
      console.error('分享失败:', error)
      showToast('分享失败，请重试', 'error')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex justify-center">
      <button
        onClick={handleShare}
        disabled={generating}
        className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg disabled:opacity-50"
      >
        <span className="text-xl">📤</span>
        <span>{generating ? '生成中...' : '分享此卦'}</span>
      </button>
    </div>
  )
}
