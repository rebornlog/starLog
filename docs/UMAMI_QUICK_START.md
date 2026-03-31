# 📊 Umami 统计快速启用指南

## 方案选择

### 方案 A：Umami Cloud（推荐，5 分钟）

**优点：**
- ✅ 无需自己部署
- ✅ 免费套餐：每月 10,000 页面浏览量
- ✅ 开箱即用

**步骤：**

1. **注册账号**
   - 访问：https://cloud.umami.is/
   - 点击 "Get Started"
   - 使用邮箱注册

2. **添加网站**
   - 登录后点击 "Add website"
   - 网站名称：starLog
   - 域名：starlog.dev（或当前 IP 47.79.20.10）
   - 时区：Asia/Shanghai
   - 点击 "Add website"

3. **获取 Website ID**
   - 在网站列表中找到 starlog
   - 复制 Website ID（格式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）

4. **更新配置**
   ```js
   // 编辑 data/siteMetadata.js
   analytics: {
     umamiAnalytics: {
       umamiWebsiteId: '你的 Website ID',
     },
   }
   ```

5. **重启服务**
   ```bash
   pm2 restart starlog-frontend
   ```

6. **验证**
   - 访问网站
   - 查看 Umami 后台实时数据

---

### 方案 B：自建 Umami（高级，30 分钟）

**优点：**
- ✅ 数据完全掌控
- ✅ 无页面浏览限制

**部署步骤：**

1. **创建数据库**
   ```bash
   docker exec -it starlog-postgres psql -U starlog
   CREATE DATABASE umami;
   CREATE USER umami WITH PASSWORD 'umami123';
   GRANT ALL PRIVILEGES ON DATABASE umami TO umami;
   \q
   ```

2. **部署 Umami**
   ```bash
   docker run -d \
     --name umami \
     -p 3001:3000 \
     -e DATABASE_URL=postgresql://umami:umami123@localhost:5432/umami \
     -e DATABASE_TYPE=postgresql \
     -e SECRET=your-secret-key \
     ghcr.io/umami-software/umami:postgresql-latest
   ```

3. **初始化**
   - 访问：http://47.79.20.10:3001
   - 默认账号：admin / umami
   - 添加网站获取 Website ID

4. **更新配置**
   ```js
   // data/siteMetadata.js
   analytics: {
     umamiAnalytics: {
       umamiWebsiteId: '你的 Website ID',
       umamiScriptUrl: 'http://47.79.20.10:3001/script.js',
     },
   }
   ```

---

## 代码集成

### 方法 1：使用 Next.js Script 组件（推荐）

创建 `components/analytics/UmamiAnalytics.tsx`:

```tsx
'use client'

import Script from 'next/script'
import siteMetadata from '@/data/siteMetadata'

export function UmamiAnalytics() {
  const websiteId = siteMetadata.analytics?.umamiAnalytics?.umamiWebsiteId
  const scriptUrl = siteMetadata.analytics?.umamiAnalytics?.umamiScriptUrl || 'https://analytics.umami.is/script.js'

  if (!websiteId) return null

  return (
    <Script
      id="umami-analytics"
      strategy="lazyOnload"
      src={scriptUrl}
      data-website-id={websiteId}
    />
  )
}
```

### 方法 2：添加到 layout.tsx

编辑 `app/layout.tsx`:

```tsx
import { UmamiAnalytics } from '@/components/analytics/UmamiAnalytics'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <UmamiAnalytics />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## 验证安装

### 1. 检查脚本加载

打开浏览器开发者工具（F12）：
- Network 标签 → 搜索 "script.js"
- 应该看到 umami 脚本加载

### 2. 检查请求

- Network 标签 → 搜索 "umami"
- 应该看到发送到 analytics.umami.is 的请求

### 3. 查看实时数据

- 访问 Umami 后台
- Realtime 页面
- 应该看到当前访问

---

## 追踪事件

### 页面浏览（自动）

Umami 自动追踪页面浏览，无需额外配置。

### 自定义事件

```tsx
// 按钮点击
<button 
  onClick={() => {
    if (window.umami) {
      window.umami.track('button-click', { button: 'download' })
    }
  }}
>
  下载
</button>

// 表单提交
<form onSubmit={(e) => {
  if (window.umami) {
    window.umami.track('form-submit', { form: 'contact' })
  }
}}>
  ...
</form>
```

### TypeScript 类型定义

添加 `types/umami.d.ts`:

```typescript
interface Umami {
  track: (eventName: string, eventData?: Record<string, unknown>) => void
}

interface Window {
  umami?: Umami
}
```

---

## 查看数据

### 云版本
访问：https://cloud.umami.is/

### 自托管版本
访问：http://47.79.20.10:3001

**可查看数据：**
- 📊 实时访客
- 📈 页面浏览量
- 🌍 访客地理位置
- 🖥️ 设备和浏览器
- 🔗 引荐来源
- 📱 移动端 vs 桌面端

---

## 隐私保护

Umami 默认不收集个人数据：

- ❌ 不收集 IP 地址
- ❌ 不使用 Cookie
- ❌ 不追踪个人身份
- ✅ 符合 GDPR
- ✅ 符合 CCPA

---

## 成本对比

| 服务 | 免费额度 | 价格 |
|------|----------|------|
| Umami Cloud | 10K/月 | $2/月起 |
| Google Analytics | 无限 | 免费 |
| 自建 Umami | 无限 | 服务器成本 |

---

## 故障排查

### 问题 1：数据不显示

**检查：**
1. Website ID 是否正确
2. 脚本 URL 是否可访问
3. 浏览器控制台是否有错误
4. 广告拦截器是否拦截

**解决：**
```bash
# 检查脚本加载
curl -I https://analytics.umami.is/script.js

# 检查配置
grep -A 5 "umamiAnalytics" data/siteMetadata.js
```

### 问题 2：性能影响

Umami 脚本仅 2KB，对性能影响极小：
- 加载时间：<100ms
- 内存占用：<1MB
- 不影响页面 SEO

---

## 快速开始（5 分钟）

```bash
# 1. 注册 Umami Cloud
# 访问：https://cloud.umami.is/

# 2. 添加网站，获取 Website ID

# 3. 更新配置
cat > /tmp/umami-config.js << 'EOF'
analytics: {
  umamiAnalytics: {
    umamiWebsiteId: '你的 Website ID',
  },
}
EOF

# 4. 编辑 data/siteMetadata.js
# 替换 umamiAnalytics 部分

# 5. 重启服务
pm2 restart starlog-frontend

# 6. 查看数据
# 访问 Umami 后台查看实时统计
```

---

**配置完成后，您将看到实时的访问数据！** 📊🚀
