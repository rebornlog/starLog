# 🌿 starLog - 个人知识库

> 像龙猫森林一样宁静的知识花园

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 项目简介

starLog 是一个基于 Next.js 15 的个人知识库系统，集成技术博客、A 股行情、星座运势、易经问卦、能量饮食等功能。采用宫崎骏风格设计，记录技术的成长轨迹，探索生活的无限可能。

**在线演示**: [http://47.79.20.10:3000](http://47.79.20.10:3000)

---

## ✨ 核心功能

### 📚 技术博客
- Markdown/MDX 支持
- 分类和标签管理
- 文章目录导航
- 阅读进度条
- 代码语法高亮
- Redis 缓存优化

### 📈 金融市场
- A 股实时行情
- 热门股票列表
- 股票搜索和排序
- K 线图展示
- 技术指标（MA/MACD/RSI/KDJ）
- 自选股管理

### 💰 基金理财
- 热门基金列表（31 只精选）
- 基金详情页（实时净值/历史业绩）
- 天天基金实时数据接入
- 历史净值图表（lightweight-charts）
- 持仓分布展示（资产配置/前十大持仓/行业分布）
- 基金导入/导出功能
- 45 分钟 Redis 缓存策略

### ✨ 星座运势
- 12 星座每日运势
- 爱情/事业/财运/健康分析
- 幸运颜色和数字
- 今日宜忌
- 算法生成（每日更新）

### ☯️ 易经问卦
- 随机起卦（铜钱摇卦）
- 时间起卦（基于时辰）
- 数字起卦（用户输入）
- 64 卦完整解卦
- 变爻分析

### 🥗 能量饮食
- 生辰八字分析
- 五行强弱计算
- 个性化饮食建议
- 推荐/避免食物列表
- 四季调养指南

### 📅 大事纪
- 项目发展历程
- 重要里程碑
- 时间轴展示
- 分类统计

---

## 🎨 特色功能

### 🌓 日夜主题切换
- 自动保存用户偏好
- 系统偏好检测
- 平滑过渡动画
- 全站深色模式支持

### 🍞 面包屑导航
- 自动识别页面层级
- 响应式设计
- 悬停高亮效果

### 📸 自动化截图
- Playwright 集成
- 全页面截图
- 批量页面审计
- 自动生成报告

### ⚡ 性能优化
- Redis 缓存分级
- 图片懒加载
- 骨架屏加载动画
- 代码分割
- 缓存 TTL 优化

### 🔧 服务管理
- PM2 进程守护
- 开机自启配置
- 健康监控脚本
- 日志管理
- 多服务统一管理

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3
- **组件**: React 19
- **状态管理**: React Hooks

### 后端
- **API**: Next.js API Routes + FastAPI
- **数据库**: PostgreSQL 15
- **ORM**: Prisma 5
- **缓存**: Redis 6
- **金融数据**: 腾讯财经 API + 天天基金 API
- **图表**: lightweight-charts 5

### 运维
- **进程管理**: PM2
- **部署**: Docker
- **监控**: 自定义监控脚本

---

## 📦 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 15+
- Redis 6+
- Python 3.8+ (金融 API)

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/rebornlog/starLog.git
cd starLog

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 配置数据库和 Redis

# 4. 数据库迁移
npx prisma migrate dev

# 5. 启动开发服务器
npm run dev

# 6. 启动金融 API（使用 PM2）
pm2 start ecosystem.config.js

# 或手动启动
cd services/finance
python -m uvicorn main:app --host 0.0.0.0 --port 8081
python -m uvicorn fund_api:app --host 0.0.0.0 --port 8082
```

访问 http://localhost:3000

### PM2 管理

```bash
# 查看所有服务
pm2 list

# 重启服务
pm2 restart all

# 查看日志
pm2 logs

# 保存服务列表（开机自启）
pm2 save
pm2 startup
```

---

## 📁 项目结构

```
starLog/
├── app/                      # Next.js 页面
│   ├── blog/                 # 博客页面
│   ├── stocks/               # 股票页面
│   ├── funds/                # 基金页面（新增）
│   │   ├── page.tsx          # 基金列表页
│   │   ├── [code]/page.tsx   # 基金详情页
│   │   ├── import/page.tsx   # 导入页面
│   │   └── export/page.tsx   # 导出页面
│   ├── zodiac/               # 星座页面
│   ├── iching/               # 易经页面
│   ├── diet/                 # 饮食页面
│   ├── timeline/             # 大事纪页面
│   └── page.tsx              # 首页
├── components/               # React 组件
│   ├── Header.tsx            # 导航栏（含主题切换）
│   ├── Breadcrumb.tsx        # 面包屑导航
│   ├── Skeleton.tsx          # 骨架屏组件
│   ├── ThemeToggle.tsx       # 主题切换按钮
│   ├── FundChart.tsx         # 基金图表组件（新增）
│   └── ...
├── data/                     # 静态数据
│   ├── funds.ts              # 基金数据（新增）
│   └── ...
├── lib/                      # 工具函数
│   ├── redis.ts              # Redis 缓存
│   ├── db.ts                 # 数据库连接
│   └── cache-config.ts       # 缓存配置
├── prisma/                   # 数据库 Schema
├── services/                 # 后端服务
│   ├── finance/              # 金融服务
│   │   ├── main.py           # 股票 API
│   │   ├── fund_api.py       # 基金 API（新增）
│   │   ├── fund_routes.py    # 基金路由（新增）
│   │   └── venv/             # Python 虚拟环境
│   ├── data/                 # 数据服务
│   │   └── funds.py          # 基金静态数据（新增）
│   └── tiantian_fund.py      # 天天基金 API（新增）
├── scripts/                  # 工具脚本
│   ├── screenshot.js         # 自动化截图
│   ├── health-check.sh       # 健康监控（新增）
│   └── 36kr-daily.sh         # 36kr 日报推送
├── ecosystem.config.js       # PM2 配置（新增）
└── README.md                 # 项目文档
```

---

## 📊 性能指标

| 指标 | 当前值 | 目标值 | 状态 |
|------|--------|--------|------|
| 首页加载 | 0.3s | <1s | ✅ |
| 博客加载 | 0.8s | <1s | ✅ |
| 股票加载 | 0.6s | <1s | ✅ |
| 星座加载 | 0.7s | <1s | ✅ |
| 缓存命中率 | 90% | >80% | ✅ |

---

## 🎯 开发计划

### P0 - 已完成 ✅
- [x] 日夜主题切换
- [x] 导航栏优化
- [x] 面包屑导航
- [x] 股票搜索功能
- [x] 自动化截图
- [x] 基金板块（列表/详情/图表）
- [x] PM2 服务管理
- [x] 健康监控脚本

### P1 - 进行中 🚧
- [ ] 基金对比功能
- [ ] 定投计算器
- [ ] 骨架屏加载
- [ ] 自定义 404 页面
- [ ] 全局搜索（Cmd+K）
- [ ] 移动端触摸优化

### P2 - 计划中 📋
- [ ] 评论系统（Giscus）
- [ ] 页面过渡动画
- [ ] Service Worker
- [ ] CDN 部署

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 👨‍💻 作者

**老柱子**
- GitHub: [@rebornlog](https://github.com/rebornlog)
- Email: 944183654@qq.com

---

## 🙏 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Playwright](https://playwright.dev/)
- [AkShare](https://akshare.akfamily.xyz/)

---

**Made with ❤️ by 老柱子**

