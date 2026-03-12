import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 装饰元素 */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🌿</div>
          <div className="flex justify-center gap-2 text-4xl">
            <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🍄</span>
            <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🌻</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🦋</span>
          </div>
        </div>

        {/* 404 文字 */}
        <h1 className="text-9xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* 描述 */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          哎呀，页面走丢了
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          这片知识森林还在成长中，您要访问的页面可能还不存在
        </p>

        {/* 装饰分隔线 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          <span className="text-2xl">🌱</span>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105"
          >
            🏠 返回首页
          </Link>
          <Link
            href="/blog"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105 border-2 border-emerald-500"
          >
            📚 浏览博客
          </Link>
        </div>

        {/* 底部提示 */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          或者试试搜索功能，也许能找到您想要的内容
        </p>
      </div>
    </div>
  )
}
