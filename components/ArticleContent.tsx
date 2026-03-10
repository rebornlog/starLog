'use client'

import { useEffect, useState } from 'react'

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const [processedContent, setProcessedContent] = useState<string>('')
  const [codeBlocks, setCodeBlocks] = useState<string[]>([])

  useEffect(() => {
    const codeBlocks: string[] = []
    let codeBlockIndex = 0

    // 处理 Markdown 标题，添加 ID
    let processed = content.replace(/^## (.+)$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
      return `<h2 id="${id}">${title}</h2>`
    })

    // 处理 H3 标题
    processed = processed.replace(/^### (.+)$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
      return `<h3 id="${id}">${title}</h3>`
    })

    // 处理代码块（添加复制按钮容器）
    processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const cleanCode = code.trim()
      codeBlocks.push(cleanCode)
      const index = codeBlockIndex++
      return `<div class="relative my-4"><pre class="bg-gray-100 dark:bg-gray-800 p-4 pr-16 rounded-lg overflow-x-auto"><code class="language-${lang || 'text'}">${cleanCode}</code></pre><div data-code-index="${index}" class="copy-btn-container absolute top-2 right-2"></div></div>`
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

    setProcessedContent(processed)
    setCodeBlocks(codeBlocks)
  }, [content])

  // 为代码块添加复制按钮
  useEffect(() => {
    const containers = document.querySelectorAll('.copy-btn-container')
    containers.forEach((container) => {
      const index = parseInt(container.getAttribute('data-code-index') || '0')
      const code = codeBlocks[index]
      
      container.innerHTML = ''
      
      const button = document.createElement('button')
      button.className = 'p-2 rounded-lg transition-all duration-200 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
      button.title = '复制代码'
      button.innerHTML = `
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      `
      
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code)
          button.className = 'p-2 rounded-lg transition-all duration-200 bg-emerald-500 text-white'
          button.title = '已复制'
          button.innerHTML = `
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          `
          
          setTimeout(() => {
            button.className = 'p-2 rounded-lg transition-all duration-200 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            button.title = '复制代码'
            button.innerHTML = `
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            `
          }, 2000)
        } catch (error) {
          console.error('复制失败:', error)
        }
      })
      
      container.appendChild(button)
    })
  }, [processedContent, codeBlocks])

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
