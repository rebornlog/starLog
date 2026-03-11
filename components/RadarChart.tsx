'use client'

interface RadarChartProps {
  data: {
    label: string
    value: number // 0-100
    color?: string
  }[]
  size?: number
  className?: string
}

export default function RadarChart({ 
  data, 
  size = 200,
  className = ''
}: RadarChartProps) {
  const center = size / 2
  const radius = (size / 2) - 30
  const angleStep = (2 * Math.PI) / data.length

  // 生成多边形点
  const points = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2
    const value = item.value / 100
    const x = center + Math.cos(angle) * radius * value
    const y = center + Math.sin(angle) * radius * value
    return `${x},${y}`
  }).join(' ')

  // 背景网格
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="animate-fade-in">
        {/* 背景网格 */}
        {gridLevels.map((level, i) => (
          <polygon
            key={i}
            points={data.map((_, index) => {
              const angle = index * angleStep - Math.PI / 2
              const x = center + Math.cos(angle) * radius * level
              const y = center + Math.sin(angle) * radius * level
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            className="text-gray-500"
          />
        ))}

        {/* 轴线 */}
        {data.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2
          const x = center + Math.cos(angle) * radius
          const y = center + Math.sin(angle) * radius
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              className="text-gray-500"
            />
          )
        })}

        {/* 数据区域 */}
        <polygon
          points={points}
          fill="url(#gradient)"
          fillOpacity="0.5"
          stroke="url(#gradientStroke)"
          strokeWidth="2"
        />

        {/* 渐变定义 */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* 数据点 */}
        {data.map((item, index) => {
          const angle = index * angleStep - Math.PI / 2
          const value = item.value / 100
          const x = center + Math.cos(angle) * radius * value
          const y = center + Math.sin(angle) * radius * value
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="url(#gradientStroke)"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              />
              {/* 标签 */}
              <text
                x={center + Math.cos(angle) * (radius + 15)}
                y={center + Math.sin(angle) * (radius + 15)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600 dark:fill-gray-300"
              >
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>
      
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
