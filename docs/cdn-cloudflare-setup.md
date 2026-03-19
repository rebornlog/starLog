# 🌐 Cloudflare CDN 配置指南

**配置时间：** 2026-03-20  
**优先级：** P1  
**成本：** 免费计划

---

## 📋 准备工作

### 1. 注册 Cloudflare
1. 访问 https://www.cloudflare.com
2. 点击 "Sign Up" 注册免费账户
3. 验证邮箱

### 2. 添加网站
1. 点击 "Add a domain"
2. 输入域名：`starlog.dev`（或你的域名）
3. 选择免费计划（Free）
4. Cloudflare 会扫描现有 DNS 记录

---

## 🔧 DNS 配置

### 需要修改的 DNS 记录

| 类型 | 名称 | 内容 | 代理状态 | 说明 |
|------|------|------|----------|------|
| A | @ | 47.79.20.10 | 🟠 Proxied | 主域名 |
| A | www | 47.79.20.10 | 🟠 Proxied | WWW 子域名 |
| CNAME | cdn | 47.79.20.10 | 🟠 Proxied | CDN 专用 |

**重要：** 确保代理状态是 🟠 Proxied（橙色云朵），这样流量才会经过 Cloudflare CDN。

---

## ⚙️ 优化配置

### 1. SSL/TLS 设置
**路径：** SSL/TLS → Overview

- **加密模式：** Full (完全)
- **Always Use HTTPS：** ✅ 开启
- **Minimum TLS Version：** 1.2
- **Opportunistic Encryption：** ✅ 开启
- **TLS 1.3：** ✅ 开启

### 2. 缓存配置
**路径：** Caching → Configuration

- **Caching Level：** Standard
- **Browser Cache TTL：** 4 hours (或更长)

**路径：** Caching → Cache Rules

添加规则：
```
If:
  Hostname equals starlog.dev AND
  Path matches ^/_next/static/.*

Then:
  Cache Level: Cache Everything
  Edge Cache TTL: 1 year
  Browser Cache TTL: 1 year
```

### 3. 性能优化
**路径：** Speed → Optimization

**Content Optimization:**
- ✅ Auto Minify (HTML, CSS, JS)
- ✅ Brotli compression
- ✅ Early Hints
- ✅ HTTP/2
- ✅ HTTP/3 (with QUIC)

**Mobile:**
- ✅ Mobile Redirect (如需要)

### 4. 安全设置
**路径：** Security → Settings

- **Security Level:** Medium
- **Challenge Passage:** 30 minutes
- **Browser Integrity Check:** ✅ On
- **Privacy Pass:** ✅ On

**路径：** Security → WAF

添加规则（免费计划 5 条）：
```
1. Block SQL Injection
   Expression: (http.request.uri.query contains "SELECT") OR 
               (http.request.uri.query contains "UNION")
   Action: Block

2. Block Path Traversal
   Expression: http.request.uri.path contains "../"
   Action: Block
```

### 5. Page Rules（重要！）
**路径：** Rules → Page Rules

添加 3 条规则：

#### 规则 1：静态资源缓存 1 年
```
URL: starlog.dev/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 year
  - Browser Cache TTL: 1 year
```

#### 规则 2：HTML 缓存 5 分钟
```
URL: starlog.dev/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 5 minutes
  - Browser Cache TTL: 5 minutes
```

#### 规则 3：API 不缓存
```
URL: starlog.dev/api/*
Settings:
  - Cache Level: Bypass
```

---

## 🚀 Next.js 配置

