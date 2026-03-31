'use client'

import { FadeIn, ScaleIn, SlideIn } from '@/components/ui/animations'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-totoro-500 via-totoro-700 to-totoro-900">
      {/* 背景动画 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* 主标题 */}
          <ScaleIn delay={0.2}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              欢迎来到
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                starLog
              </span>
            </h1>
          </ScaleIn>

          {/* 副标题 */}
          <FadeIn delay={0.4}>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              专业的基金股票分析平台
              <br />
              <span className="text-white/70 text-base sm:text-lg mt-2 block">
                记录技术的成长轨迹，探索生活的无限可能
              </span>
            </p>
          </FadeIn>

          {/* CTA 按钮 */}
          <SlideIn delay={0.6} direction="up">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/funds">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all">
                  📊 开始分析
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2 border-white/50 text-white hover:bg-white/10">
                  📝 技术博客
                </Button>
              </Link>
            </div>
          </SlideIn>

          {/* 特性卡片 */}
          <FadeIn delay={0.8}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-white font-semibold">基金分析</div>
                <div className="text-white/70 text-sm">实时净值查询</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-white font-semibold">股票行情</div>
                <div className="text-white/70 text-sm">A 股实时数据</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">📝</div>
                <div className="text-white font-semibold">技术博客</div>
                <div className="text-white/70 text-sm">分享与成长</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">✨</div>
                <div className="text-white font-semibold">星座运势</div>
                <div className="text-white/70 text-sm">每日运势解读</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* 底部滚动提示 */}
      <FadeIn delay={1.2}>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-white/70 text-sm animate-bounce">
            ↓ 滚动探索更多
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
