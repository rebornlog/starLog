'use client'

import React from 'react'

interface TouchFeedbackProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

/**
 * 移动端触摸反馈组件
 * 添加点击波纹效果和触觉反馈
 */
export default function TouchFeedback({ 
  children, 
  className = '', 
  onClick,
  disabled = false 
}: TouchFeedbackProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    
    // 创建波纹效果
    const ripple = document.createElement('span')
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    
    ripple.style.width = ripple.style.height = size + 'px'
    ripple.style.left = x + 'px'
    ripple.style.top = y + 'px'
    ripple.classList.add('ripple')
    
    e.currentTarget.appendChild(ripple)
    
    // 移除波纹
    setTimeout(() => {
      ripple.remove()
    }, 600)
    
    // 触发点击
    onClick?.()
    
    // 触觉反馈（如果设备支持）
    if ('vibrate' in navigator && !disabled) {
      navigator.vibrate(10)  // 轻微震动 10ms
    }
  }

  return (
    <div
      className={`touch-feedback ${className} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
      <style jsx>{`
        .touch-feedback {
          transition: transform 0.1s ease, opacity 0.2s ease;
        }
        
        .touch-feedback:active:not(.disabled) {
          transform: scale(0.98);
          opacity: 0.9;
        }
        
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }
        
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .touch-feedback.disabled {
          opacity: 0.6;
        }
      `}</style>
    </div>
  )
}
