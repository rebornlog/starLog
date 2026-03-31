'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { calculateBazi, getElementColor } from '@/lib/bazi/calculator'
import { generateDietAdvice, FOOD_DATABASE } from '@/lib/bazi/food-database'
import { addFavorite, addHistory, isFavorited, removeFavorite } from '@/lib/storage'
import { useToast } from '@/components/Toast'
import SEO from '@/components/SEO'
import { Skeleton } from '@/components/Skeleton'


export const metadata = {
  title: 'Diet | starLog',
  description: 'Diet 页面 - starLog 个人知识库',
  robots: {
    index: true,
    follow: true,
  },
}


// 动态导入重型组件
const RadarChart = dynamic(() => import('@/components/RadarChart'), {
  loading: () => <div className="h-64 flex items-center justify-center"><Skeleton className="w-full h-full" /></div>,
  ssr: false
})

export default function DietPage() {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    gender: 'male',
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [favorited, setFavorited] = useState(false)

  // 检查收藏状态
  useEffect(() => {
    if (result?.bazi) {
      const id = `diet-${formData.year}-${formData.month}-${formData.day}-${formData.hour}`;
      setFavorited(isFavorited('diet', id));
    }
  }, [result, formData]);

  // 收藏切换函数
  const handleToggleFavorite = () => {
    const id = `diet-${result.bazi.year}-${result.bazi.month}-${result.bazi.day}-${result.bazi.hour}`;
    if (favorited) {
      removeFavorite('diet', id);
      setFavorited(false);
      showToast('已取消收藏', 'info');
    } else {
      addFavorite({
        type: 'diet',
        id,
        title: `能量饮食方案 - ${result.birthInfo}`,
        data: { bazi: result.bazi, advice: result.advice, birthInfo: result.birthInfo },
      });
      addHistory({
        type: 'diet',
        id: `${id}-${Date.now()}`,
        title: `能量饮食方案 - ${result.birthInfo}`,
        data: { bazi: result.bazi, advice: result.advice },
      });
      setFavorited(true);
      showToast('收藏成功！⭐', 'success');
    }
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      try {
        const year = parseInt(formData.year)
        const month = parseInt(formData.month)
        const day = parseInt(formData.day)
        const hour = parseInt(formData.hour)

        if (!year || !month || !day || hour === undefined) {
          alert('请填写完整的生辰信息')
          setLoading(false)
          return
        }

        const bazi = calculateBazi(year, month, day, hour)
        const advice = generateDietAdvice(bazi.weakElements, bazi.strongElements)

        setResult({
          bazi,
          advice,
          birthInfo: `${year}年${month}月${day}日${hour}时`,
        })
      } catch (error) {
        console.error('计算失败:', error)
        alert('计算失败，请检查输入')
      } finally {
        setLoading(false)
      }
    }, 1000)
  }

  // 重置
  const handleReset = () => {
    setFormData({ year: '', month: '', day: '', hour: '', gender: 'male' })
    setResult(null)
  }

  return (
    <>
      <SEO
        title="能量饮食 - 八字五行饮食方案"
        description="根据您的生辰八字分析五行强弱，定制专属能量饮食方案。包含推荐食物、避免食物、五行平衡建议和四季调养指南。"
        keywords={['能量饮食', '八字饮食', '五行饮食', '健康饮食', '生辰八字', '五行平衡']}
      />
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 px-4 py-12 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* 装饰背景 - 移动端简化 */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-10 hidden-mobile">
          <div className="absolute top-20 left-10 text-8xl">🥗</div>
          <div className="absolute right-10 bottom-20 text-8xl">🍲</div>
          <div className="absolute top-1/2 left-1/4 text-6xl">🥕</div>
          <div className="absolute top-1/3 right-1/4 text-6xl">🍎</div>
        </div>

        {/* 跳过导航链接 - 可访问性 */}
        <a href="#main-content" className="skip-link">
          跳转到主要内容
        </a>

        <div className="relative z-10 mx-auto max-w-5xl" id="main-content">
          {/* 标题 */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-green-900 md:text-5xl dark:text-green-100">
              🍲 能量饮食 🍲
            </h1>
            <p className="text-lg text-green-700 dark:text-green-300">根据生辰八字 · 定制专属饮食</p>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              五行平衡 · 阴阳调和 · 吃出健康
            </p>
          </div>

        {!result ? (
          /* 输入表单 */
          <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 生辰输入 */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-green-900 dark:text-green-100">
                  <span className="text-2xl">📅</span>
                  请输入生辰
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      年份
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="1990"
                      min="1900"
                      max="2026"
                      className="w-full rounded-xl border-2 border-green-300 px-4 py-3 focus:border-green-500 focus:outline-none dark:border-green-700 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      月份
                    </label>
                    <input
                      type="number"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      placeholder="1-12"
                      min="1"
                      max="12"
                      className="w-full rounded-xl border-2 border-green-300 px-4 py-3 focus:border-green-500 focus:outline-none dark:border-green-700 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      日期
                    </label>
                    <input
                      type="number"
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      placeholder="1-31"
                      min="1"
                      max="31"
                      className="w-full rounded-xl border-2 border-green-300 px-4 py-3 focus:border-green-500 focus:outline-none dark:border-green-700 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      时辰
                    </label>
                    <input
                      type="number"
                      value={formData.hour}
                      onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                      placeholder="0-23"
                      min="0"
                      max="23"
                      className="w-full rounded-xl border-2 border-green-300 px-4 py-3 focus:border-green-500 focus:outline-none dark:border-green-700 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 性别选择 */}
              <div>
                <h3 className="mb-3 text-lg font-bold text-green-900 dark:text-green-100">性别</h3>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="sr-only"
                    />
                    <div
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        formData.gender === 'male'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <span className="text-2xl">👨</span>
                      <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">男</span>
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="sr-only"
                    />
                    <div
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        formData.gender === 'female'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <span className="text-2xl">👩</span>
                      <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">女</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? '分析中...' : '开始分析'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border-2 border-gray-300 px-6 py-4 font-medium transition-all hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-slate-700"
                >
                  重置
                </button>
              </div>
            </form>

            {/* 说明 */}
            <div className="mt-6 rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-center text-sm text-green-700 dark:text-green-300">
                💡 请输入您的农历或公历生辰（系统会自动转换）
                <br />
                时辰为 24 小时制，如不确定可填 12（午时）
              </p>
            </div>
          </div>
        ) : (
          /* 结果展示 */
          <DietResult 
            result={result} 
            onReset={handleReset} 
            favorited={favorited}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="mx-auto max-w-2xl rounded-xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-800/60">
            <h3 className="mb-2 font-bold text-green-900 dark:text-green-100">📖 关于能量饮食</h3>
            <p className="text-sm leading-relaxed text-green-700 dark:text-green-300">
              根据生辰八字分析五行强弱，
              <br />
              推荐补充弱五行的食材，避免强化强五行。
              <br />
              <span className="text-green-600 dark:text-green-400">
                饮食建议仅供参考，具体请遵医嘱。
              </span>
            </p>
          </div>
        </div>

        {/* 导航 */}
        <div className="mt-8 flex justify-center gap-6">
          <a
            href="/zodiac"
            className="inline-flex items-center text-purple-700 transition-colors hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
          >
            ✨ 星座运势
          </a>
          <a
            href="/iching"
            className="inline-flex items-center text-amber-700 transition-colors hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
          >
            ☯ 易经问卦
          </a>
          <a
            href="/"
            className="inline-flex items-center text-green-700 transition-colors hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
    </>
  )
}

// 结果展示组件
interface DietResultProps {
  result: any;
  onReset: () => void;
  favorited: boolean;
  onToggleFavorite: () => void;
}

function DietResult({ result, onReset, favorited, onToggleFavorite }: DietResultProps) {
  const { bazi, advice, birthInfo } = result

  return (
    <div className="space-y-6">
      {/* 八字排盘 + 五行雷达图 */}
      <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-green-900 dark:text-green-100">
          <span className="text-3xl">📅</span>
          生辰八字
        </h2>
        <div className="mb-4 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-400">{birthInfo}</p>
        </div>
        
        {/* 五行雷达图 */}
        <div className="mb-8 flex justify-center">
          <RadarChart
            data={[
              { label: '金', value: ((bazi.elements['金'] || 0) / 8) * 100, color: '#fbbf24' },
              { label: '木', value: ((bazi.elements['木'] || 0) / 8) * 100, color: '#10b981' },
              { label: '水', value: ((bazi.elements['水'] || 0) / 8) * 100, color: '#3b82f6' },
              { label: '火', value: ((bazi.elements['火'] || 0) / 8) * 100, color: '#ef4444' },
              { label: '土', value: ((bazi.elements['土'] || 0) / 8) * 100, color: '#92400e' },
            ]}
            size={280}
            className="animate-fade-in"
          />
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '年柱', pillar: bazi.yearPillar },
            { label: '月柱', pillar: bazi.monthPillar },
            { label: '日柱', pillar: bazi.dayPillar },
            { label: '时柱', pillar: bazi.hourPillar },
          ].map(({ label, pillar }) => (
            <div
              key={label}
              className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20"
            >
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {pillar.heavenlyStem.name}
                {pillar.earthlyBranch.name}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {pillar.heavenlyStem.element}
                {pillar.earthlyBranch.element}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 五行分析 */}
      <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-green-900 dark:text-green-100">
          <span className="text-3xl">⚖️</span>
          五行分析
        </h2>
        <div className="mb-6 grid grid-cols-5 gap-4">
          {['金', '木', '水', '火', '土'].map((element) => {
            const count = bazi.elements[element as keyof typeof bazi.elements] || 0
            const isStrong = bazi.strongElements.includes(element)
            const isWeak = bazi.weakElements.includes(element)
            return (
              <div
                key={element}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: `${getElementColor(element)}20` }}
              >
                <p className="mb-2 text-2xl font-bold" style={{ color: getElementColor(element) }}>
                  {element}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
                {isStrong && (
                  <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-1 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    强
                  </span>
                )}
                {isWeak && (
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    弱
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* 强弱说明 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
            <h3 className="mb-2 font-bold text-green-900 dark:text-green-100">💪 强五行</h3>
            <p className="text-green-700 dark:text-green-300">
              {bazi.strongElements.length > 0 ? bazi.strongElements.join('、') : '五行相对平衡'}
            </p>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              建议：适当减少对应食材摄入
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-100">💪 弱五行</h3>
            <p className="text-blue-700 dark:text-blue-300">
              {bazi.weakElements.length > 0 ? bazi.weakElements.join('、') : '五行相对平衡'}
            </p>
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">建议：多补充对应食材</p>
          </div>
        </div>
      </div>

      {/* 饮食建议 */}
      <div className="rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-8 shadow-xl dark:from-slate-700 dark:to-slate-800">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-green-900 dark:text-green-100">
          <span className="text-3xl">🥗</span>
          饮食建议
        </h2>

        {/* 推荐食材 */}
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-green-900 dark:text-green-100">
            <span className="text-xl">✅</span>
            推荐食材（补充弱五行）
          </h3>
          <div className="flex flex-wrap gap-2">
            {advice.recommend.slice(0, 10).map((food: any, i: number) => (
              <span
                key={i}
                className="rounded-full border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 dark:border-green-700 dark:bg-slate-800 dark:text-green-300"
              >
                {food.name}
              </span>
            ))}
          </div>
        </div>

        {/* 避免食材 */}
        {advice.avoid.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-red-900 dark:text-red-100">
              <span className="text-xl">❌</span>
              少食食材（避免强化强五行）
            </h3>
            <div className="flex flex-wrap gap-2">
              {advice.avoid.map((food: any, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 dark:border-red-700 dark:bg-slate-800 dark:text-red-300"
                >
                  {food.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 一日三餐 */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-green-900 dark:text-green-100">
            <span className="text-xl">📋</span>
            一日三餐建议
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {advice.dailyPlan.map((plan: any, i: number) => (
              <div key={i} className="rounded-xl bg-white p-4 dark:bg-slate-800">
                <p className="mb-2 font-bold text-green-900 dark:text-green-100">{plan.meal}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {plan.foods.length > 0 ? plan.foods.join(' + ') : '均衡饮食'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 收藏按钮 */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
            favorited
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-pink-300 dark:border-pink-700 hover:bg-pink-50 dark:hover:bg-slate-700'
          }`}
        >
          <span className="text-xl">{favorited ? '⭐' : '☆'}</span>
          <span>{favorited ? '已收藏' : '收藏此方案'}</span>
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onReset}
          className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
        >
          重新分析
        </button>
        <a
          href="/zodiac"
          className="rounded-full border-2 border-purple-300 bg-white px-6 py-3 font-medium text-purple-700 transition-all hover:bg-purple-50 dark:border-purple-700 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-slate-700"
        >
          星座运势
        </a>
        <a
          href="/iching"
          className="rounded-full border-2 border-amber-300 bg-white px-6 py-3 font-medium text-amber-700 transition-all hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
        >
          易经问卦
        </a>
        <a
          href="/favorites"
          className="rounded-full border-2 border-pink-300 bg-white px-6 py-3 font-medium text-pink-700 transition-all hover:bg-pink-50 dark:border-pink-700 dark:bg-slate-800 dark:text-pink-300 dark:hover:bg-slate-700"
        >
          ⭐ 收藏夹
        </a>
      </div>
    </div>
  )
}
