'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Post {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  viewCount: number
}

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  async function fetchRecentPosts() {
    try {
      const res = await fetch('/api/posts?page=1&limit=3')
      const data = await res.json()
      setRecentPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch recent posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // 功能卡片配置
  const featureCards = [
    {
      icon: '📚',
      title: '技术博客',
      description: '记录开发路上的点点滴滴\n分享实战经验与技术思考',
      color: 'from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      linkColor: 'text-green-600 dark:text-green-400',
      href: '/blog',
    },
    {
      icon: '📈',
      title: '金融市场',
      description: 'A 股实时行情追踪\n市场动态一目了然',
      color: 'from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      linkColor: 'text-blue-600 dark:text-blue-400',
      href: 'http://47.79.20.10:8081/stocks/popular',
      external: true,
    },
    {
      icon: '🧭',
      title: '风水学',
      description: '探索传统智慧与现代应用\n环境能量与生活哲学',
      color: 'from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-800 dark:text-purple-200',
      linkColor: 'text-purple-600 dark:text-purple-400',
      href: '/blog',
    },
    {
      icon: '🔮',
      title: '商业未来',
      description: '洞察行业趋势与投资机会\n把握时代脉搏与风向',
      color: 'from-slate-50 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30',
      borderColor: 'border-slate-200 dark:border-slate-800',
      textColor: 'text-slate-800 dark:text-slate-200',
      linkColor: 'text-slate-600 dark:text-slate-400',
      href: '/blog',
    },
  ]

  // 主题标签
  const topics = [
    { icon: '📚', name: '技术', href: '/blog?category=tech' },
    { icon: '📈', name: '金融', href: '/blog?category=finance' },
    { icon: '🧭', name: '风水', href: '/blog?category=fengshui' },
    { icon: '🔮', name: '商业', href: '/blog?category=business' },
  ]

  return (
    <>
      {/* 主内容区域 */}
      <main className="min-h-screen pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* 宫崎骏风格标题区域 */}
          <div className="text-center mb-6 sm:mb-8 relative">
            {/* 装饰性云朵 - 移动端隐藏或缩小 */}
            <div className="hidden sm:block absolute -top-8 -left-8 text-6xl animate-pulse opacity-60">☁️</div>
            <div className="hidden sm:block absolute -top-12 -right-12 text-5xl animate-pulse opacity-40 delay-300">☁️</div>
            
            {/* 主标题 */}
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-bold mb-3 sm:mb-4 relative z-10">
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

          {/* 副标题 */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-2 sm:mb-3 font-medium text-center">
            像龙猫森林一样宁静的知识花园
          </p>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed text-center">
            在这里，记录技术的成长轨迹，追踪市场的起伏变化
            <br className="hidden sm:inline"/>
            探索风水智慧，洞察商业未来
            <br className="hidden sm:inline"/>
            每一篇笔记都是一颗种子，终将长成参天大树
          </p>

          {/* 主题标签导航 - 移动端优化 */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {topics.map((topic) => (
              <Link
                key={topic.name}
                href={topic.href}
                className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">{topic.name}</span>
              </Link>
            ))}
          </div>

          {/* 功能卡片 - 移动端单列，桌面端双列 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {featureCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener noreferrer' : undefined}
                className={`group bg-gradient-to-br ${card.color} p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border ${card.borderColor}`}
              >
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${card.textColor}`}>{card.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {card.description}
                </p>
                <div className={`mt-3 sm:mt-4 text-sm sm:text-base font-medium group-hover:translate-x-2 transition-transform duration-300 ${card.linkColor}`}>
                  {card.external ? '查看详情 →' : '开始阅读 →'}
                </div>
              </Link>
            ))}
          </div>

          {/* 最新文章预览 - 移动端优化 */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-amber-200 dark:border-amber-800 shadow-inner mb-12 sm:mb-16">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">📝</span>
                <h2 className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-200">最新文章</h2>
              </div>
              <Link
                href="/blog"
                className="text-sm sm:text-base font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
              >
                查看更多 →
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2 animate-pulse">📚</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">暂无文章</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">📄</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 truncate">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">·</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {post.readingTime} 分钟阅读
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      👁️ {post.viewCount}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            
            {!loading && recentPosts.length > 0 && (
              <p className="mt-4 sm:mt-6 text-amber-600 dark:text-amber-400 text-center text-xs sm:text-sm">
                ✨ 每日更新，敬请期待更多优质内容
              </p>
            )}
          </div>

          {/* 关于我 - 移动端优化 */}
          <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-red-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-pink-200 dark:border-pink-800 shadow-inner mb-12 sm:mb-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl">👤</span>
              <h2 className="text-xl sm:text-2xl font-bold text-pink-800 dark:text-pink-200">关于我</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              {/* 头像 */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl">
                    🐷
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 text-3xl sm:text-4xl animate-bounce">✨</div>
              </div>
              {/* 简介 */}
              <div className="flex-1 text-left w-full">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Hi，我是 老柱子 👋
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">
                  Java 资深开发工程师 / 技术爱好者 / 终身学习者
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {['Java', '微服务框架', 'Redis', 'Elasticsearch', 'Kafka'].map((skill) => (
                    <span
                      key={skill}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white dark:bg-gray-800 rounded-full text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  在这里分享技术、金融、风水、商业的思考。相信知识的价值，享受分享的快乐。
                </p>
              </div>
            </div>
            {/* 社交链接 - 移动端堆叠 */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
              <a
                href="https://github.com/rebornlog"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">🐙</span>
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">GitHub</span>
              </a>
              <a
                href="mailto:944183654@qq.com"
                className="group flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">📧</span>
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">Email</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* 固定在底部的装饰图标 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 pt-8 pb-4 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center gap-4 text-3xl">
            <span className="hover:animate-bounce cursor-pointer">🍄</span>
            <span className="hover:animate-bounce cursor-pointer">🌻</span>
            <span className="hover:animate-bounce cursor-pointer">🦋</span>
            <span className="hover:animate-bounce cursor-pointer">🐞</span>
            <span className="hover:animate-bounce cursor-pointer">🌼</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            © 2026 starLog - 个人知识库 · Made with ❤️ by 老柱子
          </p>
        </div>
      </footer>
    </>
  )
}
