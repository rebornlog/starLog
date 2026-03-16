#!/bin/bash
# 36kr 热榜日报 - 定时任务脚本
# 每天凌晨 0 点执行

# 设置 PATH，确保 cron 环境能找到 openclaw
export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin:$PATH"

echo "🚀 开始执行 36kr 日报任务 - $(date)"

# 使用 OpenClaw subagent 执行完整流程
openclaw sessions spawn \
  runtime=subagent \
  mode=run \
  label=36kr-daily-auto \
  timeout=300 \
  task='任务：抓取 36kr 热榜并推送到飞书群

步骤：
1. 使用 browser 打开 https://36kr.com/
2. 使用 snapshot 获取页面内容（refs=aria）
3. 提取 24 小时热榜 Top5 文章（标题+URL+ 描述）
4. 格式化日报（markdown）
5. 使用 message 工具发送到飞书群 oc_243b4984ac32e0d58d6a2a9089f40908

输出格式：
```
## 📰 36kr 热榜日报 - YYYY/MM/DD

### 🔥 Top5 热点

1. **文章标题**
   - 摘要：50 字以内的内容摘要
   - 链接：https://...

...

---
💡 日报由 AI 自动生成 · 每天凌晨 0 点推送
```

注意：如果 browser 遇到问题，用 web_fetch 尝试抓取。摘要可以基于标题生成。
'

echo "✅ 任务已提交"
