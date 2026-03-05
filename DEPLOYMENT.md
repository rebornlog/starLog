# starLog 部署与开发指南

> 个人知识库系统 - 多主题支持 · 技术文档 · 金融分析 · 项目管理

---

## 📋 目录

- [快速开始](#快速开始)
- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [生产部署](#生产部署)
- [主题系统](#主题系统)
- [常见问题](#常见问题)
- [更新日志](#更新日志)

---

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/rebornlog/starLog.git
cd starLog

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 💻 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥18.17 | 推荐使用 20.x LTS |
| npm | ≥9.x | 或 yarn/pnpm |
| Git | ≥2.x | 版本控制 |

---

## 🛠 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 外网访问开发服务器

如需通过外网 IP 访问开发服务器（如 `http://47.79.20.10:3000`），`next.config.js` 已配置：

```js
allowedDevOrigins: ['47.79.20.10:3000', '172.17.13.144:3000', 'localhost:3000']
```

**注意：** 生产环境请使用 `npm run build && npm run start`。

### 构建生产版本

```bash
npm run build
npm run start
```

### 静态导出

```bash
npm run export
# 输出到 out/ 目录
```

---

## 🌐 生产部署

### Vercel 部署（推荐）

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 部署：
   ```bash
   vercel
   ```

3. 生产发布：
   ```bash
   vercel --prod
   ```

### Docker 部署

```bash
# 构建镜像
docker build -t starlog .

# 运行容器
docker run -p 3000:3000 starlog
```

### 传统服务器部署

```bash
# 1. 克隆项目
git clone https://github.com/rebornlog/starLog.git
cd starLog

# 2. 安装依赖
npm install --production

# 3. 构建
npm run build

# 4. 使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "starlog" -- start
pm2 save
pm2 startup
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 🎨 主题系统

### 可用主题

| 主题 ID | 名称 | 图标 | 描述 |
|--------|------|------|------|
| `totoro` | 龙猫森林 | 🌿 | 清新自然的森林色调 |
| `midnight` | 午夜蓝调 | 🌙 | 深邃优雅的蓝黑色调 |
| `sunset` | 落日余晖 | 🌅 | 温暖浪漫的橙红色调 |
| `arctic` | 极地冰川 | ❄️ | 清冷纯净的蓝白色调 |
| `sakura` | 樱花飞舞 | 🌸 | 温柔浪漫的粉色调 |
| `emerald` | 翡翠绿洲 | 💎 | 高贵典雅的绿色调 |
| `monochrome` | 极简黑白 | ⚫ | 经典永恒的黑白色调 |
| `ocean` | 深海秘境 | 🌊 | 神秘深邃的蓝色调 |
| `amber` | 琥珀流光 | 🍯 | 温暖华丽的金棕色调 |
| `cyberpunk` | 赛博朋克 | 🤖 | 未来科技感的霓虹色调 |

### 切换主题

1. 点击右上角主题切换按钮
2. 选择喜欢的主题
3. 主题会自动保存到 localStorage

### 自定义主题

编辑 `lib/themes/themes.ts` 添加新主题：

```typescript
{
  id: 'custom',
  name: '自定义主题',
  nameEn: 'Custom Theme',
  description: '描述',
  icon: '🎨',
  colors: {
    primary: '#FF0000',
    // ... 其他颜色
  },
  gradient: 'linear-gradient(135deg, #FF0000 0%, #00FF00 100%)',
  fontFamily: 'Inter, system-ui',
  borderRadius: '12px',
  shadow: 'soft',
}
```

---

## ⚠️ 常见问题

### 1. Tailwind CSS 4.x 配置

本项目使用 **Tailwind CSS 4.x**，配置方式与 3.x 不同：

**旧方式 (3.x) - 不再支持：**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { totoro: {...} }
    }
  }
}
```

**新方式 (4.x) - 当前使用：**
```css
/* css/tailwind.css */
@import "tailwindcss";

@theme {
  --color-totoro-500: #4F836B;
  --color-totoro-600: #3D6B55;
}
```

### 2. 开发服务器跨域访问

如果遇到跨域错误，在 `next.config.js` 添加：

```js
module.exports = {
  allowedDevOrigins: ['your-ip:3000', 'localhost:3000']
}
```

### 3. 路径别名配置

确保 `tsconfig.json` 包含：

```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/data/*": ["data/*"]
    }
  }
}
```

### 4. 构建失败

清理缓存后重试：

```bash
rm -rf .next node_modules/.cache
npm run dev
```

### 5. 端口被占用

修改端口：

```bash
PORT=3001 npm run dev
```

---

## 📦 项目结构

```
starLog/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── blog/              # 博客文章
│   ├── projects/          # 项目展示
│   └── about/             # 关于页面
├── components/            # React 组件
│   ├── theme/            # 主题切换组件
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/                   # 工具库
│   └── themes/           # 主题系统
│       ├── ThemeProvider.tsx
│       ├── themes.ts
│       └── ThemeSwitcher.tsx
├── css/                   # 样式文件
│   └── tailwind.css      # Tailwind 配置
├── content/              # Markdown 内容
├── public/               # 静态资源
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind 配置 (兼容模式)
└── tsconfig.json         # TypeScript 配置
```

---

## 🔄 更新日志

### v2.4.0 (2026-03-05)

**新增功能**
- ✨ 10 套高级感主题系统
- 🎨 主题切换 UI 组件
- 💾 localStorage 主题持久化
- 🌐 外网 IP 开发服务器支持

**技术升级**
- ⬆️ Tailwind CSS 4.1.18
- ⬆️ Next.js 15.5.12
- 🔧 @theme CSS 指令替代配置文件

**修复问题**
- 🐛 Tailwind CSS 4.x 兼容性
- 🐛 tsconfig.json 路径映射
- 🐛 跨域访问限制

### v2.3.0 (之前版本)

- 基础博客功能
- 内容集成 (Contentlayer)
- SEO 优化
- 响应式设计

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 👥 联系方式

- **GitHub**: https://github.com/rebornlog/starLog
- **Email**: 944183654@qq.com
- **Demo**: https://starlog.dev/

---

## 🙏 致谢

本项目基于 [tailwind-nextjs-starter-blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) 构建。

感谢所有贡献者和使用者！
