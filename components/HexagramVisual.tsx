'use client'

interface Line {
  isYang: boolean
  isMoving?: boolean
}

interface HexagramVisualProps {
  lines?: Line[]
  structure?: number[]  // 0=阴，1=阳
  name?: string
  title?: string
  showName?: boolean
}

export default function HexagramVisual({ 
  lines, 
  structure,
  name, 
  title,
  showName = true 
}: HexagramVisualProps) {
  // 如果没有 lines，从 structure 转换
  const actualLines: Line[] = lines || (structure ? structure.map(val => ({ isYang: val === 1 })) : [])
  return (
    <div className="mb-8 flex flex-col items-center">
      {/* 标题 */}
      {title && (
        <h3 className="mb-4 text-xl font-bold text-amber-900 dark:text-amber-100">
          {title}
        </h3>
      )}

      {/* 卦象 */}
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg dark:from-slate-800 dark:to-slate-900">
        <div className="flex flex-col-reverse gap-1">
          {actualLines.map((line, i) => (
            <div
              key={i}
              className={`flex h-12 w-48 items-center justify-center transition-all ${
                line.isMoving ? 'animate-pulse' : ''
              }`}
            >
              {line.isYang ? (
                // 阳爻：连续
                <div className="h-3 w-full rounded-full bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400" />
              ) : (
                // 阴爻：断开
                <div className="flex w-full justify-between">
                  <div className="h-3 w-[42%] rounded-full bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400" />
                  <div className="h-3 w-[42%] rounded-full bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 卦名 */}
      {showName && name && (
        <div className="text-center">
          <div
            className="mb-2 text-5xl font-bold text-amber-900 dark:text-amber-100"
            style={{ fontFamily: 'Ma Shan Zheng, cursive' }}
          >
            {name}
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            {lines.filter(l => l.isYang).length}阳{lines.filter(l => !l.isYang).length}阴
          </div>
        </div>
      )}
    </div>
  )
}
