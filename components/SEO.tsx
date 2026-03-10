'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
}

export default function SEO({
  title,
  description,
  keywords = [],
  image = '/static/og-image.jpg',
  type = 'website',
}: SEOProps) {
  const pathname = usePathname()

  useEffect(() => {
    // 设置文档标题
    document.title = `${title} - starLog`

    // 设置 meta 标签
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attr}="${name}"]`)
      
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attr, name)
        document.head.appendChild(meta)
      }
      
      meta.setAttribute('content', content)
    }

    // 基础 SEO
    setMeta('description', description)
    setMeta('keywords', keywords.join(', '))
    
    // Open Graph
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:image', image, true)
    setMeta('og:type', type, true)
    setMeta('og:url', `https://starlog.com${pathname}`, true)
    setMeta('og:site_name', 'starLog', true)
    
    // Twitter Card
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', image)
  }, [title, description, keywords, image, type, pathname])

  // 结构化数据（JSON-LD）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebSite',
    name: title,
    description: description,
    url: `https://starlog.com${pathname}`,
    image: image,
    author: {
      '@type': 'Person',
      name: '水镜先生',
    },
    publisher: {
      '@type': 'Organization',
      name: 'starLog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://starlog.com/static/logo.png',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
    />
  )
}
