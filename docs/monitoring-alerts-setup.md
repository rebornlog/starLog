# 🔔 监控告警配置指南

**配置时间：** 2026-03-20  
**优先级：** P1  
**成本：** 免费

---

## 📋 支持的告警渠道

| 渠道 | 免费额度 | 延迟 | 推荐度 |
|------|----------|------|--------|
| 钉钉机器人 | 无限制 | <1s | ⭐⭐⭐⭐⭐ |
| 企业微信机器人 | 无限制 | <1s | ⭐⭐⭐⭐⭐ |
| 飞书机器人 | 无限制 | <1s | ⭐⭐⭐⭐ |
| Slack Webhook | 无限制 | <2s | ⭐⭐⭐ |
| Telegram Bot | 无限制 | <1s | ⭐⭐⭐⭐ |

---

## 🚀 快速配置

### 方式 1：钉钉机器人（推荐）

#### 1. 创建钉钉群
1. 打开钉钉
2. 创建群聊（或选择现有群）
3. 群设置 → 智能群助手 → 添加机器人

#### 2. 配置机器人
1. 选择 "自定义" 机器人
2. 设置名称：`starLog 监控`
3. 安全设置：选择 "自定义关键词"
4. 添加关键词：`starLog`、`告警`、`🚨`
5. 点击 "完成"
6. **复制 Webhook URL**（重要！）

Webhook 格式：
```
https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN
```

#### 3. 更新监控脚本
编辑 `scripts/monitor-services.sh`：
```bash
WEBHOOK_URL="https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
```

#### 4. 测试告警
```bash
cd /home/admin/.openclaw/workspace/starLog/scripts
./monitor-services.sh

# 手动测试
curl 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"msgtype":"text","text":{"content":"🚨 starLog 告警：测试消息"}}'
```

---

### 方式 2：企业微信机器人

#### 1. 创建企业微信群
1. 打开企业微信
2. 创建群聊
3. 群设置 → 群机器人 → 添加

#### 2. 配置机器人
1. 新建机器人
2. 设置名称：`starLog 监控`
3. **复制 Webhook URL**

Webhook 格式：
```
https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY
```

#### 3. 更新监控脚本
编辑 `scripts/monitor-services.sh`：
```bash
WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"
```

#### 4. 修改告警格式（企业微信）
编辑 `scripts/monitor-services.sh` 的 `alert()` 函数：
```bash
alert() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] 🚨 ALERT: $1" | tee -a "$ALERT_LOG"
    
    if [ -n "$WEBHOOK_URL" ]; then
        # 企业微信格式
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"🚨 starLog 告警\\n时间：$timestamp\\n内容：$1\"}}" \
            > /dev/null 2>&1
    fi
}
```

---

### 方式 3：飞书机器人

#### 1. 创建飞书群
1. 打开飞书
2. 创建群聊
3. 群设置 → 机器人 → 添加机器人

#### 2. 配置自定义机器人
1. 选择 "自定义机器人"
2. 设置名称：`starLog 监控`
3. 安全设置：自定义关键词 `starLog`
4. **复制 Webhook URL**

Webhook 格式：
```
https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_HOOK
```

#### 3. 更新监控脚本
编辑 `scripts/monitor-services.sh`：
```bash
WEBHOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_HOOK"
```

#### 4. 修改告警格式（飞书）
```bash
alert() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] 🚨 ALERT: $1" | tee -a "$ALERT_LOG"
    
    if [ -n "$WEBHOOK_URL" ]; then
        # 飞书格式（支持富文本）
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d '{
                "msg_type": "interactive",
                "card": {
                    "config": {"wide_screen_mode": true},
                    "header": {
                        "template": "red",
                        "title": {"content": "🚨 starLog 告警", "tag": "plain_text"}
                    },
                    "elements": [
                        {
                            "tag": "div",
                            "text": {
                                "content": "**时间：** '"$timestamp"'\n**内容：** '"$1"'",
                                "tag": "lark_md"
                            }
                        }
                    ]
                }
            }' \
            > /dev/null 2>&1
    fi
}
```

---

## ⚙️ 配置 Cron 定时任务

### 1. 编辑 Crontab
```bash
crontab -e
```

### 2. 添加定时任务
```bash
# 每 5 分钟检查一次服务状态
*/5 * * * * /home/admin/.openclaw/workspace/starLog/scripts/monitor-services.sh >> /tmp/service-monitor.log 2>&1
```

### 3. 验证 Cron
```bash
# 查看已配置的 Cron
crontab -l

# 查看 Cron 日志（Ubuntu/Debian）
grep CRON /var/log/syslog | tail -20
```

---

## 📊 告警示例

### 钉钉告警消息
```
🚨 starLog 告警：finance-api 服务异常！状态：stopped
```

