'use client'

import { useState } from 'react'
import HexagramVisual from '@/components/HexagramVisual'
import Accordion from '@/components/Accordion'
import { FIVE_ELEMENTS } from '@/lib/iching/five-elements'
import { ORIGINAL_TEXTS } from '@/lib/iching/original-texts'
import { HEXAGRAM_DETAILS } from '@/lib/iching/hexagram-details'

interface EnhancedHexagramResultProps {
  result: any
  onReset: () => void
}

export default function EnhancedHexagramResult({ result, onReset }: EnhancedHexagramResultProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'detail' | 'original' | 'scenario'>('basic')

  const hexagram = result?.hexagram
  const interpretation = result?.interpretation
  const fiveElements = hexagram ? FIVE_ELEMENTS[hexagram.id] : null
  const originalText = hexagram ? ORIGINAL_TEXTS[hexagram.id] : null
  const detail = hexagram ? HEXAGRAM_DETAILS[hexagram.id] : null
  const changingLines = result?.changingLines

  if (!hexagram) return null

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
      const text = `${shareData.title}\n${shareData.text}\n\n${shareData.url}`
      await navigator.clipboard.writeText(text)
      alert('已复制到剪贴板，可以粘贴分享了！')
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* 卦象头部 */}
      <div className="mb-8 rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-slate-800">
        {/* 卦字符号 */}
        <div className="mb-4 animate-pulse text-8xl">{hexagram.character}</div>
        <h2 className="mb-2 text-3xl font-bold text-amber-900 dark:text-amber-100">
          第{hexagram.number}卦 · {hexagram.name}卦
        </h2>
        <p className="mb-4 text-lg text-amber-700 dark:text-amber-300">{hexagram.pinyin}</p>
        
        {/* 起卦信息 */}
        <div className="mb-6 text-sm text-amber-600 dark:text-amber-400">
          <span>起卦方式：{result.method === 'random' ? '随机' : result.method === 'time' ? '时间' : '数字'}</span>
          <span className="mx-2">·</span>
          <span>{result.timestamp.toLocaleString('zh-CN')}</span>
        </div>

        {/* 卦象可视化 */}
        <div className="mb-6 flex justify-center">
          <HexagramVisual structure={result.structure || hexagram.structure} size="lg" animated={true} />
        </div>

        {/* 变爻提示 */}
        {changingLines && Array.isArray(changingLines) && changingLines.length > 0 && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              🔮 变爻：{changingLines.map(pos => `第${pos}爻`).join('、')}
            </span>
          </div>
        )}
      </div>

      {/* 五行属性卡片 */}
      {fiveElements && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center shadow-md dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="text-xs text-amber-600 dark:text-amber-400">五行</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{fiveElements.element}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center shadow-md dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="text-xs text-amber-600 dark:text-amber-400">方位</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{fiveElements.direction}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center shadow-md dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="text-xs text-amber-600 dark:text-amber-400">季节</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{fiveElements.season}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center shadow-md dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="text-xs text-amber-600 dark:text-amber-400">属性</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{fiveElements.attribute}</div>
          </div>
        </div>
      )}

      {/* 选项卡导航 */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveTab('basic')}
          className={`rounded-full px-6 py-2 font-medium transition-all ${
            activeTab === 'basic'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700'
          }`}
        >
          📜 基础解读
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`rounded-full px-6 py-2 font-medium transition-all ${
            activeTab === 'detail'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700'
          }`}
        >
          💡 详细解析
        </button>
        <button
          onClick={() => setActiveTab('original')}
          className={`rounded-full px-6 py-2 font-medium transition-all ${
            activeTab === 'original'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700'
          }`}
        >
          📖 周易原文
        </button>
        <button
          onClick={() => setActiveTab('scenario')}
          className={`rounded-full px-6 py-2 font-medium transition-all ${
            activeTab === 'scenario'
              ? 'bg-amber-500 text-white shadow-md'
              : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700'
          }`}
        >
          🎯 场景解读
        </button>
      </div>

      {/* 选项卡内容 */}
      <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        {/* 基础解读 */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <Accordion title="📜 卦辞" defaultExpanded>
              <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-lg leading-relaxed text-amber-900 dark:text-amber-100">{hexagram.judgment}</p>
              </div>
            </Accordion>

            <Accordion title="🌄 象传" defaultExpanded>
              <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-lg leading-relaxed text-amber-900 dark:text-amber-100">{hexagram.image}</p>
              </div>
            </Accordion>

            {interpretation && (
              <Accordion title="🔮 综合解读" defaultExpanded>
                <div className="prose prose-amber max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap font-sans text-amber-800 dark:text-amber-200">{interpretation}</pre>
                </div>
              </Accordion>
            )}

            {/* 变卦展示 */}
            {result.transformedHexagram && result.transformedStructure && (
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-6 dark:from-slate-700 dark:to-slate-600">
                <h3 className="mb-4 text-center text-xl font-bold text-orange-900 dark:text-orange-100">
                  变卦 · {result.transformedHexagram.name}卦
                </h3>
                <div className="mb-4 flex justify-center">
                  <HexagramVisual structure={result.transformedStructure} size="md" animated={true} />
                </div>
                <p className="text-center text-orange-700 dark:text-orange-300">
                  {result.transformedHexagram.judgment}
                </p>
                <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  💡 启示：事物正在向"{result.transformedHexagram.name}"的方向发展
                </p>
              </div>
            )}
          </div>
        )}

        {/* 详细解析 */}
        {activeTab === 'detail' && detail && (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 className="mb-2 text-lg font-bold text-blue-900 dark:text-blue-100">核心含义</h3>
              <p className="text-blue-800 dark:text-blue-200">{detail.coreMeaning}</p>
            </div>

            <Accordion title="💡 白话详解" defaultExpanded>
              <p className="leading-relaxed text-amber-800 dark:text-amber-200">{detail.explanation}</p>
            </Accordion>

            <Accordion title="☯️ 卦象解析">
              <p className="leading-relaxed text-amber-800 dark:text-amber-200">{detail.trigramsAnalysis}</p>
            </Accordion>

            <Accordion title="🎓 人生启示">
              <p className="leading-relaxed text-amber-800 dark:text-amber-200">{detail.lifeLesson}</p>
            </Accordion>

            {detail.historicalStories && detail.historicalStories.length > 0 && (
              <Accordion title="📚 历史典故">
                <ul className="list-inside list-disc space-y-2 text-amber-800 dark:text-amber-200">
                  {detail.historicalStories.map((story, i) => (
                    <li key={i}>{story}</li>
                  ))}
                </ul>
              </Accordion>
            )}

            {detail.idioms && detail.idioms.length > 0 && (
              <Accordion title="📝 相关成语">
                <div className="flex flex-wrap gap-2">
                  {detail.idioms.map((idiom, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                    >
                      {idiom}
                    </span>
                  ))}
                </div>
              </Accordion>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <h3 className="mb-2 font-bold text-green-900 dark:text-green-100">✅ 宜</h3>
                <ul className="list-inside list-disc text-green-800 dark:text-green-200">
                  {detail.actions.do.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <h3 className="mb-2 font-bold text-red-900 dark:text-red-100">❌ 忌</h3>
                <ul className="list-inside list-disc text-red-800 dark:text-red-200">
                  {detail.actions.dont.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 周易原文 */}
        {activeTab === 'original' && originalText && (
          <div className="space-y-6">
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <h3 className="mb-2 text-lg font-bold text-amber-900 dark:text-amber-100">卦辞</h3>
              <p className="font-medium text-amber-900 dark:text-amber-100">{originalText.judgment}</p>
            </div>

            {originalText.judgmentComment && (
              <Accordion title="📖 彖传" defaultExpanded>
                <p className="leading-relaxed text-amber-800 dark:text-amber-200">{originalText.judgmentComment}</p>
              </Accordion>
            )}

            <Accordion title="🌄 象传" defaultExpanded>
              <p className="leading-relaxed text-amber-800 dark:text-amber-200">{originalText.image}</p>
            </Accordion>

            <Accordion title="📝 爻辞">
              <div className="space-y-3">
                {originalText.lines.map((line, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-slate-700">
                    <p className="font-medium text-amber-900 dark:text-amber-100">{line}</p>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        )}

        {/* 场景解读 */}
        {activeTab === 'scenario' && detail?.scenarios && (
          <div className="space-y-4">
            {detail.scenarios.career && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-100">
                  <span>💼</span> 事业
                </h3>
                <p className="text-blue-800 dark:text-blue-200">{detail.scenarios.career}</p>
              </div>
            )}

            {detail.scenarios.love && (
              <div className="rounded-lg bg-pink-50 p-4 dark:bg-pink-900/20">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-pink-900 dark:text-pink-100">
                  <span>❤️</span> 感情
                </h3>
                <p className="text-pink-800 dark:text-pink-200">{detail.scenarios.love}</p>
              </div>
            )}

            {detail.scenarios.health && (
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-green-900 dark:text-green-100">
                  <span>🏥</span> 健康
                </h3>
                <p className="text-green-800 dark:text-green-200">{detail.scenarios.health}</p>
              </div>
            )}

            {detail.scenarios.wealth && (
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-yellow-900 dark:text-yellow-100">
                  <span>💰</span> 财运
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200">{detail.scenarios.wealth}</p>
              </div>
            )}

            {detail.scenarios.study && (
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-purple-900 dark:text-purple-100">
                  <span>📚</span> 学业
                </h3>
                <p className="text-purple-800 dark:text-purple-200">{detail.scenarios.study}</p>
              </div>
            )}

            {detail.scenarios.relationship && (
              <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-indigo-900 dark:text-indigo-100">
                  <span>👥</span> 人际
                </h3>
                <p className="text-indigo-800 dark:text-indigo-200">{detail.scenarios.relationship}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={onReset}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
        >
          🔄 再占一卦
        </button>
        <button
          onClick={handleShare}
          className="rounded-full border-2 border-blue-300 bg-white px-6 py-3 font-medium text-blue-700 transition-all hover:bg-blue-50 dark:border-blue-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
        >
          📤 分享此卦
        </button>
        <a
          href="/favorites"
          className="rounded-full border-2 border-pink-300 bg-white px-6 py-3 font-medium text-pink-700 transition-all hover:bg-pink-50 dark:border-pink-700 dark:bg-slate-800 dark:text-pink-300 dark:hover:bg-slate-700"
        >
          ⭐ 我的收藏
        </a>
      </div>
    </div>
  )
}
