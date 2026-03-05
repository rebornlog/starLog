'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-4xl mx-auto">
        {/* 标题 */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-500 via-emerald-400 to-pink-500 bg-clip-text text-transparent">
          🌿 starLog
        </h1>
        
        {/* 副标题 */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
          个人知识库与金融分析平台
        </p>
        
        {/* 描述 */}
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          📝 记录技术成长 | 📈 追踪市场动态 | 🎨 10 套主题切换
        </p>

        {/* 快捷按钮 */}
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link 
            href="/blog" 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            📖 开始阅读
          </Link>
          <a 
            href="http://47.79.20.10:8081/stocks/popular" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            📈 查看行情
          </a>
          <a 
            href="http://47.79.20.10:8081/docs" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            📚 API 文档
          </a>
        </div>

        {/* 特色功能卡片 */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-green-100 dark:border-green-900 hover:shadow-xl transition-shadow duration-300">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">
              技术博客
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              记录开发经验、技术分享、项目实战
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-green-100 dark:border-green-900 hover:shadow-xl transition-shadow duration-300">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">
              金融数据
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              A 股实时行情、市场概览、热门股票
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-green-100 dark:border-green-900 hover:shadow-xl transition-shadow duration-300">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">
              主题切换
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              10 套高级主题，点击右下角按钮切换
            </p>
          </div>
        </div>

        {/* 主题切换提示 */}
        <div className="mt-16 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            🎨 <strong>试试点击右下角的</strong> <span className="text-3xl align-middle animate-bounce inline-block">🌿</span> <strong>按钮切换主题！</strong>
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            已上线 10 套主题：龙猫森林、午夜蓝调、落日余晖、极地冰川、樱花飞舞...
          </p>
        </div>
      </div>
    </div>
  )
}
