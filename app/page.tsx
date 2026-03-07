'use client'

import Link from 'next/link'

export default function Home() {
  // 最新文章（placeholder，后续每日更新）
  const recentPosts = [
    { title: 'Spring Boot 3.0 新特性深度解析', date: '2026-03-07', category: '技术' },
    { title: 'Redis 缓存穿透、击穿、雪崩解决方案', date: '2026-03-06', category: '技术' },
    { title: 'Kafka 消息队列在高并发场景下的应用', date: '2026-03-05', category: '技术' },
  ]

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
      href: '/blog/fengshui',
    },
    {
      icon: '🔮',
      title: '商业未来',
      description: '洞察行业趋势与投资机会\n把握时代脉搏与风向',
      color: 'from-slate-50 to-gray-100 dark:from-slate-900/30 dark:to-gray-900/30',
      borderColor: 'border-slate-200 dark:border-slate-800',
      textColor: 'text-slate-800 dark:text-slate-200',
      linkColor: 'text-slate-600 dark:text-slate-400',
      href: '/blog/business',
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

        {/* 副标题 */}
        <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-3 font-medium">
          像龙猫森林一样宁静的知识花园
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          在这里，记录技术的成长轨迹，追踪市场的起伏变化<br/>
          探索风水智慧，洞察商业未来<br/>
          每一篇笔记都是一颗种子，终将长成参天大树
        </p>

        {/* 主题标签导航 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {topics.map((topic) => (
            <Link
              key={topic.name}
              href={topic.href}
              className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{topic.name}</span>
            </Link>
          ))}
        </div>

        {/* 功能卡片 - 2x2 网格 */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {featureCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              target={card.external ? '_blank' : undefined}
              rel={card.external ? 'noopener noreferrer' : undefined}
              className={`group bg-gradient-to-br ${card.color} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border ${card.borderColor}`}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
              <h3 className={`text-2xl font-bold mb-3 ${card.textColor}`}>{card.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {card.description}
              </p>
              <div className={`mt-4 font-medium group-hover:translate-x-2 transition-transform duration-300 ${card.linkColor}`}>
                {card.external ? '查看详情 →' : '开始阅读 →'}
              </div>
            </Link>
          ))}
        </div>

        {/* 最新文章预览 */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-3xl p-8 border border-amber-200 dark:border-amber-800 shadow-inner mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📝</span>
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">最新文章</h2>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post, index) => (
              <Link
                key={index}
                href={`/blog/${index}`}
                className="group flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📄</span>
                  <div>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mb-1">
                      {post.category}
                    </span>
                    <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {post.title}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-amber-600 dark:text-amber-400 text-center text-sm">
            ✨ 每日更新，敬请期待更多优质内容
          </p>
        </div>

        {/* 关于我 */}
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-red-900/20 rounded-3xl p-8 border border-pink-200 dark:border-pink-800 shadow-inner mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">👤</span>
            <h2 className="text-2xl font-bold text-pink-800 dark:text-pink-200">关于我</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* 头像 */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-6xl">
                  🐷
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce">✨</div>
            </div>
            {/* 简介 */}
            <div className="flex-1 text-left">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Hi，我是 老柱子 👋
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
                Java 资深开发工程师 / 技术爱好者 / 终身学习者
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Java', '微服务框架', 'Redis', 'Elasticsearch', 'Kafka'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                在这里分享技术、金融、风水、商业的思考。相信知识的价值，享受分享的快乐。
              </p>
            </div>
          </div>
          {/* 社交链接 */}
          <div className="flex justify-center gap-4 mt-6">
            <a
              href="https://github.com/rebornlog"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">🐙</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">GitHub</span>
            </a>
            <a
              href="mailto:944183654@qq.com"
              className="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">📧</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">Email</span>
            </a>
          </div>
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
