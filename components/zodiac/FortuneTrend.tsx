'use client';

import { useMemo } from 'react';
import { generateDailyFortune } from '@/lib/zodiac/fortune';
import type { ZodiacSign } from '@/lib/zodiac/data';

interface FortuneTrendProps {
  sign: ZodiacSign;
  currentDate: Date;
}

// 内联 SVG 图标
const TrendingUp = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// 运势等级颜色
function getFortuneColor(score: number): string {
  if (score >= 5) return '#fbbf24'; // 黄色 - 大吉
  if (score >= 4) return '#4ade80'; // 绿色 - 吉
  if (score >= 3) return '#60a5fa'; // 蓝色 - 小吉
  if (score >= 2) return '#9ca3af'; // 灰色 - 平
  return '#fb923c'; // 橙色 - 注意
}

interface TrendDataPoint {
  date: Date;
  overall: number;
  label: string;
  isToday: boolean;
}

export function FortuneTrend({ sign, currentDate }: FortuneTrendProps) {
  // 生成近 7 日运势数据
  const trendData = useMemo(() => {
    const data: TrendDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const fortune = generateDailyFortune(sign.id, date);
      data.push({
        date,
        overall: fortune.overall,
        label: date.toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric'
        }),
        isToday: i === 0
      });
    }
    return data;
  }, [sign.id, currentDate]);

  // 计算 SVG 路径
  const svgPath = useMemo(() => {
    const width = 100;
    const height = 50;
    const padding = 5;
    
    const points = trendData.map((item, index) => {
      const x = padding + (index / (trendData.length - 1)) * (width - 2 * padding);
      const y = height - padding - (item.overall / 5) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }, [trendData]);

  // 计算平均运势
  const avgScore = Math.round(
    trendData.reduce((sum, item) => sum + item.overall, 0) / trendData.length
  );

  // 判断趋势
  const trend = trendData[trendData.length - 1].overall - trendData[0].overall;
  const trendLabel = trend > 1 ? '上升' : trend < -1 ? '下降' : '平稳';
  const trendColor = trend > 1 ? '#4ade80' : trend < -1 ? '#f87171' : '#9ca3af';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp />
          近 7 日运势趋势
        </h3>
        <div className="text-right">
          <div className="text-white/60 text-sm">平均运势</div>
          <div className="text-white font-bold text-lg">{avgScore}星</div>
        </div>
      </div>

      {/* 趋势图 */}
      <div className="relative h-40 mb-4">
        <svg
          viewBox="0 0 100 50"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* 背景网格 */}
          <defs>
            <pattern id="grid" width="14.28" height="12.5" patternUnits="userSpaceOnUse">
              <path
                d="M 14.28 0 L 0 0 0 12.5"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="50" fill="url(#grid)" />
          
          {/* 渐变填充 */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* 面积图 */}
          <polygon
            points={`5,45 ${svgPath} 95,45`}
            fill="url(#areaGradient)"
          />
          
          {/* 折线 */}
          <polyline
            points={svgPath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 数据点 */}
          {trendData.map((item, index) => {
            const x = 5 + (index / (trendData.length - 1)) * 90;
            const y = 45 - (item.overall / 5) * 40;
            const color = getFortuneColor(item.overall);
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={item.isToday ? 3 : 2}
                  fill={color}
                  stroke="white"
                  strokeWidth="0.5"
                />
                {item.isToday && (
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="3"
                      to="7"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.8"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 日期标签 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {trendData.map((item, index) => (
          <div
            key={index}
            className={`text-center text-xs ${
              item.isToday ? 'text-white font-bold' : 'text-white/60'
            }`}
          >
            <div>{item.label}</div>
            <div className={`mt-1 ${item.isToday ? 'text-purple-300' : ''}`}>
              {item.isToday ? '今天' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* 趋势统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <div className="text-white/60 text-xs mb-1">最高分</div>
          <div className="text-yellow-400 font-bold text-lg">
            {Math.max(...trendData.map(d => d.overall))}星
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <div className="text-white/60 text-xs mb-1">最低分</div>
          <div className="text-orange-400 font-bold text-lg">
            {Math.min(...trendData.map(d => d.overall))}星
          </div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <div className="text-white/60 text-xs mb-1">趋势</div>
          <div className="font-bold text-lg" style={{ color: trendColor }}>
            {trendLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
