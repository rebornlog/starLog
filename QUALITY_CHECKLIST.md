# 📋 starLog 前端质量检查清单

> 基于专业前端工程标准制定

---

## 🎯 质量维度与指标

### 1️⃣ 功能正确性

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| 核心路径 E2E 覆盖率 | ≥95% | 待测 | ⏳ |
| 组件单元测试覆盖率 | ≥80% | 待测 | ⏳ |

**检查项：**
- [ ] 主题切换功能 E2E 测试
- [ ] 页面导航 E2E 测试
- [ ] 搜索功能 E2E 测试
- [ ] ThemeProvider 单元测试
- [ ] ThemeSwitcher 单元测试

**工具：** Cypress, Playwright, Jest, Vitest

---

### 2️⃣ 性能表现

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| LCP (最大内容绘制) | ≤2.5s | 待测 | ⏳ |
| FID (首次输入延迟) | ≤100ms | 待测 | ⏳ |
| CLS (累计布局偏移) | ≤0.1 | 待测 | ⏳ |
| 首屏资源压缩率 | ≥70% | 待测 | ⏳ |

**检查项：**
- [ ] LCP ≤2.5s
- [ ] FID ≤100ms
- [ ] CLS ≤0.1
- [ ] 图片使用 WebP/AVIF
- [ ] 关键资源预加载
- [ ] 避免阻塞渲染的 JS/CSS
- [ ] 字体使用 `font-display: swap`

**工具：** Web Vitals, Lighthouse, Chrome DevTools

---

### 3️⃣ 代码质量

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| TypeScript 类型覆盖率 | 100% | 待测 | ⏳ |
| ESLint 错误数 | 0 | 待测 | ⏳ |
| 代码重复率 | ≤5% | 待测 | ⏳ |

**检查项：**
- [ ] 无 TypeScript 类型错误
- [ ] 无 ESLint 错误
- [ ] 无 console.log 生产代码
- [ ] 组件有 PropTypes/TypeScript 类型定义
- [ ] 函数有 JSDoc 注释

**工具：** ESLint, TypeScript, SonarQube

---

### 4️⃣ 可访问性 (A11y)

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| WCAG 2.1 AA 合规 | 100% | 待测 | ⏳ |
| 键盘导航 | 100% | 待测 | ⏳ |
| 屏幕阅读器支持 | 100% | 待测 | ⏳ |

**检查项：**
- [ ] 所有按钮有 `aria-label`
- [ ] 所有图片有 `alt` 文本
- [ ] 颜色对比度 ≥4.5:1
- [ ] 键盘可导航所有交互元素
- [ ] 焦点状态可见
- [ ] 表单有 `label` 关联

**工具：** axe-core, Lighthouse Accessibility

---

### 5️⃣ 浏览器兼容性

| 浏览器 | 最低版本 | 状态 |
|--------|---------|------|
| Chrome | 90+ | ⏳ 待测 |
| Firefox | 88+ | ⏳ 待测 |
| Safari | 14+ | ⏳ 待测 |
| Edge | 90+ | ⏳ 待测 |
| 移动端 Safari | 14+ | ⏳ 待测 |
| 移动端 Chrome | 90+ | ⏳ 待测 |

---

## 🛠️ 检查工具配置

### Lighthouse CI 配置

```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      url: [
        'http://localhost/ index.html',
        'http://localhost/blog/index.html',
        'http://localhost/about/index.html'
      ]
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    }
  }
}
```

### Jest 配置

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

---

## 📊 当前项目状态

### 主题切换功能检查

| 检查项 | 状态 | 备注 |
|--------|------|------|
| 按钮渲染 | ✅ | 右下角浮动按钮 |
| 点击响应 | ⏳ | 待用户验证 |
| 主题切换 | ⏳ | 待用户验证 |
| localStorage 持久化 | ⏳ | 待验证 |
| 暗色模式切换 | ⏳ | 待验证 |

### 性能检查（待执行）

```bash
# 使用 Lighthouse 检查
npx lighthouse http://47.79.20.10:3000/ --output=html --output-path=./lighthouse-report.html

# 使用 Web Vitals Chrome 扩展
# 手动访问页面查看 Real User Metrics
```

---

## 🔄 持续集成流程

### CI/CD 检查清单

```yaml
# .github/workflows/quality-check.yml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
      
      - name: Lighthouse
        run: npm run lighthouse:ci
```

---

## 📝 检查记录模板

### 每次发布前检查

```markdown
## 发布检查 - YYYY-MM-DD

### 功能正确性
- [ ] E2E 测试通过
- [ ] 单元测试通过
- [ ] 手动测试核心流程

### 性能
- [ ] LCP: ___ ms (目标：≤2500ms)
- [ ] FID: ___ ms (目标：≤100ms)
- [ ] CLS: ___ (目标：≤0.1)

### 代码质量
- [ ] ESLint: 0 错误
- [ ] TypeScript: 0 错误
- [ ] 测试覆盖率：___%

### 可访问性
- [ ] Lighthouse Accessibility: ___/100
- [ ] 键盘导航测试通过
- [ ] 屏幕阅读器测试通过

### 浏览器兼容性
- [ ] Chrome 测试通过
- [ ] Firefox 测试通过
- [ ] Safari 测试通过
- [ ] 移动端测试通过

### 签署人
- 开发：__________
- 测试：__________
- 产品：__________
```

---

## 🎯 改进计划

### 短期（1 周内）
- [ ] 添加 Lighthouse CI
- [ ] 添加 Jest 单元测试
- [ ] 添加 Cypress E2E 测试
- [ ] 性能基线测量

### 中期（1 个月内）
- [ ] 核心功能测试覆盖率 ≥80%
- [ ] Lighthouse 性能评分 ≥90
- [ ] 建立性能监控 dashboard
- [ ] 自动化回归测试

### 长期（3 个月内）
- [ ] E2E 覆盖率 ≥95%
- [ ] 建立性能预算
- [ ] 自动化性能回归检测
- [ ] 完整的 A11y 合规

---

**创建时间：** 2026-03-05  
**版本：** 1.0  
**维护者：** starLog 团队  
**更新频率：** 每次发布前

---

> "质量不是检查出来的，是构建出来的。但检查确保我们构建了质量。"
