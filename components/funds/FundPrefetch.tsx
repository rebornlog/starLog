'use client'

import { useEffect } from 'react'

/**
 * 基金数据预加载组件
 * 在后台预加载热门基金数据，提升页面切换体验
 */
export default function FundPrefetch() {
  useEffect(() => {
    // 预加载热门基金数据
    const prefetchFundData = async () => {
      try {
        // 预加载基金列表
        const fetchPromise = fetch('/api/funds/list?fund_type=all&limit=20', {
          headers: {
            'Cache-Control': 'public, max-age=300',  // 5 分钟缓存
          },
        })
        
        // 不等待结果，只是触发预加载
        fetchPromise.catch(() => {
          // 静默失败，不影响主流程
        })
      } catch (error) {
        // 静默失败
      }
    }

    // 空闲时执行预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchFundData()
      })
    } else {
      // 降级方案：延迟执行
      setTimeout(prefetchFundData, 1000)
    }
  }, [])

  return null
}
