# ⏰ 25 分钟自动化任务完整说明

## 📋 任务概述

每 25 分钟自动执行一次**网站全面检测与优化**，包括：

1. **E2E 测试** - 所有页面和 API 功能测试
2. **性能检测** - 加载时间、资源大小、响应速度
3. **SEO 检查** - Title、Meta、H1、Canonical 等
4. **可访问性** - Alt 属性、ARIA 标签、键盘导航
5. **自动修复** - 服务异常自动重启
6. **GitHub 提交** - 测试报告自动 push
7. **经验沉淀** - 记录到 MEMORY.md

---

## 🚀 执行流程

### 阶段 1/5: 页面加载测试
测试所有页面的 HTTP 状态码和加载状态：

```bash
✅ / (HTTP 200)
✅ /funds (HTTP 308)
✅ /stocks (HTTP 308)
✅ /blog (HTTP 308)
...共 19 个页面
```

### 阶段 2/5: API 端点测试
验证后端 API 响应：

```bash
✅ /health (HTTP 200, JSON 有效)
✅ /api/funds/list (HTTP 200, JSON 有效)
✅ /api/stocks/list (HTTP 200, JSON 有效)
```

### 阶段 3/5: 页面元素测试 (Playwright)
使用浏览器自动化测试：
- Console 错误检测
- Network 错误检测
- 元素渲染检查
- 截图保存

### 阶段 4/5: 按钮可点击性测试
自动点击所有可交互元素：
- 按钮 (button)
- 链接 (a[href])
- 可点击卡片 (.cursor-pointer)
- 菜单项 ([role="menuitem"])

**测试逻辑：**
1. 查找所有可点击元素
2. 滚动到元素位置
3. 点击元素
4. 检查是否有错误提示
5. 记录是否发生页面跳转

### 阶段 5/5: 性能与内容优化

#### 性能测试
- 加载时间测量（毫秒级）
- 页面大小统计（KB）
- 响应时间分析

**标准：**
- 🟢 快速：< 1000ms
- 🟡 一般：1000-3000ms
- 🔴 缓慢：> 3000ms

#### SEO 检查
- ✅ Title 标签
- ✅ Meta Description
- ✅ H1 标签
- ✅ Canonical URL
- ✅ Viewport (移动端适配)

#### 可访问性检查
- 图片 alt 属性
- 按钮 aria-label
- 键盘导航支持
- 颜色对比度（待人工）

#### 生成优化建议
自动生成 `recommendations-YYYY-MM-DD-HHMMSS.md`，包含：
- P0 高优先级优化项
- P1 中优先级优化项
- P2 低优先级优化项
- 自动修复项清单

---

## 📊 测试覆盖

### 页面列表 (19 个)
```
/
/about
/blog
/diet
/favorites
/funds
/funds/alerts
/funds/compare
/funds/export
/funds/import
/funds/sip-calculator
/funds/watchlist
/iching
/iching/history
/novel
/projects
/stocks
/timeline
/zodiac
```

### API 端点 (3 个)
```
/health
/api/funds/list
/api/stocks/list
```

### 按钮测试
- 不限制数量
- 自动发现所有可点击元素
- 智能去重（避免重复点击重叠元素）

---

## 📁 输出文件

### 测试报告
位置：`test-reports/`

- `report-YYYY-MM-DD-HHMMSS.md` - E2E 测试报告
- `performance-YYYYMMDD-HHMMSS.txt` - 性能测试结果
- `recommendations-YYYY-MM-DD-HHMMSS.md` - 优化建议

### 日志文件
位置：`/tmp/auto-test-e2e/`

- `test-YYYY-MM-DD-HHMMSS.log` - 执行日志
- `cron.log` - Cron 调度日志

### 经验记录
- `MEMORY.md` - 长期记忆（测试总结）
- `ERROR_LOG.md` - 错误记录（发现问题）

---

## 🔧 配置说明

### Cron 配置
```bash
# 查看当前配置
crontab -l | grep auto-test

# 输出：
*/25 * * * * cd /home/admin/.openclaw/workspace/starLog && ./scripts/auto-test-e2e.sh --full >> /tmp/auto-test-e2e/cron.log 2>&1
```

### 修改频率
```bash
crontab -e
```

修改第一列：
- `*/15` - 每 15 分钟
- `*/25` - 每 25 分钟（当前）
- `*/60` - 每小时
- `0 * * * *` - 每小时整点

### 测试模式
```bash
# 快速模式（仅页面和 API）
./scripts/auto-test-e2e.sh --quick

# 完整模式（包含性能优化）
./scripts/auto-test-e2e.sh --full
```

