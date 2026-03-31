# 🌐 Cloudflare CDN 配置指南

## 为什么使用 CDN？

**Cloudflare 免费套餐优势：**
- ✅ 全球 275+ 数据中心
- ✅ 免费 SSL 证书
- ✅ DDoS 防护
- ✅ 自动压缩（Brotli/Gzip）
- ✅ 缓存加速（静态资源）
- ✅ 每月 100,000 请求免费

**预期效果：**
- 加载速度提升 50%+
- 服务器带宽减少 60%+
- 全球访问延迟降低

---

## 快速开始（10 分钟）

### 步骤 1：注册 Cloudflare

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（免费）
3. 验证邮箱

---

### 步骤 2：添加网站

1. 登录后点击 "Add a domain"
2. 输入域名：`starlog.dev`
   - 如果还没有域名，暂时用 IP：`47.79.20.10`
3. 选择 **Free** 套餐
4. 点击 "Continue"

---

### 步骤 3：修改 DNS 服务器

Cloudflare 会提供两个 DNS 服务器地址，例如：
```
david.ns.cloudflare.com
lola.ns.cloudflare.com
```

**修改域名 DNS 服务器：**

如果域名在阿里云：
1. 登录阿里云控制台
2. 进入 "域名解析"
3. 找到 `starlog.dev`
4. 点击 "修改 DNS 服务器"
5. 填入 Cloudflare 提供的两个地址
6. 保存

**DNS 生效时间：** 通常 5-30 分钟，最长 48 小时

---

### 步骤 4：配置 DNS 记录

在 Cloudflare 后台添加 DNS 记录：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| A | @ | 47.79.20.10 | 🟡 Proxied |
| A | www | 47.79.20.10 | 🟡 Proxided |

**注意：**
- 🟡 黄色云朵 = 启用 CDN 代理（推荐）
- ⚪ 灰色云朵 = 仅 DNS，不经过 CDN

---

### 步骤 5：配置 SSL/TLS

1. 进入 "SSL/TLS" 菜单
2. 选择加密模式：**Full** 或 **Full (strict)**
3. 开启 "Always Use HTTPS"（强制 HTTPS）

---

### 步骤 6：配置缓存规则

#### 6.1 页面规则（Page Rules）

进入 "Rules" → "Page Rules" → "Create Page Rule"

