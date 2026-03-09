# 🚀 starLog - 个人知识库与金融分析平台

> 📝 基于 Next.js 的全栈知识库系统 | 📈 集成 A 股实时行情 | 🎨 宫崎骏风格设计 | ⭐ 全新收藏功能

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Stars](https://img.shields.io/github/stars/rebornlog/starLog?style=social)](https://github.com/rebornlog/starLog)

---

## 🎯 5 分钟快速部署（傻瓜式教程）

### 前置要求

- ✅ **Node.js 18+** ([下载地址](https://nodejs.org/))
- ✅ **Git** ([下载地址](https://git-scm.com/))
- ✅ **Redis** (可选，用于缓存)

### 方式一：本地开发环境（推荐新手）

#### 1️⃣ 克隆项目

```bash
# 克隆项目到本地
git clone https://github.com/rebornlog/starLog.git

# 进入项目目录
cd starLog
```

#### 2️⃣ 安装依赖

```bash
# 使用 npm (推荐)
npm install

# 或使用 yarn
yarn install
```

#### 3️⃣ 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env.local

# 编辑 .env.local 文件，填入你的配置
# 至少需要配置数据库连接字符串
```

**最小化配置（仅数据库）**:
```bash
# 数据库连接（PostgreSQL）
DATABASE_URL="postgresql://user:password@localhost:5432/starlog"

# Redis（可选，用于缓存）
REDIS_URL="redis://localhost:6379"
```

#### 4️⃣ 初始化数据库

```bash
# 安装 Prisma CLI
npm install -g prisma

# 生成 Prisma 客户端
npx prisma generate

# 执行数据库迁移
npx prisma migrate deploy
```

#### 5️⃣ 启动开发服务器

```bash
# 启动开发服务器（自动热重载）
npm run dev

# 访问 http://localhost:3000
```

**🎉 完成！** 现在你可以访问 http://localhost:3000 查看项目了！

---

### 方式二：Docker 一键部署（最简单）

#### 1️⃣ 确保已安装 Docker

```bash
# 检查 Docker 是否安装
docker --version

# 检查 Docker Compose 是否安装
docker-compose --version
```

#### 2️⃣ 克隆并启动

```bash
# 克隆项目
git clone https://github.com/rebornlog/starLog.git
cd starLog

# 一键启动所有服务
docker-compose up -d
```

**🎉 完成！** 访问 http://localhost:3000 即可。

#### 3️⃣ 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
```

#### 4️⃣ 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎使用！）
docker-compose down -v
```

---

### 方式三：生产环境部署

#### 1️⃣ 构建生产版本

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动生产服务器
npm start
```

#### 2️⃣ 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start npm --name "starlog" -- start

# 查看状态
pm2 status

# 查看日志
pm2 logs starlog

# 设置开机自启
pm2 startup
pm2 save
```

---

## ✨ 核心功能

### 📝 知识库管理
- ✅ Markdown 文章发布
- ✅ 文件上传下载
- ✅ PDF 导出
- ✅ 分类标签管理
- ✅ 全文检索

### 📈 金融数据分析
- ✅ A 股实时行情
- ✅ 市场概览
- ✅ 股票搜索
- ✅ 历史数据查询
- ✅ 数据可视化

### ☯️ 传统文化
- ✅ 易经问卦（支持收藏 ⭐）
- ✅ 星座运势（支持收藏 ⭐）
- ✅ 能量饮食（支持收藏 ⭐）
- ✅ 八字分析

### ⭐ 收藏功能（NEW！）
- ✅ 一键收藏喜欢的内容
- ✅ 收藏夹统一管理
- ✅ 按类型筛选
- ✅ LocalStorage 本地存储
- ✅ 自动记录历史

### 🎨 UI/UX
- ✅ 宫崎骏风格设计
- ✅ 响应式布局
- ✅ 暗色模式
- ✅ 中英文切换
- ✅ 移动端优化

---

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| **前端框架** | Next.js 15, React 18, TypeScript |
| **样式** | Tailwind CSS, CSS Modules |
| **状态管理** | React Hooks, LocalStorage |
| **数据库** | PostgreSQL, Prisma ORM |
| **缓存** | Redis |
| **部署** | Docker, PM2 |
| **API** | RESTful API |

---

## 📁 项目结构

```
starLog/
├── app/                    # Next.js 15 App Router
│   ├── blog/              # 博客页面
│   ├── favorites/         # ⭐ 收藏夹页面（新增）
│   ├── iching/            # 易经问卦
│   ├── zodiac/            # 星座运势
│   ├── diet/              # 能量饮食
│   └── page.tsx           # 首页
├── lib/                    # 工具函数
│   ├── storage.ts         # ⭐ 收藏功能核心（新增）
│   ├── redis.ts           # Redis 缓存
│   ├── db.ts              # 数据库连接
│   └── ...
├── components/             # React 组件
├── prisma/                 # 数据库 Schema
├── public/                 # 静态资源
└── .env.local             # 环境变量配置
```

---

## ⚙️ 环境变量配置

### 必需配置

```bash
# 数据库连接（PostgreSQL）
DATABASE_URL="postgresql://用户名：密码@主机：端口/数据库名"

# 示例：
# DATABASE_URL="postgresql://postgres:123456@localhost:5432/starlog"
```

### 可选配置

```bash
# Redis 缓存
REDIS_URL="redis://localhost:6379"

# 应用配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="starLog"

# 金融 API（如果使用外部服务）
FINANCE_API_URL="http://localhost:8081"
```

---

## 📖 使用指南

### 1️⃣ 发布文章

1. 访问 `/blog` 页面
2. 点击"新建文章"
3. 使用 Markdown 编辑器编写
4. 添加分类和标签
5. 点击发布

### 2️⃣ 收藏内容

1. 访问问卦/星座/饮食页面
2. 点击 ⭐ 收藏按钮
3. 访问 `/favorites` 查看收藏夹
4. 可以筛选、删除收藏

### 3️⃣ 查看股票行情

1. 访问金融市场页面
2. 搜索股票代码或名称
3. 查看实时行情和历史数据

---

## 🐛 常见问题

### 1. 安装依赖失败

```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 2. 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
# Windows: 服务管理器
# Mac: brew services list
# Linux: systemctl status postgresql

# 检查连接字符串是否正确
# 格式：postgresql://user:password@host:port/database
```

### 3. 端口被占用

```bash
# 修改端口（在 .env.local 中）
PORT=3001

# 或查找占用端口的进程
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### 4. Redis 连接失败

```bash
# Redis 是可选的，没有 Redis 会使用数据库查询
# 如需使用 Redis：

# Mac
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# 下载：https://github.com/microsoftarchive/redis/releases
```

### 5. 构建失败

```bash
# 清理构建缓存
rm -rf .next

# 重新构建
npm run build
```

---

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 数据库操作
npx prisma studio          # 打开数据库管理界面
npx prisma migrate dev     # 开发环境迁移
npx prisma migrate deploy  # 生产环境迁移
npx prisma generate        # 生成 Prisma 客户端
```

---

## 📝 更新日志

### v1.1.0 (2026-03-09) - ⭐ 收藏功能
- ✨ 新增收藏功能核心
- ✨ 新增收藏夹页面
- ✨ 问卦/星座/饮食支持收藏
- 🐛 修复按钮表单提交问题
- ✅ 所有功能测试通过

### v1.0.0 (2026-03-08) - 首发版本
- ✨ 知识库管理
- ✨ 金融数据分析
- ✨ 易经问卦
- ✨ 星座运势
- ✨ 能量饮食

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📞 联系方式

- 📧 Email: 944183654@qq.com
- 🌐 GitHub: [@rebornlog](https://github.com/rebornlog)
- 💬 Issues: [GitHub Issues](https://github.com/rebornlog/starLog/issues)

---

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

---

**🎉 享受使用 starLog！**

如果这个项目对你有帮助，请给一个 ⭐ Star！
