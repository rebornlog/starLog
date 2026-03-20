'use client'

import { useState } from 'react'
import { LineInterpretation } from '@/lib/iching/data'

interface LineDetailProps {
  lines: LineInterpretation[]
  structure: number[]
}

export default function LineDetail({ lines, structure }: LineDetailProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  // 爻位名称（从下到上）
  const lineNames = ['初', '二', '三', '四', '五', '上']
  const lineTypes = ['六', '九'] // 阴爻/阳爻

  const getLineName = (index: number) => {
    const type = structure[index] === 1 ? lineTypes[1] : lineTypes[0]
    const name = lineNames[index]
    return `${type}${name}`
  }

  return (
    <div className="space-y-4">
      {/* 爻位选择 */}
      <div className="grid grid-cols-6 gap-2">
        {lines.map((line, index) => (
          <button
            key={line.position}
            onClick={() => setSelectedLine(index)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all ${
              selectedLine === index
                ? 'bg-amber-500 text-white shadow-lg scale-105'
                : 'bg-amber-100 dark:bg-slate-700 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-slate-600'
            }`}
          >
            <span className="text-xs mb-1">{getLineName(index)}</span>
            <div className="w-8 h-1 bg-current rounded-full mb-1">
              {structure[index] === 1 ? (
                <div className="w-full h-full" />
              ) : (
                <div className="flex gap-1">
                  <div className="flex-1" />
                  <div className="w-2" />
                  <div className="flex-1" />
                </div>
              )}
            </div>
            <span className="text-xs">{line.position}</span>
          </button>
        ))}
      </div>

      {/* 爻辞详情 */}
      {selectedLine !== null && lines[selectedLine] && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {getLineName(selectedLine)}
            </span>
            <div className="flex-1 h-px bg-amber-300 dark:bg-amber-700" />
            <span className="text-sm text-amber-600 dark:text-amber-400">
              第{lines[selectedLine].position}爻
            </span>
          </div>
          <p className="text-lg text-amber-900 dark:text-amber-100 leading-relaxed">
            {lines[selectedLine].text}
          </p>
        </div>
      )}

      {/* 提示 */}
      {!selectedLine && (
        <div className="text-center text-amber-600 dark:text-amber-400 text-sm py-8">
          👆 点击爻位查看详细爻辞
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
