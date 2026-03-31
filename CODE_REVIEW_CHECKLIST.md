# 📋 starLog 代码审查清单

**版本：** 1.0
**创建时间：** 2026-03-26
**目标：** 减少调试修复占比（当前 40% → 目标 20%）

---

## 🎯 审查原则

1. **预防优于修复** - 在代码合并前发现问题
2. **自动化优先** - 能自动检查的不靠人工
3. **聚焦高风险** - 重点关注易错区域
4. **持续改进** - 根据问题更新清单

---

## ✅ 审查清单

### 一、API 路径配置（P0 - 必查）

**背景：** 2026-03-21 因 localhost 硬编码导致生产环境故障

**检查项：**
- [ ] 无 `localhost` 硬编码
- [ ] API 地址使用环境变量或相对路径
- [ ] 生产环境使用 `/api` 代理路径

**检查命令：**
```bash
# 检查 localhost 硬编码
grep -r "localhost:8081" app/ services/

# 检查 API_BASE 配置
grep -r "API_BASE\|API_URL" app/
```

**正确示例：**
```typescript
// ✅ 使用环境变量
const FINANCE_API_URL = process.env.FINANCE_API_URL || 'http://localhost:8081'

// ✅ 使用相对路径（Next.js 代理）
const API_BASE = ''
fetch(`${API_BASE}/api/funds/list`)
```

**错误示例：**
```typescript
// ❌ 硬编码 localhost
const API_BASE = 'http://localhost:8081'

// ❌ 双重 /api 前缀
const API_BASE = '/api'
fetch(`${API_BASE}/api/funds/list`)  // 结果：/api/api/funds/list
```

---

### 二、React 组件优化（P1 - 重要）

**背景：** 2026-03-21 K 线图组件重复初始化导致页面崩溃

**检查项：**
- [ ] useEffect 依赖项完整
- [ ] 图表/定时器正确清理
- [ ] 避免不必要的重渲染

**检查命令：**
```bash
# 查找 useEffect 使用情况
grep -r "useEffect" app/ components/ | grep -v node_modules
```

**正确示例：**
```typescript
// ✅ 图表初始化（只执行一次）
useEffect(() => {
  if (data.length > 0 && !chartRef.current) {
    initChart()  // 只在未初始化时创建
  } else if (chartRef.current && data.length > 0) {
    candleSeriesRef.current.setData(data)  // 已存在则只更新数据
  }
}, [data])

// ✅ 清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    fetchData()
  }, 5000)
  
  return () => clearInterval(timer)  // 组件卸载时清理
}, [])
```

**错误示例：**
```typescript
// ❌ 每次都创建新图表
useEffect(() => {
  if (data.length > 0) {
    initChart()  // 每次都创建，导致内存泄漏
  }
}, [data])

// ❌ 没有清理定时器
useEffect(() => {
  setInterval(() => {
    fetchData()
  }, 5000)
}, [])
```

---

### 三、数据库查询优化（P1 - 重要）

**背景：** 避免 N+1 查询和慢查询

**检查项：**
- [ ] 使用 include 预加载关联数据
- [ ] 添加必要的索引
- [ ] 限制返回数据量
- [ ] 使用缓存（Redis）

**检查命令：**
```bash
# 查找 Prisma 查询
grep -r "prisma\." app/ services/ | grep -v node_modules

# 查找 Redis 缓存使用
grep -r "redis\|cache" app/ services/
```

**正确示例：**
```typescript
// ✅ 预加载关联数据
const posts = await prisma.post.findMany({
  include: {
    author: true,
    tags: true,
  },
  take: 10,  // 限制数量
  orderBy: { createdAt: 'desc' },
})

// ✅ 使用缓存
const cached = await redis.get('popular_posts')
if (cached) {
  return JSON.parse(cached)
}

const posts = await prisma.post.findMany({...})
await redis.setex('popular_posts', 3600, JSON.stringify(posts))
```

**错误示例：**
```typescript
// ❌ N+1 查询
const posts = await prisma.post.findMany()
for (const post of posts) {
  post.author = await prisma.user.findUnique({...})  // 每次循环都查询
}

// ❌ 无限制查询
const posts = await prisma.post.findMany()  // 可能返回大量数据
```

---

### 四、错误处理（P1 - 重要）

**背景：** 未处理的错误导致页面崩溃

**检查项：**
- [ ] async/await 使用 try-catch
- [ ] fetch 请求检查响应状态
- [ ] 用户友好的错误提示

**检查命令：**
```bash
# 查找未处理的 fetch
grep -r "fetch(" app/ components/ | grep -v "await" | grep -v "then"
```

**正确示例：**
```typescript
// ✅ 完整的错误处理
try {
  const res = await fetch('/api/data')
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  const data = await res.json()
  return data
} catch (error) {
  console.error('Fetch error:', error)
  // 用户友好的错误提示
  setError('数据加载失败，请稍后重试')
  return null
}
```

