'use client'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import SearchButton from './SearchButton'
import ThemeToggle from './ThemeToggle'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname()
  let headerClass = 'flex items-center w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm justify-between py-4 shadow-sm border-b border-gray-200/50 dark:border-gray-800/50'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center gap-3">
          {/* Logo 图标 */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative text-3xl transform group-hover:scale-110 transition-transform">🌿</div>
          </div>
          
          {/* 站点标题 */}
          <div className="hidden sm:block">
            <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              starLog
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              像龙猫森林一样宁静的知识花园
            </div>
          </div>
          <span className="sm:hidden text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            starLog
          </span>
        </div>
      </Link>
      
      <div className="flex items-center gap-3 sm:gap-4">
        {/* 桌面导航 */}
        <nav className="hidden lg:flex items-center gap-1">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {link.title}
                </Link>
              )
            })}
        </nav>
        
        {/* 功能按钮组 */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-800">
          <ThemeToggle />
          <SearchButton />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default Header
