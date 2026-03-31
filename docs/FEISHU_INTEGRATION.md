# starLog 飞书集成配置

## 📋 配置步骤

### 1. 创建飞书机器人

1. 打开飞书群聊
2. 点击右上角「设置」→「群机器人」
3. 点击「添加机器人」
4. 选择「自定义机器人」
5. 填写机器人名称（如：starLog 监控助手）
6. 复制 Webhook 地址

### 2. 配置环境变量

将 Webhook 地址添加到环境变量：

```bash
# 添加到 ~/.bashrc
export FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 或者添加到 /etc/environment（系统级）
FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 使配置生效
source ~/.bashrc
```

### 3. 测试飞书通知

```bash
# 测试脚本
cd /home/admin/.openclaw/workspace/starLog

# 手动触发告警测试
echo "测试告警" | curl -X POST "$FEISHU_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"🚨 starLog 测试告警\\n这是一条测试消息\"}}"
```

---

## 📱 告警消息格式

### 监控告警
```
🚨 starLog 告警
时间：2026-03-27 19:30:00
内容：❌ 前端服务异常 (HTTP 503)
```

### 恢复通知
```
✅ starLog 服务恢复
时间：2026-03-27 19:31:00
服务：前端服务
操作：自动重启成功
```

### 日报摘要
```
📊 starLog 日报
日期：2026-03-27

✅ 服务状态：正常
📈 请求总数：12,345
⚠️  错误数量：3
💾 磁盘使用：35%
🧠 内存使用：28%
```

---

## 🔧 脚本集成

### smart-monitor.sh
已自动集成飞书告警，当检测到以下情况时自动发送：
- 前端服务异常
- 金融 API 异常
- 数据库连接失败
- Redis 连接失败
- 磁盘使用率 > 80%
- 内存使用率 > 80%

### analyze-logs.sh
可配置每日自动发送日志分析报告：
```bash
# 添加到 crontab
0 9 * * * /home/admin/.openclaw/workspace/starLog/scripts/analyze-logs.sh --daily && \
  curl -X POST "$FEISHU_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"📊 starLog 日报已生成\\n查看位置：/tmp/log-analysis/daily_report_*.md\"}}"
```

---

## 🎯 最佳实践

### 告警分级
- **P0 紧急** - 服务宕机、数据库失败 → 立即通知
- **P1 重要** - 性能下降、错误率上升 → 每 10 分钟汇总
- **P2 提示** - 日志分析日报 → 每日 9:00 发送

### 避免告警风暴
- 同一错误 10 分钟内只发送一次
- 夜间（23:00-07:00）只发送 P0 紧急告警
- 配置告警静默期

### 告警路由
- 运维群 - 所有告警
- 开发群 - 代码相关错误
- 产品群 - 业务指标异常

---

## 📞 故障排查

**Q: 飞书通知不发送？**
```bash
# 检查环境变量
echo $FEISHU_WEBHOOK

# 测试 webhook
curl -X POST "$FEISHU_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"test\"}}"
```

**Q: 告警太频繁？**
- 调整监控脚本阈值
- 增加告警间隔时间
- 配置告警聚合

---

**配置完成后，运行测试：**
```bash
cd /home/admin/.openclaw/workspace/starLog
./scripts/smart-monitor.sh --check
```