---

## 📤 GitHub 自动提交

### 提交内容
- 测试报告 (`test-reports/report-*.md`)
- 性能数据 (`test-reports/performance-*.txt`)
- 优化建议 (`test-reports/recommendations-*.md`)

### 提交格式
```
🤖 Auto: 自动化测试与优化报告 (2026-03-31 09:12:53)
```

### Push 配置
当前使用 HTTPS + Token 方式：
```
origin  https://ghp_***@github.com/rebornlog/starLog.git
```

**注意：** 如果 push 失败，检查：
1. Token 是否过期
2. 仓库权限是否正确
3. 网络是否通畅

---

## 🎯 优化建议分类

### P0 - 高优先级（立即执行）
- [ ] 启用 CDN
- [ ] 图片优化为 WebP
- [ ] 代码分割
- [ ] 缓存策略

### P1 - 中优先级（本周执行）
- [ ] 懒加载
- [ ] 预加载关键资源
- [ ] Gzip/Brotli 压缩
- [ ] 减少重定向

### P2 - 低优先级（本月执行）
- [ ] Service Worker
- [ ] HTTP/2 推送
- [ ] 边缘计算

### SEO 优化
- [ ] Title 优化
- [ ] Meta Description
- [ ] H1 标签
- [ ] 结构化数据

### 可访问性
- [ ] 图片 Alt
- [ ] 按钮标签
- [ ] 键盘导航
- [ ] 焦点指示

---

## 📈 监控指标

### 性能指标
- 页面加载时间 < 1s
- API 响应时间 < 500ms
- 页面大小 < 100KB
- 错误率 < 1%

### 质量指标
- 测试通过率 > 95%
- SEO 评分 > 90
- 可访问性评分 > 85
- Lighthouse 性能 > 80

### 运维指标
- 服务可用性 > 99.9%
- 自动修复成功率 > 90%
- 问题发现到修复 < 25 分钟

---

## 🔍 故障排查

### 测试失败
1. 查看最新报告：`ls -lt test-reports/ | head -3`
2. 查看执行日志：`tail -100 /tmp/auto-test-e2e/test-*.log`
3. 手动执行：`./scripts/auto-test-e2e.sh --full`

### Playwright 错误
- 确保在项目目录内运行
- 检查 node_modules 是否存在
- 重新安装：`npm install playwright`

### GitHub Push 失败
1. 检查 Token：`git remote -v`
2. 测试推送：`git push origin main --dry-run`
3. 更新 Token：修改 remote URL

### Cron 未执行
1. 检查服务：`systemctl status cron`
2. 查看日志：`grep CRON /var/log/syslog | tail -20`
3. 手动触发一次

---

## 📞 使用示例

### 查看最新报告
```bash
# 最新测试报告
cat $(ls -t test-reports/report-*.md | head -1)

# 最新性能数据
cat $(ls -t test-reports/performance-*.txt | head -1)

# 最新优化建议
cat $(ls -t test-reports/recommendations-*.md | head -1)
```

### 手动执行测试
```bash
# 快速测试（1 分钟）
./scripts/auto-test-e2e.sh --quick

# 完整测试（5 分钟）
./scripts/auto-test-e2e.sh --full

# 仅优化检测
./scripts/auto-optimize.sh
```

### 查看历史趋势
```bash
# 查看最近 10 次测试结果
ls -lt test-reports/report-*.md | head -10

# 统计通过率
grep "通过率" test-reports/report-*.md | tail -10
```

---

## 🎓 最佳实践

### 1. 定期查看报告
- 每天至少查看一次最新报告
- 关注通过率趋势
- 及时处理重复出现的问题

### 2. 优化建议执行
- 优先执行 P0 优化项
- 每周执行 P1 优化项
- 每月回顾 P2 优化项

### 3. 经验沉淀
- 每次修复后更新 ERROR_LOG.md
- 重要教训记录到 MEMORY.md
- 定期整理优化文档

### 4. GitHub 管理
- 定期清理旧测试报告（保留 7 天）
- 使用 git tag 标记重要版本
- 在 Issues 中追踪长期优化项

---

## 📚 相关文档

- [自动化测试使用指南](./AUTO_TEST_GUIDE.md)
- [性能优化检查表](./PERFORMANCE_CHECKLIST.md)
- [SEO 优化指南](./SEO_GUIDE.md)
- [可访问性标准](./ACCESSIBILITY.md)

---

**最后更新：** 2026-03-31 09:15  
**维护者：** 自动化测试系统  
**下次执行：** 25 分钟后自动
