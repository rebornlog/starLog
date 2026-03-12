'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbProps {
  className?: string
}

export default function Breadcrumb({ className = '' }: BreadcrumbProps) {
  const pathname = usePathname()
  
  if (!pathname || pathname === '/') return null
  
  const segments = pathname.split('/').filter(Boolean)
  
  const getSegmentName = (segment: string): string => {
    const names: Record<string, string> = {
      blog: '博客',
      zodiac: '星座',
      iching: '问卦',
      diet: '饮食',
      stocks: '股票',
      tags: '标签',
      projects: '项目',
      about: '关于',
      favorites: '收藏',
      timeline: '大事纪',
    }
    return names[segment] || segment
  }
  
  return (
    <nav className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6 ${className}`} aria-label="Breadcrumb">
      <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
        首页
      </Link>
      
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const href = '/' + segments.slice(0, index + 1).join('/')
        const name = getSegmentName(segment)
        
        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium">{name}</span>
            ) : (
              <Link href={href} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {name}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
