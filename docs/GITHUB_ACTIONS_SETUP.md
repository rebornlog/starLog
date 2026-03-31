# 📋 GitHub Actions 启用指南

**日期：** 2026-03-27  
**目的：** 启用 CI/CD 自动化测试

---

## 🎯 启用步骤

### 步骤 1：访问 GitHub 仓库

1. 打开浏览器访问：https://github.com/[你的用户名]/starLog
2. 点击顶部「Settings」标签
3. 在左侧菜单找到「Actions」→「General」

### 步骤 2：启用 Actions

1. 找到「Actions permissions」部分
2. 选择「Allow all actions and reusable workflows」
3. 点击「Save」保存

### 步骤 3：验证工作流

1. 点击顶部「Actions」标签
2. 应该能看到两个工作流：
   - ✅ Lighthouse CI
   - ✅ API Tests

### 步骤 4：首次触发

1. 提交一个代码变更到 main 或 develop 分支
2. 或创建一个 Pull Request
3. 在 Actions 页面查看执行状态

---

## 🔧 工作流说明

### Lighthouse CI

**触发条件：**
- Push 到 main/develop 分支
- Pull Request 到 main 分支

**测试内容：**
- 首页 (/)
- 基金页面 (/funds)
- 股票页面 (/stocks)
- 博客页面 (/blog)

**性能指标：**
- Performance（性能）
- Accessibility（可访问性）
- Best Practices（最佳实践）
- SEO（搜索引擎优化）

**预期结果：**
- 所有指标 ≥ 90 分（绿色）
- 至少 ≥ 80 分（黄色警告）

### API Tests

**触发条件：**
- Push 到 main/develop 分支
- Pull Request 到 main 分支

**测试内容：**
- Python 单元测试（pytest）
- API 端点集成测试
- 代码覆盖率报告

**服务依赖：**
- PostgreSQL 15（自动启动）
- Redis 7（自动启动）

**预期结果：**
- 所有测试通过（绿色）
- 代码覆盖率 ≥ 80%

---

## 📊 查看测试结果

### Lighthouse 报告

1. 在 Actions 页面点击工作流运行
2. 向下滚动到「Artifacts」部分
3. 下载 `lighthouse-reports.zip`
4. 解压后用浏览器打开 HTML 报告

### API 测试报告

1. 在 Actions 页面点击工作流运行
2. 查看日志输出
3. 测试覆盖率报告在 `coverage/` 目录

---

## 🔧 故障排查

### Q: Actions 标签不显示？

**解决：**
```
1. 确认已启用 Actions（步骤 2）
2. 刷新页面（Ctrl+F5）
3. 检查仓库权限（需要 Admin 权限）
```

### Q: 工作流执行失败？

**Lighthouse CI 失败：**
```yaml
# 增加超时时间（编辑 .github/workflows/lighthouse-ci.yml）
serverReadyTimeout: 120000  # 从 60s 增加到 120s
```

**API Tests 失败：**
```bash
# 本地测试
cd services/finance
pip install -r requirements.txt
pip install pytest pytest-cov
pytest --cov=.
```

### Q: CodeCov 集成？

**步骤：**
1. 访问 https://codecov.io
2. 用 GitHub 账号登录
3. 添加 starLog 仓库
4. 获取 Upload Token
5. 添加到 GitHub Secrets：`CODECOV_TOKEN`

---

## 🎯 最佳实践

### 分支策略
- **main** - 生产分支，保护分支
- **develop** - 开发分支，自动测试
- **feature/*** - 功能分支，PR 前测试

### 测试要求
- 所有 PR 必须通过 CI 测试
- 代码覆盖率不低于 80%
- Lighthouse 评分不低于 80 分

### 通知配置
- 启用 GitHub 邮件通知
- 集成飞书通知（可选）
- Slack/Discord 通知（可选）

---

## 📞 需要帮助？

**GitHub Actions 文档：**
- 官方文档：https://docs.github.com/en/actions
- 工作流语法：https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions

**Lighthouse CI：**
- 官方文档：https://github.com/treosh/lighthouse-ci-action

**遇到问题？**
1. 查看 Actions 日志
2. 本地复现问题
3. 查看本文档故障排查部分

---

**启用后，每次提交都会自动测试！** 🎉
