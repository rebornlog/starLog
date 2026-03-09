'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { ZODIAC_SIGNS, getZodiacSign } from '@/lib/zodiac/data';
import { generateDailyFortune } from '@/lib/zodiac/fortune';
import { addFavorite, addHistory, isFavorited, removeFavorite } from '@/lib/storage';

interface PageProps {
  params: Promise<{
    sign: string;
  }>;
}

// 运势等级
function getFortuneLevel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 90) return { label: '大吉', emoji: '🌟', color: 'text-yellow-400' };
  if (score >= 80) return { label: '吉', emoji: '✨', color: 'text-green-400' };
  if (score >= 70) return { label: '小吉', emoji: '🌙', color: 'text-blue-400' };
  if (score >= 60) return { label: '平', emoji: '☁️', color: 'text-gray-400' };
  return { label: '注意', emoji: '⚠️', color: 'text-orange-400' };
}

// 运势条组件
function FortuneBar({ label, score, color }: { label: string; score: number; color: string }) {
  const level = getFortuneLevel(score);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">{label}</span>
        <span className={`${level.color} font-bold`}>
          {level.emoji} {score}分 {level.label}
        </span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ZodiacSignPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { sign: signId } = resolvedParams;
  const sign = ZODIAC_SIGNS.find(s => s.id === signId);
  
  const [fortune, setFortune] = useState<any>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sign) return;

    // 生成今日运势
    const fortuneData = generateDailyFortune(sign, new Date());
    setFortune(fortuneData);
    
    // 检查收藏状态
    const id = `zodiac-${sign.id}-${new Date().toDateString()}`;
    setFavorited(isFavorited('zodiac', id));
    setLoading(false);
  }, [sign]);

  if (!sign || loading || !fortune) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="text-white text-2xl">加载中...</div>
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const fortuneId = `zodiac-${sign.id}-${today.toDateString()}`;

  const handleToggleFavorite = () => {
    if (favorited) {
      removeFavorite('zodiac', fortuneId);
      setFavorited(false);
    } else {
      addFavorite({
        type: 'zodiac',
        id: fortuneId,
        title: `${sign.name} - ${dateStr}`,
        data: { sign, fortune, date: dateStr },
      });
      addHistory({
        type: 'zodiac',
        id: `${fortuneId}-${Date.now()}`,
        title: `${sign.name} - ${dateStr}`,
        data: { sign, fortune },
      });
      setFavorited(true);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${sign.gradient} py-12 px-4`}>
      {/* 星空背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/zodiac"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
          >
            ← 返回星座列表
          </Link>
        </div>

        {/* 星座头部 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="text-7xl">{sign.icon}</div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {sign.name}
                </h1>
                <p className="text-white/80 text-lg">{sign.englishName}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white/70">{sign.dateRange}</span>
                  <span className="text-white/50">•</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                    {sign.element}象星座
                  </span>
                </div>
              </div>
            </div>
            
            {/* 收藏按钮 */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                favorited
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : 'bg-white/20 text-white border-2 border-white/50 hover:bg-white/30'
              }`}
            >
              <span className="text-xl">{favorited ? '⭐' : '☆'}</span>
              <span className="text-sm">{favorited ? '已收藏' : '收藏'}</span>
            </button>
          </div>
          
          <div className="text-white/90 text-center py-4 border-t border-white/20">
            <p className="text-lg">{dateStr}</p>
          </div>
        </div>

        {/* 整体运势 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            整体运势
          </h2>
          
          <FortuneBar
            label="综合运势"
            score={fortune.overall}
            color="bg-gradient-to-r from-yellow-400 to-orange-500"
          />
          
          <p className="text-white/90 text-lg leading-relaxed mt-6 p-4 bg-white/5 rounded-xl">
            {fortune.description}
          </p>
        </div>

        {/* 分项运势 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 爱情运 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💕</span>
              爱情运势
            </h3>
            <FortuneBar
              label="爱情"
              score={fortune.love}
              color="bg-gradient-to-r from-pink-400 to-rose-500"
            />
          </div>

          {/* 事业运 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💼</span>
              事业运势
            </h3>
            <FortuneBar
              label="事业"
              score={fortune.career}
              color="bg-gradient-to-r from-blue-400 to-indigo-500"
            />
          </div>

          {/* 财运 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              财运运势
            </h3>
            <FortuneBar
              label="财运"
              score={fortune.wealth}
              color="bg-gradient-to-r from-yellow-400 to-amber-500"
            />
          </div>
        </div>

        {/* 幸运元素 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🍀 幸运元素</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">幸运颜色</span>
                <span className="text-white font-bold text-lg">{fortune.luckyColor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">幸运数字</span>
                <span className="text-white font-bold text-lg">{fortune.luckyNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">📅 今日宜忌</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400 text-xl">✅</span>
                  <span className="text-white font-medium">宜</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fortune.good.map((item: string) => (
                    <span
                      key={item}
                      className="bg-green-500/30 text-green-200 px-3 py-1 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400 text-xl">❌</span>
                  <span className="text-white font-medium">忌</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fortune.bad.map((item: string) => (
                    <span
                      key={item}
                      className="bg-red-500/30 text-red-200 px-3 py-1 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 温馨提示 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <p className="text-white/80">
            🔮 星座运势仅供娱乐参考，生活的主动权永远在你手中。
            <br />
            保持积极心态，每一天都可以很精彩！
          </p>
        </div>

        {/* 导航 */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
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
          <Link
            href="/favorites"
            className="inline-flex items-center text-pink-300 hover:text-pink-100 transition-colors"
          >
            ⭐ 我的收藏
          </Link>
        </div>
      </div>
    </div>
  );
}
