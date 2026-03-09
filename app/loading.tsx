export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50 backdrop-blur-sm">
      <div className="text-center">
        {/* 加载动画 */}
        <div className="relative">
          {/* 外圈 */}
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 rounded-full animate-pulse"></div>
          
          {/* 内圈旋转 */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 border-r-emerald-500 rounded-full animate-spin"></div>
          
          {/* 中心图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-bounce">🌿</span>
          </div>
        </div>

        {/* 加载文字 */}
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          加载中...
        </p>
        
        {/* 装饰性文字 */}
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          正在为您准备内容
        </p>
      </div>
    </div>
  )
}
