'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { castHexagram, interpretHexagram } from '@/lib/iching/divination';
import { HEXAGRAMS } from '@/lib/iching/data';
import { addFavorite, addHistory, isFavorited, removeFavorite } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import HexagramVisual from '@/components/HexagramVisual';

type Method = 'random' | 'time' | 'number';

export default function IChingPage() {
  const { showToast } = useToast();
  const [method, setMethod] = useState<Method | null>(null);
  const [numbers, setNumbers] = useState<[number, number, number] | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);

  // 检查收藏状态
  useEffect(() => {
    if (result?.hexagram) {
      const id = `hexagram-${result.hexagram.id}`;
      setFavorited(isFavorited('iching', id));
    }
  }, [result]);

  // 起卦
  const handleDivination = () => {
    setLoading(true);
    
    // 模拟思考时间，增加仪式感
    setTimeout(() => {
      try {
        const divResult = castHexagram(method || 'random', numbers || undefined);
        const interpretation = interpretHexagram(divResult);
        setResult({ ...divResult, interpretation });
      } catch (error) {
        console.error('起卦失败:', error);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  // 重置
  const handleReset = () => {
    setMethod(null);
    setNumbers(null);
    setResult(null);
  };

  // 数字输入
  const handleNumberSubmit = (nums: [number, number, number]) => {
    setNumbers(nums);
    setMethod('number');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-9xl">☯</div>
        <div className="absolute bottom-20 right-10 text-9xl">☯</div>
        <div className="absolute top-1/2 left-1/4 text-6xl">䷀</div>
        <div className="absolute top-1/3 right-1/4 text-6xl">䷁</div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            ☯ 易经问卦 ☯
          </h1>
          <p className="text-amber-700 dark:text-amber-300 text-lg">
            心诚则灵 · 探索易经智慧
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
            三种起卦方式，为您揭示当下启示
          </p>
        </div>

        {!result ? (
          <>
            {/* 起卦方式选择 */}
            {!method && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <button
                  onClick={() => setMethod('random')}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-amber-200 dark:border-amber-800"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎲</div>
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                    随机起卦
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    模拟铜钱摇卦，最传统的方式
                  </p>
                </button>

                <button
                  onClick={() => setMethod('time')}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-amber-200 dark:border-amber-800"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🕐</div>
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                    时间起卦
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    基于当前时辰，天人合一
                  </p>
                </button>

                <button
                  onClick={() => setMethod('number')}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-amber-200 dark:border-amber-800"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔢</div>
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                    数字起卦
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    输入 3 个数字，心动即占
                  </p>
                </button>
              </div>
            )}

            {/* 数字输入 */}
            {method === 'number' && !numbers && (
              <NumberInput onSubmit={handleNumberSubmit} onBack={() => setMethod(null)} />
            )}

            {/* 确认起卦 */}
            {method && method !== 'number' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-amber-700 dark:text-amber-300 mb-6">
                  {method === 'random' ? '准备摇动铜钱...' : '正在感应时辰...'}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleDivination}
                    disabled={loading}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    {loading ? '起卦中...' : '开始起卦'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                  >
                    返回
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* 卦象结果 */
          <>
            <HexagramResult result={result} onReset={handleReset} />
            
            {/* 收藏按钮 */}
            {result?.hexagram && (
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  onClick={() => {
                    const id = `hexagram-${result.hexagram.id}`;
                    const isFav = isFavorited('iching', id);
                    if (isFav) {
                      removeFavorite('iching', id);
                      setFavorited(false);
                      showToast('已取消收藏', 'info');
                    } else {
                      addFavorite({
                        type: 'iching',
                        id,
                        title: `第${result.hexagram.number}卦 - ${result.hexagram.name}`,
                        data: { hexagram: result.hexagram, interpretation: result.interpretation },
                      });
                      addHistory({
                        type: 'iching',
                        id: `${id}-${Date.now()}`,
                        title: `第${result.hexagram.number}卦 - ${result.hexagram.name}`,
                        data: { hexagram: result.hexagram },
                      });
                      setFavorited(true);
                      showToast('收藏成功！⭐', 'success');
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    favorited
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-pink-300 dark:border-pink-700 hover:bg-pink-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-xl">{favorited ? '⭐' : '☆'}</span>
                  <span>{favorited ? '已收藏' : '收藏此卦'}</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-amber-900 dark:text-amber-100 font-bold mb-2">📖 关于易经问卦</h3>
            <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
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

        {/* 导航 */}
        <div className="mt-8 text-center">
          <a
            href="/zodiac"
            className="inline-flex items-center text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
          >
            ← 返回星座运势
          </a>
        </div>
      </div>
    </div>
  );
}

// 数字输入组件
function NumberInput({ onSubmit, onBack }: { onSubmit: (nums: [number, number, number]) => void; onBack: () => void }) {
  const [nums, setNums] = useState(['', '', '']);

  const handleSubmit = () => {
    const parsed = nums.map(n => parseInt(n) || 0) as [number, number, number];
    if (parsed.some(n => n <= 0)) {
      alert('请输入正整数');
      return;
    }
    onSubmit(parsed);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
      <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-6 text-center">
        请输入 3 个数字
      </h3>
      <div className="flex gap-4 justify-center mb-6">
        {nums.map((num, i) => (
          <input
            key={i}
            type="number"
            value={num}
            onChange={(e) => {
              const newNums = [...nums];
              newNums[i] = e.target.value;
              setNums(newNums as [string, string, string]);
            }}
            placeholder={`数字${i + 1}`}
            className="w-24 text-center text-2xl border-2 border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 dark:bg-slate-700 dark:text-white"
          />
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
        >
          确认
        </button>
        <button
          onClick={onBack}
          className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
        >
          返回
        </button>
      </div>
      <p className="text-amber-600 dark:text-amber-400 text-sm text-center mt-4">
        心中默念问题，随意输入 3 个数字
      </p>
    </div>
  );
}

// 卦象结果组件
function HexagramResult({ result, onReset }: { result: any; onReset: () => void }) {
  const { hexagram, character, method, timestamp, interpretation, structure } = result;

  if (!hexagram) {
    return <div>卦象未找到</div>;
  }

  return (
    <div className="space-y-6">
      {/* 卦象头部 - 添加可视化 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl text-center">
        {/* 卦象可视化 */}
        <div className="mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
          <HexagramVisual structure={structure || hexagram.structure} size="lg" animated={true} />
        </div>
        
        {/* 卦名字符 */}
        <div className="text-8xl mb-4 animate-pulse">{character}</div>
        <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
          第{hexagram.number}卦 · {hexagram.name}
        </h2>
        <p className="text-amber-700 dark:text-amber-300 text-lg mb-4">
          {hexagram.pinyin}
        </p>
        <div className="text-sm text-amber-600 dark:text-amber-400">
          起卦方式：{method === 'random' ? '随机' : method === 'time' ? '时间' : '数字'} · {timestamp.toLocaleString('zh-CN')}
        </div>
      </div>

      {/* 卦辞 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">📜</span>
          卦辞
        </h3>
        <p className="text-amber-800 dark:text-amber-200 text-lg leading-relaxed">
          {hexagram.judgment}
        </p>
      </div>

      {/* 象传 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">🌄</span>
          象传
        </h3>
        <p className="text-amber-800 dark:text-amber-200 text-lg leading-relaxed">
          {hexagram.image}
        </p>
      </div>

      {/* 解读 */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          解读
        </h3>
        <pre className="text-amber-800 dark:text-amber-200 whitespace-pre-wrap leading-relaxed font-sans">
          {interpretation}
        </pre>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onReset}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all"
        >
          再占一卦
        </button>
        <a
          href="/zodiac"
          className="bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-full font-medium border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-slate-700 transition-all"
        >
          星座运势
        </a>
        <a
          href="/diet"
          className="bg-white dark:bg-slate-800 text-green-700 dark:text-green-300 px-6 py-3 rounded-full font-medium border-2 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-slate-700 transition-all"
        >
          能量饮食
        </a>
        <Link
          href="/favorites"
          className="bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 px-6 py-3 rounded-full font-medium border-2 border-pink-300 dark:border-pink-700 hover:bg-pink-50 dark:hover:bg-slate-700 transition-all"
        >
          ⭐ 我的收藏
        </Link>
      </div>
    </div>
  );
}
