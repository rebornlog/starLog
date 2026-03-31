# 📱 飞书告警配置指南

**日期：** 2026-03-27  
**耗时：** 5 分钟

---

## 📋 配置步骤

### 步骤 1：创建飞书机器人（2 分钟）

1. **打开飞书群聊**
   - 选择要接收告警的飞书群

2. **添加机器人**
   - 点击右上角「设置」图标
   - 选择「群机器人」
   - 点击「添加机器人」
   - 选择「自定义机器人」

3. **配置机器人**
   - 名称：`starLog 监控助手`
   - 头像：（可选）
   - 安全设置：选择「自定义关键词」
   - 添加关键词：`starLog`、`告警`、`监控`

4. **复制 Webhook 地址**
   - 点击「复制」按钮
   - 格式：`https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

### 步骤 2：配置环境变量（1 分钟）

**方法 1：临时配置（当前会话）**
```bash
export FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/你的 webhook 地址"
```

**方法 2：永久配置（推荐）**
```bash
# 编辑 ~/.bashrc
nano ~/.bashrc

# 添加到文件末尾
export FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/你的 webhook 地址"

# 使配置生效
source ~/.bashrc
```

**方法 3：写入 .env.local**
```bash
# 编辑 .env.local
nano /home/admin/.openclaw/workspace/starLog/.env.local

# 添加或修改
FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/你的 webhook 地址"
```

---

### 步骤 3：测试告警（2 分钟）

**测试 1：手动触发告警**
```bash
cd /home/admin/.openclaw/workspace/starLog

# 测试飞书通知
curl -X POST "$FEISHU_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "msg_type": "text",
    "content": {
      "text": "🚨 starLog 测试告警\n\n这是一条测试消息\n时间：'$(date '+%Y-%m-%d %H:%M:%S')'"
    }
  }'

echo "✅ 测试消息已发送，请查看飞书群"
```

**测试 2：系统检查告警**
```bash
# 执行系统检查（会触发飞书通知如果有告警）
./scripts/smart-monitor.sh --check
```

**测试 3：模拟故障告警**
```bash
# 手动触发告警测试
./scripts/smart-monitor.sh --alert
```

---

## 📱 告警消息格式

### 系统告警
```
🚨 starLog 告警
时间：2026-03-27 21:00:00
内容：❌ 前端服务异常 (HTTP 503)
```

### 恢复通知
```
✅ starLog 服务恢复
时间：2026-03-27 21:01:00
服务：前端服务
操作：自动重启成功
```

### 日报摘要（每日 9:00）
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

## 🔧 故障排查

### Q: 飞书消息不发送？

**检查 1：环境变量**
```bash
echo $FEISHU_WEBHOOK
# 应该显示 webhook 地址
```

**检查 2：Webhook 有效性**
```bash
curl -X POST "$FEISHU_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{"msg_type":"text","content":{"text":"test"}}'
# 应该返回 {"code":0,"msg":"success"}
```

**检查 3：关键词配置**
- 飞书机器人安全设置中必须包含关键词
- 消息内容必须包含至少一个关键词

### Q: 告警太频繁？

**调整阈值：**
```bash
# 编辑 smart-monitor.sh
nano scripts/smart-monitor.sh

# 修改阈值（例如磁盘从 80% 改为 90%）
if [ "$usage" -lt 90 ]; then  # 原来是 80
```

**配置静默期：**
```bash
# 同一告警 10 分钟内只发送一次
# 已在脚本中实现
```

### Q: 想发送到多个群？

**方法 1：配置多个 Webhook**
```bash
export FEISHU_WEBHOOK_1="https://..."
export FEISHU_WEBHOOK_2="https://..."

# 修改脚本中的 alert() 函数，循环发送
```

**方法 2：飞书群分组**
- 创建一个「starLog 告警群」
- 将相关人员拉入该群
- 只发送到该群

---

## 🎯 最佳实践

### 告警分级

**P0 紧急（立即通知）**
- 服务宕机
- 数据库失败
- 磁盘 > 95%

**P1 重要（10 分钟汇总）**
- 性能下降
- 错误率上升
- 内存 > 85%

**P2 提示（每日汇总）**
- 日志分析日报
- 性能报告
- 业务指标

### 通知时间

**工作时间（09:00-22:00）**
- 所有告警立即发送

**非工作时间（22:00-09:00）**
- 只发送 P0 紧急告警
- P1/P2 告警延迟到 09:00 发送

---

## 📞 完成确认

配置完成后，你应该收到：
1. ✅ 测试消息
2. ✅ 系统检查消息（如有告警）
3. ✅ 每日 9:00 日报
4. ✅ 每周一 9:00 周报

**未收到？**
- 检查飞书机器人配置
- 检查环境变量
- 查看脚本日志：`tail -20 /tmp/smart-monitor.log`

---

**配置完成后继续方向 2！** 🚀
