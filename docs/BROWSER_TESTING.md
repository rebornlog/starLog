# 浏览器自动化测试指南

**更新时间：** 2026-03-28

---

## 环境配置

### 已安装
- ✅ Playwright: 已安装
- ✅ Chromium 浏览器：已安装
- ✅ 测试配置：已配置

### 测试目录
- **测试脚本：** `tests/`
- **测试结果：** `test-results/`
- **配置文件：** `playwright.config.ts`

---

## 运行测试

### 运行所有测试
```bash
npm run test:e2e
```

### UI 模式（推荐调试用）
```bash
npm run test:e2e:ui
```

### 有头模式（可以看到浏览器）
```bash
npm run test:e2e:headed
```

### 运行特定测试
```bash
npx playwright test tests/test-fund-page.spec.ts
```

---

## 测试报告

测试完成后，查看：
- **HTML 报告：** `npx playwright show-report`
- **截图：** `test-results/` 目录
- **测试日志：** Console 输出

---

## 当前测试用例

### 基金详情页历史业绩按钮测试
- **文件：** `tests/test-fund-page.spec.ts`
- **状态：** ✅ 通过
- **功能：**
  - 访问基金详情页
  - 点击"历史业绩"按钮
  - 检查 Console 错误
  - 验证表格显示
  - 保存截图

---

## 添加新测试

1. 在 `tests/` 目录创建 `.spec.ts` 文件
2. 编写测试用例
3. 运行测试：`npm run test:e2e`

### 示例测试
```typescript
import { test, expect } from '@playwright/test';

test('测试示例', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/starLog/);
});
```

---

## 故障排查

### 浏览器无法启动
```bash
# 重新安装浏览器
npx playwright install chromium

# 安装系统依赖（需要 sudo）
npx playwright install-deps chromium
```

### 测试失败
1. 查看 `test-results/` 中的截图
2. 运行 UI 模式：`npm run test:e2e:ui`
3. 检查 Console 日志

---

## 最佳实践

1. **截图验证：** 关键步骤保存截图
2. **错误捕获：** 收集 Console 错误
3. **等待策略：** 使用 `waitForLoadState` 而非固定延迟
4. **数据验证：** 检查页面元素和数据
5. **清理资源：** 测试完成后关闭浏览器

---

**文档维护：** 马斯克  
**最后更新：** 2026-03-28
