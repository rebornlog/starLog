import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始种子数据初始化...')

  // 创建作者：老柱子
  const author = await prisma.user.upsert({
    where: { email: '944183654@qq.com' },
    update: {},
    create: {
      id: 'user_laoshuzi',
      email: '944183654@qq.com',
      name: '老柱子',
      bio: 'Java 资深开发工程师 / 技术爱好者 / 终身学习者。在这里分享技术、金融、风水、商业的思考。',
      website: 'https://github.com/rebornlog',
    },
  })
  console.log('✅ 创建用户：', author.name)

  // 第一篇高质量文章：性能优化实战
  const post1 = await prisma.post.create({
    data: {
      id: 'post-qps-optimization',
      slug: 'qps-from-300-to-3100-optimization-guide',
      title: 'QPS 从 300 到 3100：我靠一行代码让接口性能暴涨 10 倍',
      summary: '记录一次真实的生产环境性能优化经历。从接口响应慢到性能提升 10 倍，中间只改了一行代码。但这行代码背后，是整整两天的排查和分析。',
      excerpt: '记录一次真实的生产环境性能优化经历...',
      content: `# QPS 从 300 到 3100：我靠一行代码让接口性能暴涨 10 倍

> 这是发生在上周的真实故事。一个看似简单的接口优化，却让我对"性能瓶颈"有了全新的认识。

## 事故缘起

周三下午 3 点，我正在摸鱼...啊不是，正在 review 代码，突然收到运维的钉钉消息：

> "柱子，用户反馈 App 首页加载特别慢，有时候要等十几秒，能帮忙看看吗？"

我心里咯噔一下。这个接口是我写的，上个月才上线，当时压测 QPS 能到 2000+，怎么突然就不行了？

## 初步排查

打开监控系统，一眼就看到了问题：

![监控图表](/static/posts/optimization/monitor-1.png)

接口平均响应时间从平时的 50ms 飙升到了 800ms+，P99 甚至达到了 2 秒。QPS 从 2000+ 跌到了 300 左右。

**第一反应：数据库问题？**

查慢查询日志，发现这个 SQL 执行时间确实很长：

\`\`\`sql
SELECT * FROM user_orders 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 20;
\`\`\`

等等，这个 SQL 看起来很正常啊？user_id 字段有索引，每次查询就 20 条数据，怎么会慢？

## 深入分析

### 第一次尝试：加索引

我习惯性地在 EXPLAIN 了一下：

\`\`\`
mysql> EXPLAIN SELECT * FROM user_orders WHERE user_id = 12345 ORDER BY created_at DESC LIMIT 20;
+----+-------------+--------------+------+---------------+---------+---------+-------+------+-------------+
| id | select_type | table        | type | possible_keys | key     | key_len | ref   | rows | Extra       |
+----+-------------+--------------+------+---------------+---------+---------+-------+------+-------------+
|  1 | SIMPLE      | user_orders  | ref  | idx_user_id   | idx_user_id | 8       | const |  156 | Using where |
+----+-------------+--------------+------+---------------+---------+---------+-------+------+-------------+
\`\`\`

看起来走了索引，rows 也只有 156，没问题啊？

**但直觉告诉我，事情没那么简单。**

### 第二次尝试：查执行计划

我又仔细看了看 Extra 字段——**没有 Using index**！这意味着什么？

这意味着虽然走了索引，但还需要回表查询！

这个表有 500 万 + 数据，156 条记录回表，每次查询就是 156 次随机 IO。并发一上来，磁盘直接被打满。

## 真相大白

翻出建表语句，我找到了问题所在：

\`\`\`sql
-- 原来的索引
CREATE INDEX idx_user_id ON user_orders(user_id);

-- 查询语句
SELECT * FROM user_orders 
WHERE user_id = ? 
ORDER BY created_at DESC 
LIMIT 20;
\`\`\`

发现问题了吗？**索引只包含 user_id，但查询需要 ORDER BY created_at**！

这意味着 MySQL 虽然能用索引快速定位到 user_id 的记录，但无法利用索引完成排序，必须把所有匹配的记录查出来，然后在 filesort 中排序。

## 解决方案

答案很简单：**创建覆盖索引**。

\`\`\`sql
-- 删除旧索引
DROP INDEX idx_user_id ON user_orders;

-- 创建复合索引
CREATE INDEX idx_user_created ON user_orders(user_id, created_at DESC);
\`\`\`

**重点来了：** 索引字段的顺序很重要！

- user_id 在前：用于 WHERE 条件过滤
- created_at 在后：用于 ORDER BY 排序

这样 MySQL 可以直接从索引中获取有序数据，无需回表，无需 filesort。

## 效果对比

索引创建完成后，再次 EXPLAIN：

\`\`\`
mysql> EXPLAIN SELECT * FROM user_orders WHERE user_id = 12345 ORDER BY created_at DESC LIMIT 20;
+----+-------------+--------------+-------+--------------------+--------------------+---------+------+------+--------------------------+
| id | select_type | table        | type  | possible_keys      | key                | key_len | ref  | rows | Extra                    |
+----+-------------+--------------+-------+--------------------+--------------------+---------+------+------+--------------------------+
|  1 | SIMPLE      | user_orders  | ref   | idx_user_created   | idx_user_created   | 8       | const|  156 | Using index condition    |
+----+-------------+--------------+-------+--------------------+--------------------+---------+------+------+--------------------------+
\`\`\`

看到没？**Using index condition**！这意味着查询完全在索引中完成，不需要回表！

### 性能对比

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 平均响应时间 | 800ms | 50ms | 16 倍 ⬆️ |
| P99 响应时间 | 2000ms | 120ms | 16 倍 ⬆️ |
| QPS | 300 | 3100 | 10 倍 ⬆️ |
| CPU 使用率 | 85% | 25% | 70% ⬇️ |
| 磁盘 IO | 90% | 15% | 83% ⬇️ |

## 复盘总结

### 踩过的坑

1. **不要盲目相信 EXPLAIN 的 type 字段**
   - type=ref 不代表高效，还要看 Extra
   - Using index 才是王道

2. **复合索引的顺序很重要**
   - 等值查询字段放前面
   - 排序字段放后面
   - 考虑最左前缀原则

3. **覆盖索引是性能优化的利器**
   - 避免回表
   - 避免 filesort
   - 减少 IO

### 最佳实践

\`\`\`sql
-- ✅ 好的索引设计
CREATE INDEX idx_user_created ON user_orders(user_id, created_at DESC);

-- ❌ 不好的索引设计
CREATE INDEX idx_created_user ON user_orders(created_at, user_id);
-- 这样 user_id 无法使用最左前缀

-- ❌ 缺失排序字段
CREATE INDEX idx_user_only ON user_orders(user_id);
-- 排序时无法利用索引
\`\`\`

## 最后的思考

这次优化，从表面看只是改了一行 SQL，但实际上：

- 花了 2 小时排查监控和日志
- 花了 4 小时分析执行计划
- 花了 2 小时验证和测试
- **最后只用了 1 分钟执行 ALTER TABLE**

**性能优化从来不是靠运气，而是靠对原理的理解和系统的分析。**

共勉。

---

**参考资料：**
- [MySQL 索引原理及慢查询优化](https://tech.meituan.com/2014/06/30/mysql-index.html)
- [Use The Index, Luke](https://use-the-index-luke.com/)

**延伸阅读：**
- [Redis 缓存穿透、击穿、雪崩解决方案](/blog/redis-cache-solutions)
- [Kafka 在高并发场景下的应用](/blog/kafka-high-concurrency)`,
      category: 'tech',
      tags: ['Java', 'MySQL', '性能优化', '数据库', '索引'],
      isPublished: true,
      publishedAt: new Date('2026-03-07T10:00:00Z'),
      readingTime: 8,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      metaTitle: 'QPS 从 300 到 3100：MySQL 索引优化实战指南',
      metaDesc: '记录一次真实的生产环境性能优化经历。通过创建覆盖索引，将接口 QPS 从 300 提升到 3100，响应时间从 800ms 降到 50ms。',
      keywords: ['MySQL', '索引优化', '性能优化', 'QPS', '覆盖索引', '复合索引'],
      authorId: author.id,
    },
  })
  console.log('✅ 创建文章：', post1.title)

  // 第二篇文章：Redis 缓存
  const post2 = await prisma.post.create({
    data: {
      id: 'post-redis-cache',
      slug: 'redis-cache-penetration-breakdown-avalanche-solutions',
      title: 'Redis 缓存穿透、击穿、雪崩——我们生产环境是这样解决的',
      summary: '一次凌晨 3 点的缓存雪崩事故，让我们团队彻底重新审视了缓存策略。本文详细记录了我们从事故中总结的缓存最佳实践。',
      excerpt: '一次凌晨 3 点的缓存雪崩事故...',
      content: `# Redis 缓存穿透、击穿、雪崩——我们生产环境是这样解决的

> 凌晨 3 点，电话响了。我知道，出事了。

## 事故经过

那是一个普通的周二晚上，我 11 点就睡了。凌晨 3 点 17 分，手机铃声把我从睡梦中惊醒。

"柱子，快起来！系统崩了！"

打开电脑，监控系统一片红：

- 数据库 CPU：100%
- 接口响应时间：5s+
- 错误率：87%

**缓存全挂了。**

## 原因分析

### 第一层：缓存雪崩

查日志发现，我们的缓存服务器在 3 点 15 分同时宕机了 3 台（共 5 台）。原因是：

\`\`\`
# 所有缓存的过期时间设置成了整点
cache.set(key, value, expire_at=next_hour())  # ❌ 错误示范
\`\`\`

**所有缓存都在 3 点整过期**，导致：
1. 大量请求同时打到数据库
2. 数据库瞬间被打挂
3. 缓存服务器因为请求量暴增也扛不住了

### 第二层：缓存穿透

雪崩之后，更严重的问题来了——**缓存穿透**。

我们的商品详情接口没有做防穿透保护：

\`\`\`java
// ❌ 错误示范
public Product getProduct(String id) {
    Product product = redis.get(id);
    if (product == null) {
        product = db.query(id);  // 数据库也没有这个 ID
        // 没有写入空缓存！
    }
    return product;
}
\`\`\`

恶意用户发现后，开始大量请求不存在的 ID：
\`\`\`
GET /product/invalid-1
GET /product/invalid-2
GET /product/invalid-3
...
\`\`\`

**每个请求都直接打到数据库**，彻底压垮了系统。

### 第三层：缓存击穿

即使恢复了缓存，还有**热点 key 击穿**问题。

我们的秒杀商品 key（product:seckill:001）QPS 达到 10 万+：
\`\`\`
# 单个 key 的访问量
product:seckill:001 → 100,000+ QPS
\`\`\`

这个 key 一旦过期，瞬间会有成千上万个请求同时去查数据库。

## 解决方案

### 方案 1：缓存雪崩——随机过期时间

\`\`\`java
// ✅ 正确做法：在基础过期时间上增加随机值
public void setCache(String key, Object value) {
    // 基础过期时间 1 小时
    long baseExpire = 3600;
    // 随机增加 0-300 秒
    long randomExpire = ThreadLocalRandom.current().nextInt(300);
    
    redis.setex(key, baseExpire + randomExpire, value);
}
\`\`\`

**效果：** 缓存过期时间分散在 1 小时 ~1 小时 5 分钟之间，不会同时失效。

### 方案 2：缓存穿透——布隆过滤器 + 空缓存

\`\`\`java
// ✅ 正确做法：双层防护
public Product getProduct(String id) {
    // 第一层：布隆过滤器
    if (!bloomFilter.mightContain(id)) {
        return null;  // 肯定不存在
    }
    
    // 第二层：缓存
    Product product = redis.get(id);
    if (product != null) {
        return product;
    }
    
    // 第三层：数据库
    product = db.query(id);
    if (product == null) {
        // 写入空缓存，防止穿透
        redis.setex(id, 300, NULL_OBJECT);
        return null;
    }
    
    redis.setex(id, 3600, product);
    return product;
}
\`\`\`

**布隆过滤器配置：**
\`\`\`java
// 预计插入 1000 万数据，误判率 0.01%
BloomFilter<String> bloomFilter = BloomFilter.create(
    Funnels.stringFunnel(Charset.forName("utf-8")),
    10_000_000,  // 预期数据量
    0.0001       // 误判率
);
\`\`\`

### 方案 3：缓存击穿——互斥锁 + 逻辑过期

\`\`\`java
// ✅ 正确做法：互斥锁防止并发击穿
public Product getProductWithLock(String id) {
    Product product = redis.get(id);
    if (product != null) {
        return product;
    }
    
    // 获取分布式锁
    String lockKey = "lock:product:" + id;
    RLock lock = redisson.getLock(lockKey);
    
    if (lock.tryLock()) {
        try {
            // 双重检查
            product = redis.get(id);
            if (product != null) {
                return product;
            }
            
            // 查数据库
            product = db.query(id);
            redis.setex(id, 3600, product);
        } finally {
            lock.unlock();
        }
    } else {
        // 获取锁失败，等待后重试
        Thread.sleep(50);
        return getProductWithLock(id);
    }
    
    return product;
}
\`\`\`

### 方案 4：逻辑过期（高级玩法）

对于超热点 key，可以使用**逻辑过期**：

\`\`\`java
// 缓存数据结构
class CacheObject {
    Object data;
    long expireTime;  // 逻辑过期时间
}

// 查询逻辑
public Product getProductWithLogicExpire(String id) {
    CacheObject cache = redis.get(id);
    
    if (cache == null) {
        return getProductWithLock(id);
    }
    
    // 检查是否逻辑过期
    if (System.currentTimeMillis() > cache.expireTime) {
        // 异步重建缓存
        rebuildCacheAsync(id);
    }
    
    return (Product) cache.data;
}

// 异步重建
private void rebuildCacheAsync(String id) {
    CompletableFuture.runAsync(() -> {
        String lockKey = "lock:rebuild:" + id;
        if (redisson.getLock(lockKey).tryLock()) {
            try {
                Product product = db.query(id);
                CacheObject cache = new CacheObject();
                cache.data = product;
                cache.expireTime = System.currentTimeMillis() + 3600000;
                redis.set(id, cache);  // 不过期
            } finally {
                redisson.getLock(lockKey).unlock();
            }
        }
    });
}
\`\`\`

**优点：** 永不过期，避免并发问题
**缺点：** 实现复杂，需要异步重建

## 最终架构

经过这次事故，我们重构了缓存架构：

\`\`\`
┌─────────────────────────────────────────┐
│              请求入口                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          布隆过滤器 (穿透防护)             │
└─────────────────┬───────────────────────┘
                  │ 存在
                  ▼
┌─────────────────────────────────────────┐
│         Redis 缓存集群                    │
│  - 随机过期时间 (防雪崩)                  │
│  - 互斥锁 (防击穿)                        │
│  - 逻辑过期 (热点 key)                    │
└─────────────────┬───────────────────────┘
                  │ 未命中
                  ▼
┌─────────────────────────────────────────┐
│            数据库                         │
│  - 空值缓存 (防穿透)                      │
└─────────────────────────────────────────┘
\`\`\`

## 监控告警

最后，我们加了监控告警：

\`\`\`yaml
# Prometheus 告警规则
groups:
- name: cache_alerts
  rules:
  - alert: CacheHitRateLow
    expr: redis_hit_rate < 0.8
    for: 5m
    annotations:
      summary: "缓存命中率低于 80%"
      
  - alert: CacheServerDown
    expr: up{job="redis"} == 0
    for: 1m
    annotations:
      summary: "缓存服务器宕机"
\`\`\`

## 复盘总结

### 血的教训

1. **缓存过期时间不要设置成整点**
2. **一定要防穿透**（布隆过滤器 + 空缓存）
3. **热点 key 要特殊处理**（互斥锁/逻辑过期）
4. **监控告警要完善**（不要等用户反馈）

### 最佳实践清单

- [ ] 缓存过期时间增加随机值
- [ ] 布隆过滤器防穿透
- [ ] 空值缓存（短过期时间）
- [ ] 热点 key 互斥锁
- [ ] 缓存命中率监控
- [ ] 缓存服务器健康检查
- [ ] 降级预案（缓存挂了怎么办）

---

**参考资料：**
- [Redis 设计与实现](http://redisbook.com/)
- [阿里巴巴 Java 开发手册](https://github.com/alibaba/p3c)

**延伸阅读：**
- [QPS 从 300 到 3100：MySQL 索引优化](/blog/qps-from-300-to-3100-optimization-guide)
- [Kafka 在高并发场景下的应用](/blog/kafka-high-concurrency)`,
      category: 'tech',
      tags: ['Redis', '缓存', '性能优化', '高并发', '分布式'],
      isPublished: true,
      publishedAt: new Date('2026-03-06T10:00:00Z'),
      readingTime: 10,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      metaTitle: 'Redis 缓存穿透、击穿、雪崩解决方案实战',
      metaDesc: '一次凌晨 3 点的缓存雪崩事故，让我们团队彻底重新审视了缓存策略。本文详细记录了缓存穿透、击穿、雪崩的完整解决方案。',
      keywords: ['Redis', '缓存穿透', '缓存击穿', '缓存雪崩', '布隆过滤器', '高并发'],
      authorId: author.id,
    },
  })
  console.log('✅ 创建文章：', post2.title)

  console.log('🎉 种子数据初始化完成！')
  console.log('📊 统计:')
  console.log('   - 用户：1')
  console.log('   - 文章：2')
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
