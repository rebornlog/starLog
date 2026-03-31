# 📊 Umami 监控配置指南

**日期：** 2026-03-27  
**耗时：** 10 分钟

---

## 📋 配置步骤

### 步骤 1：访问 Umami 后台（1 分钟）

**本地部署：**
```
http://localhost:3000  # 如果 Umami 本地部署
```

**远程部署：**
```
https://umami.starlog.dev  # 或你的 Umami 地址
```

**登录：**
- 用户名：（管理员账号）
- 密码：（管理员密码）

---

### 步骤 2：添加网站（3 分钟）

1. **点击「+ Add website」**
2. **填写信息：**
   - Name: `starLog`
   - Domain: `starlog.dev`（或你的域名）
   - 其他选项默认

3. **点击「Save」**

4. **获取配置信息：**
   - Website ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - 点击「API」标签
   - 生成 API Key（如未生成）
   - 复制 API Key

---

### 步骤 3：配置环境变量（2 分钟）

**编辑 .env.local：**
```bash
cd /home/admin/.openclaw/workspace/starLog
nano .env.local
```

**添加配置：**
```bash
# Umami 分析配置
NEXT_PUBLIC_UMAMI_API_URL="https://umami.starlog.dev"
NEXT_PUBLIC_UMAMI_WEBSITE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 填入 Website ID
NEXT_PUBLIC_UMAMI_API_KEY="your-api-key-here"  # 填入 API Key
```

**使配置生效：**
```bash
# 前端需要重启才能读取新环境变量
# 生产环境
pm2 restart starlog-frontend

# 开发环境（不推荐生产使用）
npm run dev
```

---

### 步骤 4：前端集成（2 分钟）

**已有集成（无需修改）：**
- 仪表盘组件：`app/analytics/dashboard.tsx`
- 自动从环境变量读取配置

**验证集成：**
```bash
# 访问仪表盘
http://localhost:3000/analytics/dashboard
```

**应该看到：**
- 总访问量
- 独立访客
- 跳出率
- 平均停留时间
- 热门页面 Top 10

---

### 步骤 5：测试数据（2 分钟）

**生成测试流量：**
```bash
# 访问几个页面
curl http://localhost:3000 > /dev/null
curl http://localhost:3000/funds > /dev/null
curl http://localhost:3000/stocks > /dev/null
curl http://localhost:3000/blog > /dev/null

# 等待 1-2 分钟数据同步

# 查看 Umami 后台
# 应该看到最新的访问记录
```

**检查仪表盘：**
```bash
# 访问仪表盘
# http://localhost:3000/analytics/dashboard

# 应该显示真实数据而非示例数据
```

---

## 📊 自动报告配置

### 配置环境变量（用于脚本）

**编辑 ~/.bashrc：**
```bash
nano ~/.bashrc

# 添加
export UMAMI_API_URL="https://umami.starlog.dev"
export UMAMI_WEBSITE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export UMAMI_API_KEY="your-api-key-here"

# 使配置生效
source ~/.bashrc
```

### 测试报告生成
```bash
cd /home/admin/.openclaw/workspace/starLog

# 生成日报
./scripts/generate-report.sh --daily

# 生成周报
./scripts/generate-report.sh --weekly

# 查看报告
ls -lh /tmp/business-reports/
```

---

## 🔧 故障排查

### Q: 仪表盘显示"无法加载统计数据"？

**检查 1：环境变量**
```bash
echo $NEXT_PUBLIC_UMAMI_WEBSITE_ID
echo $NEXT_PUBLIC_UMAMI_API_KEY
```

**检查 2：API 连通性**
```bash
curl -H "Authorization: Bearer $UMAMI_API_KEY" \
  "$UMAMI_API_URL/websites/$UMAMI_WEBSITE_ID/stats"
```

**检查 3：前端重启**
```bash
# 生产环境
pm2 restart starlog-frontend

# 等待 1-2 分钟
```

### Q: Umami 后台无数据？

**检查 1：前端集成**
```bash
# 检查页面是否加载 Umami 脚本
# 应该在 <head> 中有 Umami 追踪代码
```

**检查 2：域名匹配**
```bash
# Umami 后台配置的域名应该与实际访问域名一致
# starlog.dev 或 localhost
```

**检查 3：浏览器控制台**
```bash
# F12 打开开发者工具
# 查看 Console 是否有错误
# 查看 Network 是否有 Umami API 请求
```

### Q: 报告生成失败？

**检查 jq 安装：**
```bash
which jq

# 如未安装
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS
```

**检查环境变量：**
```bash
echo $UMAMI_WEBSITE_ID
echo $UMAMI_API_KEY
```

---

## 📈 监控指标说明

### 流量指标

**总访问量 (Pageviews)**
- 页面浏览次数
- 包含重复访问

**独立访客 (Visitors)**
- 独立用户数
- 基于 UUID 识别

**跳出率 (Bounce Rate)**
- 单页访问比例
- 越低越好（通常 30-50%）

**平均停留时间**
- 用户平均停留时长
- 越长越好

### 业务指标

**基金查询次数**
- `/funds/*` 页面访问量
- 反映基金功能使用情况

**股票查询次数**
- `/stocks/*` 页面访问量
- 反映股票功能使用情况

**博客阅读量**
- `/blog/*` 页面访问量
- 反映内容消费情况

---

## 🎯 最佳实践

### 数据隐私
- [x] 不收集个人敏感信息
- [x] IP 地址匿名化
- [x] 遵守 GDPR

### 性能优化
- [x] 仪表盘数据缓存（5 分钟）
- [x] 异步加载非关键指标
- [ ] CDN 加速（可选）

### 告警策略
- [ ] 流量异常（±50%）
- [ ] 错误率飙升（>5%）
- [ ] 性能下降（>3 秒）

---

## 📞 完成确认

配置完成后，你应该看到：
1. ✅ Umami 后台有实时数据
2. ✅ 仪表盘显示真实统计
3. ✅ 日报/周报正常生成
4. ✅ 飞书通知包含业务指标

**未看到数据？**
- 检查 Umami 后台配置
- 检查前端环境变量
- 查看浏览器控制台错误

---

**配置完成后继续方向 3！** 🚀
