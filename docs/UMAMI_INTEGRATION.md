# 📊 Umami 深度集成指南

**日期：** 2026-03-27  
**目的：** 实现业务指标监控和自动报告

---

## 📋 配置步骤

### 1. Umami 服务配置

#### 已有配置
- **Umami 地址：** https://umami.starlog.dev（或本地部署）
- **网站 ID：** 在 Umami 后台获取
- **API Key：** 在 Umami 后台生成

#### 环境变量配置
```bash
# 添加到 ~/.bashrc
export UMAMI_API_URL="https://umami.starlog.dev"
export UMAMI_WEBSITE_ID="your-website-id"
export UMAMI_API_KEY="your-api-key"

# 使配置生效
source ~/.bashrc
```

### 2. 前端仪表盘配置

#### 环境变量（前端）
```bash
# 添加到 .env.local
NEXT_PUBLIC_UMAMI_API_URL=https://umami.starlog.dev
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id
NEXT_PUBLIC_UMAMI_API_KEY=your-api-key
```

#### 访问仪表盘
```
http://localhost:3000/analytics/dashboard
```

### 3. 自动报告配置

#### 添加到 crontab
```bash
# 每天早上 9 点生成日报
0 9 * * * /home/admin/.openclaw/workspace/starLog/scripts/generate-report.sh --daily

# 每周一早上 9 点生成周报
0 9 * * 1 /home/admin/.openclaw/workspace/starLog/scripts/generate-report.sh --weekly
```

---

## 📈 监控指标

### 流量指标
- **总访问量 (Pageviews)** - 页面浏览次数
- **独立访客 (Visitors)** - 独立用户数
- **跳出率 (Bounce Rate)** - 单页访问比例
- **平均停留时间** - 用户平均停留时长

### 业务指标
- **基金查询次数** - 基金功能使用量
- **股票查询次数** - 股票功能使用量
- **博客文章阅读量** - 内容消费情况
- **用户增长率** - 新增用户趋势

### 性能指标
- **页面加载时间** - Lighthouse Performance
- **API 响应时间** - 后端性能
- **错误率** - 前端/后端错误统计

---

## 🛠️ 可用命令

### 生成报告
```bash
# 日报
./scripts/generate-report.sh --daily

# 周报
./scripts/generate-report.sh --weekly

# 清理旧报告
./scripts/generate-report.sh --clean
```

### 查看仪表盘
```
访问：http://localhost:3000/analytics/dashboard
```

---

## 📱 飞书通知

### 配置 Webhook
```bash
export FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
```

### 通知内容
- **日报** - 每日 9:00 自动发送
- **周报** - 每周一 9:00 自动发送
- **异常告警** - 流量异常时立即发送

---

## 📊 报告模板

### 日报模板
```markdown
# 📊 starLog 业务日报

**日期：** 2026-03-27

## 核心指标
- 总访问量：1,234
- 独立访客：567
- 跳出率：35.2%

## 热门页面
1. / - 500 次浏览
2. /funds - 300 次浏览
3. /stocks - 200 次浏览

## 建议
1. 关注跳出率变化
2. 优化热门页面性能
```

### 周报模板
```markdown
# 📊 starLog 业务周报

**周期：** 2026-03-20 至 2026-03-27

## 核心指标
- 总访问量：8,765
- 独立访客：3,456
- 平均停留时间：120 秒

## 趋势分析
- 访问量环比：+15%
- 访客数环比：+10%

## 建议
1. 分析流量高峰时段
2. 优化低性能页面
```

---

## 🔧 故障排查

**Q: 仪表盘无法加载？**
```bash
# 检查环境变量
echo $UMAMI_WEBSITE_ID
echo $UMAMI_API_KEY

# 测试 API
curl -H "Authorization: Bearer $UMAMI_API_KEY" \
  "$UMAMI_API_URL/websites/$UMAMI_WEBSITE_ID/stats"
```

**Q: 报告生成失败？**
```bash
# 检查 jq 是否安装
which jq

# 安装 jq
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS
```

---

## 🎯 最佳实践

### 数据隐私
- [ ] 不收集个人敏感信息
- [ ] 遵守 GDPR/隐私政策
- [ ] 提供数据删除选项

### 性能优化
- [ ] 仪表盘数据缓存（5 分钟）
- [ ] 分页加载大量数据
- [ ] 异步加载非关键指标

### 告警策略
- [ ] 流量异常（±50%）
- [ ] 错误率飙升（>5%）
- [ ] 性能下降（>3 秒）

---

**集成完成后，系统将自动监控业务指标并生成报告！** 🎉