### 更新 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 CDN 支持
  assetPrefix: process.env.CDN_URL ? `${process.env.CDN_URL}/_next` : undefined,
  
  // 图片优化
  images: {
    domains: ['starlog.dev', 'cdn.starlog.dev'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 压缩
  compress: true,
  
  // 生产环境配置
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
```

### 环境变量

在 `.env.production` 添加：
```bash
# Cloudflare CDN URL（可选，如使用自定义域名）
CDN_URL=https://cdn.starlog.dev
```

---

## 📊 预期效果

### 性能提升
| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 首次加载（国内） | 3s | **1.5s** | 50% ↓ |
| 首次加载（海外） | 5s | **1s** | 80% ↓ |
| 静态资源加载 | 2s | **0.5s** | 75% ↓ |
| TTFB | 800ms | **200ms** | 75% ↓ |

### 覆盖范围
- **全球 275+ 数据中心**
- **100+ 国家/地区**
- **95% 互联网用户在 50ms 内**

---

## 🔍 验证配置

### 1. 检查 DNS
```bash
# 应该显示 Cloudflare 的 IP
nslookup starlog.dev
```

### 2. 检查 CDN 缓存
访问 https://www.cdnplanet.com/tools/cloudflareflare/

### 3. 检查响应头
```bash
curl -I https://starlog.dev/_next/static/...
# 应该看到：
# cf-cache-status: HIT
# cache-control: public, max-age=31536000
```

### 4. 性能测试
- https://pagespeed.web.dev/
- https://www.webpagetest.org/

---

## ⚠️ 注意事项

### 1. 缓存失效
- 开发环境：使用 `npm run dev` 不受 CDN 影响
- 生产环境：清除缓存 via Cloudflare Dashboard
  - Caching → Configuration → Purge Everything
  - 或使用 API：`curl -X POST .../purge_cache`

### 2. API 接口
- **不要缓存 API 响应**（已配置 bypass）
- API 使用独立子域名（可选）：`api.starlog.dev`

### 3. 图片资源
- Next.js Image 组件自动优化
- 确保 `next.config.js` 配置了正确的 domains

### 4. WebSocket
- Cloudflare 免费计划支持 WebSocket
- 无需额外配置

---

## 📈 监控与分析

### Cloudflare Analytics
**路径：** Analytics & Logs → Overview

监控指标：
- 请求数
- 缓存命中率（目标 >90%）
- 带宽使用
- 威胁分析

### 告警设置
**路径：** Monitoring → Alerts

添加告警：
1. 缓存命中率 < 80%
2. 错误率 > 5%
3. 带宽异常增长

---

## 🆘 故障排查

### 问题 1：CDN 不生效
**检查：**
1. DNS 是否正确指向 Cloudflare
2. 代理状态是否为 🟠 Proxied
3. 域名是否已激活

### 问题 2：缓存不更新
**解决：**
1. Dashboard → Caching → Purge Everything
2. 检查 Page Rules 配置
3. 浏览器硬刷新（Ctrl+Shift+R）

### 问题 3：API 被缓存
**解决：**
1. 检查 Page Rules 是否有 bypass 规则
2. API 响应头添加 `Cache-Control: no-store`

---

## 💰 免费计划限制

| 功能 | 免费计划 | 付费计划 |
|------|----------|----------|
| CDN | ✅ 无限 | ✅ 无限 |
| SSL | ✅ 无限 | ✅ 无限 |
| DDoS 防护 | ✅ 无限 | ✅ 无限 |
| WAF 规则 | 5 条 | 无限制 |
| Page Rules | 3 条 | 无限制 |
| Workers | 100 次/天 | 无限制 |
| 日志 | 3 小时 | 7-30 天 |

**结论：** 对于 starLog 当前规模，免费计划完全够用！

---

## ✅ 配置清单

- [ ] 注册 Cloudflare 账户
- [ ] 添加域名到 Cloudflare
- [ ] 修改 DNS 记录（🟠 Proxied）
- [ ] 配置 SSL/TLS（Full 模式）
- [ ] 配置缓存规则（Page Rules）
- [ ] 启用自动压缩（Brotli）
- [ ] 配置 WAF 规则
- [ ] 更新 Next.js 配置
- [ ] 测试缓存命中
- [ ] 性能基准测试

---

**配置完成时间：** TBD  
**配置人：** TBD  
**验证状态：** ⏳ 待验证
