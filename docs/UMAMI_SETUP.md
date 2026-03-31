# 📊 Umami 访问统计集成指南

## 什么是 Umami？

Umami 是一个简单、快速、注重隐私的 Google Analytics 替代品。

**优势：**
- ✅ 隐私友好（符合 GDPR）
- ✅ 自托管（数据完全掌控）
- ✅ 轻量级（脚本仅 2KB）
- ✅ 界面美观
- ✅ 免费开源

---

## 方案选择

### 方案 A：使用 Umami 云服务（推荐，简单）

**优点：**
- 无需自己部署服务器
- 免费套餐：每月 10,000 页面浏览量
- 开箱即用

**步骤：**

1. **注册账号**
   - 访问：https://cloud.umami.is/
   - 点击 "Get Started" 注册

2. **添加网站**
   - 登录后点击 "Add website"
   - 填写网站名称：starLog
   - 域名：starlog.dev（或当前 IP）
   - 获取 Website ID

3. **配置环境变量**
   ```bash
   # .env.local
   NEXT_PUBLIC_UMAMI_WEBSITE_ID="your-website-id"
   NEXT_PUBLIC_UMAMI_SCRIPT_URL="https://analytics.umami.is/script.js"
   ```

4. **添加到代码**
   已在 `app/layout.tsx` 中预留 Umami 集成位置

---

### 方案 B：自建 Umami 服务（高级）

**优点：**
- 完全控制数据
- 无页面浏览限制
- 可定制

**部署步骤：**

#### 1. 准备数据库

```bash
# 使用 Docker 快速部署
docker run -d \
  --name umami \
  -p 3001:3000 \
  -e DATABASE_URL=postgresql://umami:umami@localhost:5432/umami \
  -e DATABASE_TYPE=postgresql \
  -e SECRET=your-secret-key \
  ghcr.io/umami-software/umami:postgresql-latest
```

#### 2. 创建数据库

```bash
# 连接到 PostgreSQL
docker exec -it starlog-postgres psql -U starlog

# 创建 Umami 数据库
CREATE DATABASE umami;
CREATE USER umami WITH PASSWORD 'umami';
GRANT ALL PRIVILEGES ON DATABASE umami TO umami;
\q
```

#### 3. 初始化 Umami

```bash
# 访问初始化页面
http://localhost:3001

# 默认账号
用户名：admin
密码：umami
```

#### 4. 配置环境变量

```bash
# .env.local
NEXT_PUBLIC_UMAMI_WEBSITE_ID="your-website-id"
NEXT_PUBLIC_UMAMI_SCRIPT_URL="http://47.79.20.10:3001/script.js"
```

---

## 代码集成

### 方法 1：使用 Umami React 组件（推荐）

安装依赖：
```bash
npm install @umami/react
```

在 `app/layout.tsx` 中添加：
```tsx
import { UmamiProvider } from '@umami/react'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <UmamiProvider 
          websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
        >
          {children}
        </UmamiProvider>
      </body>
    </html>
  )
}
```

### 方法 2：手动添加脚本（简单）

在 `app/layout.tsx` 的 `<head>` 中添加：
```tsx
<script 
  async 
  src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
  data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
/>
```

### 方法 3：使用 Next.js Script 组件（最佳）

```tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <head>
        <Script
          strategy="lazyOnload"
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## 追踪事件

### 页面浏览（自动）

Umami 会自动追踪页面浏览，无需额外配置。

### 自定义事件

```tsx
import { track } from '@umami/react'

// 按钮点击
<button onClick={() => track('button-click', { button: 'download' })}>
  下载
</button>

// 表单提交
<form onSubmit={(e) => {
  track('form-submit', { form: 'contact' })
}}>
  ...
</form>

// 文件下载
<a 
  href="/file.pdf" 
  onClick={() => track('file-download', { file: 'whitepaper.pdf' })}
>
  下载白皮书
</a>
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

## 推荐方案

**对于 starLog：**

1. **初期（<10K PV/月）：** 使用 Umami Cloud 免费版
2. **成长期（>10K PV/月）：** 升级到付费版或自建
3. **长期：** 建议自建（数据完全掌控）

---

## 快速开始（5 分钟）

```bash
# 1. 注册 Umami Cloud
# 访问：https://cloud.umami.is/

# 2. 添加网站，获取 Website ID

# 3. 更新环境变量
echo 'NEXT_PUBLIC_UMAMI_WEBSITE_ID="your-id"' >> .env.local
echo 'NEXT_PUBLIC_UMAMI_SCRIPT_URL="https://analytics.umami.is/script.js"' >> .env.local

# 4. 重启服务
pm2 restart starlog-frontend

# 5. 查看数据
# 访问 Umami 后台查看实时统计
```

---

## 故障排查

### 数据不显示

1. 检查 Website ID 是否正确
2. 检查脚本 URL 是否可访问
3. 查看浏览器控制台是否有错误
4. 确认广告拦截器未拦截

### 性能影响

Umami 脚本仅 2KB，对性能影响极小：
- 加载时间：<100ms
- 内存占用：<1MB
- 不影响页面 SEO

---

## 参考链接

- 官网：https://umami.is/
- 文档：https://umami.is/docs/
- GitHub: https://github.com/umami-software/umami
- 云版本：https://cloud.umami.is/
