'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { castHexagram, interpretHexagram } from '@/lib/iching/divination'
import { HEXAGRAMS } from '@/lib/iching/data'
import { addFavorite, addHistory as addStorageHistory, isFavorited, removeFavorite } from '@/lib/storage'
import { addHistory as addDivinationHistory } from '@/lib/iching/history'
import { useToast } from '@/components/Toast'
import HexagramVisual from '@/components/HexagramVisual'
import Accordion from '@/components/Accordion'
import DivinationGuide from '@/components/DivinationGuide'
import NumberInput from '@/components/NumberInput'
import EnhancedHexagramResult from '@/components/EnhancedHexagramResult'
import EnhancedDivinationGuide from '@/components/EnhancedDivinationGuide'


export const metadata = {
  title: 'Iching | starLog',
  description: 'Iching 页面 - starLog 个人知识库',
  robots: {
    index: true,
    follow: true,
  },
}


type Method = 'random' | 'time' | 'number'
type PageState = 'guide' | 'select' | 'input' | 'confirm' | 'result'

export default function IChingPage() {
  const { showToast } = useToast()
  const [pageState, setPageState] = useState<PageState>('guide')
  const [method, setMethod] = useState<Method | null>(null)
  const [numbers, setNumbers] = useState<[number, number, number] | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [favorited, setFavorited] = useState(false)

  // 检查收藏状态
  useEffect(() => {
    if (result?.hexagram) {
      const id = `hexagram-${result.hexagram.id}`
      setFavorited(isFavorited('iching', id))
    }
  }, [result])

  // 起卦
  const handleDivination = () => {
    setLoading(true)
    try {
      const divResult = castHexagram(method || 'random', numbers || undefined)
      const interpretation = interpretHexagram(divResult)
      setResult({ ...divResult, interpretation })
      setPageState('result')
    } catch (error) {
      console.error('起卦失败:', error)
      showToast('起卦失败，请重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 重置
  const handleReset = () => {
    setPageState('select')
    setMethod(null)
    setNumbers(null)
    setResult(null)
  }

  // 完成引导
  const handleGuideComplete = () => {
    setPageState('select')
  }

  // 选择起卦方式
  const handleMethodSelect = (selectedMethod: Method) => {
    setMethod(selectedMethod)
    if (selectedMethod === 'number') {
      setPageState('input')
    } else {
      setPageState('confirm')
    }
  }

  // 数字输入提交
  const handleNumberSubmit = (nums: [number, number, number]) => {
    setNumbers(nums)
    setMethod('number')
    setPageState('confirm')
  }

  // 返回选择
  const handleBackToSelect = () => {
    setPageState('select')
    setMethod(null)
    setNumbers(null)
  }

  // 渲染不同状态
  const renderContent = () => {
    switch (pageState) {
      case 'guide':
        return <EnhancedDivinationGuide onComplete={handleGuideComplete} />

      case 'select':
        return (
          <>
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold text-amber-900 md:text-5xl dark:text-amber-100">
                ☯ 易经问卦 ☯
              </h1>
              <p className="text-lg text-amber-700 dark:text-amber-300">心诚则灵 · 探索易经智慧</p>
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                三种起卦方式，为您揭示当下启示
              </p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <button
                onClick={() => handleMethodSelect('random')}
                className="group rounded-2xl border-2 border-amber-200 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-amber-800 dark:bg-slate-800"
              >
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">🎲</div>
                <h3 className="mb-2 text-xl font-bold text-amber-900 dark:text-amber-100">
                  随机起卦
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  模拟铜钱摇卦，最传统的方式
                </p>
              </button>

              <button
                onClick={() => handleMethodSelect('time')}
                className="group rounded-2xl border-2 border-amber-200 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-amber-800 dark:bg-slate-800"
              >
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">🕐</div>
                <h3 className="mb-2 text-xl font-bold text-amber-900 dark:text-amber-100">
                  时间起卦
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">基于当前时辰，天人合一</p>
              </button>

              <button
                onClick={() => handleMethodSelect('number')}
                className="group rounded-2xl border-2 border-amber-200 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-amber-800 dark:bg-slate-800"
              >
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">🔢</div>
                <h3 className="mb-2 text-xl font-bold text-amber-900 dark:text-amber-100">
                  数字起卦
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  输入 3 个数字，心动即占
                </p>
              </button>
            </div>
          </>
        )

      case 'input':
        return <NumberInput onSubmit={handleNumberSubmit} onBack={handleBackToSelect} />

      case 'confirm':
        return (
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-slate-800">
            <p className="mb-6 text-amber-700 dark:text-amber-300">
              {method === 'random' ? '准备摇动铜钱...' : '正在感应时辰...'}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDivination}
                disabled={loading}
                className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-lg font-bold text-white transition-all hover:shadow-lg disabled:opacity-50"
              >
                {loading ? '起卦中...' : '开始起卦'}
              </button>
              <button
                onClick={handleBackToSelect}
                className="rounded-full bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
              >
                返回
              </button>
            </div>
          </div>
        )

      case 'result':
        return result ? (
          <>
            <EnhancedHexagramResult result={result} onReset={handleReset} />

            {/* 收藏按钮 */}
            {result?.hexagram && (
              <div className="mb-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const id = `hexagram-${result.hexagram.id}`
                    const isFav = isFavorited('iching', id)
                    if (isFav) {
                      removeFavorite('iching', id)
                      setFavorited(false)
                      showToast('已取消收藏', 'info')
                    } else {
                      addFavorite({
                        type: 'iching',
                        id,
                        title: `第${result.hexagram.number}卦 - ${result.hexagram.name}`,
                        data: { hexagram: result.hexagram, interpretation: result.interpretation },
                      })
                      addStorageHistory({
                        type: 'iching',
                        id: `${id}-${Date.now()}`,
                        title: `第${result.hexagram.number}卦 - ${result.hexagram.name}`,
                        data: { hexagram: result.hexagram },
                      })
                      // 添加到问卦历史
                      addDivinationHistory({
                        hexagramId: result.hexagram.id,
                        hexagramName: result.hexagram.name,
                        method: result.method,
                        changingLines: result.changingLines,
                        transformedHexagramId: result.transformedHexagram?.id,
                      })
                      setFavorited(true)
                      showToast('收藏成功！⭐', 'success')
                    }
                  }}
                  className={`flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all ${
                    favorited
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'border-2 border-pink-300 bg-white text-gray-700 hover:bg-pink-50 dark:border-pink-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-xl">{favorited ? '⭐' : '☆'}</span>
                  <span>{favorited ? '已收藏' : '收藏此卦'}</span>
                </button>
              </div>
            )}
          </>
        ) : null

      default:
        return null
    }
  }

  // 引导页全屏显示
  if (pageState === 'guide') {
    return renderContent()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 px-4 py-12 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 装饰背景 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 text-9xl">☯</div>
        <div className="absolute right-10 bottom-20 text-9xl">☯</div>
        <div className="absolute top-1/2 left-1/4 text-6xl">䷀</div>
        <div className="absolute top-1/3 right-1/4 text-6xl">䷁</div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        {renderContent()}

        {/* 底部说明 */}
        {pageState !== 'result' && (
          <div className="mt-12 text-center">
            <div className="mx-auto max-w-2xl rounded-xl bg-white/60 p-6 backdrop-blur-sm dark:bg-slate-800/60">
              <h3 className="mb-2 font-bold text-amber-900 dark:text-amber-100">📖 关于易经问卦</h3>
              <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-300">
                易经，群经之首，大道之源。六十四卦，三百八十四爻，
                <br />
                包罗万象，揭示天地人之道。
                <br />
                <span className="text-amber-600 dark:text-amber-400">
                  问卦仅供参考，决策还需理性。
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 导航 */}
        {pageState !== 'result' && (
          <div className="mt-8 flex justify-center gap-6">
            <Link
              href="/iching/history"
              className="inline-flex items-center gap-2 text-amber-700 transition-colors hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            >
              <span>📜</span>
              <span>问卦历史</span>
            </Link>
            <a
              href="/zodiac"
              className="inline-flex items-center text-amber-700 transition-colors hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
            >
              ← 返回星座运势
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// 卦象结果组件
function HexagramResult({ result, onReset }: { result: any; onReset: () => void }) {
  const { hexagram, character, method, timestamp, interpretation, structure, transformedHexagram, transformedStructure, changingLines } = result

  if (!hexagram) {
    return <div>卦象未找到</div>
  }

  // 准备 Accordion 数据
  const accordionItems = [
    {
      id: 'judgment',
      title: '卦辞',
      icon: '📜',
      content: <p className="text-lg leading-relaxed">{hexagram.judgment}</p>,
      defaultOpen: true,
    },
    {
      id: 'image',
      title: '象传',
      icon: '🌄',
      content: <p className="text-lg leading-relaxed">{hexagram.image}</p>,
    },
    {
      id: 'interpretation',
      title: '解读',
      icon: '🔮',
      content: (
        <pre className="font-sans text-lg leading-relaxed whitespace-pre-wrap">
          {interpretation}
        </pre>
      ),
    },
  ]

  // 分享功能
  const handleShare = async () => {
    const shareData = {
      title: `易经问卦 - ${hexagram.name}卦`,
      text: `【${hexagram.name}卦】${hexagram.judgment}\n\n${interpretation}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      // 降级方案：复制到剪贴板
      const text = `${shareData.title}\n${shareData.text}\n\n${shareData.url}`
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板，可以粘贴分享了！')
    }
  }

  return (
    <div className="space-y-6">
      {/* 卦象头部 */}
      <div className="rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-slate-800">
        {/* 卦象可视化 */}
        <div className="mb-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:from-slate-700 dark:to-slate-600">
          <HexagramVisual structure={structure || hexagram.structure} size="lg" animated={true} />
        </div>

        {/* 卦名字符 */}
        <div className="mb-4 animate-pulse text-8xl">{character}</div>
        <h2 className="mb-2 text-3xl font-bold text-amber-900 dark:text-amber-100">
          第{hexagram.number}卦 · {hexagram.name}
        </h2>
        <p className="mb-4 text-lg text-amber-700 dark:text-amber-300">{hexagram.pinyin}</p>
        <div className="text-sm text-amber-600 dark:text-amber-400">
          起卦方式：{method === 'random' ? '随机' : method === 'time' ? '时间' : '数字'} ·{' '}
          {timestamp.toLocaleString('zh-CN')}
        </div>
        
        {/* 变爻提示 */}
        {changingLines && Array.isArray(changingLines) && changingLines.length > 0 && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              🔮 变爻：{changingLines.map(pos => `第${pos}爻`).join('、')}
            </span>
          </div>
        )}
      </div>

      {/* 变卦展示（如果有） */}
      {transformedHexagram && transformedStructure && (
        <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 p-8 shadow-xl dark:from-slate-700 dark:to-slate-600">
          <h3 className="mb-4 text-center text-xl font-bold text-orange-900 dark:text-orange-100">
            变卦 · {transformedHexagram.name}卦
          </h3>
          <div className="mb-4 flex justify-center">
            <HexagramVisual structure={transformedStructure} size="md" animated={true} />
          </div>
          <p className="text-center text-orange-700 dark:text-orange-300">
            {transformedHexagram.judgment}
          </p>
          <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
            💡 启示：事物正在向"{transformedHexagram.name}"的方向发展
          </p>
        </div>
      )}

      {/* 使用 Accordion 展示卦辞、象传、解读 */}
      <Accordion items={accordionItems} />

      {/* 操作按钮 */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onReset}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
        >
          再占一卦
        </button>
        <button
          onClick={handleShare}
          className="rounded-full border-2 border-blue-300 bg-white px-6 py-3 font-medium text-blue-700 transition-all hover:bg-blue-50 dark:border-blue-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
        >
          📤 分享此卦
        </button>
        <a
          href="/zodiac"
          className="rounded-full border-2 border-purple-300 bg-white px-6 py-3 font-medium text-purple-700 transition-all hover:bg-purple-50 dark:border-purple-700 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-slate-700"
        >
          星座运势
        </a>
        <Link
          href="/favorites"
          className="rounded-full border-2 border-pink-300 bg-white px-6 py-3 font-medium text-pink-700 transition-all hover:bg-pink-50 dark:border-pink-700 dark:bg-slate-800 dark:text-pink-300 dark:hover:bg-slate-700"
        >
          ⭐ 我的收藏
        </Link>
      </div>
    </div>
  )
}
