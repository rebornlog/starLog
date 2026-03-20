'use client'

import HexagramVisual from './HexagramVisual'

interface TransformingHexagramProps {
  originalStructure: number[]
  transformedStructure: number[]
  originalName: string
  transformedName: string
  movingLines?: number[] // 动爻位置
}

export default function TransformingHexagram({
  originalStructure,
  transformedStructure,
  originalName,
  transformedName,
  movingLines = [],
}: TransformingHexagramProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-8 shadow-xl">
      <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-6 text-center">
        🔮 变卦展示
      </h3>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* 本卦 */}
        <div className="text-center">
          <div className="mb-4">
            <HexagramVisual 
              structure={originalStructure} 
              size="md" 
              animated={false}
              highlightLines={movingLines}
            />
          </div>
          <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">
            本卦：{originalName}
          </h4>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            当前状况
          </p>
        </div>

        {/* 箭头 */}
        <div className="flex items-center">
          <div className="text-4xl text-amber-500 animate-pulse">
            →
          </div>
        </div>

        {/* 变卦 */}
        <div className="text-center">
          <div className="mb-4">
            <HexagramVisual 
              structure={transformedStructure} 
              size="md" 
              animated={true}
            />
          </div>
          <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">
            变卦：{transformedName}
          </h4>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            发展趋势
          </p>
        </div>
      </div>

      {/* 动爻说明 */}
      {movingLines.length > 0 && (
        <div className="mt-6 text-center text-sm text-amber-700 dark:text-amber-300">
          <span className="font-bold">动爻：</span>
          {movingLines.map(line => `第${line + 1}爻`).join('、')}
          <span className="ml-2">（老阳/老阴变化）</span>
        </div>
      )}
    </div>
  )
}
