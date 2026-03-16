import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import { PrismaClient } from '@prisma/client'

export const metadata: Metadata = {
  title: '大事纪 | starLog - 个人知识库',
  description: 'starLog 项目发展历程和重要里程碑',
}

const prisma = new PrismaClient()

// 项目里程碑事件（静态）
const milestoneEvents = [
  {
    date: '2026-03-17',
    title: '基金板块完整功能上线',
    description: '基金列表/详情页、实时净值 API、历史业绩图表、持仓分布展示，PM2 统一管理所有服务',
    type: 'feature',
    emoji: '💰',
  },
  {
    date: '2026-03-17',
    title: '服务架构优化',
    description: '修复 finance-api 导入路径问题，配置阿里云安全组，实现 8081/8082 端口外部访问',
    type: 'devops',
    emoji: '🔧',
  },
  {
    date: '2026-03-12',
    title: 'UI/UX 全面优化',
    description: '完成日夜主题切换、导航栏优化、面包屑导航、股票搜索功能',
    type: 'feature',
    emoji: '🎨',
  },
  {
    date: '2026-03-12',
    title: '网站审计和截图功能',
    description: '实现自动化网站截图功能，完成 11 个页面的全面审计',
    type: 'feature',
    emoji: '📸',
  },
  {
    date: '2026-03-12',
    title: '性能优化完成',
    description: '实现 Redis 缓存分级、懒加载组件、缓存 TTL 优化',
    type: 'performance',
    emoji: '⚡',
  },
  {
    date: '2026-03-12',
    title: '股票功能增强',
    description: '添加股票搜索、排序、筛选功能，优化股票列表页',
    type: 'feature',
    emoji: '📈',
  },
  {
    date: '2026-03-11',
    title: '金融 API 优化',
    description: '修复金融 API 问题，改用腾讯财经接口，添加 Redis 缓存',
    type: 'fix',
    emoji: '🔧',
  },
  {
    date: '2026-03-11',
    title: '视觉模型配置',
    description: '配置 dashscope/qwen-vl-max 视觉模型，支持图片识别',
    type: 'feature',
    emoji: '👁️',
  },
  {
    date: '2026-03-10',
    title: '博客系统优化',
    description: '添加文章目录导航、阅读进度条、代码高亮优化',
    type: 'feature',
    emoji: '📝',
  },
  {
    date: '2026-03-09',
    title: 'PM2 进程守护',
    description: '配置 PM2 进程管理和开机自启，提升服务稳定性',
    type: 'devops',
    emoji: '🚀',
  },
  {
    date: '2026-03-08',
    title: '星座运势功能',
    description: '完成 12 星座运势详情页，添加分项运势和幸运元素',
    type: 'feature',
    emoji: '✨',
  },
  {
    date: '2026-03-07',
    title: '易经问卦功能',
    description: '实现随机/时间/数字三种起卦方式，64 卦解卦',
    type: 'feature',
    emoji: '☯️',
  },
  {
    date: '2026-03-06',
    title: '能量饮食功能',
    description: '完成八字五行分析，定制专属能量饮食方案',
    type: 'feature',
    emoji: '🥗',
  },
  {
    date: '2026-03-05',
    title: '股票行情功能',
    description: '集成 K 线图、技术指标、热门股票列表',
    type: 'feature',
    emoji: '📊',
  },
  {
    date: '2026-03-04',
    title: '项目启动',
    description: 'starLog 个人知识库项目正式启动',
    type: 'milestone',
    emoji: '🎉',
  },
]

// 动态获取最新文章
async function getRecentPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        publishedAt: true,
        viewCount: true,
      },
    })

    return posts.map(post => ({
      id: post.id,
      date: new Date(post.publishedAt).toISOString().split('T')[0],
      title: post.title,
      description: post.summary,
      type: 'article' as const,
      category: post.category,
      slug: post.slug,
      viewCount: post.viewCount,
      emoji: getCategoryEmoji(post.category),
    }))
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    tech: '💻',
    finance: '📈',
    fengshui: '🧭',
    business: '🔮',
  }
  return emojis[category] || '📝'
}

const typeColors = {
  feature: 'from-emerald-500 to-teal-500',
  fix: 'from-blue-500 to-cyan-500',
  performance: 'from-purple-500 to-pink-500',
  devops: 'from-orange-500 to-amber-500',
  milestone: 'from-red-500 to-rose-500',
  article: 'from-emerald-500 to-teal-500',
}

export default async function TimelinePage() {
  const articleEvents = await getRecentPosts()
  
  // 合并文章事件和里程碑事件，按日期排序
  const allEvents = [...articleEvents, ...milestoneEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 面包屑导航 */}
        <Breadcrumb />
        
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            📅 大事纪
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            starLog 项目发展历程和重要里程碑
          </p>
        </div>

        {/* 时间轴 */}
        <div className="relative">
          {/* 中心线 */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 transform md:-translate-x-1/2" />

          {/* 事件列表 */}
          <div className="space-y-8">
            {allEvents.map((event, index) => {
              const isLeft = index % 2 === 0
              const colors = typeColors[event.type as keyof typeof typeColors]
              const isArticle = event.type === 'article'
              
              return (
                <div
                  key={event.id || index}
                  className={`relative flex items-center ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* 内容卡片 */}
                  <div className={`ml-20 md:ml-0 md:w-1/2 ${
                    isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
                  }`}>
                    {isArticle ? (
                      <a
                        href={`/blog/${event.slug}`}
                        className="block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                      >
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${colors} mb-3`}>
                          📝 文章发布
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {event.emoji} {event.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
                          <time>{event.date}</time>
                          <span>·</span>
                          <span>👁️ {event.viewCount}</span>
                        </div>
                      </a>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${colors} mb-3`}>
                          {event.type === 'feature' && '✨ 新功能'}
                          {event.type === 'fix' && '🐛 修复'}
                          {event.type === 'performance' && '⚡ 性能'}
                          {event.type === 'devops' && '🚀 运维'}
                          {event.type === 'milestone' && '🎉 里程碑'}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {event.emoji} {event.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {event.description}
                        </p>
                        
                        <time className="text-sm text-gray-500 dark:text-gray-500">
                          {event.date}
                        </time>
                      </div>
                    )}
                  </div>

                  {/* 中心点 */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-4 border-emerald-500 rounded-full transform -translate-x-1/2 z-10" />
                </div>
              )
            })}
          </div>
        </div>

        {/* 底部统计 */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            📊 项目统计
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {allEvents.filter(e => e.type === 'article').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">文章</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {allEvents.filter(e => e.type === 'feature').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">新功能</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {allEvents.filter(e => e.type === 'performance').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">性能优化</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {allEvents.filter(e => e.type === 'devops').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">运维</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {allEvents.filter(e => e.type === 'milestone').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">里程碑</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