**错误示例：**
```typescript
// ❌ 没有错误处理
const res = await fetch('/api/data')
const data = await res.json()  // 如果失败会崩溃

// ❌ 忽略错误状态
const res = await fetch('/api/data')
const data = await res.json()  // 404 也会尝试解析 JSON
```

---

### 五、安全性检查（P0 - 必查）

**背景：** 安全漏洞可能导致数据泄露

**检查项：**
- [ ] 用户输入验证和转义
- [ ] SQL 注入防护（使用 ORM）
- [ ] XSS 防护（使用 dangerouslySetInnerHTML 时）
- [ ] 敏感信息不提交到 Git

**检查命令：**
```bash
# 查找 dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" app/ components/

# 查找硬编码的密钥
grep -r "secret\|password\|key\|token" app/ services/ | grep -v ".env" | grep -v node_modules
```

**正确示例：**
```typescript
// ✅ 用户输入转义
import DOMPurify from 'dompurify'
const sanitized = DOMPurify.sanitize(userInput)

// ✅ 使用 ORM 防 SQL 注入
const user = await prisma.user.findUnique({
  where: { email: userInput }  // Prisma 自动参数化
})
```

**错误示例：**
```typescript
// ❌ 直接使用用户输入
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ 拼接 SQL（如果使用原生 SQL）
const query = `SELECT * FROM users WHERE email = '${userInput}'`
```

---

### 六、性能优化（P2 - 推荐）

**背景：** 性能问题影响用户体验

**检查项：**
- [ ] 图片使用懒加载
- [ ] 大数据列表使用虚拟滚动
- [ ] 避免在 render 中创建对象
- [ ] 使用 React.memo 优化重渲染

**检查命令：**
```bash
# 查找图片标签
grep -r "<img" app/ components/ | grep -v "loading="

# 查找大型数组 map
grep -r "\.map(" app/ components/ | head -10
```

**正确示例：**
```typescript
// ✅ 图片懒加载
<img src={image} alt={title} loading="lazy" />

// ✅ 使用 useMemo 避免重复计算
const filteredData = useMemo(() => {
  return data.filter(item => item.active)
}, [data])

// ✅ React.memo 避免不必要的重渲染
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.map(...)}</div>
})
```

---

### 七、代码规范（P2 - 推荐）

**背景：** 一致的代码风格提高可维护性

**检查项：**
- [ ] 遵循 TypeScript 类型定义
- [ ] 函数不超过 50 行
- [ ] 组件不超过 300 行
- [ ] 有意义的变量名

**检查命令：**
```bash
# 运行 lint
npm run lint

# 运行 type check
npx tsc --noEmit
```

---

## 🔧 自动化检查脚本

### 提交前检查（pre-commit）

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "📋 运行代码审查检查..."

# 1. 检查 localhost 硬编码
if grep -r "localhost:8081" app/ --include="*.ts" --include="*.tsx" 2>/dev/null; then
    echo "❌ 发现 localhost 硬编码"
    exit 1
fi

# 2. 运行 lint
npm run lint -- --max-warnings=0
if [ $? -ne 0 ]; then
    echo "❌ Lint 检查失败"
    exit 1
fi

# 3. 类型检查
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ 类型检查失败"
    exit 1
fi

echo "✅ 代码审查通过"
```

### 部署前检查

```bash
#!/bin/bash
# deploy-check.sh 已包含完整检查

./deploy-check.sh
```

---

## 📊 审查流程

### 小型修改（< 50 行）

1. 自查清单相关项
2. 运行自动化检查
3. 直接提交

### 中型修改（50-200 行）

1. 自查清单相关项
2. 运行自动化检查
3. 同事交叉审查
4. 提交

### 大型修改（> 200 行）

1. 自查清单相关项
2. 运行自动化检查
3. 团队审查会议
4. 测试环境验证
5. 提交

---

## 📈 持续改进

### 每周回顾

每周五运行技能统计，分析调试修复占比：

```bash
./scripts/skill-stats.sh weekly
```

**目标：**
- 调试修复占比：40% → 20%
- 成功率：93% → 98%

### 更新清单

每次生产故障后：
1. 分析根本原因
2. 添加到审查清单
3. 更新自动化检查

---

## 🎓 培训材料

### 新人入职

1. 阅读本清单
2. 学习历史教训（MEMORY.md）
3. 实践代码审查
4. 通过审查考核

### 常见错误案例

见 `MEMORY.md` 中的"血泪教训"章节：
- API 路径硬编码
- K 线图重复初始化
- 开发模式部署

---

## 📞 参考资源

- [MEMORY.md](../MEMORY.md) - 历史教训总结
- [SKILL_AUTOMATION_GUIDE.md](./SKILL_AUTOMATION_GUIDE.md) - 技能自动化指南
- [deploy-check.sh](../starLog/deploy-check.sh) - 部署检查脚本

---

**审查清单版本：** 1.0
**最后更新：** 2026-03-26
**维护者：** 马斯克 🚀
