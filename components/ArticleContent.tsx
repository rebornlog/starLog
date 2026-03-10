'use client'

import { useEffect, useState } from 'react'

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const [processedContent, setProcessedContent] = useState<string>('')

  useEffect(() => {
    // 处理 Markdown 标题，添加 ID
    const processContent = (text: string) => {
      // 处理 H2 标题 (## )
      let processed = text.replace(/^## (.+)$/gm, (match, title) => {
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
        return `<h2 id="${id}">${title}</h2>`
      })

      // 处理 H3 标题 (### )
      processed = processed.replace(/^### (.+)$/gm, (match, title) => {
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
        return `<h3 id="${id}">${title}</h3>`
      })

      // 处理代码块（保留格式）
      processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
      })

      // 处理行内代码
      processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')

      // 处理粗体
      processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

      // 处理斜体
      processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>')

      // 处理列表
      processed = processed.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      processed = processed.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside my-4">$&</ul>')

      // 处理段落
      processed = processed.replace(/^(?!<[huplo]|<li|<ul|<pre)(.+)$/gm, '<p class="my-4">$1</p>')

      return processed
    }

    setProcessedContent(processContent(content))
  }, [content])

  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:scroll-mt-24 
        prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-gray-900 dark:prose-h2:text-white
        prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-800 dark:prose-h3:text-gray-100
        prose-p:my-4 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-white
        prose-code:text-gray-800 dark:prose-code:text-gray-200
        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
        prose-ul:my-4 prose-li:text-gray-700 dark:prose-li:text-gray-300"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
