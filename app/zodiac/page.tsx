import Link from 'next/link';
import { ZODIAC_SIGNS } from '@/lib/zodiac/data';

export const metadata = {
  title: '星座运势 - starLog',
  description: '十二星座每日运势查询',
};

export default function ZodiacPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 py-12 px-4">
      {/* 星空背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-star-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ✨ 星座运势 ✨
          </h1>
          <p className="text-purple-200 text-lg">
            探索星辰指引，发现今日运势
          </p>
          <p className="text-purple-300 text-sm mt-2">
            每日更新 · 算法生成 · 趣味参考
          </p>
        </div>

        {/* 星座网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {ZODIAC_SIGNS.map((sign) => (
            <Link
              key={sign.id}
              href={`/zodiac/${sign.id}`}
              className={`group relative bg-gradient-to-br ${sign.gradient} rounded-2xl p-6 
                transform transition-all duration-300 hover:scale-105 hover:shadow-2xl 
                hover:shadow-${sign.element === '火' ? 'orange' : sign.element === '土' ? 'green' : sign.element === '风' ? 'blue' : 'purple'}-500/30
                backdrop-blur-sm bg-opacity-90`}
            >
              {/* 星座图标 */}
              <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {sign.icon}
              </div>
              
              {/* 星座名称 */}
              <h3 className="text-white font-bold text-xl mb-1">
                {sign.name}
              </h3>
              <p className="text-white/80 text-sm mb-2">
                {sign.englishName}
              </p>
              
              {/* 日期范围 */}
              <div className="text-white/70 text-xs">
                {sign.dateRange}
              </div>
              
              {/* 元素标签 */}
              <div className="absolute top-3 right-3">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                  {sign.element}
                </span>
              </div>

              {/* 悬停提示 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-colors duration-300" />
            </Link>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-white font-bold mb-2">🔮 关于星座运势</h3>
            <p className="text-purple-200 text-sm leading-relaxed">
              本运势采用算法生成，基于日期与星座的伪随机计算。
              <br />
              同一星座在同一天的运势相同，次日自动更新。
              <br />
              <span className="text-purple-300">仅供娱乐参考，生活掌握在自己手中。</span>
            </p>
          </div>
        </div>

        {/* 导航 */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center">
          <Link
            href="/"
            className="inline-flex items-center text-purple-300 hover:text-white transition-colors"
          >
            ← 返回首页
          </Link>
          <Link
            href="/iching"
            className="inline-flex items-center text-amber-300 hover:text-amber-100 transition-colors"
          >
            ☯ 易经问卦
          </Link>
          <Link
            href="/diet"
            className="inline-flex items-center text-green-300 hover:text-green-100 transition-colors"
          >
            🥗 能量饮食
          </Link>
        </div>
      </div>
    </div>
  );
}
