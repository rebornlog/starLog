# 🧬 网站自我进化系统

**创建时间：** 2026-03-31 17:26  
**核心理念：** 通过测试发现问题，自动修复并优化，实现自我进化

---

## 🎯 进化流程

### 阶段 1/4: 检测问题 🔍

**自动检测：**
- ✅ 页面加载问题（HTTP 错误、加载缓慢）
- ✅ API 服务异常（无响应、错误）
- ✅ JavaScript 错误（Console 错误）
- ✅ SEO 问题（缺少 title、description）

**输出：** `detected-issues-*.json`

---

### 阶段 2/4: 自动修复 🔧

**修复策略：**
1. **服务问题** → 自动重启 PM2 服务
2. **Metadata 缺失** → 自动创建 metadata.ts
3. **性能问题** → 清理缓存、优化图片
4. **JS 错误** → 记录并尝试修复

**修复原则：**
- 只修复明确的问题
- 不破坏现有功能
- 修复后自动验证

---

### 阶段 3/4: 验证修复 ✅

**验证项目：**
- ✅ 前端服务响应
- ✅ API 服务健康
- ✅ 关键页面可访问
- ✅ 浏览器渲染正常
- ✅ 无 JavaScript 错误

**验证失败 → 自动回滚**

---

### 阶段 4/4: 提交进化成果 📤

**提交内容：**
- 修复的代码
- 新增的 metadata
- 性能优化
- 进化报告

**Commit 格式：**
```
🧬 Evolution: 自动检测修复 X 个问题，优化 Y 项 (时间戳)
```

---

## 📊 进化统计

**每次执行：**
- 检测问题：0-10 个
- 自动修复：发现即修复
- 性能优化：持续进行
- 提交频率：每 25 分钟（如有优化）

---

## 🔧 技术实现

### 检测引擎

**页面检测：**
```bash
curl -s -o /dev/null -w "%{http_code}" URL
curl -s -o /dev/null -w "%{time_total}" URL
```

**API 检测：**
```bash
curl -s http://localhost:8081/health
```

**JS 错误检测：**
```javascript
// Playwright 监听 pageerror 事件
page.on('pageerror', error => {
    errors.push(error.message);
});
```

### 修复引擎

**Metadata 自动添加：**
```typescript
// 自动创建 app/{page}/metadata.ts
export const metadata: Metadata = {
  title: '页面标题 | starLog',
  description: '页面描述',
}
```

**服务自动重启：**
```bash
pm2 restart starlog-frontend finance-api fund-api
```

### 验证引擎

**Playwright 浏览器测试：**
```javascript
await page.goto('http://localhost:3000');
const hasContent = await page.$('main');
const hasError = await page.$('.error');
```

---

## 📈 进化案例

### 案例 1: Metadata 缺失

**检测：**
```
⚠️  /funds - 缺少 title 标签
⚠️  /funds - 缺少 meta description
```

**修复：**
```bash
✅ 已添加 metadata: funds
   创建 app/funds/metadata.ts
```

**提交：**
```
🧬 Evolution: 自动检测修复 2 个问题，优化 1 项
```

---

### 案例 2: 服务宕机

**检测：**
```
❌ / - HTTP 000
❌ API /health - 无响应
```

**修复：**
```bash
✅ 服务已重启
   pm2 restart starlog-frontend finance-api
```

**验证：**
```
✅ 前端服务正常
✅ API 服务正常
✅ 页面可访问
```

---

### 案例 3: 性能优化

**检测：**
```
⚠️  /blog - 加载缓慢 (4.2s)
```

**修复：**
```bash
✅ 已清理构建缓存
   rm -rf .next/cache
✅ 建议图片转换为 WebP
```

---

## 🎯 进化目标

### 短期目标（本周）
- [x] 自动检测页面问题
- [x] 自动修复服务异常
- [x] 自动添加 metadata
- [ ] 自动优化图片
- [ ] 自动修复 JS 错误

### 中期目标（本月）
- [ ] 性能自动优化
- [ ] SEO 自动优化
- [ ] 可访问性自动优化
- [ ] 自动 A/B 测试

### 长期目标
- [ ] AI 驱动的问题预测
- [ ] 自动代码重构
- [ ] 自动功能增强
- [ ] 用户行为分析与优化

---

## 📁 相关文件

**核心脚本：**
- `scripts/auto-evolve.sh` - 自我进化主脚本
- `scripts/auto-test-e2e.sh` - E2E 测试集成
- `scripts/lighthouse-test.sh` - 性能测试

**报告位置：**
- `test-reports/evolution-*.md` - 进化报告
- `test-reports/detected-issues-*.json` - 问题清单
- `/tmp/auto-evolve.log` - 执行日志

---

## 🚀 执行频率

**定时任务：** 每 25 分钟自动执行

**Cron 配置：**
```bash
*/25 * * * * ./scripts/auto-test-e2e.sh --full
```

**执行流程：**
```
E2E 测试 → 性能检测 → 自动修复 → 自我进化 → Lighthouse 测试
```

---

## 💡 进化哲学

> **网站如有生命，应能自我进化**

1. **自我检测** - 主动发现问题
2. **自我修复** - 自动解决问题
3. **自我优化** - 持续改进性能
4. **自我完善** - 不断提升体验

**最终目标：** 让网站在运行中不断进化，越来越完善！

---

**最后更新：** 2026-03-31 17:26  
**维护者：** 自我进化系统  
**状态：** ✅ 运行中
