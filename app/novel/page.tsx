'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NovelPage() {
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      setDownloadError(null)
      
      const response = await fetch('/api/novel-export')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '下载失败')
      }
      
      // 创建 blob 并下载
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'yima_tulong_book.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (error) {
      console.error('下载失败:', error)
      setDownloadError(error instanceof Error ? error.message : '下载失败')
      setTimeout(() => setDownloadError(null), 3000)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* 导航栏 */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-white">
                📚 StarLog
              </Link>
              <Link href="/funds" className="text-gray-300 hover:text-white transition">
                基金
              </Link>
              <Link href="/stocks" className="text-gray-300 hover:text-white transition">
                股票
              </Link>
              <Link href="/novel" className="text-white font-semibold transition">
                小说
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white transition">
                博客
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            📖 倚码屠龙
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            一个外包程序员的逆袭之路
          </p>
          <p className="text-gray-400">
            作者：林蒹葭（化名）
          </p>
        </div>

        {/* 简介卡片 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">📖 内容简介</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            2024 年，北京。林蒹葭，一个普通的外包程序员，月薪 8000，没有五险一金，每天工作 12 小时，周末无休。
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            他是地下室的芦苇，随风摇摆，身不由己。但他不信命。
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            代码，是他的武器。学习，是他的阶梯。坚持，是他的信仰。
          </p>
          <p className="text-gray-300 leading-relaxed">
            4 年后，他站在同一个写字楼的 28 层。大厂技术副总裁，年薪 200 万，儿女双全，家庭幸福。
          </p>
        </div>

        {/* 核心卖点 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">✨ 核心卖点</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="text-white font-semibold mb-1">真实感</h3>
                <p className="text-gray-400 text-sm">基于真实经历改编，每个外包兄弟都能看到自己</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-white font-semibold mb-1">技术干货</h3>
                <p className="text-gray-400 text-sm">24 个核心技能，涵盖程序员成长的方方面面</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">❤️</span>
              <div>
                <h3 className="text-white font-semibold mb-1">情感共鸣</h3>
                <p className="text-gray-400 text-sm">爱情、亲情、友情，每个人都能找到共鸣点</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="text-white font-semibold mb-1">金句密度</h3>
                <p className="text-gray-400 text-sm">每页都有适合发朋友圈的金句</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="text-white font-semibold mb-1">阅读体验</h3>
                <p className="text-gray-400 text-sm">一句话一段，轻松易读，适合碎片化阅读</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-white font-semibold mb-1">完整出版材料</h3>
                <p className="text-gray-400 text-sm">包含简介、目录、样章、营销策略</p>
              </div>
            </div>
          </div>
        </div>

        {/* 目录 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">📑 目录</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">第一卷 蒹葭苍苍（外包入职）</h3>
              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                <li>• 第 1 回 蒹葭倚码 - 代码整洁之道</li>
                <li>• 第 2 回 静女其姝 - 需求分析方法</li>
                <li>• 第 3 回 硕人其颀 - Git 版本管理</li>
                <li>• 第 4 回 清人在彭 - 技术表达能力</li>
                <li>• 第 5 回 白露为霜 - 线上故障排查</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">第二卷 所谓伊人（技术成长）</h3>
              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                <li>• 第 6 回 在水一方 - 数据库架构设计</li>
                <li>• 第 7 回 溯洄从之 - 系统设计能力</li>
                <li>• 第 8 回 宛在水中央 - 团队管理</li>
                <li>• 第 9 回 道阻且跻 - AI 项目实战</li>
                <li>• 第 10 回 溯游从之 - 转正式失败与坚持</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">第三卷 道阻且长（职场进阶）</h3>
              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                <li>• 第 11 回 夙兴夜寐 - 工作生活平衡</li>
                <li>• 第 12 回 他山之石 - 技术选型方法</li>
                <li>• 第 13 回 如切如磋 - 职业规划与考研</li>
                <li>• 第 14 回 高山仰止 - 影响力建设</li>
                <li>• 第 15 回 战战兢兢 - 压力管理与转正式</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">第四卷 求之不得（高管视角）</h3>
              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                <li>• 第 16 回 求之不得 - 架构设计与重构</li>
                <li>• 第 17 回 寤寐思服 - 技术合规与上市</li>
                <li>• 第 18 回 优哉游哉 - 35 岁危机与家庭</li>
                <li>• 第 19 回 琴瑟友之 - 结婚</li>
                <li>• 第 20 回 钟鼓乐之 - 二胎与人生感悟</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">第五卷 倚码屠龙（终极逆袭）</h3>
              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                <li>• 第 21 回 倚码屠龙 - 大模型项目与技术决策</li>
                <li>• 第 22 回 飞龙在天 - 行业影响力与传承</li>
                <li>• 第 23 回 蒹葭倚玉 - 家庭经营与人生智慧</li>
                <li>• 第 24 回 白露为霜 - 40 岁人生感悟</li>
                <li>• 尾声 - 倚码屠龙，屠的是自己</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">📊 作品数据</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50000+</div>
              <div className="text-gray-400 text-sm">总字数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">24</div>
              <div className="text-gray-400 text-sm">回目</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">5</div>
              <div className="text-gray-400 text-sm">卷数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">100+</div>
              <div className="text-gray-400 text-sm">金句</div>
            </div>
          </div>
        </div>

        {/* 导出按钮 */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">📥 下载小说文件</h2>
          <p className="text-gray-300 text-center mb-6">
            包含完整小说（优化版 + 初稿）+ 出版材料（简介 + 目录 + 样章 + 营销策略）
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`
                px-8 py-4 rounded-xl font-semibold text-lg
                transition-all duration-300 transform
                ${downloading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105'
                }
                text-white shadow-lg hover:shadow-xl
              `}
            >
              {downloading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>打包中...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载 ZIP 压缩包</span>
                </span>
              )}
            </button>
            
            {downloadSuccess && (
              <div className="text-green-400 text-sm flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>下载成功！</span>
              </div>
            )}
            
            {downloadError && (
              <div className="text-red-400 text-sm">
                {downloadError}
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>文件大小：约 48KB | 格式：ZIP（包含 4 个 Markdown 文件）</p>
          </div>
        </div>

        {/* 金句展示 */}
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-white text-center mb-6">✨ 精选金句</h2>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 text-center italic">
              "代码整洁，不是洁癖。是专业。"
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 text-center italic">
              "出身不是终点。放弃，才是。"
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 text-center italic">
              "走得走不了，得看我自己。"
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <p className="text-gray-300 text-center italic">
              "倚码屠龙，屠的不是龙。是那个，曾经自卑的自己。"
            </p>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© 2026 StarLog. All rights reserved.</p>
            <p className="mt-2 text-sm">
              《倚码屠龙》- 一个外包程序员的逆袭之路
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
