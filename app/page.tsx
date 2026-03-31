import Link from 'next/link'
import Image from 'next/image'
import { PrismaClient } from '@prisma/client'
import { getCachedRecentPosts, setCachedRecentPosts } from '@/lib/redis'
import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import HeroSection from '@/components/HeroSection'

const prisma = new PrismaClient()

// 网站统计卡片组件
function StatCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-emerald-100 dark:border-emerald-900 hover:shadow-xl transition-shadow">
      <div className="text-3xl sm:text-4xl mb-2">{icon}</div>
      <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'starLog - 个人知识库 | 技术博客·星座运势·易经问卦·能量饮食',
  description: 'starLog 是一个基于 Next.js 的个人知识库系统，集成技术博客、A 股行情、星座运势、易经问卦、能量饮食等功能。宫崎骏风格设计，记录技术的成长轨迹，探索生活的无限可能。',
}

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
    description: 'A 股实时行情\n基金净值查询\n板块热度监控',
    color: 'from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    linkColor: 'text-blue-600 dark:text-blue-400',
    href: '/stocks',
  },
  {
    icon: '🌟',
    title: '星座运势',
    description: '十二星座每日运势\n爱情·事业·健康全方位解析',
    color: 'from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-800 dark:text-purple-200',
    linkColor: 'text-purple-600 dark:text-purple-400',
    href: '/horoscope',
  },
  {
    icon: '☯️',
    title: '易经问卦',
    description: '古老智慧启迪现代生活\n在线起卦·卦象解析',
    color: 'from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-200',
    linkColor: 'text-amber-600 dark:text-amber-400',
    href: '/iching',
  },
  {
    icon: '🥗',
    title: '能量饮食',
    description: '食物能量与体质匹配\n健康饮食建议',
    color: 'from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30',
    borderColor: 'border-teal-200 dark:border-teal-800',
    textColor: 'text-teal-800 dark:text-teal-200',
    linkColor: 'text-teal-600 dark:text-teal-400',
    href: '/diet',
  },
  {
    icon: '⏱️',
    title: '时间轴',
    description: '按时间顺序浏览所有文章\n探索知识的演进历程',
    color: 'from-rose-50 to-red-100 dark:from-rose-900/30 dark:to-red-900/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    textColor: 'text-rose-800 dark:text-rose-200',
    linkColor: 'text-rose-600 dark:text-rose-400',
    href: '/timeline',
  },
]