### 企业微信告警消息
```
🚨 starLog 告警
时间：2026-03-20 07:20:00
内容：finance-api 服务异常！状态：stopped
```

### 飞书告警消息（富文本卡片）
```
┌─────────────────────────────┐
│ 🚨 starLog 告警              │
├─────────────────────────────┤
│ 时间：2026-03-20 07:20:00   │
│ 内容：finance-api 服务异常   │
└─────────────────────────────┘
```

---

## 🔍 监控指标

### 服务监控
- ✅ PM2 进程状态（5 个服务）
- ✅ HTTP 端点响应（3 个端点）
- ✅ Redis 连接状态
- ✅ 磁盘使用率（阈值 90%）
- ✅ 内存使用率（阈值 90%）

### 告警触发条件
| 指标 | 告警条件 | 优先级 |
|------|----------|--------|
| PM2 进程 | stopped/errored | 🔴 P0 |
| HTTP 端点 | 非 200 状态码 | 🔴 P0 |
| Redis | 连接失败 | 🔴 P0 |
| 磁盘 | 使用率 >90% | 🟠 P1 |
| 内存 | 使用率 >90% | 🟠 P1 |

---

## 🧪 测试告警

### 测试 1：手动触发告警
```bash
# 编辑脚本，临时添加告警
echo 'alert "测试告警：这是一条测试消息"' >> monitor-services.sh

# 执行脚本
./monitor-services.sh

# 检查是否收到告警消息
```

### 测试 2：停止服务触发告警
```bash
# 停止一个服务
pm2 stop finance-api

# 等待 5 分钟（Cron 执行）
# 或手动执行监控脚本
./monitor-services.sh

# 应该收到告警：finance-api 服务异常
```

### 测试 3：验证告警频率
监控脚本已包含防重复机制，相同告警不会频繁发送。

---

## ⚠️ 注意事项

### 1. Webhook 安全
- ✅ 使用自定义关键词过滤
- ✅ 不要泄露 Webhook URL
- ✅ 定期更换 Token

### 2. 告警频率
- 默认每 5 分钟检查一次
- 避免告警风暴（相同告警合并）
- 非工作时间可调整频率

### 3. 日志管理
```bash
# 查看监控日志
tail -f /tmp/service-monitor.log

# 查看告警日志
tail -f /tmp/service-alerts.log

# 清理旧日志（保留 7 天）
find /tmp -name "service-*.log" -mtime +7 -delete
```

### 4. 故障恢复
告警脚本只负责通知，不负责自动恢复。如需自动恢复：
```bash
# 在 alert() 函数中添加自动重启
if [ "$process_name" = "finance-api" ]; then
    pm2 restart finance-api
    alert "$process_name 已自动重启"
fi
```

---

## 📈 最佳实践

### 1. 分级告警
- P0（立即通知）：服务宕机、API 不可用
- P1（工作时间处理）：性能下降、缓存失效
- P2（定期 review）：日志增长、磁盘趋势

### 2. 告警路由
- 工作时间 → 开发群
- 非工作时间 → 值班人员
- 紧急告警 → 电话/短信

### 3. 告警抑制
- 维护期间暂停告警
- 相同告警合并（5 分钟内）
- 依赖故障级联抑制

### 4. 监控仪表板
可选：配置 Grafana + Prometheus 可视化监控

---

## ✅ 配置清单

- [ ] 选择告警渠道（钉钉/企业微信/飞书）
- [ ] 创建群聊和机器人
- [ ] 获取 Webhook URL
- [ ] 更新 `monitor-services.sh` 的 `WEBHOOK_URL`
- [ ] 测试 Webhook（curl 命令）
- [ ] 配置 Cron 定时任务
- [ ] 执行一次完整测试
- [ ] 验证告警消息接收
- [ ] 配置日志轮转（可选）

---

## 🆘 故障排查

### 问题 1：收不到告警
**检查：**
1. Webhook URL 是否正确
2. 关键词是否匹配
3. 网络是否可达
```bash
curl -v 'YOUR_WEBHOOK_URL' -d '{"msgtype":"text","text":{"content":"test"}}'
```

### 问题 2：告警太频繁
**解决：**
1. 增加检查间隔（从 5 分钟改为 10 分钟）
2. 添加告警抑制逻辑
3. 调整阈值（如磁盘从 90% 改为 95%）

### 问题 3：Cron 不执行
**检查：**
```bash
# 查看 Cron 服务状态
systemctl status cron

# 查看 Cron 日志
grep CRON /var/log/syslog | tail -20

# 验证脚本权限
chmod +x monitor-services.sh
```

---

**配置完成时间：** TBD  
**配置人：** TBD  
**告警渠道：** ⏳ 待配置  
**测试状态：** ⏳ 待测试
