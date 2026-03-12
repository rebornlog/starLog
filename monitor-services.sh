#!/bin/bash

LOG_FILE="/tmp/service-monitor.log"
FRONTEND_URL="http://47.79.20.10:3000"
FINANCE_URL="http://47.79.20.10:8081/health"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# 检查前端
check_frontend() {
  if ! curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL --connect-timeout 5 | grep -q "200"; then
    log "❌ 前端服务异常，重启中..."
    ps aux | grep "npm run dev" | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null
    sleep 2
    cd /home/admin/.openclaw/workspace/starLog
    rm -rf .next
    DATABASE_URL="postgresql://starlog:starlog123@localhost:5432/starlog?connection_limit=10" \
    REDIS_URL="redis://localhost:6379" \
    nohup npm run dev > /tmp/starlog-frontend.log 2>&1 &
    log "✅ 前端服务已重启"
  fi
}

# 检查金融 API
check_finance() {
  if ! curl -s -o /dev/null -w "%{http_code}" $FINANCE_URL --connect-timeout 5 | grep -q "200"; then
    log "❌ 金融 API 异常，重启中..."
    ps aux | grep "uvicorn.*8081" | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null
    sleep 2
    cd /home/admin/.openclaw/workspace/starLog/services/finance
    source venv/bin/activate
    nohup python -m uvicorn main:app --host 0.0.0.0 --port 8081 > /tmp/finance-api.log 2>&1 &
    log "✅ 金融 API 已重启"
  fi
}

# 主循环
log "=== 服务监控启动 ==="
while true; do
  check_frontend
  check_finance
  sleep 60
done
