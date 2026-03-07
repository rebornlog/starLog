import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// 缓存文章数据（5 分钟）
const ARTICLE_CACHE_TTL = 300 // 秒

export async function getCachedArticle(slug: string) {
  const cacheKey = `article:${slug}`
  const cached = await redis.get(cacheKey)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedArticle(slug: string, data: any) {
  const cacheKey = `article:${slug}`
  await redis.setex(cacheKey, ARTICLE_CACHE_TTL, JSON.stringify(data))
}

export async function getCachedRecentPosts(limit: number = 3) {
  const cacheKey = `recent_posts:${limit}`
  const cached = await redis.get(cacheKey)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedRecentPosts(posts: any[], limit: number = 3) {
  const cacheKey = `recent_posts:${limit}`
  await redis.setex(cacheKey, ARTICLE_CACHE_TTL, JSON.stringify(posts))
}

export async function invalidateArticleCache(slug: string) {
  await redis.del(`article:${slug}`)
  await redis.del(`recent_posts:3`)
}

export default redis
