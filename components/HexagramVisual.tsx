'use client'

interface HexagramVisualProps {
  structure: number[] // [从下到上，1=阳爻，0=阴爻]
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export default function HexagramVisual({ 
  structure, 
  size = 'lg',
  animated = true 
}: HexagramVisualProps) {
  const sizeClasses = {
    sm: { line: 'h-2', gap: 'gap-1', container: 'w-16' },
    md: { line: 'h-3', gap: 'gap-1.5', container: 'w-24' },
    lg: { line: 'h-4', gap: 'gap-2', container: 'w-32' },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`${sizes.container} mx-auto`}>
      <div className={`flex flex-col ${sizes.gap} ${animated ? 'animate-fade-in' : ''}`}>
        {/* 从下到上显示 6 个爻 */}
        {[5, 4, 3, 2, 1, 0].map((index) => (
          <div
            key={index}
            className={`relative ${sizes.line} w-full flex items-center justify-center`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {structure[index] === 1 ? (
              // 阳爻（实线）
              <div className="w-full h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-sm shadow-md" />
            ) : (
              // 阴爻（虚线，中间断开）
              <div className="w-full h-full flex gap-1">
                <div className="flex-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-sm shadow-md" />
                <div className="w-4" /> {/* 中间断开 */}
                <div className="flex-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-sm shadow-md" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 装饰性光晕 */}
      {animated && (
        <div className="absolute inset-0 bg-amber-400/10 blur-xl rounded-full -z-10 animate-pulse" />
      )}
      
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
