/**
 * 缓存分级配置
 * 水镜先生 - starLog
 */

export const CACHE_TTL = {
  // 实时数据（股票行情）- 1 分钟
  STOCK_QUOTE: 60,
  
  // 短期数据（星座运势）- 1 小时（每日更新）
  HOROSCOPE: 3600,
  
  // 中期数据（文章列表）- 5 分钟
  ARTICLE_LIST: 300,
  
  // 长期数据（文章详情）- 10 分钟
  ARTICLE_DETAIL: 600,
  
  // 静态配置 - 24 小时
  CONFIG: 86400,
  
  // 热门标签 - 30 分钟
  POPULAR_TAGS: 1800,
  
  // 易经卦象 - 1 小时
  ICHING_HEXAGRAM: 3600,
  
  // 饮食分析 - 24 小时（相同生辰结果相同）
  DIET_ANALYSIS: 86400,
} as const

export const CACHE_PREFIX = {
  ARTICLE: 'article',
  ARTICLE_LIST: 'article:list',
  STOCK: 'stock',
  MARKET: 'market',
  HOROSCOPE: 'horoscope',
  ICHING: 'iching',
  DIET: 'diet',
  TAGS: 'tags',
} as const

export interface CacheConfig {
  key: string
  ttl: number
}

export function getCacheConfig(type: keyof typeof CACHE_PREFIX, identifier?: string): CacheConfig {
  const prefix = CACHE_PREFIX[type]
  const key = identifier ? `${prefix}:${identifier}` : prefix
  
  let ttl: number
  switch (type) {
    case 'STOCK':
      ttl = CACHE_TTL.STOCK_QUOTE
      break
    case 'HOROSCOPE':
      ttl = CACHE_TTL.HOROSCOPE
      break
    case 'ARTICLE':
      ttl = CACHE_TTL.ARTICLE_DETAIL
      break
    case 'ARTICLE_LIST':
    case 'TAGS':
      ttl = CACHE_TTL.ARTICLE_LIST
      break
    case 'ICHING':
      ttl = CACHE_TTL.ICHING_HEXAGRAM
      break
    case 'DIET':
      ttl = CACHE_TTL.DIET_ANALYSIS
      break
    default:
      ttl = CACHE_TTL.ARTICLE_LIST
  }
  
  return { key, ttl }
}
