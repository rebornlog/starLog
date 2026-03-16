'use client'

import { useEffect, useRef } from 'react'

interface WalineCommentsProps {
  slug: string
}

export default function WalineComments({ slug }: WalineCommentsProps) {
  const commentRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !commentRef.current) return
    initialized.current = true

    // 动态加载 Waline CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/@waline/client/dist/waline.css'
    document.head.appendChild(link)

    // 动态加载 Waline JS
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@waline/client/dist/waline.js'
    script.onload = () => {
      if (commentRef.current && window.Waline) {
        window.Waline.init({
          el: commentRef.current,
          serverURL: 'https://waline.starlog.dev', // 替换为实际部署地址
          path: slug,
          lang: 'zh-CN',
          emoji: [
            'https://cdn.jsdelivr.net/gh/walinejs/emojis/weibo',
          ],
          meta: ['nick', 'mail', 'link'],
          requiredMeta: ['nick', 'mail'],
          wordLimit: 0,
          pageSize: 10,
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      // 清理
      if (commentRef.current) {
        commentRef.current.innerHTML = ''
      }
    }
  }, [slug])

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        💬 评论
      </h2>
      <div ref={commentRef} className="waline-container" />
    </section>
  )
}

declare global {
  interface Window {
    Waline: any
  }
}
