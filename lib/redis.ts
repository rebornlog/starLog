import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// =====================================
// 新缓存 API（分级 TTL）
// =====================================

export interface CacheConfig {
  key: string
  ttl: number
}

export async function getCache<T>(config: CacheConfig | string): Promise<T | null> {
  const key = typeof config === 'string' ? config : config.key
  try {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error)
    return null
  }
}

export async function setCache<T>(config: CacheConfig | string, data: T): Promise<void> {
  const key = typeof config === 'string' ? config : config.key
  const ttl = typeof config === 'string' ? 300 : config.ttl
  try {
    await redis.setex(key, ttl, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error)
  }
}

export async function deleteCache(config: CacheConfig | string): Promise<void> {
  const key = typeof config === 'string' ? config : config.key
  try {
    await redis.del(key)
  } catch (error) {
    console.error(`Redis delete error for key ${key}:`, error)
  }
}

// =====================================
// 向后兼容的旧 API（保持现有代码工作）
// =====================================

const ARTICLE_CACHE_TTL = 300

export async function getCachedArticle(slug: string) {
  return getCache(`article:${slug}`)
}

export async function setCachedArticle(slug: string, data: any) {
  return setCache({ key: `article:${slug}`, ttl: ARTICLE_CACHE_TTL }, data)
}

export async function invalidateArticleCache(slug: string) {
  await deleteCache(`article:${slug}`)
  await deleteCache('recent_posts:3')
}

export async function getCachedRecentPosts(limit: number = 3) {
  return getCache(`recent_posts:${limit}`)
}

export async function setCachedRecentPosts(posts: any[], limit: number = 3) {
  return setCache({ key: `recent_posts:${limit}`, ttl: ARTICLE_CACHE_TTL }, posts)
}

// 股票缓存（60 秒）
export async function getCachedStockQuote(code: string) {
  return getCache({ key: `stock:${code}`, ttl: 60 })
}

export async function setCachedStockQuote(code: string, data: any) {
  return setCache({ key: `stock:${code}`, ttl: 60 }, data)
}

// 星座运势缓存（1 小时）
export async function getCachedHoroscope(sign: string, date: string) {
  return getCache({ key: `horoscope:${sign}:${date}`, ttl: 3600 })
}

export async function setCachedHoroscope(sign: string, date: string, data: any) {
  return setCache({ key: `horoscope:${sign}:${date}`, ttl: 3600 }, data)
}

export default redis

// 博客文章列表缓存
export async function getCachedPostList(category?: string, page = 1, limit = 10) {
  const key = `post:list:${category || 'all'}:${page}:${limit}`
  return getCache({ key, ttl: 300 })
}

export async function setCachedPostList(data: any, category?: string, page = 1, limit = 10) {
  const key = `post:list:${category || 'all'}:${page}:${limit}`
  return setCache({ key, ttl: 300 }, data)
}
