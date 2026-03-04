# starLog - 个人知识库

> 基于 Next.js 15 的全栈知识库系统，支持博客、文档管理、金融数据分析

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产构建

```bash
# 构建
npm run build

# 启动生产服务
npm run start
```

## 📁 项目结构

```
starLog/
├── app/                    # Next.js App Router 页面
│   ├── blog/              # 博客文章
│   ├── library/           # 知识库文档
│   ├── finance/           # 金融分析
│   ├── api/               # API 路由
│   └── page.tsx           # 首页
├── components/            # React 组件
├── data/                  # 内容数据
│   ├── blog/              # 博客文章 (MDX)
│   ├── library/           # 知识库文档
│   └── siteMetadata.js    # 站点配置
├── lib/                   # 工具库
│   ├── db.ts              # 数据库客户端
│   ├── redis.ts           # Redis 客户端
│   └── utils.ts           # 通用工具
├── prisma/                # 数据库 Schema
│   └── schema.prisma
├── public/                # 静态资源
└── scripts/               # 脚本工具
```

## 🛠️ 技术栈

### 前端
- **Next.js 15** - React 框架 (App Router)
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Shadcn UI** - 组件库
- **Contentlayer** - MDX 内容管理

### 后端
- **Next.js API Routes** - 服务端 API
- **Prisma** - ORM
- **PostgreSQL** - 主数据库
- **Redis** - 缓存

### 功能特性
- ✅ 博客系统
- ✅ 知识库文档
- ✅ 文件上传/下载
- ✅ PDF 导出
- ✅ 全文检索
- ✅ 金融数据集成
- ✅ 暗色模式
- ✅ SEO 优化
- ✅ RSS 订阅

## 📝 功能规划

### Phase 1: 博客基础 (当前)
- [x] 项目初始化
- [x] 基础博客功能
- [ ] 自定义域名配置
- [ ] SEO 优化

### Phase 2: 知识库管理
- [ ] 文档分类管理
- [ ] 文件上传/下载
- [ ] PDF 导出功能
- [ ] 全文检索

### Phase 3: 金融分析
- [ ] Finnhub API 集成
- [ ] 股票数据展示
- [ ] 技术指标计算
- [ ] K 线图表

### Phase 4: 高级功能
- [ ] 用户认证
- [ ] 评论系统
- [ ] 数据分析面板
- [ ] 自动化部署

## 🔧 配置

### 环境变量

创建 `.env.local` 文件：

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/starlog"

# Redis
REDIS_URL="redis://localhost:6379"

# Finnhub API
FINNHUB_API_KEY="your_api_key"

# NextAuth (可选)
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 数据库配置

```bash
# 初始化数据库
npx prisma generate
npx prisma db push

# 创建迁移
npx prisma migrate dev --name init
```

## 📄 许可证

MIT © 2026 musk
