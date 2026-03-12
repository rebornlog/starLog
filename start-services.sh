#!/bin/bash

# 停止现有服务
ps aux | grep -E "next|node.*3000|uvicorn.*8081" | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null
sleep 2

# 启动金融 API
cd /home/admin/.openclaw/workspace/starLog/services/finance
source venv/bin/activate
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8081 > /tmp/finance-api.log 2>&1 &
echo "✅ 金融 API 已启动 (PID: $!)"

# 启动前端
cd /home/admin/.openclaw/workspace/starLog
rm -rf .next
DATABASE_URL="postgresql://starlog:starlog123@localhost:5432/starlog?connection_limit=10" \
REDIS_URL="redis://localhost:6379" \
nohup npm run dev > /tmp/starlog-frontend.log 2>&1 &
echo "✅ 前端服务已启动 (PID: $!)"

# 等待服务启动
sleep 15

# 验证服务
echo ""
echo "=== 服务状态 ==="
curl -s -o /dev/null -w "前端：%{http_code}\n" http://47.79.20.10:3000 --connect-timeout 10
curl -s -o /dev/null -w "金融 API：%{http_code}\n" http://47.79.20.10:8081/health --connect-timeout 10
redis-cli ping
