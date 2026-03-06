'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-5xl mx-auto">
        {/* 宫崎骏风格标题区域 */}
        <div className="mb-8 relative">
          {/* 装饰性云朵 */}
          <div className="absolute -top-8 -left-8 text-6xl animate-pulse opacity-60">☁️</div>
          <div className="absolute -top-12 -right-12 text-5xl animate-pulse opacity-40 delay-300">☁️</div>
          
          {/* 主标题 */}
          <h1 className="text-6xl md:text-8xl font-bold mb-4 relative z-10">
            <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
              🌿 starLog
            </span>
          </h1>
          
          {/* 装饰性植物 */}
          <div className="flex justify-center gap-2 text-3xl mb-4">
            <span className="animate-bounce delay-100">🌱</span>
            <span className="animate-bounce delay-200">🌿</span>
            <span className="animate-bounce delay-300">🍃</span>
            <span className="animate-bounce delay-400">🌲</span>
            <span className="animate-bounce delay-500">🌳</span>
          </div>
        </div>

        {/* 副标题 - 宫崎骏风格描述 */}
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-3 font-medium">
          像龙猫森林一样宁静的知识花园
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          在这里，记录技术的成长轨迹，追踪市场的起伏变化<br/>
          每一篇笔记都是一颗种子，终将长成参天大树
        </p>

        {/* 主要功能入口 - 卡片式设计 */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* 博客卡片 */}
          <Link 
            href="/blog" 
            className="group bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-green-200 dark:border-green-800"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
            <h3 className="text-2xl font-bold mb-3 text-green-800 dark:text-green-200">
              技术博客
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              记录开发路上的点点滴滴<br/>
              分享实战经验与技术思考
            </p>
            <div className="mt-4 text-green-600 dark:text-green-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
              开始阅读 →
            </div>
          </Link>

          {/* 金融数据卡片 */}
          <a 
            href="http://47.79.20.10:8081/stocks/popular" 
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-200 dark:border-blue-800"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📈</div>
            <h3 className="text-2xl font-bold mb-3 text-blue-800 dark:text-blue-200">
              金融市场
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              A 股实时行情追踪<br/>
              市场动态一目了然
            </p>
            <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
              查看行情 →
            </div>
          </a>

          {/* 主题切换卡片 */}
          <div className="group bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-pink-200 dark:border-pink-800">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
            <h3 className="text-2xl font-bold mb-3 text-pink-800 dark:text-pink-200">
              主题花园
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              10 套精美主题随心切换<br/>
              点击右下角按钮探索
            </p>
            <div className="mt-4 text-pink-600 dark:text-pink-400 font-medium">
              🌿 试试点击右下角
            </div>
          </div>
        </div>

        {/* 主题展示区域 */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 border border-green-200 dark:border-green-800 shadow-inner">
          <h2 className="text-2xl font-bold mb-6 text-green-800 dark:text-green-200">
            🎨 已上线主题
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '🌿', name: '龙猫森林' },
              { icon: '🌙', name: '午夜蓝调' },
              { icon: '🌅', name: '落日余晖' },
              { icon: '❄️', name: '极地冰川' },
              { icon: '🌸', name: '樱花飞舞' },
              { icon: '💎', name: '翡翠绿洲' },
              { icon: '⚫', name: '极简黑白' },
              { icon: '🌊', name: '深海秘境' },
              { icon: '🍯', name: '琥珀流光' },
              { icon: '🤖', name: '赛博朋克' },
            ].map((theme) => (
              <div 
                key={theme.name}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">{theme.icon}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{theme.name}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-center">
            ✨ 点击右下角的 <span className="text-2xl align-middle animate-bounce inline-block">🌿</span> 按钮，开启你的主题之旅
          </p>
        </div>

        {/* 底部装饰 */}
        <div className="mt-16 flex justify-center gap-4 text-4xl opacity-60">
          <span className="hover:animate-bounce cursor-default">🍄</span>
          <span className="hover:animate-bounce cursor-default delay-100">🌻</span>
          <span className="hover:animate-bounce cursor-default delay-200">🦋</span>
          <span className="hover:animate-bounce cursor-default delay-300">🐞</span>
          <span className="hover:animate-bounce cursor-default delay-400">🌼</span>
        </div>
      </div>
    </div>
  )
}