**规则 1：静态资源缓存**
```
URL: starlog.dev/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

**规则 2：图片缓存**
```
URL: starlog.dev/*.{jpg,jpeg,png,gif,webp,svg}
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
```

**规则 3：API 不缓存**
```
URL: starlog.dev/api/*
Settings:
  - Cache Level: Bypass
```

#### 6.2 缓存优化

进入 "Caching" → "Configuration"：
- ✅ 开启 "Auto Minify"（压缩 HTML/CSS/JS）
- ✅ 开启 "Brotli" 压缩
- ✅ 开启 "Early Hints"

---

### 步骤 7：配置性能优化

进入 "Speed" → "Optimization"：

**推荐配置：**
- ✅ Auto Minify（HTML/CSS/JS）
- ✅ Brotli 压缩
- ✅ HTTP/2
- ✅ HTTP/3 (with QUIC)
- ✅ 0-RTT Connection Resumption

**移动端优化：**
- ✅ Mobile Redirect（如果需要）
- ✅ Image Optimization（Polish）- 付费功能

---

## Next.js 配置优化

### 更新 `next.config.js`

```js
module.exports = {
  // ... 其他配置
  
  // 启用 CDN 支持
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || '',
  
  images: {
    // 允许 CDN 域名
    domains: ['cdn.starlog.dev', 'res.cloudinary.com'],
    
    // 设备尺寸优化
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 缓存优化
    minimumCacheTTL: 60,
  },
  
  // 头部配置
  async headers() {
    return [
      {
        // 静态资源长缓存
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API 短缓存
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },
}
```

### 更新环境变量

```bash
# .env.local
NEXT_PUBLIC_CDN_URL="https://cdn.starlog.dev"
NEXT_PUBLIC_SITE_URL="https://starlog.dev"
```

---

## 验证 CDN 是否生效

### 方法 1：检查响应头

```bash
curl -I https://starlog.dev/static/images/logo.webp
```

**应该看到：**
```
cf-cache-status: HIT           # Cloudflare 缓存命中
cf-ray: xxxxxx                 # Cloudflare 请求 ID
server: cloudflare             # Cloudflare 服务器
cache-control: max-age=31536000
```

### 方法 2：使用在线工具

- https://tools.keycdn.com/cdn-test
- https://www.cdnplanet.com/tools/cdnfinder/

### 方法 3：浏览器开发者工具

1. 打开 Chrome DevTools (F12)
2. 进入 "Network" 标签
3. 刷新页面
4. 查看资源请求的响应头
5. 寻找 `cf-cache-status: HIT`

---

## 高级配置

### 1. 自定义缓存键

进入 "Caching" → "Cache Keys"：

```
Include: Host, Scheme
Exclude: None
```

### 2. 缓存清除策略

**手动清除：**
- 进入 "Caching" → "Configuration"
- 点击 "Purge Everything" 或 "Custom Purge"

**API 清除：**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"files":["https://starlog.dev/static/images/logo.webp"]}'
```

### 3. Workers（边缘计算）

Cloudflare Workers 可以在边缘节点运行 JavaScript：

**示例：添加安全头**
```js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)
  
  // 添加安全头
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('X-Frame-Options', 'DENY')
  
  return newResponse
}
```

---

## 监控与分析

### Cloudflare Analytics

进入 "Analytics" → "Traffic"：

**可查看：**
- 📊 请求量
- 🌍 地理位置
- ⚡ 缓存命中率
- 🛡️ 安全事件
- 📈 带宽使用

### 设置告警

进入 "Analytics" → "Alerts"：

**推荐告警：**
- 缓存命中率 < 50%
- 错误率 > 5%
- 带宽异常增长

---

## 成本估算

### 免费套餐限制

| 资源 | 限制 | 实际使用 |
|------|------|----------|
| 请求数 | 100K/天 | ~30K/天 ✅ |
| 带宽 | 不限 | ~10GB/月 ✅ |
| Workers | 100K 请求/天 | 未使用 ✅ |
| Page Rules | 3 条 | 3 条 ✅ |

### 升级建议

**何时升级：**
- 请求数 > 100K/天
- 需要更多 Page Rules
- 需要图片优化（Polish）
- 需要视频流媒体

**付费套餐：**
- Pro: $20/月
- Business: $200/月
- Enterprise: 定制

---

## 故障排查

### 问题 1：CDN 不生效

**检查清单：**
- [ ] DNS 服务器已修改
- [ ] DNS 记录已添加
- [ ] 代理状态为 🟡（黄色云朵）
- [ ] 等待 DNS 传播（最多 48 小时）

### 问题 2：缓存不更新

**解决方案：**
1. 手动清除缓存
2. 在 URL 后添加版本号：`/static/images/logo.v2.webp`
3. 使用构建工具自动添加 hash

### 问题 3：API 被缓存

**解决方案：**
1. 添加 Page Rule 绕过 API 缓存
2. 在 API 响应头中添加 `Cache-Control: no-cache`

---

## 替代方案

### 如果不用 Cloudflare

| 服务商 | 免费额度 | 价格 | 特点 |
|--------|----------|------|------|
| Vercel Edge | 100GB/月 | $20 起 | Next.js 原生 |
| Netlify | 100GB/月 | $19 起 | 静态站点 |
| AWS CloudFront | 1TB/月 | $0.085/GB | 功能强大 |
| 阿里云 CDN | 10GB/月 | $0.24/GB | 国内加速 |

---

## 快速检查清单

部署前检查：

- [ ] Cloudflare 账号注册
- [ ] 域名添加到 Cloudflare
- [ ] DNS 服务器已修改
- [ ] DNS 记录配置正确
- [ ] SSL/TLS 设置为 Full
- [ ] 开启强制 HTTPS
- [ ] 配置缓存规则（Page Rules）
- [ ] 开启 Auto Minify
- [ ] 开启 Brotli 压缩
- [ ] 测试缓存命中
- [ ] 更新 Next.js 配置
- [ ] 更新环境变量
- [ ] 重新构建部署

---

## 参考链接

- Cloudflare 官网：https://www.cloudflare.com/
- 文档：https://developers.cloudflare.com/
- 社区：https://community.cloudflare.com/
- 状态：https://www.cloudflarestatus.com/

---

**配置完成后，网站加载速度预计提升 50%+！** 🚀
