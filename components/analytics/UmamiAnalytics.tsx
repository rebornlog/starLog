'use client'

import Script from 'next/script'
import siteMetadata from '@/data/siteMetadata'

/**
 * Umami 访问统计组件
 * 
 * 使用方法：
 * 1. 在 Umami Cloud (https://cloud.umami.is/) 注册账号
 * 2. 添加网站获取 Website ID
 * 3. 更新 data/siteMetadata.js 中的 umamiWebsiteId
 * 4. 在 layout.tsx 中引入此组件
 * 
 * 示例：
 * ```js
 * // data/siteMetadata.js
 * analytics: {
 *   umamiAnalytics: {
 *     umamiWebsiteId: 'your-website-id',
 *     umamiScriptUrl: 'https://analytics.umami.is/script.js', // 可选，默认使用 Umami Cloud
 *   },
 * }
 * ```
 */
export function UmamiAnalytics() {
  const websiteId = siteMetadata.analytics?.umamiAnalytics?.umamiWebsiteId
  const scriptUrl = siteMetadata.analytics?.umamiAnalytics?.umamiScriptUrl || 'https://analytics.umami.is/script.js'

  // 如果没有配置 Website ID，不加载统计脚本
  if (!websiteId) {
    return null
  }

  return (
    <>
      <Script
        id="umami-analytics"
        strategy="lazyOnload"
        src={scriptUrl}
        data-website-id={websiteId}
      />
    </>
  )
}

/**
 * 追踪自定义事件
 * 
 * 使用方法：
 * ```tsx
 * // 按钮点击
 * <button 
 *   onClick={() => {
 *     trackEvent('button-click', { button: 'download' })
 *   }}
 * >
 *   下载
 * </button>
 * 
 * // 表单提交
 * <form onSubmit={(e) => {
 *   trackEvent('form-submit', { form: 'contact' })
 * }}>
 *   ...
 * </form>
 * ```
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData)
  }
}
