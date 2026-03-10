# 📅 大事纪功能设计文档

**功能名称**: 项目大事纪（Timeline）  
**优先级**: P1  
**预计工时**: 4-6 小时  
**状态**: 🟡 设计中

---

## 🎯 功能目标

以**时间线图表**形式展示 starLog 项目的发展历程，包括：
- 项目启动时间
- 重要功能上线
- 版本发布记录
- 关键里程碑

---

## 📐 设计方案

### 1. 数据来源

#### 方案 A：Git 历史自动生成（推荐）⭐
**优点**:
- 自动同步，无需手动维护
- 数据准确可靠
- 实时反映项目进展

**实现方式**:
```typescript
// 后端 API：获取 Git 提交历史
GET /api/timeline

// 返回格式
{
  "events": [
    {
      "date": "2026-03-10",
      "title": "收藏夹批量操作功能",
      "description": "添加批量选择/删除功能",
      "type": "feature", // feature | fix | docs | refactor
      "commit": "7ac1678",
      "author": "老柱子"
    },
    // ...
  ]
}
```

**技术实现**:
- 使用 `simple-git` 库读取 Git 历史
- 后端 API 定时缓存（避免频繁读取）
- 前端展示时按日期分组

#### 方案 B：手动维护配置文件
**优点**:
- 可以添加更详细的描述
- 可以包含非代码相关的里程碑

**缺点**:
- 需要手动更新，容易遗漏

**建议**: 结合两种方案，Git 历史自动生成 + 手动补充重要事件

---

### 2. UI 设计

#### 页面布局
```
┌─────────────────────────────────────┐
│  📅 starLog 大事纪                  │
│  记录项目成长的每一步                │
├─────────────────────────────────────┤
│                                     │
│    ● 2026-03-10                    │
│    │  收藏夹批量操作功能            │
│    │  添加批量选择/删除...          │
│    │                                │
│    ● 2026-03-09                    │
│    │  收藏夹搜索功能                │
│    │  支持关键词搜索...             │
│    │                                │
│    ● 2026-03-08                    │
│    │  收藏功能上线                  │
│    │  支持易经/星座/饮食收藏...     │
│    │                                │
│    ● 2026-03-07                    │
│    │  项目初始化                    │
│    │  Next.js + PostgreSQL...       │
│    │                                │
└─────────────────────────────────────┘
```

#### 视觉风格
- **时间线**: 垂直线条，宫崎骏风格配色（绿色/棕色系）
- **节点**: 圆形图标，不同类型用不同 emoji
  - 🎉 版本发布
  - ✨ 新功能
  - 🐛 Bug 修复
  - 📝 文档更新
  - ♻️ 重构优化
- **卡片**: 圆角卡片，轻微阴影，hover 效果

#### 移动端适配
- 单列时间线
- 触摸友好的卡片大小
- 折叠/展开长描述

---

### 3. 技术实现

#### 文件结构
```
starLog/
├── app/
│   └── timeline/
│       └── page.tsx          # 大事纪页面
├── components/
│   └── Timeline/
│       ├── Timeline.tsx      # 时间线主组件
│       ├── TimelineEvent.tsx # 单个事件组件
│       └── TimelineFilter.tsx # 筛选器组件
├── lib/
│   └── timeline.ts           # 时间线数据处理
└── pages/
    └── api/
        └── timeline/
            └── route.ts      # API 端点
```

#### 核心代码示例

**API 端点** (`app/api/timeline/route.ts`):
```typescript
import { NextResponse } from 'next/server'
import { simpleGit } from 'simple-git'

export async function GET() {
  try {
    const git = simpleGit('/home/admin/.openclaw/workspace/starLog')
    const log = await git.log({ maxCount: 100 })
    
    // 解析 Git 历史为时间线事件
    const events = log.all.map(commit => ({
      date: new Date(commit.date).toISOString().split('T')[0],
      title: commit.message.split('\n')[0],
      description: commit.body || '',
      type: getCommitType(commit.message),
      commit: commit.hash.substring(0, 7),
      author: commit.author_name,
    }))
    
    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}

function getCommitType(message: string): string {
  if (message.startsWith('feat:')) return 'feature'
  if (message.startsWith('fix:')) return 'fix'
  if (message.startsWith('docs:')) return 'docs'
  if (message.startsWith('refactor:')) return 'refactor'
  return 'other'
}
```