async function getRecentPosts() {
  try {
    const cached = await getCachedRecentPosts(3)
    if (cached) {
      console.log('✅ 首页文章：Redis 缓存命中')
      return cached
    }

    console.log('⏳ 首页文章：查询数据库...')
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 5, // 增加到 5 篇
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        tags: true,
        publishedAt: true,
        readingTime: true,
        viewCount: true,
      },
    })

    if (posts.length > 0) {
      await setCachedRecentPosts(posts, 5)
      console.log('✅ 首页文章：已缓存到 Redis')
    }

    return posts
  } catch (error) {
    console.error('Failed to fetch recent posts:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function Home() {
  const recentPosts = await getRecentPosts()

  return (
    <>
      <HeroSection />
      
      <main className="container mx-auto px-4 py-16">
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">核心功能</h2>
        <p className="text-gray-600 dark:text-gray-400">探索 starLog 的丰富功能</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureCards.map((card, index) => (
          <Link key={card.href} href={card.href}>
            <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border ${card.borderColor}`}>
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className={`text-xl font-bold mb-2 ${card.textColor}`}>{card.title}</h3>
              <p className={`text-sm ${card.textColor} opacity-80`}>{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
    </main>
    </>
  )
  const topics = [
    { icon: '📚', name: '技术', href: '/blog?category=tech' },
    { icon: '📈', name: '金融', href: '/stocks/' },
    { icon: '💰', name: '基金', href: '/funds' },
    { icon: '✨', name: '星座', href: '/zodiac' },
    { icon: '☯', name: '问卦', href: '/iching' },
    { icon: '🥗', name: '饮食', href: '/diet' },
    { icon: '⭐', name: '收藏', href: '/favorites' },
    { icon: '📅', name: '大事纪', href: '/timeline' },
  ]

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      {/* 主内容区域 */}
      <main className="min-h-screen pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* 面包屑导航 */}
          <Breadcrumb />
          
          {/* 宫崎骏风格标题区域 */}
          <div className="text-center mb-8 sm:mb-12 relative">
            {/* 装饰性云朵 */}
            <div className="hidden md:block absolute -top-8 -left-8 text-6xl opacity-60 animate-cloud-float">☁️</div>
            <div className="hidden md:block absolute -top-12 -right-12 text-5xl opacity-40 animate-cloud-float-slow">☁️</div>
            
            {/* 主标题 */}
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-bold mb-3 sm:mb-4 relative z-10">
              <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
                🌿 starLog
              </span>
            </h1>
            
            {/* 装饰性植物 */}
            <div className="flex justify-center gap-1 sm:gap-2 text-2xl sm:text-3xl mb-3 sm:mb-4">
              <span className="animate-plant-sway">🌱</span>
              <span className="animate-plant-sway-delay-1">🌿</span>
              <span className="animate-plant-sway-delay-2">🍃</span>
              <span className="hidden sm:inline-block animate-plant-sway-delay-3">🌲</span>
              <span className="hidden sm:inline-block animate-plant-sway-delay-4">🌳</span>
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

          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="搜索文章、股票、标签..."
                  className="w-full px-6 py-4 pl-12 rounded-full border-2 border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                按 <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘K</kbd> 快速搜索
              </p>
            </div>
          </div>

          {/* 主题标签导航 */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {topics.map((topic) => (
              <Link
                key={topic.name}
                href={topic.href}
                className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
              >
                <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">{topic.name}</span>
              </Link>
            ))}
          </div>

          {/* 功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {featureCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                target={card.external ? '_blank' : undefined}
                rel={card.external ? 'noopener noreferrer' : undefined}
                className={`group bg-gradient-to-br ${card.color} p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border ${card.borderColor} min-h-[280px] sm:min-h-[300px] flex flex-col`}
              >
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${card.textColor}`}>{card.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line flex-1">
                  {card.description}
                </p>
                <div className={`mt-3 sm:mt-4 text-sm sm:text-base font-medium group-hover:translate-x-2 transition-transform duration-300 ${card.linkColor}`}>
                  {card.external ? '查看详情 →' : '开始阅读 →'}
                </div>
              </Link>
            ))}
          </div>

          {/* 网站统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <StatCard icon="📝" label="文章总数" value={2} />
            <StatCard icon="👁️" label="总阅读量" value={46} />
            <StatCard icon="📈" label="股票数量" value={30} />
            <StatCard icon="⭐" label="收藏次数" value={0} />
          </div>

          {/* 最新文章预览 */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-amber-200 dark:border-amber-800 shadow-inner mb-12 sm:mb-16">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">📝</span>
                <h2 className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-200">最新文章</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">共 {recentPosts.length} 篇</span>
                <Link
                  href="/blog"
                  className="text-sm sm:text-base font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                >
                  查看更多 →
                </Link>
              </div>
            </div>
            
            {recentPosts.length === 0 ? (
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
                            {formatDate(post.publishedAt)}
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
            
            {recentPosts.length > 0 && (
              <p className="mt-4 sm:mt-6 text-amber-600 dark:text-amber-400 text-center text-xs sm:text-sm">
                ✨ 每日更新，敬请期待更多优质内容
              </p>
            )}
          </div>

          {/* 关于我 */}
          <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-red-900/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-pink-200 dark:border-pink-800 shadow-inner mb-12 sm:mb-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl">👤</span>
              <h2 className="text-xl sm:text-2xl font-bold text-pink-800 dark:text-pink-200">关于我</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              {/* 头像 */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 p-1 shadow-lg overflow-hidden">
                  <Image
                    src="/avatar.jpg"
                    alt="老柱子"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    priority
                  />
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
            {/* 社交链接 */}
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

        {/* 热门标签 */}
        <div className="mb-12 sm:mb-16">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>🏷️</span> 热门标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React', 'TypeScript', 'Redis', '性能优化', 'Elasticsearch', 'Java', '多线程', 'A 股', '星座运势', '易经', '能量饮食'].map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors border border-emerald-200 dark:border-emerald-800"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* 固定在底部的装饰图标 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 py-4 z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex justify-center gap-4 text-3xl">
            <span className="hover:animate-bounce cursor-pointer">🍄</span>
            <span className="hover:animate-bounce cursor-pointer">🌻</span>
            <span className="hover:animate-bounce cursor-pointer">🦋</span>
            <span className="hover:animate-bounce cursor-pointer">🐞</span>
            <span className="hover:animate-bounce cursor-pointer">🌼</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
            © 2026 starLog - 个人知识库 · Made with ❤️ by 老柱子
          </p>
        </div>
      </footer>
    </>
  )
}
