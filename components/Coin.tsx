'use client'

import { useState, useEffect } from 'react'

interface CoinProps {
  isFlipping: boolean
  delay?: number
}

export default function Coin({ isFlipping, delay = 0 }: CoinProps) {
  return (
    <div
      className={`relative w-16 h-16 md:w-20 md:h-20 transition-all duration-300 ${
        isFlipping ? 'animate-coin-flip' : ''
      }`}
      style={{
        animationDelay: `${delay}ms`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 正面 */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg flex items-center justify-center"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
        }}
      >
        <span className="text-2xl md:text-3xl font-bold text-amber-900">字</span>
      </div>
      
      {/* 反面 */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg flex items-center justify-center"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        <span className="text-2xl md:text-3xl font-bold text-gray-700">花</span>
      </div>
    </div>
  )
}