**时间线组件** (`components/Timeline/Timeline.tsx`):
```typescript
'use client'

import { useState, useEffect } from 'react'
import TimelineEvent from './TimelineEvent'
import TimelineFilter from './TimelineFilter'

interface TimelineEvent {
  date: string
  title: string
  description: string
  type: string
  commit: string
  author: string
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events)
        setLoading(false)
      })
  }, [])

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.type === filter)

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          📅 starLog 大事纪
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          记录项目成长的每一步
        </p>

        <TimelineFilter filter={filter} setFilter={setFilter} />

        <div className="relative">
          {/* 时间线 */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-emerald-600" />
          
          {/* 事件列表 */}
          <div className="space-y-8">
            {filteredEvents.map((event, index) => (
              <TimelineEvent key={index} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

**事件组件** (`components/Timeline/TimelineEvent.tsx`):
```typescript
interface EventProps {
  event: {
    date: string
    title: string
    description: string
    type: string
    commit: string
    author: string
  }
}

export default function TimelineEvent({ event }: EventProps) {
  const typeConfig = {
    feature: { emoji: '✨', color: 'bg-purple-500' },
    fix: { emoji: '🐛', color: 'bg-red-500' },
    docs: { emoji: '📝', color: 'bg-blue-500' },
    refactor: { emoji: '♻️', color: 'bg-orange-500' },
    other: { emoji: '📌', color: 'bg-gray-500' },
  }

  const config = typeConfig[event.type as keyof typeof typeConfig] || typeConfig.other

  return (
    <div className="relative pl-20">
      {/* 时间点 */}
      <div className={`absolute left-6 w-5 h-5 ${config.color} rounded-full border-4 border-white dark:border-slate-800 shadow-lg`} />
      
      {/* 内容卡片 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{config.emoji}</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {event.date}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
            {event.commit}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {event.title}
        </h3>
        
        {event.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {event.description}
          </p>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          by {event.author}
        </div>
      </div>
    </div>
  )
}
```

---

### 4. 功能扩展

#### 筛选功能
- 按类型筛选（功能/修复/文档/重构）
- 按日期范围筛选
- 搜索关键词

#### 统计信息
- 总提交数
- 本月提交数
- 最活跃的开发日期

#### 导出功能
- 导出为 Markdown
- 导出为 PDF
- 生成项目报告

---

## 📋 开发任务清单

### 第一阶段：基础功能（2-3 小时）
- [ ] 创建 API 端点 `/api/timeline`
- [ ] 安装 `simple-git` 依赖
- [ ] 实现 Git 历史读取逻辑
- [ ] 创建基础时间线组件
- [ ] 实现事件卡片组件

### 第二阶段：UI 优化（1-2 小时）
- [ ] 设计宫崎骏风格配色
- [ ] 添加动画效果（时间线绘制动画）
- [ ] 移动端适配
- [ ] 暗黑模式支持

### 第三阶段：增强功能（1-2 小时）
- [ ] 类型筛选器
- [ ] 搜索功能
- [ ] 加载状态优化
- [ ] 错误处理

### 第四阶段：测试与部署（1 小时）
- [ ] 本地测试
- [ ] TypeScript 类型检查
- [ ] ESLint 检查
- [ ] 构建测试
- [ ] Git 提交 + 推送

---

## 🎨 设计参考

### 配色方案
```css
/* 宫崎骏风格配色 */
--timeline-line: linear-gradient(to bottom, #10b981, #059669)
--card-bg: #ffffff (light) / #1e293b (dark)
--accent-green: #10b981
--accent-purple: #8b5cf6
--accent-amber: #f59e0b
```

### 动画效果
- 时间线从上到下绘制动画
- 卡片淡入效果
- hover 时轻微放大

---

## ✅ 验收标准

1. **功能完整性**
   - [ ] 能正确显示 Git 历史
   - [ ] 时间线视觉清晰
   - [ ] 筛选功能正常

2. **UI/UX**
   - [ ] 符合宫崎骏风格
   - [ ] 移动端友好
   - [ ] 暗黑模式正常

3. **性能**
   - [ ] 首屏加载 < 2 秒
   - [ ] 时间线滚动流畅
   - [ ] 无内存泄漏

4. **代码质量**
   - [ ] TypeScript 类型完整
   - [ ] ESLint 无警告
   - [ ] 代码注释清晰

---

## 📝 备注

- 优先使用 Git 历史自动生成
- 保留手动添加特殊事件的能力
- 考虑添加"回到今天"按钮快速滚动到最新事件
- 可以集成到首页或作为独立页面

---

**下一步**: 开始实现第一阶段功能
