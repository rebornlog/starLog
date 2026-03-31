'use client'

import { useState } from 'react'
import HexagramVisual from '@/components/HexagramVisual'
import Accordion from '@/components/Accordion'

interface HexagramResultProps {
  result: any
  onReset: () => void
}

export default function HexagramResult({ result, onReset }: HexagramResultProps) {
  const [showLines, setShowLines] = useState(false)

  const hexagram = result?.hexagram
  const interpretation = result?.interpretation

  if (!hexagram) return null

  return (
    <div className="mx-auto max-w-4xl">
      {/* 标题 */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-amber-900 dark:text-amber-100">
          卦象结果
        </h2>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          第{hexagram.number}卦 · {hexagram.name}
        </p>
      </div>

      {/* 本卦 */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <h3 className="mb-4 text-xl font-bold text-amber-900 dark:text-amber-100">
          本卦
        </h3>
        <HexagramVisual
          lines={hexagram.lines}
          name={hexagram.name}
          showName={true}
        />
        
        {/* 卦辞 */}
        <Accordion title="📜 卦辞" defaultExpanded>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
              {interpretation?.judgment}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {interpretation?.judgmentComment}
            </p>
          </div>
        </Accordion>

        {/* 象传 */}
        <Accordion title="📖 象传" defaultExpanded>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
              {interpretation?.image}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {interpretation?.imageComment}
            </p>
          </div>
        </Accordion>

        {/* 爻辞详情 */}
        <Accordion title={`📝 爻辞详情 (${hexagram.lines.filter(l => l.isYang).length}阳${hexagram.lines.filter(l => !l.isYang).length}阴)`}>
          <div className="space-y-3">
            {hexagram.lines.map((line: any, i: number) => (
              <div
                key={i}
                className={`rounded-lg p-3 ${
                  line.isMoving
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-gray-50 dark:bg-slate-700'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-100">
                    {line.name}
                  </span>
                  {line.isMoving && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      动爻
                    </span>
                  )}
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {line.text}
                </p>
              </div>
            ))}
          </div>
        </Accordion>

        {/* 变卦（如果有动爻） */}
        {result.transformedHexagram && (
          <>
            <div className="my-6 border-t-2 border-dashed border-amber-200 dark:border-amber-800" />
            <h3 className="mb-4 text-xl font-bold text-amber-900 dark:text-amber-100">
              变卦
            </h3>
            <HexagramVisual
              lines={result.transformedHexagram.lines}
              name={result.transformedHexagram.name}
              showName={true}
            />
            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
              <p className="font-medium text-orange-900 dark:text-orange-100">
                发展趋势：{interpretation?.transformation}
              </p>
            </div>
          </>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onReset}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-white transition-all hover:shadow-lg"
        >
          🔄 重新起卦
        </button>
        <button
          onClick={() => {
            // TODO: 分享功能
            alert('分享功能开发中...')
          }}
          className="rounded-full bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-300 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        >
          📤 分享
        </button>
      </div>
    </div>
  )
}

// 在 HexagramResult 组件中添加原文展示
// 在爻辞详情 Accordion 后添加：

{/* 周易原文（如果有） */}
{interpretation?.hasOriginalText && (
  <>
    <div className="my-6 border-t-2 border-dashed border-amber-200 dark:border-amber-800" />
    <Accordion title="📜 周易原文">
      <div className="space-y-4">
        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <h4 className="mb-2 font-bold text-amber-900 dark:text-amber-100">卦辞</h4>
          <p className="font-medium text-amber-900 dark:text-amber-100">
            {interpretation.originalText?.judgment}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <h4 className="mb-2 font-bold text-amber-900 dark:text-amber-100">彖传</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {interpretation.originalText?.judgmentComment}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
          <h4 className="mb-2 font-bold text-amber-900 dark:text-amber-100">象传</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {interpretation.originalText?.image}
          </p>
        </div>
      </div>
    </Accordion>
  </>
)}

// 在卦象显示后添加五行属性
// 在 HexagramVisual 组件后添加：

{/* 五行属性 */}
{interpretation?.fiveElements && (
  <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
      <div className="text-xs text-amber-600 dark:text-amber-400">五行</div>
      <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
        {interpretation.fiveElements.element}
      </div>
    </div>
    <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
      <div className="text-xs text-amber-600 dark:text-amber-400">方位</div>
      <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
        {interpretation.fiveElements.direction}
      </div>
    </div>
    <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
      <div className="text-xs text-amber-600 dark:text-amber-400">季节</div>
      <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
        {interpretation.fiveElements.season}
      </div>
    </div>
    <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
      <div className="text-xs text-amber-600 dark:text-amber-400">属性</div>
      <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
        {interpretation.fiveElements.attribute}
      </div>
    </div>
  </div>
)}
