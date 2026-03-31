# 🔍 SEO 优化方案

## 当前 SEO 状态

### ✅ 已配置
- [x] 基础 metadata (title, description)
- [x] Open Graph (社交媒体分享)
- [x] Twitter Card
- [x] 站点地图 (sitemap.ts)
- [x] robots.txt
- [x] 结构化数据（部分）

### ⚠️ 待优化
- [ ] 结构化数据完善
- [ ] 页面加载速度
- [ ] 移动端优化
- [ ] 内部链接优化
- [ ] 关键词优化

---

## 优化方案

### 1. 结构化数据增强（Schema.org）

创建 `app/structured-data.tsx`:

```tsx
import Script from 'next/script'

interface StructuredDataProps {
  type: 'Article' | 'WebSite' | 'Organization' | 'BlogPosting'
  data: Record<string, unknown>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="afterInteractive"
    />
  )
}
```

**使用示例：**

```tsx
// 在博客文章页面
<StructuredData
  type="BlogPosting"
  data={{
    headline: post.title,
    datePublished: post.date,
    dateModified: post.lastmod,
    description: post.summary,
    image: post.images[0],
    author: {
      '@type': 'Person',
      name: post.authors[0].name,
    },
  }}
/>
```

### 2. 更新 siteMetadata.js

```js
// data/siteMetadata.js
module.exports = {
  title: 'starLog - 个人知识库',
  description: '技术博客·A 股行情·星座运势·易经问卦·能量饮食',
  language: 'zh-CN',
  theme: 'light',
  
  // SEO 关键配置
  siteUrl: 'https://starlog.dev',
  siteRepo: 'https://github.com/rebornlog/starLog',
  siteLogo: '/static/images/logo.png',
  socialBanner: '/static/images/twitter-card.png',
  
  // 作者信息
  author: {
    name: '老柱子',
    email: '944183654@qq.com',
    twitter: 'https://twitter.com/yourhandle',
    github: 'https://github.com/rebornlog',
    linkedin: 'https://www.linkedin.com/in/yourprofile',
  },
  
  // 社交媒体
  social: {
    github: 'https://github.com/rebornlog',
    twitter: 'https://twitter.com/yourhandle',
    facebook: '',
    youtube: '',
  },
  
  // 分析工具
  analytics: {
    umami: {
      enabled: false, // 启用后填写 ID
      websiteId: '',
    },
    google: {
      enabled: false,
      measurementId: '',
    },
  },
  
  // 联系方式
  contact: {
    email: '944183654@qq.com',
    github: 'https://github.com/rebornlog',
  },
}
```

### 3. 优化 robots.txt

创建 `app/robots.ts`:

```ts
import { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/static/',
        '/admin/',
      ],
    },
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
    host: siteMetadata.siteUrl,
  }
}
```

### 4. 关键词优化

**目标关键词：**
- 技术博客
- A 股行情
- 基金净值查询
- 星座运势
- 易经问卦
- 能量饮食
- Next.js 博客
- 个人知识库

**优化位置：**
1. 页面 title
2. meta description
3. h1 标题
4. 图片 alt 属性
5. 内部链接 anchor text

### 5. 页面速度优化

**Core Web Vitals 目标：**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**优化措施：**

#### 图片优化
```tsx
import Image from 'next/image'

// ✅ 使用 Next.js Image 组件
<Image
  src="/avatar.jpg"
  alt="老柱子"
  width={400}
  height={400}
  priority={true} // 首屏图片
  quality={80}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### 字体优化
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})
```

#### 代码分割
```tsx
// 动态导入大组件
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('@/components/Chart'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
})
```

### 6. 内部链接优化

**策略：**
1. 相关文章推荐
2. 标签云
3. 分类导航
4. 面包屑导航
5. 站点地图页面

**示例：**

```tsx
// 在博客文章底部
<div className="related-posts">
  <h3>相关文章</h3>
  <ul>
    {relatedPosts.map(post => (
      <li key={post.slug}>
        <Link href={`/blog/${post.slug}`}>
          {post.title}
        </Link>
      </li>
    ))}
  </ul>
</div>
```

### 7. 移动端优化

**检查清单：**
- [x] 响应式设计
- [ ] 移动端字体大小（至少 16px）
- [ ] 触摸目标大小（至少 44x44px）
- [ ] 视口配置
- [ ] 移动端导航

**优化：**

```tsx
// 确保视口配置正确
<meta name="viewport" content="width=device-width, initial-scale=1" />

// 移动端友好的字体
<p className="text-base md:text-lg">内容</p>

// 触摸友好的按钮
<button className="min-h-[44px] min-w-[44px] p-3">
  点击
</button>
```

---

## 执行步骤

### 步骤 1：更新 siteMetadata

```bash
# 编辑文件
vim data/siteMetadata.js

# 确保 siteUrl 正确
siteUrl: 'https://starlog.dev' # 或当前 IP
```

### 步骤 2：添加结构化数据

```bash
# 创建组件
mkdir -p components/seo
vim components/seo/StructuredData.tsx
```

### 步骤 3：测试 SEO

**工具：**
- Google Search Console
- Google PageSpeed Insights
- Bing Webmaster Tools
- Ahrefs SEO Toolbar

**本地测试：**
```bash
# 检查 sitemap
curl http://localhost:3000/sitemap.xml

# 检查 robots.txt
curl http://localhost:3000/robots.txt

# 检查 meta 标签
curl http://localhost:3000 | grep -i "<meta"
```

### 步骤 4：提交搜索引擎

**Google:**
1. 访问 https://search.google.com/search-console
2. 添加网站
3. 验证所有权
4. 提交 sitemap: `sitemap.xml`

**Bing:**
1. 访问 https://www.bing.com/webmasters
2. 添加网站
3. 验证所有权
4. 提交 sitemap

---

## 监控与分析

### 关键指标

| 指标 | 目标 | 工具 |
|------|------|------|
| 自然搜索流量 | 增长 | Google Analytics |
| 关键词排名 | 前 10 | Ahrefs/SEMrush |
| 页面速度 | >90 | PageSpeed Insights |
| 索引页面数 | 全部 | Search Console |
| 点击率 (CTR) | >2% | Search Console |

### 每周检查

```bash
# 检查索引状态
site:starlog.dev

# 检查 sitemap
curl -I https://starlog.dev/sitemap.xml

# 检查页面速度
https://pagespeed.web.dev/
```

---

## 常见问题

### Q1: 为什么页面不被索引？

**可能原因：**
- robots.txt 阻止
- noindex 标签
- 页面质量低
- 缺少内部链接

**解决：**
1. 检查 robots.txt
2. 移除 noindex
3. 提升内容质量
4. 添加内部链接

### Q2: 如何提高排名？

**策略：**
1. 高质量内容
2. 关键词优化
3. 页面速度
4. 移动端友好
5. 内部链接
6. 外部链接

### Q3: 多久能看到效果？

**时间线：**
- 1 周：页面被索引
- 2-4 周：开始有排名
- 3-6 个月：稳定流量

---

## 参考资源

- Google SEO 入门：https://developers.google.com/search/docs/beginner/seo-starter-guide
- Schema.org: https://schema.org/
- PageSpeed Insights: https://pagespeed.web.dev/

---

**SEO 是长期投资，持续优化必有回报！** 🚀
