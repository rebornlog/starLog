# 🤖 自动化 E2E 测试系统

## 📋 概述

自动化 E2E 测试系统每 25 分钟自动执行一次网站全面测试，包括：

- ✅ **页面加载测试** - 检查所有页面是否正常加载
- ✅ **API 端点测试** - 验证后端 API 响应
- ✅ **页面元素测试** - 使用 Playwright 检测 Console/Network 错误
- ✅ **按钮可点击性测试** - 自动点击按钮并检测错误
- ✅ **自动修复** - 服务异常时自动重启
- ✅ **经验沉淀** - 测试结果自动记录到 MEMORY.md

---

## 🚀 快速开始

### 手动执行测试

```bash
# 完整测试（所有功能）
./scripts/auto-test-e2e.sh --full

# 快速测试（仅页面和 API）
./scripts/auto-test-e2e.sh --quick

# 仅生成报告
./scripts/auto-test-e2e.sh --report
```

### 定时任务

系统已配置 crontab，每 25 分钟自动执行一次：

```bash
# 查看定时任务
crontab -l | grep auto-test

# 输出：
*/25 * * * * /home/admin/.openclaw/workspace/starLog/scripts/auto-test-e2e.sh --quick >> /tmp/auto-test-e2e/cron.log 2>&1
```

---

## 📊 测试报告

### 报告位置

- **测试报告：** `/home/admin/.openclaw/workspace/starLog/test-reports/report-YYYY-MM-DD-HHMMSS.md`
- **执行日志：** `/tmp/auto-test-e2e/test-YYYY-MM-DD-HHMMSS.log`
- **Cron 日志：** `/tmp/auto-test-e2e/cron.log`

### 报告内容

每份测试报告包含：

1. **测试概览** - 总测试数、通过率、自动修复数
2. **详细结果** - 每个页面和 API 的测试状态
3. **建议与优化点** - 基于测试结果的建议

---

## 🔧 配置说明

### 测试页面列表

编辑 `auto-test-e2e.sh` 修改 `PAGES` 数组：

```bash
declare -a PAGES=(
    "/"
    "/funds"
    "/stocks"
    "/blog"
    "/funds/alerts"
    "/funds/watchlist"
    "/funds/sip-calculator"
    "/funds/compare"
)
```

### API 端点列表

编辑 `auto-test-e2e.sh` 修改 `API_ENDPOINTS` 数组：

```bash
declare -a API_ENDPOINTS=(
    "/health"
    "/api/funds/list"
    "/api/stocks/list"
)
```

### 修改测试频率

编辑 crontab：

```bash
crontab -e
```

修改第一列（分钟）：

```bash
# 每 25 分钟
*/25 * * * *

# 每 15 分钟
*/15 * * * *

# 每小时
0 * * * *
```

---

## 🛠️ 自动修复功能

系统会自动检测并修复以下问题：

### 服务异常

- **API 服务无响应** → 自动重启 `finance-api` 和 `fund-api`
- **前端服务无响应** → 自动重启 `starlog-frontend`

### 修复日志

所有自动修复操作会记录到：

- 测试报告中的"自动修复"统计
- MEMORY.md 中的动作记录
- 执行日志中的详细信息

---

## 📈 经验沉淀

### 自动记录

每次测试完成后，系统会自动将结果记录到 `MEMORY.md`：

```markdown
### HH:MM - 自动化 E2E 测试
- **动作：** 执行网站全面自动化测试
- **目的：** 每 25 分钟自动检测网站问题并修复
- **结果：** 总测试 X, 通过 Y, 失败 Z, 修复 W
- **报告：** /path/to/report.md
```

### 问题记录

发现新问题时，自动记录到 `ERROR_LOG.md`：

```markdown
### ❌ 问题：page_load @ /funds
**时间：** 2026-03-31 08:21:42
**描述：** HTTP 500
**状态：** 待修复
**自动修复：** 待执行
```

---

## 🔍 故障排查

### 测试失败

1. **查看测试报告**
   ```bash
   ls -lt /home/admin/.openclaw/workspace/starLog/test-reports/ | head -5
   cat /home/admin/.openclaw/workspace/starLog/test-reports/report-最新.md
   ```

2. **查看执行日志**
   ```bash
   tail -100 /tmp/auto-test-e2e/test-最新.log
   ```

3. **手动执行测试**
   ```bash
   ./scripts/auto-test-e2e.sh --full
   ```

### Playwright 测试跳过

如果看到"页面元素测试无有效 JSON 输出，跳过"：

- **原因：** Playwright 浏览器测试输出格式问题
- **影响：** 仅跳过深度元素测试，基础页面和 API 测试仍正常
- **解决：** 检查 Playwright 是否正确安装
  ```bash
  npx playwright --version
  npx playwright install chromium
  ```

### Cron 未执行

检查 cron 服务状态：

```bash
# 查看 cron 日志
grep CRON /var/log/syslog | tail -20

# 检查 cron 服务
systemctl status cron

# 手动触发一次
./scripts/auto-test-e2e.sh --quick
```

---

## 📝 最佳实践

### 1. 定期查看报告

每天查看最新测试报告，关注：

- 通过率是否下降
- 是否有新问题出现
- 自动修复是否频繁触发

### 2. 及时修复问题

当测试报告发现问题时：

1. 查看 ERROR_LOG.md 了解问题详情
2. 优先修复重复出现的问题
3. 更新 MEMORY.md 记录修复经验

### 3. 优化测试用例

根据实际需求调整：

- 添加新页面到 PAGES 数组
- 添加新 API 到 API_ENDPOINTS 数组
- 调整测试频率（crontab）

---

## 🎯 测试覆盖

### 当前覆盖

| 类别 | 数量 | 状态 |
|------|------|------|
| 页面加载 | 8 | ✅ |
| API 端点 | 3 | ✅ |
| 页面元素 | 8 | ⚠️ (可选) |
| 按钮测试 | 8 | ⚠️ (可选) |
| **总计** | **27** | **✅** |

### 测试类型

- **同步测试** - HTTP 请求检查（必选）
- **异步测试** - Playwright 浏览器自动化（可选）
- **性能测试** - 响应时间检查（内置）
- **功能测试** - 按钮点击验证（可选）

---

## 📞 支持

### 常见问题

**Q: 为什么有些页面显示 308 而不是 200？**
A: 308 是永久重定向，Next.js 路由正常行为，视为成功。

**Q: 如何禁用 Playwright 测试？**
A: 使用 `--quick` 模式，仅执行基础页面和 API 测试。

**Q: 测试报告在哪里？**
A: `/home/admin/.openclaw/workspace/starLog/test-reports/` 目录。

### 相关文件

- **测试脚本：** `scripts/auto-test-e2e.sh`
- **测试报告：** `test-reports/`
- **执行日志：** `/tmp/auto-test-e2e/`
- **Cron 日志：** `/tmp/auto-test-e2e/cron.log`
- **经验记录：** `MEMORY.md`
- **错误记录：** `ERROR_LOG.md`

---

**最后更新：** 2026-03-31  
**维护者：** 自动化测试系统
