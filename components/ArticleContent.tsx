'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// 复制按钮组件
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-700/60 hover:bg-gray-600 hover:text-white rounded-md transition-all duration-200 backdrop-blur-sm border border-gray-600/50"
      type="button"
    >
      {copied ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已复制
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          复制
        </span>
      )}
    </button>
  )
}

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  return (
    <>
      {/* 全局样式 */}
      <style jsx global>{`
        .markdown-body {
          --color-text: #f3f4f6;
          --color-heading: #ffffff;
          --color-link: #60a5fa;
          --color-code: #f9a8d4;
          --color-code-bg: #1f2937;
          --color-pre-bg: #0f172a;
          --color-border: #4b5563;
          --color-quote: #e5e7eb;
          --color-quote-border: #3b82f6;
        }

        .markdown-body h2 {
          border-bottom: 2px solid #4b5563;
          padding-bottom: 0.5rem;
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .markdown-body h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .markdown-body p {
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          line-height: 1.8;
        }

        .markdown-body blockquote {
          border-left: 4px solid #3b82f6;
          padding: 0.75rem 1.25rem;
          margin: 1.5rem 0;
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .markdown-body table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .markdown-body th {
          background-color: #1f2937;
          text-align: left;
          font-weight: 600;
        }

        .markdown-body td,
        .markdown-body th {
          padding: 0.75rem 1rem;
          border: 1px solid #374151;
        }

        .markdown-body tr:nth-child(even) {
          background-color: rgba(31, 41, 55, 0.5);
        }

        .markdown-body code::before,
        .markdown-body code::after {
          content: none;
        }

        .markdown-body pre {
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .markdown-body img {
          border-radius: 0.75rem;
          margin: 1.5rem auto;
          display: block;
        }

        .markdown-body hr {
          border: none;
          border-top: 2px solid #374151;
          margin: 3rem 0;
        }

        /* 代码块容器 */
        .code-container {
          position: relative;
          margin: 1.5rem 0;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        /* 代码块头部 */
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #1f2937;
          border-bottom: 1px solid #374151;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        /* 自定义滚动条 */
        pre::-webkit-scrollbar {
          height: 8px;
        }

        pre::-webkit-scrollbar-track {
          background: #1f2937;
        }

        pre::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }

        pre::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>

      <article className="markdown-body max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]}
          components={{
            // 代码块渲染
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '')
              const lang = match ? match[1] : 'text'
              const code = String(children).replace(/\n$/, '')

              // 行内代码
              if (inline) {
                return (
                  <code className="px-1.5 py-0.5 text-sm font-mono text-pink-400 bg-gray-800 rounded border border-gray-700">
                    {children}
                  </code>
                )
              }

              // 代码块
              return (
                <div className="code-container group">
                  <div className="code-header">
                    <span className="font-mono lowercase text-xs sm:text-sm">{lang}</span>
                    <CopyButton code={code} />
                  </div>
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <SyntaxHighlighter
                      style={oneDark}
                      language={lang}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0 0 0.75rem 0.75rem',
                        background: 'transparent',
                        fontSize: '0.8125rem',
                        lineHeight: 1.6,
                        fontFamily: 'monospace',
                        minWidth: 'fit-content',
                        WebkitOverflowScrolling: 'touch'
                      }}
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            },

            // 标题渲染
            h1: ({ children }) => (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 mt-8 tracking-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 mt-8 sm:mt-10 pb-3 border-b border-gray-600 tracking-tight">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-100 mb-3 mt-6 sm:mt-8 tracking-tight">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-200 mb-2 mt-4 sm:mt-6">
                {children}
              </h4>
            ),

            // 段落渲染
            p: ({ children }) => (
              <p className="text-sm sm:text-base text-gray-100 leading-loose my-4 sm:my-5 tracking-wide">
                {children}
              </p>
            ),

            // 引用块渲染
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-400 pl-4 py-3 my-6 bg-blue-500/15 rounded-r-lg">
                <div className="text-gray-100 italic">{children}</div>
              </blockquote>
            ),

            // 链接渲染
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            // 列表渲染
            ul: ({ children }) => (
              <ul className="list-disc list-outside space-y-2 my-4 text-gray-100 pl-5 text-sm sm:text-base">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside space-y-2 my-4 text-gray-100 pl-5 text-sm sm:text-base">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-2 text-gray-100 leading-relaxed">
                {children}
              </li>
            ),

            // 表格渲染
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-lg border border-gray-600 shadow-lg">
                <table className="min-w-full">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 bg-gray-800 text-left text-sm font-semibold text-gray-100 border-b border-gray-600">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-t border-gray-600 text-sm text-gray-100">
                {children}
              </td>
            ),

            // 图片渲染
            img: ({ src, alt }) => (
              <figure className="my-8">
                <img
                  src={src}
                  alt={alt}
                  className="rounded-lg shadow-2xl mx-auto max-w-full border border-gray-700"
                  loading="lazy"
                />
                {alt && (
                  <figcaption className="text-center text-sm text-gray-500 mt-3">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ),

            // 水平线渲染
            hr: () => <hr className="my-12 border-gray-600" />,

            // 粗体渲染
            strong: ({ children }) => (
              <strong className="font-bold text-white">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </>
  )
}
