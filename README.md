# 🌟 starLog - 个人知识库与金融分析平台

> 📝 基于 Next.js 的全栈知识库系统 | 📈 集成 A 股实时行情 | 🎨 宫崎骏风格设计

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.6+-blue?logo=python)](https://python.org/)
[![Stars](https://img.shields.io/github/stars/rebornlog/starLog?style=social)](https://github.com/rebornlog/starLog)

---

## 📖 目录

- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [API 文档](#-api-文档)
- [部署指南](#-部署指南)
- [开发计划](#-开发计划)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## 🎯 项目简介

**starLog** 是一个现代化的个人知识库系统，集成了博客、文档管理和金融数据分析功能。

### 核心亮点

| 特性 | 说明 |
|------|------|
| 📝 **知识库管理** | 支持 Markdown 文章、文件上传下载、PDF 导出 |
| 📈 **金融数据** | A 股实时行情、市场概览、股票搜索（腾讯财经数据源） |
| 🎨 **精美 UI** | 宫崎骏风格设计、中英文切换、暗色模式 |
| 🔍 **全文检索** | 基于 PostgreSQL 的高效搜索 |
| 📦 **容器化** | Docker 一键部署 |

### 在线演示

- 🌐 主站：http://47.79.20.10:3000
- 📊 金融 API：http://47.79.20.10:8081
- 📚 API 文档：http://47.79.20.10:8081/docs

---

## ✨ 功能特性

### 📝 博客与知识库

- ✅ Markdown/MDX 支持
- ✅ 语法高亮
- ✅ 目录导航
- ✅ 标签分类
- ✅ 文件上传/下载
- ✅ PDF 导出（开发中）

### 📈 金融分析

- ✅ A 股实时行情
- ✅ 市场概览（四大指数）
- ✅ 热门股票列表
- ✅ 股票搜索
- 🔄 K 线图表（开发中）
- 🔄 技术指标（开发中）

### 🔧 系统功能

- ✅ 全文检索
- ✅ 用户认证（开发中）
- ✅ 评论系统（开发中）
- ✅ RSS 订阅
- ✅ SEO 优化
- ✅ 响应式设计

---

## 🛠️ 技术栈

### 前端

```
Next.js 15          # React 框架
TypeScript          # 类型安全
Tailwind CSS        # 样式框架
Contentlayer        # MDX 内容管理
```

### 后端

```
Next.js API Routes  # 主后端
FastAPI (Python)    # 金融服务
PostgreSQL          # 主数据库
Prisma              # ORM
```

### 部署

```
Docker              # 容器化
Docker Compose      # 编排
Nginx               # 反向代理（可选）
```

---

## 🚀 快速开始

### 环境要求

- Node.js 20+
- Python 3.6+
- PostgreSQL 14+（可选）

### 1. 克隆项目

```bash
git clone https://github.com/rebornlog/starLog.git
cd starLog
```

### 2. 安装依赖

```bash
# 前端依赖
npm install

# Python 金融服务
cd services/finance
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑配置
# DATABASE_URL="postgresql://user:pass@localhost:5432/starlog"
# FINANCE_SERVICE_URL="http://localhost:8081"
```

### 4. 启动服务

```bash
# 终端 1: 启动金融服务 (端口 8081)
cd services/finance
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8081

# 终端 2: 启动前端 (端口 3000)
npm run dev
```

### 5. 访问应用

- 🌐 前端：http://localhost:3000
- 📊 金融 API：http://localhost:8081
- 📚 API 文档：http://localhost:8081/docs

---

## 📁 项目结构

```
starLog/
├── app/                        # Next.js 应用目录
│   ├── api/                    # API 路由
│   │   ├── documents/          # 文档管理
│   │   ├── upload/             # 文件上传
│   │   └── finance/            # 金融数据代理
│   ├── blog/                   # 博客页面
│   ├── library/                # 知识库页面
│   ├── finance/                # 金融页面
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页
├── components/                 # React 组件
│   ├── ui/                     # 基础组件
│   ├── finance/                # 金融组件
│   └── layout/                 # 布局组件
├── services/finance/           # Python 金融服务
│   ├── main.py                 # FastAPI 应用
│   ├── requirements.txt        # Python 依赖
│   └── README.md               # 服务文档
├── prisma/                     # 数据库配置
│   └── schema.prisma           # Prisma Schema
├── lib/                        # 工具库
│   ├── db.ts                   # 数据库客户端
│   └── utils.ts                # 通用工具
├── public/                     # 静态资源
├── docker-compose.yml          # Docker 编排
├── Dockerfile                  # 前端镜像
└── README.md                   # 项目文档
```

---

## 📡 API 文档

### 金融服务 API

| 接口 | 方法 | 说明 | 示例 |
|------|------|------|------|
| `/health` | GET | 健康检查 | `curl http://localhost:8081/health` |
| `/stock/{symbol}` | GET | 股票行情 | `curl http://localhost:8081/stock/600519` |
| `/stock/{symbol}/detail` | GET | 股票详情 | `curl http://localhost:8081/stock/000001/detail` |
| `/market/overview` | GET | 市场概览 | `curl http://localhost:8081/market/overview` |
| `/stock/search` | GET | 股票搜索 | `curl "http://localhost:8081/stock/search?keyword=茅台"` |
| `/stocks/popular` | GET | 热门股票 | `curl http://localhost:8081/stocks/popular` |

### 响应示例

**股票行情:**
```json
{
  "symbol": "600519",
  "name": "贵州茅台",
  "price": 1401.18,
  "open": 1426.19,
  "high": 1426.19,
  "low": 1392.09,
  "previousClose": 1426.19,
  "change": -25.01,
  "changePercent": -1.75,
  "timestamp": "2026-03-04 20:00:00"
}
```

**市场概览:**
```json
{
  "上证指数": { "price": 4082.47, "change": -40.21, "changePercent": -0.98 },
  "深证成指": { "price": 13917.75, "change": -104.64, "changePercent": -0.75 },
  "创业板指": { "price": 3164.37, "change": -45.11, "changePercent": -1.41 },
  "沪深 300": { "price": 4602.62, "change": -53.28, "changePercent": -1.14 }
}
```

---

## 📦 部署指南

### Docker 部署（推荐）

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动部署

**1. 部署前端**

```bash
# 构建
npm run build

# 启动生产服务
npm run start
```

**2. 部署金融服务**

```bash
cd services/finance
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8081 &
```

**3. 配置 Nginx（可选）**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/finance {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
    }
}
```

---

## 📋 开发计划

### Phase 1 - 基础功能 ✅

- [x] 项目初始化
- [x] 博客系统
- [x] 金融服务 API
- [x] Docker 配置

### Phase 2 - 核心功能 🔄

- [ ] 宫崎骏风格 UI
- [ ] 文档管理
- [ ] 文件上传/下载
- [ ] PDF 导出

### Phase 3 - 高级功能 📅

- [ ] K 线图表
- [ ] 技术指标分析
- [ ] 用户认证
- [ ] 评论系统

### Phase 4 - 优化扩展 🔮

- [ ] Elasticsearch 检索
- [ ] Redis 缓存
- [ ] 量化策略回测
- [ ] 移动端适配

---

## ❓ 常见问题

### Q: 金融数据为什么有时加载失败？

A: 数据源来自腾讯财经，可能存在网络波动。建议：
- 检查服务器网络连接
- 增加重试机制
- 使用缓存减少请求

### Q: 如何修改主题风格？

A: 编辑 `css/tailwind.css` 和 `components/ThemeSwitch.tsx`

### Q: 数据库必须配置吗？

A: 基础博客功能不需要数据库。文档管理和用户功能需要 PostgreSQL。

### Q: 如何添加新的金融数据源？

A: 在 `services/finance/main.py` 中添加新的数据获取函数，参考现有的腾讯财经实现。

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📬 联系方式

- 📧 Email: 944183654@qq.com
- 🌐 GitHub: [@rebornlog](https://github.com/rebornlog)
- 📝 CSDN: 待更新

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star！**

Made with ❤️ by musk

</div>
